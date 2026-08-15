'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { demoStore, DEMO_USER_ID, INITIAL_DIET_PLANS } from '@/lib/demo-store';
import { DietPlan, MealType } from '@/lib/types/database';

/**
 * Recupera tutti i piani alimentari settimanali con le relazioni con gli alimenti
 */
export async function getDietPlans(): Promise<DietPlan[]> {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    const { data } = await supabase
      .from('diet_plans')
      .select('*, food_items(*)')
      .order('day_of_week', { ascending: true });

    if (data) {
      return (data as any[]).map((item) => ({
        ...item,
        food_item: item.food_items,
      }));
    }
  }

  return demoStore.dietPlans.map((item) => ({
    ...item,
    food_item: demoStore.foodItems.find((f) => f.id === item.food_id),
  }));
}

/**
 * Aggiunge un alimento a uno slot pasto in un giorno della settimana
 */
export async function addDietPlanItem(params: {
  day_of_week: number;
  meal_type: MealType;
  food_id: string;
  quantity: number;
}) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = session?.id || DEMO_USER_ID;

  if (supabase && session) {
    await (supabase.from('diet_plans') as any).insert({
      user_id: userId,
      day_of_week: params.day_of_week,
      meal_type: params.meal_type,
      food_id: params.food_id,
      quantity: params.quantity,
    });
  } else {
    demoStore.dietPlans.push({
      id: `d-${params.day_of_week}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      day_of_week: params.day_of_week,
      meal_type: params.meal_type,
      food_id: params.food_id,
      quantity: params.quantity,
      created_at: new Date().toISOString(),
    });
  }

  revalidatePath('/diet');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Aggiorna un elemento del piano dieta (quantità o alimento)
 */
export async function updateDietPlanItem(params: {
  id: string;
  food_id: string;
  quantity: number;
}) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    await (supabase.from('diet_plans') as any)
      .update({
        food_id: params.food_id,
        quantity: params.quantity,
      })
      .eq('id', params.id);
  } else {
    const item = demoStore.dietPlans.find((d) => d.id === params.id);
    if (item) {
      item.food_id = params.food_id;
      item.quantity = params.quantity;
    }
  }

  revalidatePath('/diet');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Rimuove un elemento dal piano dieta
 */
export async function deleteDietPlanItem(id: string) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (supabase && session) {
    await supabase.from('diet_plans').delete().eq('id', id);
  } else {
    demoStore.dietPlans = demoStore.dietPlans.filter((d) => d.id !== id);
  }

  revalidatePath('/diet');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Copia tutti i pasti di un giorno in un altro giorno (es. da Lunedì a Martedì)
 */
export async function copyDayPlan(fromDay: number, toDay: number) {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = session?.id || DEMO_USER_ID;

  if (supabase && session) {
    // 1. Elimina i pasti esistenti nel giorno di destinazione
    await supabase.from('diet_plans').delete().eq('day_of_week', toDay);

    // 2. Preleva i pasti dal giorno sorgente
    const { data: sourceItems } = await supabase
      .from('diet_plans')
      .select('meal_type, food_id, quantity')
      .eq('day_of_week', fromDay);

    if (sourceItems && (sourceItems as any[]).length > 0) {
      const newItems = (sourceItems as any[]).map((item) => ({
        user_id: userId,
        day_of_week: toDay,
        meal_type: item.meal_type,
        food_id: item.food_id,
        quantity: item.quantity,
      }));
      await (supabase.from('diet_plans') as any).insert(newItems);
    }
  } else {
    // Demo Store
    demoStore.dietPlans = demoStore.dietPlans.filter((d) => d.day_of_week !== toDay);
    const sourceItems = demoStore.dietPlans.filter((d) => d.day_of_week === fromDay);

    for (const item of sourceItems) {
      demoStore.dietPlans.push({
        id: `d-${toDay}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        day_of_week: toDay,
        meal_type: item.meal_type,
        food_id: item.food_id,
        quantity: item.quantity,
        created_at: new Date().toISOString(),
      });
    }
  }

  revalidatePath('/diet');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Ripristina il piano settimanale iniziale di esempio
 */
export async function seedDefaultDietPlan() {
  const supabase = await createClient();
  const session = supabase ? (await supabase.auth.getUser()).data.user : null;
  const userId = session?.id || DEMO_USER_ID;

  if (supabase && session) {
    await supabase.from('diet_plans').delete().eq('user_id', userId);
  } else {
    demoStore.dietPlans = [...INITIAL_DIET_PLANS];
  }

  revalidatePath('/diet');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}
