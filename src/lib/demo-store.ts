import { FoodItem, InventoryItem, DietPlan, ShoppingListItem } from './types/database';

export const DEMO_USER_ID = 'demo-user-diet-app';

// 1. Food Items Catalog basato su dieta_settimanale_1500kcal.txt
export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  { id: 'f-1', user_id: DEMO_USER_ID, name: 'Yogurt Greco 0%', unit: 'g', perishable: true, category: 'Latticini e Bevande' },
  { id: 'f-2', user_id: DEMO_USER_ID, name: "Fiocchi d'Avena", unit: 'g', perishable: false, category: 'Cereali e Pane' },
  { id: 'f-3', user_id: DEMO_USER_ID, name: 'Banana', unit: 'pz', perishable: true, category: 'Frutta e Verdura' },
  { id: 'f-4', user_id: DEMO_USER_ID, name: 'Petto di Pollo', unit: 'g', perishable: true, category: 'Carne e Pesce' },
  { id: 'f-5', user_id: DEMO_USER_ID, name: 'Riso Integrale', unit: 'g', perishable: false, category: 'Cereali e Pane' },
  { id: 'f-6', user_id: DEMO_USER_ID, name: 'Zucchine', unit: 'g', perishable: true, category: 'Frutta e Verdura' },
  { id: 'f-7', user_id: DEMO_USER_ID, name: 'Broccoli', unit: 'g', perishable: true, category: 'Frutta e Verdura' },
  { id: 'f-8', user_id: DEMO_USER_ID, name: 'Olio EVO', unit: 'g', perishable: false, category: 'Condimenti' },
  { id: 'f-9', user_id: DEMO_USER_ID, name: 'Lenticchie Rosse Cotte', unit: 'g', perishable: true, category: 'Legumi e Semi' },
  { id: 'f-10', user_id: DEMO_USER_ID, name: 'Fagioli Cannellini Lessati', unit: 'g', perishable: true, category: 'Legumi e Semi' },
  { id: 'f-11', user_id: DEMO_USER_ID, name: 'Pane Integrale', unit: 'g', perishable: true, category: 'Cereali e Pane' },
  { id: 'f-12', user_id: DEMO_USER_ID, name: 'Insalata Mista', unit: 'g', perishable: true, category: 'Frutta e Verdura' },
  { id: 'f-13', user_id: DEMO_USER_ID, name: 'Pomodori', unit: 'g', perishable: true, category: 'Frutta e Verdura' },
  { id: 'f-14', user_id: DEMO_USER_ID, name: 'Uova Intere', unit: 'pz', perishable: true, category: 'Uova e Latticini' },
];

function getRelativeDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// 2. Initial Inventory Batches
export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'inv-1', user_id: DEMO_USER_ID, food_id: 'f-1', quantity: 600, expiration_date: getRelativeDate(5) },
  { id: 'inv-2', user_id: DEMO_USER_ID, food_id: 'f-2', quantity: 500, expiration_date: null },
  { id: 'inv-3', user_id: DEMO_USER_ID, food_id: 'f-3', quantity: 4, expiration_date: getRelativeDate(3) },
  { id: 'inv-4', user_id: DEMO_USER_ID, food_id: 'f-4', quantity: 360, expiration_date: getRelativeDate(2) },
  { id: 'inv-5', user_id: DEMO_USER_ID, food_id: 'f-4', quantity: 500, expiration_date: getRelativeDate(5) },
  { id: 'inv-6', user_id: DEMO_USER_ID, food_id: 'f-5', quantity: 1000, expiration_date: null },
  { id: 'inv-7', user_id: DEMO_USER_ID, food_id: 'f-6', quantity: 400, expiration_date: getRelativeDate(2) },
  { id: 'inv-8', user_id: DEMO_USER_ID, food_id: 'f-7', quantity: 400, expiration_date: getRelativeDate(3) },
  { id: 'inv-9', user_id: DEMO_USER_ID, food_id: 'f-8', quantity: 500, expiration_date: null },
  { id: 'inv-10', user_id: DEMO_USER_ID, food_id: 'f-14', quantity: 6, expiration_date: getRelativeDate(7) },
];

