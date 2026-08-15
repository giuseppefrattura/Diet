'use client';

import * as React from 'react';
import { DietPlan, InventoryItem, FoodItem, MEAL_TYPES, DAYS_OF_WEEK } from '@/lib/types/database';
import { MealCard } from '@/components/meal-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  getCurrentDayOfWeek,
  getDaysUntilExpiration,
  getExpirationStatus,
  formatDate,
  formatQuantity,
  cn,
} from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  Calendar,
  Refrigerator,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { InventoryBatchDialog } from './inventory-batch-dialog';

interface DashboardClientProps {
  dietPlans: DietPlan[];
  inventoryItems: InventoryItem[];
  foodItems: FoodItem[];
  shoppingCount: number;
}

export function DashboardClient({
  dietPlans,
  inventoryItems,
  foodItems,
  shoppingCount,
}: DashboardClientProps) {
  const currentDayOfWeek = getCurrentDayOfWeek();
  const [selectedDay, setSelectedDay] = React.useState<number>(currentDayOfWeek);
  const [showAddBatchModal, setShowAddBatchModal] = React.useState(false);

  // Filtra i pasti per il giorno selezionato
  const dayMeals = dietPlans.filter((p) => p.day_of_week === selectedDay);

  // Calcola scadenze imminenti o scaduti
  const expirations = inventoryItems
    .filter((inv) => inv.expiration_date !== null)
    .map((inv) => {
      const days = getDaysUntilExpiration(inv.expiration_date);
      const status = getExpirationStatus(inv.expiration_date, true);
      return {
        ...inv,
        daysLeft: days,
        status,
      };
    })
    .filter((inv) => inv.status === 'expired' || inv.status === 'warning')
    .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));

  const expiredCount = expirations.filter((e) => e.status === 'expired').length;
  const warningCount = expirations.filter((e) => e.status === 'warning').length;

  const todayName = DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name || 'Oggi';

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header with Title & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" /> Programma Alimentare Giornaliero
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Pasti di {todayName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowAddBatchModal(true)}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Aggiungi Scorta
          </Button>
          <Link href="/shopping">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Spesa ({shoppingCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* Day Selector Tabs (Lun -> Dom) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const isToday = day.id === currentDayOfWeek;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={cn(
                'px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all touch-target cursor-pointer flex items-center gap-1.5',
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              )}
            >
              {day.name}
              {isToday && (
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isSelected ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-500'
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Expirations Alert Banner */}
      {expirations.length > 0 && (
        <div
          className={cn(
            'p-4 rounded-3xl border shadow-sm transition-all',
            expiredCount > 0
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
              : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {expiredCount > 0 ? (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Allerta Scadenze ({expirations.length} {expirations.length === 1 ? 'prodotto' : 'prodotti'})
              </h3>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-0.5"
            >
              Vedi Dispensa <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {expirations.map((item) => (
              <div
                key={item.id}
                className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800 shrink-0 min-w-[180px] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {item.food_item?.name || 'Alimento'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {formatQuantity(item.quantity, item.food_item?.unit || 'g')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{formatDate(item.expiration_date)}</span>
                  <Badge
                    variant={item.status === 'expired' ? 'danger' : 'warning'}
                    className="text-[9px] px-1.5 py-0"
                  >
                    {item.daysLeft !== null && item.daysLeft < 0
                      ? 'Scaduto'
                      : item.daysLeft === 0
                      ? 'Scade Oggi'
                      : item.daysLeft === 1
                      ? 'Scade Domani'
                      : `${item.daysLeft} gg rimasti`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5 Meal Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            5 Pasti Giornalieri
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Algoritmo FEFO attivo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEAL_TYPES.map((mealTypeObj) => {
            const slotItems = dayMeals.filter((m) => m.meal_type === mealTypeObj.id);

            return (
              <MealCard
                key={mealTypeObj.id}
                mealType={mealTypeObj.id}
                dayOfWeek={selectedDay}
                dietItems={slotItems}
                inventoryItems={inventoryItems}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Overview Footer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-200 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500 text-white">
                <Refrigerator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scorte in Dispensa</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {inventoryItems.length} {inventoryItems.length === 1 ? 'Lotto' : 'Lotti'}
                </p>
              </div>
            </div>
            <Link href="/inventory">
              <Button variant="ghost" size="sm">
                Gestisci
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border-teal-200 dark:border-teal-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-600 text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lista della Spesa</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {shoppingCount} {shoppingCount === 1 ? 'Articolo' : 'Articoli'}
                </p>
              </div>
            </div>
            <Link href="/shopping">
              <Button variant="ghost" size="sm">
                Apri Spesa
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Dialog Aggiungi Lotto rapido */}
      <InventoryBatchDialog
        open={showAddBatchModal}
        onOpenChange={setShowAddBatchModal}
        foodItems={foodItems}
      />
    </div>
  );
}
