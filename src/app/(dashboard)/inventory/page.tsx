import * as React from 'react';
import { getInventoryItems, getFoodItems } from '@/actions/inventory';
import { InventoryClient } from '@/components/inventory-client';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const [inventory, foodItems] = await Promise.all([
    getInventoryItems(),
    getFoodItems(),
  ]);

  return (
    <InventoryClient
      initialInventory={inventory}
      initialFoodItems={foodItems}
    />
  );
}
