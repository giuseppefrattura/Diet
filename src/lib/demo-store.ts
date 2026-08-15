import { FoodItem, InventoryItem, DietPlan, ShoppingListItem } from './types/database';

export const DEMO_USER_ID = 'demo-user-diet-app';

// 1. Initial Food Items Catalog
export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  { id: 'f-1', user_id: DEMO_USER_ID, name: "Fiocchi d'Avena", unit: 'g', perishable: false, category: 'Cereali e Pane' },
  { id: 'f-2', user_id: DEMO_USER_ID, name: 'Latte di Mandorla', unit: 'ml', perishable: true, category: 'Latticini e Bevande' },
  { id: 'f-3', user_id: DEMO_USER_ID, name: 'Mandorle', unit: 'g', perishable: false, category: 'Snack e Frutta Secca' },
  { id: 'f-4', user_id: DEMO_USER_ID, name: 'Petto di Pollo', unit: 'g', perishable: true, category: 'Carne e Pesce' },
  { id: 'f-5', user_id: DEMO_USER_ID, name: 'Riso Basmati', unit: 'g', perishable: false, category: 'Cereali e Pane' },
  { id: 'f-6', user_id: DEMO_USER_ID, name: 'Zucchine', unit: 'g', perishable: true, category: 'Frutta e Verdura' },
  { id: 'f-7', user_id: DEMO_USER_ID, name: "Olio Extravergine d'Oliva", unit: 'ml', perishable: false, category: 'Condimenti' },
  { id: 'f-8', user_id: DEMO_USER_ID, name: 'Yogurt Greco 0%', unit: 'g', perishable: true, category: 'Latticini e Bevande' },
  { id: 'f-9', user_id: DEMO_USER_ID, name: 'Mela', unit: 'pz', perishable: true, category: 'Frutta e Verdura' },
  { id: 'f-10', user_id: DEMO_USER_ID, name: 'Salmone Fresco', unit: 'g', perishable: true, category: 'Carne e Pesce' },
  { id: 'f-11', user_id: DEMO_USER_ID, name: 'Broccoli', unit: 'g', perishable: true, category: 'Frutta e Verdura' },
  { id: 'f-12', user_id: DEMO_USER_ID, name: 'Pasta Integrale', unit: 'g', perishable: false, category: 'Cereali e Pane' },
  { id: 'f-13', user_id: DEMO_USER_ID, name: 'Uova', unit: 'pz', perishable: true, category: 'Uova e Latticini' },
  { id: 'f-14', user_id: DEMO_USER_ID, name: 'Parmigiano Reggiano', unit: 'g', perishable: true, category: 'Latticini e Bevande' },
  { id: 'f-15', user_id: DEMO_USER_ID, name: 'Tonno al Naturale', unit: 'g', perishable: false, category: 'Carne e Pesce' },
  { id: 'f-16', user_id: DEMO_USER_ID, name: 'Pane di Segale', unit: 'g', perishable: true, category: 'Cereali e Pane' },
  { id: 'f-17', user_id: DEMO_USER_ID, name: 'Gallette di Riso', unit: 'pz', perishable: false, category: 'Cereali e Pane' },
];

function getRelativeDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// 2. Initial Inventory Batches (Multi-batch with realistic expiration dates)
export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  // Latte di Mandorla: 2 lotti con scadenze diverse (uno in scadenza a 2gg, uno a 10gg)
  { id: 'inv-1', user_id: DEMO_USER_ID, food_id: 'f-2', quantity: 400, expiration_date: getRelativeDate(2) },
  { id: 'inv-2', user_id: DEMO_USER_ID, food_id: 'f-2', quantity: 1000, expiration_date: getRelativeDate(12) },
  // Avena (non deperibile)
  { id: 'inv-3', user_id: DEMO_USER_ID, food_id: 'f-1', quantity: 500, expiration_date: null },
  // Pollo (uno in scadenza oggi/domani, uno a 4 giorni)
  { id: 'inv-4', user_id: DEMO_USER_ID, food_id: 'f-4', quantity: 200, expiration_date: getRelativeDate(1) },
  { id: 'inv-5', user_id: DEMO_USER_ID, food_id: 'f-4', quantity: 300, expiration_date: getRelativeDate(4) },
  // Riso Basmati
  { id: 'inv-6', user_id: DEMO_USER_ID, food_id: 'f-5', quantity: 1000, expiration_date: null },
  // Zucchine (in scadenza a 2 giorni)
  { id: 'inv-7', user_id: DEMO_USER_ID, food_id: 'f-6', quantity: 250, expiration_date: getRelativeDate(2) },
  // Yogurt Greco (in scadenza tra 5 giorni)
  { id: 'inv-8', user_id: DEMO_USER_ID, food_id: 'f-8', quantity: 300, expiration_date: getRelativeDate(5) },
  // Uova (1 confezione da 6 pz con scadenza a 6 giorni)
  { id: 'inv-9', user_id: DEMO_USER_ID, food_id: 'f-13', quantity: 6, expiration_date: getRelativeDate(6) },
  // Olio EVO
  { id: 'inv-10', user_id: DEMO_USER_ID, food_id: 'f-7', quantity: 750, expiration_date: null },
  // Mandorle
  { id: 'inv-11', user_id: DEMO_USER_ID, food_id: 'f-3', quantity: 150, expiration_date: null },
];

