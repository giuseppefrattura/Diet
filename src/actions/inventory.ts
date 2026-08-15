'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { demoStore, DEMO_USER_ID } from '@/lib/demo-store';
import { FoodItem, InventoryItem, MealType } from '@/lib/types/database';

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

/**
 * Consuma un pasto intero applicando l'algoritmo FEFO (First Expired, First Out)
 */
export async function consumeMeal(
  mealType: MealType,
  dayOfWeek: number,
  customItems?: { food_id: string; quantity: number }[]
): Promise<MealConsumptionResult> {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = session?.id || DEMO_USER_ID;

  let itemsToConsume: { food_id: string; quantity: number; foodName?: string; unit?: string }[] = [];

  if (customItems && customItems.length > 0) {
    itemsToConsume = customItems;
  } else {
    // Recupera gli alimenti previsti per il pasto dal piano dieta
    if (supabase && session) {
      const { data } = await supabase
        .from('diet_plans')
        .select('food_id, quantity, food_items(name, unit)')
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
    } else {
      const plans = demoStore.dietPlans.filter(
        (p) => p.day_of_week === dayOfWeek && p.meal_type === mealType
      );
      itemsToConsume = plans.map((p) => {
        const food = demoStore.foodItems.find((f) => f.id === p.food_id);
        return {
          food_id: p.food_id,
          quantity: p.quantity,
          foodName: food?.name,
          unit: food?.unit,
        };
      });
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

    if (supabase && session) {
      // Supabase FEFO Query: expiration_date ASC NULLS LAST
      const { data: batches } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('food_id', item.food_id)
        .eq('user_id', userId)
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
    } else {
      // Demo Store FEFO
      const batches = demoStore.inventoryItems
        .filter((inv) => inv.food_id === item.food_id)
        .sort((a, b) => {
          if (!a.expiration_date && !b.expiration_date) return 0;
          if (!a.expiration_date) return 1; // nulls last
          if (!b.expiration_date) return -1;
          return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
        });

      for (const batch of batches) {
        if (remainingNeeded <= 0) break;

        const takeQty = Math.min(batch.quantity, remainingNeeded);
        batchesUsed.push({
          batchId: batch.id,
          quantity: takeQty,
          expirationDate: batch.expiration_date,
        });

        batch.quantity -= takeQty;
        remainingNeeded -= takeQty;
      }

      // Rimuovi lotti a zero
      demoStore.inventoryItems = demoStore.inventoryItems.filter((b) => b.quantity > 0);
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
    ? `Pasto consumato con successo! Tutti i lotti sono stati scalati in ordine FEFO.`
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
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = session?.id || DEMO_USER_ID;

  if (supabase && session) {
    await (supabase.from('inventory_items') as any).insert({
      user_id: userId,
      food_id: params.food_id,
      quantity: params.quantity,
      expiration_date: params.expiration_date || null,
    });
  } else {
    demoStore.inventoryItems.push({
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      food_id: params.food_id,
      quantity: params.quantity,
      expiration_date: params.expiration_date || null,
      created_at: new Date().toISOString(),
    });
  }

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
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    await (supabase.from('inventory_items') as any)
      .update({
        quantity: params.quantity,
        expiration_date: params.expiration_date || null,
      })
      .eq('id', params.id);
  } else {
    const item = demoStore.inventoryItems.find((i) => i.id === params.id);
    if (item) {
      item.quantity = params.quantity;
      item.expiration_date = params.expiration_date || null;
    }
  }

  revalidatePath('/inventory');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Elimina un lotto dalla dispensa
 */
export async function deleteInventoryBatch(id: string) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    await supabase.from('inventory_items').delete().eq('id', id);
  } else {
    demoStore.inventoryItems = demoStore.inventoryItems.filter((i) => i.id !== id);
  }

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
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = session?.id || DEMO_USER_ID;

  let newId = `f-${Date.now()}`;

  if (supabase && session) {
    const { data } = await (supabase.from('food_items') as any)
      .insert({
        user_id: userId,
        name: params.name.trim(),
        unit: params.unit.trim(),
        perishable: params.perishable,
        category: params.category || 'Generale',
      })
      .select('id')
      .single();
    if (data?.id) newId = data.id;
  } else {
    demoStore.foodItems.push({
      id: newId,
      user_id: userId,
      name: params.name.trim(),
      unit: params.unit.trim(),
      perishable: params.perishable,
      category: params.category || 'Generale',
      created_at: new Date().toISOString(),
    });
  }

  revalidatePath('/inventory');
  revalidatePath('/diet');
  revalidatePath('/shopping');
  return { success: true, id: newId };
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
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    await (supabase.from('food_items') as any)
      .update({
        name: params.name.trim(),
        unit: params.unit.trim(),
        perishable: params.perishable,
        category: params.category || 'Generale',
      })
      .eq('id', params.id);
  } else {
    const item = demoStore.foodItems.find((f) => f.id === params.id);
    if (item) {
      item.name = params.name.trim();
      item.unit = params.unit.trim();
      item.perishable = params.perishable;
      item.category = params.category || 'Generale';
    }
  }

  revalidatePath('/inventory');
  revalidatePath('/diet');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Gestione Anagrafica Alimenti: Eliminazione
 */
export async function deleteFoodItem(id: string) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    await supabase.from('food_items').delete().eq('id', id);
  } else {
    demoStore.foodItems = demoStore.foodItems.filter((f) => f.id !== id);
    demoStore.inventoryItems = demoStore.inventoryItems.filter((i) => i.food_id !== id);
    demoStore.dietPlans = demoStore.dietPlans.filter((d) => d.food_id !== id);
    demoStore.shoppingList = demoStore.shoppingList.filter((s) => s.food_id !== id);
  }

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
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    const { data } = await supabase
      .from('inventory_items')
      .select('*, food_items(*)')
      .order('expiration_date', { ascending: true, nullsFirst: false });

    if (data) {
      return (data as any[]).map((item) => ({
        ...item,
        food_item: item.food_items,
      }));
    }
  }

  // Fallback demo
  return demoStore.inventoryItems.map((item) => ({
    ...item,
    food_item: demoStore.foodItems.find((f) => f.id === item.food_id),
  }));
}

/**
 * Query per recuperare il catalogo alimenti
 */
export async function getFoodItems(): Promise<FoodItem[]> {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    const { data } = await supabase
      .from('food_items')
      .select('*')
      .order('name', { ascending: true });

    if (data && data.length > 0) {
      return data as FoodItem[];
    }

    // Se l'utente non ha ancora alimenti, popoliamo il catalogo iniziale
    if (data && data.length === 0) {
      const initialItems = demoStore.foodItems.map((item) => ({
        user_id: session.id,
        name: item.name,
        unit: item.unit,
        perishable: item.perishable,
        category: item.category,
      }));

      await (supabase.from('food_items') as any).insert(initialItems);

      const { data: refreshed } = await supabase
        .from('food_items')
        .select('*')
        .order('name', { ascending: true });

      if (refreshed) return refreshed as FoodItem[];
    }
  }

  return [...demoStore.foodItems].sort((a, b) => a.name.localeCompare(b.name));
}