// 3. Initial Weekly Diet Plans (1500 kcal/giorno)
export const INITIAL_DIET_PLANS: DietPlan[] = [
  // LUNEDÌ (Day 1)
  { id: 'd-1-1', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'colazione', food_id: 'f-1', quantity: 200 },
  { id: 'd-1-2', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'colazione', food_id: 'f-2', quantity: 40 },
  { id: 'd-1-3', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'colazione', food_id: 'f-3', quantity: 1 },
  { id: 'd-1-4', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'pranzo', food_id: 'f-4', quantity: 180 },
  { id: 'd-1-5', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'pranzo', food_id: 'f-5', quantity: 150 },
  { id: 'd-1-6', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'pranzo', food_id: 'f-6', quantity: 200 },
  { id: 'd-1-7', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'pranzo', food_id: 'f-8', quantity: 10 },
  { id: 'd-1-8', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'cena', food_id: 'f-9', quantity: 250 },
  { id: 'd-1-9', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'cena', food_id: 'f-11', quantity: 60 },
  { id: 'd-1-10', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'cena', food_id: 'f-12', quantity: 100 },
  { id: 'd-1-11', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'cena', food_id: 'f-13', quantity: 100 },
  { id: 'd-1-12', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'cena', food_id: 'f-8', quantity: 10 },

  // MARTEDÌ (Day 2)
  { id: 'd-2-1', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'colazione', food_id: 'f-1', quantity: 200 },
  { id: 'd-2-2', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'colazione', food_id: 'f-2', quantity: 40 },
  { id: 'd-2-3', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'colazione', food_id: 'f-3', quantity: 1 },
  { id: 'd-2-4', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'pranzo', food_id: 'f-4', quantity: 180 },
  { id: 'd-2-5', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'pranzo', food_id: 'f-5', quantity: 150 },
  { id: 'd-2-6', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'pranzo', food_id: 'f-6', quantity: 200 },
  { id: 'd-2-7', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'pranzo', food_id: 'f-8', quantity: 10 },
  { id: 'd-2-8', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'cena', food_id: 'f-14', quantity: 3 },
  { id: 'd-2-9', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'cena', food_id: 'f-10', quantity: 150 },
  { id: 'd-2-10', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'cena', food_id: 'f-13', quantity: 150 },
  { id: 'd-2-11', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'cena', food_id: 'f-11', quantity: 50 },
  { id: 'd-2-12', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'cena', food_id: 'f-8', quantity: 10 },

  // MERCOLEDÌ (Day 3)
  { id: 'd-3-1', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'colazione', food_id: 'f-1', quantity: 200 },
  { id: 'd-3-2', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'colazione', food_id: 'f-2', quantity: 40 },
  { id: 'd-3-3', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'colazione', food_id: 'f-3', quantity: 1 },
  { id: 'd-3-4', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'pranzo', food_id: 'f-4', quantity: 180 },
  { id: 'd-3-5', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'pranzo', food_id: 'f-5', quantity: 150 },
  { id: 'd-3-6', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'pranzo', food_id: 'f-7', quantity: 200 },
  { id: 'd-3-7', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'pranzo', food_id: 'f-8', quantity: 10 },
  { id: 'd-3-8', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'cena', food_id: 'f-9', quantity: 250 },
  { id: 'd-3-9', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'cena', food_id: 'f-11', quantity: 60 },
  { id: 'd-3-10', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'cena', food_id: 'f-12', quantity: 100 },
  { id: 'd-3-11', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'cena', food_id: 'f-13', quantity: 100 },
  { id: 'd-3-12', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'cena', food_id: 'f-8', quantity: 10 },

  // GIOVEDÌ (Day 4)
  { id: 'd-4-1', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'colazione', food_id: 'f-1', quantity: 200 },
  { id: 'd-4-2', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'colazione', food_id: 'f-2', quantity: 40 },
  { id: 'd-4-3', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'colazione', food_id: 'f-3', quantity: 1 },
  { id: 'd-4-4', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'pranzo', food_id: 'f-4', quantity: 180 },
  { id: 'd-4-5', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'pranzo', food_id: 'f-5', quantity: 150 },
  { id: 'd-4-6', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'pranzo', food_id: 'f-6', quantity: 200 },
  { id: 'd-4-7', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'pranzo', food_id: 'f-8', quantity: 10 },
  { id: 'd-4-8', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'cena', food_id: 'f-14', quantity: 3 },
  { id: 'd-4-9', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'cena', food_id: 'f-10', quantity: 150 },
  { id: 'd-4-10', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'cena', food_id: 'f-13', quantity: 150 },
  { id: 'd-4-11', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'cena', food_id: 'f-11', quantity: 50 },
  { id: 'd-4-12', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'cena', food_id: 'f-8', quantity: 10 },

  // VENERDÌ (Day 5)
  { id: 'd-5-1', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'colazione', food_id: 'f-1', quantity: 200 },
  { id: 'd-5-2', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'colazione', food_id: 'f-2', quantity: 40 },
  { id: 'd-5-3', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'colazione', food_id: 'f-3', quantity: 1 },
  { id: 'd-5-4', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'pranzo', food_id: 'f-4', quantity: 180 },
  { id: 'd-5-5', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'pranzo', food_id: 'f-5', quantity: 150 },
  { id: 'd-5-6', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'pranzo', food_id: 'f-7', quantity: 200 },
  { id: 'd-5-7', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'pranzo', food_id: 'f-8', quantity: 10 },
  { id: 'd-5-8', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'cena', food_id: 'f-9', quantity: 250 },
  { id: 'd-5-9', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'cena', food_id: 'f-11', quantity: 60 },
  { id: 'd-5-10', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'cena', food_id: 'f-12', quantity: 100 },
  { id: 'd-5-11', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'cena', food_id: 'f-13', quantity: 100 },
  { id: 'd-5-12', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'cena', food_id: 'f-8', quantity: 10 },

  // SABATO (Day 6 - Rotazione Pollo + Zucchine / Cena Lenticchie)
  { id: 'd-6-1', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'colazione', food_id: 'f-1', quantity: 200 },
  { id: 'd-6-2', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'colazione', food_id: 'f-2', quantity: 40 },
  { id: 'd-6-3', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'colazione', food_id: 'f-3', quantity: 1 },
  { id: 'd-6-4', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'pranzo', food_id: 'f-4', quantity: 180 },
  { id: 'd-6-5', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'pranzo', food_id: 'f-5', quantity: 150 },
  { id: 'd-6-6', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'pranzo', food_id: 'f-6', quantity: 200 },
  { id: 'd-6-7', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'pranzo', food_id: 'f-8', quantity: 10 },
  { id: 'd-6-8', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'cena', food_id: 'f-9', quantity: 250 },
  { id: 'd-6-9', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'cena', food_id: 'f-11', quantity: 60 },
  { id: 'd-6-10', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'cena', food_id: 'f-12', quantity: 100 },
  { id: 'd-6-11', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'cena', food_id: 'f-13', quantity: 100 },
  { id: 'd-6-12', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'cena', food_id: 'f-8', quantity: 10 },

  // DOMENICA (Day 7 - Rotazione Pollo + Broccoli / Cena Uova)
  { id: 'd-7-1', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'colazione', food_id: 'f-1', quantity: 200 },
  { id: 'd-7-2', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'colazione', food_id: 'f-2', quantity: 40 },
  { id: 'd-7-3', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'colazione', food_id: 'f-3', quantity: 1 },
  { id: 'd-7-4', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'pranzo', food_id: 'f-4', quantity: 180 },
  { id: 'd-7-5', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'pranzo', food_id: 'f-5', quantity: 150 },
  { id: 'd-7-6', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'pranzo', food_id: 'f-7', quantity: 200 },
  { id: 'd-7-7', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'pranzo', food_id: 'f-8', quantity: 10 },
  { id: 'd-7-8', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'cena', food_id: 'f-14', quantity: 3 },
  { id: 'd-7-9', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'cena', food_id: 'f-10', quantity: 150 },
  { id: 'd-7-10', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'cena', food_id: 'f-13', quantity: 150 },
  { id: 'd-7-11', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'cena', food_id: 'f-11', quantity: 50 },
  { id: 'd-7-12', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'cena', food_id: 'f-8', quantity: 10 },
];

class DemoStore {
  foodItems: FoodItem[] = [...INITIAL_FOOD_ITEMS];
  inventoryItems: InventoryItem[] = [...INITIAL_INVENTORY_ITEMS];
  dietPlans: DietPlan[] = [...INITIAL_DIET_PLANS];
  shoppingList: ShoppingListItem[] = [];

  reset() {
    this.foodItems = [...INITIAL_FOOD_ITEMS];
    this.inventoryItems = [...INITIAL_INVENTORY_ITEMS];
    this.dietPlans = [...INITIAL_DIET_PLANS];
    this.shoppingList = [];
  }
}

const globalForDemo = global as unknown as { demoStore?: DemoStore };
export const demoStore = globalForDemo.demoStore || new DemoStore();
if (process.env.NODE_ENV !== 'production') globalForDemo.demoStore = demoStore;
