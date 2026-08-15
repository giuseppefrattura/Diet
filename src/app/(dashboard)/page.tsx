import * as React from 'react';
import { getDietPlans } from '@/actions/diet';
import { getInventoryItems, getFoodItems } from '@/actions/inventory';
import { getShoppingList } from '@/actions/shopping';
import { DashboardClient } from '@/components/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [dietPlans, inventoryItems, foodItems, shoppingList] = await Promise.all([
    getDietPlans(),
    getInventoryItems(),
    getFoodItems(),
    getShoppingList(),
  ]);

  return (
    <DashboardClient
      dietPlans={dietPlans}
      inventoryItems={inventoryItems}
      foodItems={foodItems}
      shoppingCount={shoppingList.filter((s) => !s.is_bought).length}
    />
  );
}
