'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { demoStore, DEMO_USER_ID } from '@/lib/demo-store';
import { ShoppingListItem } from '@/lib/types/database';
import { getCurrentDayOfWeek } from '@/lib/utils';

export interface ShoppingGenerationConfig {
  daysWindow: number; // 1, 3, 5, 7
  startDay?: number; // 1-7
}

/**
 * Calcola e popola la lista della spesa in base al fabbisogno differenziale:
 * Needed = max(0, Required_in_Window - Inventory_Stock)
 */
export async function generateShoppingList(config: ShoppingGenerationConfig) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = session?.id || DEMO_USER_ID;

  const currentDay = config.startDay || getCurrentDayOfWeek();
  const targetDays: number[] = [];

  for (let i = 0; i < config.daysWindow; i++) {
    let day = ((currentDay + i - 1) % 7) + 1;
    targetDays.push(day);
  }

  // 1. Calcola fabbisogno per ogni alimento nella finestra temporale
  const requirementsMap = new Map<string, number>();

  if (supabase && session) {
    const { data: dietData } = await supabase
      .from('diet_plans')
      .select('food_id, quantity, day_of_week')
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
      .select('food_id, quantity');

    if (invData) {
      for (const row of (invData as any[])) {
        const currentStock = inventoryStockMap.get(row.food_id) || 0;
        inventoryStockMap.set(row.food_id, currentStock + Number(row.quantity));
      }
    }

    // 3. Svuota la lista della spesa esistente non acquistata e ripopola con i delta
    await supabase.from('shopping_list').delete().eq('is_bought', false);

    const newShoppingItems = [];
    for (const [foodId, totalRequired] of requirementsMap.entries()) {
      const stock = inventoryStockMap.get(foodId) || 0;
      const needed = Math.max(0, totalRequired - stock);

      if (needed > 0) {
        newShoppingItems.push({
          user_id: userId,
          food_id: foodId,
          quantity: needed,
          is_bought: false,
        });
      }
    }

    if (newShoppingItems.length > 0) {
      await (supabase.from('shopping_list') as any).insert(newShoppingItems);
    }
  } else {
    // Demo Store Logic
    for (const plan of demoStore.dietPlans) {
      if (targetDays.includes(plan.day_of_week)) {
        const current = requirementsMap.get(plan.food_id) || 0;
        requirementsMap.set(plan.food_id, current + plan.quantity);
      }
    }

    const inventoryStockMap = new Map<string, number>();
    for (const inv of demoStore.inventoryItems) {
      const current = inventoryStockMap.get(inv.food_id) || 0;
      inventoryStockMap.set(inv.food_id, current + inv.quantity);
    }

    // Mantieni gli articoli già segnati come comprati, elimina quelli non spuntati
    const keptBought = demoStore.shoppingList.filter((s) => s.is_bought);
    const newItems: ShoppingListItem[] = [];

    for (const [foodId, totalRequired] of requirementsMap.entries()) {
      const stock = inventoryStockMap.get(foodId) || 0;
      const needed = Math.max(0, totalRequired - stock);

      if (needed > 0) {
        newItems.push({
          id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user_id: userId,
          food_id: foodId,
          quantity: needed,
          is_bought: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    demoStore.shoppingList = [...keptBought, ...newItems];
  }

  revalidatePath('/shopping');
  return { success: true, count: requirementsMap.size };
}

/**
 * Toggle stato acquistato per un elemento della lista spesa
 */
export async function toggleShoppingItemBought(id: string, is_bought: boolean) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    await (supabase.from('shopping_list') as any).update({ is_bought }).eq('id', id);
  } else {
    const item = demoStore.shoppingList.find((s) => s.id === id);
    if (item) {
      item.is_bought = is_bought;
    }
  }

  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Aggiunta manuale di un alimento alla lista spesa
 */
export async function addManualShoppingItem(food_id: string, quantity: number) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = session?.id || DEMO_USER_ID;

  if (supabase && session) {
    await (supabase.from('shopping_list') as any).insert({
      user_id: userId,
      food_id,
      quantity,
      is_bought: false,
    });
  } else {
    demoStore.shoppingList.push({
      id: `shop-man-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      food_id,
      quantity,
      is_bought: false,
      created_at: new Date().toISOString(),
    });
  }

  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Elimina un elemento dalla lista della spesa
 */
export async function deleteShoppingItem(id: string) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    await supabase.from('shopping_list').delete().eq('id', id);
  } else {
    demoStore.shoppingList = demoStore.shoppingList.filter((s) => s.id !== id);
  }

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
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = session?.id || DEMO_USER_ID;

  if (supabase && session) {
    for (const item of items) {
      await (supabase.from('inventory_items') as any).insert({
        user_id: userId,
        food_id: item.foodId,
        quantity: item.quantity,
        expiration_date: item.expirationDate || null,
      });

      await supabase.from('shopping_list').delete().eq('id', item.shoppingId);
    }
  } else {
    for (const item of items) {
      demoStore.inventoryItems.push({
        id: `inv-restock-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        food_id: item.foodId,
        quantity: item.quantity,
        expiration_date: item.expirationDate || null,
        created_at: new Date().toISOString(),
      });

      demoStore.shoppingList = demoStore.shoppingList.filter((s) => s.id !== item.shoppingId);
    }
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
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    const { data } = await supabase
      .from('shopping_list')
      .select('*, food_items(*)')
      .order('is_bought', { ascending: true })
      .order('created_at', { ascending: false });

    if (data) {
      return (data as any[]).map((item) => ({
        ...item,
        food_item: item.food_items,
      }));
    }
  }

  return demoStore.shoppingList.map((item) => ({
    ...item,
    food_item: demoStore.foodItems.find((f) => f.id === item.food_id),
  }));
}
