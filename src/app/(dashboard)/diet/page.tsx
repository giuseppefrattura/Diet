import * as React from 'react';
import { getDietPlans } from '@/actions/diet';
import { getFoodItems } from '@/actions/inventory';
import { DietClient } from '@/components/diet-client';

export const dynamic = 'force-dynamic';

export default async function DietPage() {
  const [dietPlans, foodItems] = await Promise.all([
    getDietPlans(),
    getFoodItems(),
  ]);

  return (
    <DietClient
      initialDietPlans={dietPlans}
      foodItems={foodItems}
    />
  );
}