// 3. Initial Weekly Diet Plans (Days 1 to 7: Lunedì to Domenica, 5 meals/day)
export const INITIAL_DIET_PLANS: DietPlan[] = [
  // LUNEDÌ (Day 1)
  { id: 'd-1-1', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'colazione', food_id: 'f-1', quantity: 60 },
  { id: 'd-1-2', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'colazione', food_id: 'f-2', quantity: 200 },
  { id: 'd-1-3', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'colazione', food_id: 'f-3', quantity: 15 },
  { id: 'd-1-4', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'spuntino_mattina', food_id: 'f-9', quantity: 1 },
  { id: 'd-1-5', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'pranzo', food_id: 'f-5', quantity: 80 },
  { id: 'd-1-6', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'pranzo', food_id: 'f-4', quantity: 150 },
  { id: 'd-1-7', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'pranzo', food_id: 'f-6', quantity: 200 },
  { id: 'd-1-8', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'pranzo', food_id: 'f-7', quantity: 10 },
  { id: 'd-1-9', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'merenda', food_id: 'f-8', quantity: 150 },
  { id: 'd-1-10', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'merenda', food_id: 'f-3', quantity: 10 },
  { id: 'd-1-11', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'cena', food_id: 'f-10', quantity: 180 },
  { id: 'd-1-12', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'cena', food_id: 'f-11', quantity: 200 },
  { id: 'd-1-13', user_id: DEMO_USER_ID, day_of_week: 1, meal_type: 'cena', food_id: 'f-7', quantity: 10 },

  // MARTEDÌ (Day 2)
  { id: 'd-2-1', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'colazione', food_id: 'f-16', quantity: 70 },
  { id: 'd-2-2', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'colazione', food_id: 'f-13', quantity: 2 },
  { id: 'd-2-3', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'spuntino_mattina', food_id: 'f-8', quantity: 125 },
  { id: 'd-2-4', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'pranzo', food_id: 'f-12', quantity: 80 },
  { id: 'd-2-5', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'pranzo', food_id: 'f-15', quantity: 120 },
  { id: 'd-2-6', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'pranzo', food_id: 'f-6', quantity: 150 },
  { id: 'd-2-7', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'pranzo', food_id: 'f-7', quantity: 10 },
  { id: 'd-2-8', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'merenda', food_id: 'f-9', quantity: 1 },
  { id: 'd-2-9', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'merenda', food_id: 'f-3', quantity: 15 },
  { id: 'd-2-10', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'cena', food_id: 'f-4', quantity: 180 },
  { id: 'd-2-11', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'cena', food_id: 'f-11', quantity: 200 },
  { id: 'd-2-12', user_id: DEMO_USER_ID, day_of_week: 2, meal_type: 'cena', food_id: 'f-7', quantity: 10 },

  // MERCOLEDÌ (Day 3)
  { id: 'd-3-1', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'colazione', food_id: 'f-1', quantity: 60 },
  { id: 'd-3-2', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'colazione', food_id: 'f-2', quantity: 200 },
  { id: 'd-3-3', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'spuntino_mattina', food_id: 'f-9', quantity: 1 },
  { id: 'd-3-4', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'pranzo', food_id: 'f-5', quantity: 80 },
  { id: 'd-3-5', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'pranzo', food_id: 'f-4', quantity: 150 },
  { id: 'd-3-6', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'pranzo', food_id: 'f-11', quantity: 150 },
  { id: 'd-3-7', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'merenda', food_id: 'f-8', quantity: 150 },
  { id: 'd-3-8', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'cena', food_id: 'f-13', quantity: 2 },
  { id: 'd-3-9', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'cena', food_id: 'f-6', quantity: 200 },
  { id: 'd-3-10', user_id: DEMO_USER_ID, day_of_week: 3, meal_type: 'cena', food_id: 'f-16', quantity: 50 },

  // GIOVEDÌ (Day 4)
  { id: 'd-4-1', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'colazione', food_id: 'f-1', quantity: 60 },
  { id: 'd-4-2', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'colazione', food_id: 'f-2', quantity: 200 },
  { id: 'd-4-3', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'pranzo', food_id: 'f-12', quantity: 80 },
  { id: 'd-4-4', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'pranzo', food_id: 'f-10', quantity: 150 },
  { id: 'd-4-5', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'cena', food_id: 'f-4', quantity: 160 },
  { id: 'd-4-6', user_id: DEMO_USER_ID, day_of_week: 4, meal_type: 'cena', food_id: 'f-6', quantity: 200 },

  // VENERDÌ (Day 5)
  { id: 'd-5-1', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'colazione', food_id: 'f-1', quantity: 60 },
  { id: 'd-5-2', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'colazione', food_id: 'f-2', quantity: 200 },
  { id: 'd-5-3', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'pranzo', food_id: 'f-5', quantity: 80 },
  { id: 'd-5-4', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'pranzo', food_id: 'f-15', quantity: 120 },
  { id: 'd-5-5', user_id: DEMO_USER_ID, day_of_week: 5, meal_type: 'cena', food_id: 'f-10', quantity: 180 },

  // SABATO (Day 6)
  { id: 'd-6-1', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'colazione', food_id: 'f-16', quantity: 80 },
  { id: 'd-6-2', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'colazione', food_id: 'f-13', quantity: 2 },
  { id: 'd-6-3', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'pranzo', food_id: 'f-5', quantity: 90 },
  { id: 'd-6-4', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'pranzo', food_id: 'f-4', quantity: 160 },
  { id: 'd-6-5', user_id: DEMO_USER_ID, day_of_week: 6, meal_type: 'cena', food_id: 'f-10', quantity: 200 },

  // DOMENICA (Day 7)
  { id: 'd-7-1', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'colazione', food_id: 'f-1', quantity: 70 },
  { id: 'd-7-2', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'colazione', food_id: 'f-2', quantity: 220 },
  { id: 'd-7-3', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'pranzo', food_id: 'f-12', quantity: 90 },
  { id: 'd-7-4', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'pranzo', food_id: 'f-4', quantity: 150 },
  { id: 'd-7-5', user_id: DEMO_USER_ID, day_of_week: 7, meal_type: 'cena', food_id: 'f-13', quantity: 2 },
];

// Global in-memory state for local/demo storage
class DemoStore {
  foodItems: FoodItem[] = [...INITIAL_FOOD_ITEMS];
  inventoryItems: InventoryItem[] = [...INITIAL_INVENTORY_ITEMS];
  dietPlans: DietPlan[] = [...INITIAL_DIET_PLANS];
  shoppingList: ShoppingListItem[] = [];

  // Reset to initial
  reset() {
    this.foodItems = [...INITIAL_FOOD_ITEMS];
    this.inventoryItems = [...INITIAL_INVENTORY_ITEMS];
    this.dietPlans = [...INITIAL_DIET_PLANS];
    this.shoppingList = [];
  }
}

// Global singleton for server-side persistence in dev mode
const globalForDemo = global as unknown as { demoStore?: DemoStore };
export const demoStore = globalForDemo.demoStore || new DemoStore();
if (process.env.NODE_ENV !== 'production') globalForDemo.demoStore = demoStore;
