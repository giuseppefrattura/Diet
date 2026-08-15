'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { FoodItem, InventoryItem, MealType } from '@/lib/types/database';
import { INITIAL_FOOD_ITEMS } from '@/lib/demo-store';

export interface ConsumedIngredientResult {
  foodName: string;
  requiredQuantity: number;
  consumedQuantity: number;
  unit: string;
  batchesUsed: { batchId: string; quantity: number; expirationDate: string | null }[];
  isFullyFulfilled: boolean;
}

export interface MealConsumptionResult {
  success: boolean;
  mealType: MealType;
  results: ConsumedIngredientResult[];
  message: string;
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
 * Consuma un pasto intero applicando l'algoritmo FEFO (First Expired, First Out)
 */
export async function consumeMeal(
  mealType: MealType,
  dayOfWeek: number,
  customItems?: { food_id: string; quantity: number }[]
): Promise<MealConsumptionResult> {
  const { supabase, user } = await getRequiredUser();

  let itemsToConsume: { food_id: string; quantity: number; foodName?: string; unit?: string }[] = [];

  if (customItems && customItems.length > 0) {
    itemsToConsume = customItems;
  } else {
    // Recupera gli alimenti previsti per il pasto dal piano dieta
    const { data } = await supabase
      .from('diet_plans')
      .select('food_id, quantity, food_items(name, unit)')
      .eq('user_id', user.id)
      .eq('day_of_week', dayOfWeek)
      .eq('meal_type', mealType);

    if (data) {
      itemsToConsume = (data as any[]).map((d) => ({
        food_id: d.food_id,
        quantity: Number(d.quantity),
        foodName: d.food_items?.name,
        unit: d.food_items?.unit,
      }));
    }
  }

  if (itemsToConsume.length === 0) {
    return {
      success: false,
      mealType,
      results: [],
      message: 'Nessun alimento previsto per questo pasto nel piano dieta.',
    };
  }

  const results: ConsumedIngredientResult[] = [];

  for (const item of itemsToConsume) {
    let remainingNeeded = item.quantity;
    const batchesUsed: { batchId: string; quantity: number; expirationDate: string | null }[] = [];

    // Supabase FEFO Query: expiration_date ASC NULLS LAST
    const { data: batches } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('food_id', item.food_id)
      .eq('user_id', user.id)
      .order('expiration_date', { ascending: true, nullsFirst: false });

    if (batches && (batches as any[]).length > 0) {
      for (const batch of (batches as any[])) {
        if (remainingNeeded <= 0) break;

        const batchQty = Number(batch.quantity);
        const takeQty = Math.min(batchQty, remainingNeeded);

        batchesUsed.push({
          batchId: batch.id,
          quantity: takeQty,
          expirationDate: batch.expiration_date,
        });

        const newBatchQty = batchQty - takeQty;
        remainingNeeded -= takeQty;

        if (newBatchQty <= 0) {
          await supabase.from('inventory_items').delete().eq('id', batch.id);
        } else {
          await (supabase.from('inventory_items') as any).update({ quantity: newBatchQty }).eq('id', batch.id);
        }
      }
    }

    const foodName = item.foodName || 'Ingrediente';
    const unit = item.unit || 'g';
    const consumed = item.quantity - remainingNeeded;

    results.push({
      foodName,
      requiredQuantity: item.quantity,
      consumedQuantity: consumed,
      unit,
      batchesUsed,
      isFullyFulfilled: remainingNeeded === 0,
    });
  }

  revalidatePath('/');
  revalidatePath('/inventory');
  revalidatePath('/shopping');

  const allFulfilled = results.every((r) => r.isFullyFulfilled);
  const message = allFulfilled
    ? `Pasto consumato con successo! I lotti sono stati scalati in ordine FEFO.`
    : `Pasto consumato parzialmente: alcuni ingredienti sono esauriti o insufficienti in dispensa.`;

  return {
    success: true,
    mealType,
    results,
    message,
  };
}

/**
 * Aggiunge un nuovo lotto in dispensa
 */
export async function addInventoryBatch(params: {
  food_id: string;
  quantity: number;
  expiration_date: string | null;
}) {
  const { supabase, user } = await getRequiredUser();

  await (supabase.from('inventory_items') as any).insert({
    user_id: user.id,
    food_id: params.food_id,
    quantity: params.quantity,
    expiration_date: params.expiration_date || null,
  });

  revalidatePath('/inventory');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Aggiorna quantità o scadenza di un lotto esistente
 */
export async function updateInventoryBatch(params: {
  id: string;
  quantity: number;
  expiration_date: string | null;
}) {
  const { supabase } = await getRequiredUser();

  await (supabase.from('inventory_items') as any)
    .update({
      quantity: params.quantity,
      expiration_date: params.expiration_date || null,
    })
    .eq('id', params.id);

  revalidatePath('/inventory');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Elimina un lotto dalla dispensa
 */
export async function deleteInventoryBatch(id: string) {
  const { supabase } = await getRequiredUser();

  await supabase.from('inventory_items').delete().eq('id', id);

  revalidatePath('/inventory');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Gestione Anagrafica Alimenti: Aggiunta
 */
export async function addFoodItem(params: {
  name: string;
  unit: string;
  perishable: boolean;
  category: string;
}) {
  const { supabase, user } = await getRequiredUser();

  const { data, error } = await (supabase.from('food_items') as any)
    .insert({
      user_id: user.id,
      name: params.name.trim(),
      unit: params.unit.trim(),
      perishable: params.perishable,
      category: params.category || 'Generale',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/inventory');
  revalidatePath('/diet');
  revalidatePath('/shopping');
  return { success: true, id: data?.id };
}

/**
 * Gestione Anagrafica Alimenti: Modifica
 */
export async function updateFoodItem(params: {
  id: string;
  name: string;
  unit: string;
  perishable: boolean;
  category: string;
}) {
  const { supabase } = await getRequiredUser();

  await (supabase.from('food_items') as any)
    .update({
      name: params.name.trim(),
      unit: params.unit.trim(),
      perishable: params.perishable,
      category: params.category || 'Generale',
    })
    .eq('id', params.id);

  revalidatePath('/inventory');
  revalidatePath('/diet');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Gestione Anagrafica Alimenti: Eliminazione
 */
export async function deleteFoodItem(id: string) {
  const { supabase } = await getRequiredUser();

  await supabase.from('food_items').delete().eq('id', id);

  revalidatePath('/inventory');
  revalidatePath('/diet');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Query completa per recuperare la dispensa con alimenti associati
 */
export async function getInventoryItems(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('inventory_items')
    .select('*, food_items(*)')
    .eq('user_id', user.id)
    .order('expiration_date', { ascending: true, nullsFirst: false });

  if (data) {
    return (data as any[]).map((item) => ({
      ...item,
      food_item: item.food_items,
    }));
  }

  return [];
}

/**
 * Query per recuperare il catalogo alimenti
 */
export async function getFoodItems(): Promise<FoodItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('food_items')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (data && data.length > 0) {
    return data as FoodItem[];
  }

  // Se l'utente non ha ancora alimenti nel suo account, popola il catalogo iniziale
  if (data && data.length === 0) {
    const initialItems = INITIAL_FOOD_ITEMS.map((item) => ({
      user_id: user.id,
      name: item.name,
      unit: item.unit,
      perishable: item.perishable,
      category: item.category,
    }));

    await (supabase.from('food_items') as any).insert(initialItems);

    const { data: refreshed } = await supabase
      .from('food_items')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (refreshed) return refreshed as FoodItem[];
  }

  return [];
}
