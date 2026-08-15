'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { DietPlan, MealType } from '@/lib/types/database';
import { INITIAL_DIET_PLANS } from '@/lib/demo-store';

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
 * Recupera tutti i piani alimentari settimanali dell'utente
 */
export async function getDietPlans(): Promise<DietPlan[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('diet_plans')
    .select('*, food_items(*)')
    .eq('user_id', user.id)
    .order('day_of_week', { ascending: true });

  if (data) {
    return (data as any[]).map((item) => ({
      ...item,
      food_item: item.food_items,
    }));
  }

  return [];
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
  const { supabase, user } = await getRequiredUser();

  await (supabase.from('diet_plans') as any).insert({
    user_id: user.id,
    day_of_week: params.day_of_week,
    meal_type: params.meal_type,
    food_id: params.food_id,
    quantity: params.quantity,
  });

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
  const { supabase } = await getRequiredUser();

  await (supabase.from('diet_plans') as any)
    .update({
      food_id: params.food_id,
      quantity: params.quantity,
    })
    .eq('id', params.id);

  revalidatePath('/diet');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Rimuove un elemento dal piano dieta
 */
export async function deleteDietPlanItem(id: string) {
  const { supabase } = await getRequiredUser();

  await supabase.from('diet_plans').delete().eq('id', id);

  revalidatePath('/diet');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Copia tutti i pasti di un giorno in un altro giorno (es. da Lunedì a Martedì)
 */
export async function copyDayPlan(fromDay: number, toDay: number) {
  const { supabase, user } = await getRequiredUser();

  // 1. Elimina i pasti esistenti nel giorno di destinazione
  await supabase.from('diet_plans').delete().eq('user_id', user.id).eq('day_of_week', toDay);

  // 2. Preleva i pasti dal giorno sorgente
  const { data: sourceItems } = await supabase
    .from('diet_plans')
    .select('meal_type, food_id, quantity')
    .eq('user_id', user.id)
    .eq('day_of_week', fromDay);

  if (sourceItems && (sourceItems as any[]).length > 0) {
    const newItems = (sourceItems as any[]).map((item) => ({
      user_id: user.id,
      day_of_week: toDay,
      meal_type: item.meal_type,
      food_id: item.food_id,
      quantity: item.quantity,
    }));
    await (supabase.from('diet_plans') as any).insert(newItems);
  }

  revalidatePath('/diet');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}

/**
 * Popola il piano settimanale iniziale di esempio associando i cibi dell'utente
 */
export async function seedDefaultDietPlan() {
  const { supabase, user } = await getRequiredUser();

  // Recupera i cibi dell'utente
  const { data: userFood } = await supabase
    .from('food_items')
    .select('id, name')
    .eq('user_id', user.id);

  if (!userFood || userFood.length === 0) return { success: false };

  await supabase.from('diet_plans').delete().eq('user_id', user.id);

  const newPlans = [];
  for (const sample of INITIAL_DIET_PLANS) {
    // Cerca un cibo corrispondente per nome
    const sampleFood = INITIAL_DIET_PLANS.find(f => f.food_id === sample.food_id);
    const targetFood = (userFood as any[]).find(f => f.id === sample.food_id) || userFood[0];

    newPlans.push({
      user_id: user.id,
      day_of_week: sample.day_of_week,
      meal_type: sample.meal_type,
      food_id: targetFood.id,
      quantity: sample.quantity,
    });
  }

  if (newPlans.length > 0) {
    await (supabase.from('diet_plans') as any).insert(newPlans);
  }

  revalidatePath('/diet');
  revalidatePath('/');
  revalidatePath('/shopping');
  return { success: true };
}
