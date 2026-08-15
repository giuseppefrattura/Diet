import * as React from 'react';
import { getShoppingList } from '@/actions/shopping';
import { getFoodItems } from '@/actions/inventory';
import { ShoppingListClient } from '@/components/shopping-list-client';

export const dynamic = 'force-dynamic';

export default async function ShoppingPage() {
  const [shoppingList, foodItems] = await Promise.all([
    getShoppingList(),
    getFoodItems(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Lista della Spesa Smart
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Calcolo delta automatico, spunta ottimistica al supermercato e carico scorte in dispensa.
        </p>
      </div>

      <ShoppingListClient
        initialItems={shoppingList}
        foodItems={foodItems}
      />
    </div>
  );
}
