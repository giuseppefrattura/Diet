import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DietPlan, MealType } from "./types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ritorna il giorno della settimana corrente (1 = Lunedì, 7 = Domenica)
 */
export function getCurrentDayOfWeek(): number {
  const day = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  return day === 0 ? 7 : day;
}

/**
 * Calcola i giorni rimanenti fino alla data di scadenza
 */
export function getDaysUntilExpiration(expirationDate: string | null): number | null {
  if (!expirationDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expirationDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina lo stato della scadenza per gli alert visivi
 */
export type ExpirationStatus = 'expired' | 'warning' | 'safe' | 'none';

export function getExpirationStatus(
  expirationDate: string | null,
  isPerishable: boolean = true
): ExpirationStatus {
  if (!expirationDate) {
    return isPerishable ? 'warning' : 'none';
  }

  const days = getDaysUntilExpiration(expirationDate);
  if (days === null) return 'none';

  if (days < 0) return 'expired';
  if (days <= 3) return 'warning';
  return 'safe';
}

/**
 * Formattazione leggibile di data in italiano (es. "18 Ago 2026")
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Nessuna scadenza';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Formattazione quantità numerica e unità (es. "150 g", "2 pz")
 */
export function formatQuantity(quantity: number, unit: string = 'g'): string {
  const formattedNumber = Number.isInteger(quantity) ? quantity.toString() : quantity.toFixed(1);
  return `${formattedNumber} ${unit}`;
}

/**
 * Raggruppa i piani alimentari per tipo pasto
 */
export function groupMealsByType(meals: DietPlan[]): Record<MealType, DietPlan[]> {
  const grouped: Record<MealType, DietPlan[]> = {
    colazione: [],
    spuntino_mattina: [],
    pranzo: [],
    merenda: [],
    cena: [],
  };

  for (const meal of meals) {
    if (grouped[meal.meal_type]) {
      grouped[meal.meal_type].push(meal);
    }
  }

  return grouped;
}
