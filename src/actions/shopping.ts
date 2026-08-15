'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ShoppingListItem } from '@/lib/types/database';
import { getCurrentDayOfWeek } from '@/lib/utils';

export interface ShoppingGenerationConfig {
  daysWindow: number; // 1, 3, 5, 7
  startDay?: number; // 1-7
}

async function getRequiredUser() {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error('Supabase client non configurato');
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Utente non autenticato. Effettua il login.');
  }
  return { supabase, user };
}

/**
 * Calcola e popola la lista della spesa in base al fabbisogno differenziale:
 * Needed = max(0, Required_in_Window - Inventory_Stock)
 */
export async function generateShoppingList(config: ShoppingGenerationConfig) {
  const { supabase, user } = await getRequiredUser();

  const currentDay = config.startDay || getCurrentDayOfWeek();
  const targetDays: number[] = [];

  for (let i = 0; i < config.daysWindow; i++) {
    let day = ((currentDay + i - 1) % 7) + 1;
    targetDays.push(day);
  }

  // 1. Calcola fabbisogno per ogni alimento nella finestra temporale
  const requirementsMap = new Map<string, number>();

  const { data: dietData } = await supabase
    .from('diet_plans')
    .select('food_id, quantity, day_of_week')
    .eq('user_id', user.id)
    .in('day_of_week', targetDays);

  if (dietData) {
    for (const row of (dietData as any[])) {
      const currentReq = requirementsMap.get(row.food_id) || 0;
      requirementsMap.set(row.food_id, currentReq + Number(row.quantity));
    }
  }

  // 2. Calcola giacenza totale per ogni alimento in dispensa
  const inventoryStockMap = new Map<string, number>();
  const { data: invData } = await supabase
    .from('inventory_items')
    .select('food_id, quantity')
    .eq('user_id', user.id);

  if (invData) {
    for (const row of (invData as any[])) {
      const currentStock = inventoryStockMap.get(row.food_id) || 0;
      inventoryStockMap.set(row.food_id, currentStock + Number(row.quantity));
    }
  }

  // 3. Svuota la lista della spesa esistente non acquistata e ripopola con i delta
  await supabase
    .from('shopping_list')
    .delete()
    .eq('user_id', user.id)
    .eq('is_bought', false);

  const newShoppingItems = [];
  for (const [foodId, totalRequired] of requirementsMap.entries()) {
    const stock = inventoryStockMap.get(foodId) || 0;
    const needed = Math.max(0, totalRequired - stock);

    if (needed > 0) {
      newShoppingItems.push({
        user_id: user.id,
        food_id: foodId,
        quantity: needed,
        is_bought: false,
      });
    }
  }

  if (newShoppingItems.length > 0) {
    await (supabase.from('shopping_list') as any).insert(newShoppingItems);
  }

  revalidatePath('/shopping');
  return { success: true, count: requirementsMap.size };
}

/**
 * Toggle stato acquistato per un elemento della lista spesa
 */
export async function toggleShoppingItemBought(id: string, is_bought: boolean) {
  const { supabase, user } = await getRequiredUser();

  await (supabase.from('shopping_list') as any)
    .update({ is_bought })
    .eq('id', id)
    .eq('user_id', user.id);

  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Aggiunta manuale di un alimento alla lista spesa
 */
export async function addManualShoppingItem(food_id: string, quantity: number) {
  const { supabase, user } = await getRequiredUser();

  await (supabase.from('shopping_list') as any).insert({
    user_id: user.id,
    food_id,
    quantity,
    is_bought: false,
  });

  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Elimina un elemento dalla lista della spesa
 */
export async function deleteShoppingItem(id: string) {
  const { supabase, user } = await getRequiredUser();

  await supabase
    .from('shopping_list')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  revalidatePath('/shopping');
  return { success: true };
}

export interface RestockItemPayload {
  shoppingId: string;
  foodId: string;
  quantity: number;
  expirationDate: string | null;
}

/**
 * Commit Spesa ("Carica in Dispensa"):
 * Trasferisce tutti gli articoli acquistati in lotti `inventory_items` con le date di scadenza fornite
 * e li rimuove dalla lista della spesa.
 */
export async function commitShoppingToInventory(items: RestockItemPayload[]) {
  const { supabase, user } = await getRequiredUser();

  for (const item of items) {
    await (supabase.from('inventory_items') as any).insert({
      user_id: user.id,
      food_id: item.foodId,
      quantity: item.quantity,
      expiration_date: item.expirationDate || null,
    });

    await supabase
      .from('shopping_list')
      .delete()
      .eq('id', item.shoppingId)
      .eq('user_id', user.id);
  }

  revalidatePath('/shopping');
  revalidatePath('/inventory');
  revalidatePath('/');
  return { success: true, count: items.length };
}

/**
 * Recupera la lista della spesa corrente con gli alimenti
 */
export async function getShoppingList(): Promise<ShoppingListItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('shopping_list')
    .select('*, food_items(*)')
    .eq('user_id', user.id)
    .order('is_bought', { ascending: true })
    .order('created_at', { ascending: false });

  if (data) {
    return (data as any[]).map((item) => ({
      ...item,
      food_item: item.food_items,
    }));
  }

  return [];
}
