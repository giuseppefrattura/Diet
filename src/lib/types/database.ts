export type MealType =
  | 'colazione'
  | 'spuntino_mattina'
  | 'pranzo'
  | 'merenda'
  | 'cena';

export const MEAL_TYPES: { id: MealType; label: string; timeHint: string; icon: string }[] = [
  { id: 'colazione', label: 'Colazione', timeHint: '07:30 - 09:00', icon: 'Sun' },
  { id: 'spuntino_mattina', label: 'Spuntino Mattina', timeHint: '10:30 - 11:30', icon: 'Coffee' },
  { id: 'pranzo', label: 'Pranzo', timeHint: '12:45 - 14:00', icon: 'Utensils' },
  { id: 'merenda', label: 'Merenda', timeHint: '16:30 - 17:30', icon: 'Apple' },
  { id: 'cena', label: 'Cena', timeHint: '19:45 - 21:00', icon: 'Moon' },
];

export const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunedì', shortName: 'Lun' },
  { id: 2, name: 'Martedì', shortName: 'Mar' },
  { id: 3, name: 'Mercoledì', shortName: 'Mer' },
  { id: 4, name: 'Giovedì', shortName: 'Gio' },
  { id: 5, name: 'Venerdì', shortName: 'Ven' },
  { id: 6, name: 'Sabato', shortName: 'Sab' },
  { id: 7, name: 'Domenica', shortName: 'Dom' },
];

export const FOOD_CATEGORIES = [
  'Frutta e Verdura',
  'Latticini e Bevande',
  'Carne e Pesce',
  'Uova e Latticini',
  'Cereali e Pane',
  'Legumi e Semi',
  'Condimenti',
  'Snack e Frutta Secca',
  'Generale',
] as const;

export type FoodCategory = typeof FOOD_CATEGORIES[number];

export interface FoodItem {
  id: string;
  user_id: string;
  name: string;
  unit: string;
  perishable: boolean;
  category: string;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  food_id: string;
  quantity: number;
  expiration_date: string | null;
  created_at?: string;
  food_item?: FoodItem;
}

export interface DietPlan {
  id: string;
  user_id: string;
  day_of_week: number; // 1=Mon, 7=Sun
  meal_type: MealType;
  food_id: string;
  quantity: number;
  created_at?: string;
  food_item?: FoodItem;
}

export interface ShoppingListItem {
  id: string;
  user_id: string;
  food_id: string;
  quantity: number;
  is_bought: boolean;
  created_at?: string;
  food_item?: FoodItem;
}

export interface Database {
  public: {
    Tables: {
      food_items: {
        Row: FoodItem;
        Insert: Omit<FoodItem, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<FoodItem>;
      };
      inventory_items: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, 'id' | 'created_at' | 'food_item'> & { id?: string; created_at?: string };
        Update: Partial<InventoryItem>;
      };
      diet_plans: {
        Row: DietPlan;
        Insert: Omit<DietPlan, 'id' | 'created_at' | 'food_item'> & { id?: string; created_at?: string };
        Update: Partial<DietPlan>;
      };
      shopping_list: {
        Row: ShoppingListItem;
        Insert: Omit<ShoppingListItem, 'id' | 'created_at' | 'food_item'> & { id?: string; created_at?: string };
        Update: Partial<ShoppingListItem>;
      };
    };
    Enums: {
      meal_type_enum: MealType;
    };
  };
}
