'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DietPlan, InventoryItem, MealType, MEAL_TYPES } from '@/lib/types/database';
import { consumeMeal } from '@/actions/inventory';
import { useToast } from '@/components/ui/toast';
import { formatQuantity, cn } from '@/lib/utils';
import { CheckCircle2, Clock, Utensils, AlertTriangle, Sparkles, Sun, Coffee, Apple, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MealCardProps {
  mealType: MealType;
  dayOfWeek: number;
  dietItems: DietPlan[];
  inventoryItems: InventoryItem[];
}

export function MealCard({
  mealType,
  dayOfWeek,
  dietItems,
  inventoryItems,
}: MealCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [consumedToday, setConsumedToday] = React.useState(false);

  const mealMeta = MEAL_TYPES.find((m) => m.id === mealType) || {
    label: mealType,
    timeHint: '',
    icon: 'Utensils',
  };

  const getMealIcon = () => {
    switch (mealType) {
      case 'colazione':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'spuntino_mattina':
        return <Coffee className="w-5 h-5 text-orange-500" />;
      case 'pranzo':
        return <Utensils className="w-5 h-5 text-emerald-500" />;
      case 'merenda':
        return <Apple className="w-5 h-5 text-teal-500" />;
      case 'cena':
        return <Moon className="w-5 h-5 text-indigo-500" />;
      default:
        return <Utensils className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Calcola disponibilità in dispensa per ogni ingrediente
  const ingredientsStatus = dietItems.map((item) => {
    const totalInStock = inventoryItems
      .filter((inv) => inv.food_id === item.food_id)
      .reduce((sum, inv) => sum + inv.quantity, 0);

    const isAvailable = totalInStock >= item.quantity;
    const isPartial = totalInStock > 0 && totalInStock < item.quantity;
    const isMissing = totalInStock === 0;

    return {
      ...item,
      totalInStock,
      isAvailable,
      isPartial,
      isMissing,
    };
  });

  const allAvailable = ingredientsStatus.length > 0 && ingredientsStatus.every((i) => i.isAvailable);
  const hasMissing = ingredientsStatus.some((i) => i.isMissing || i.isPartial);

  const handleConsume = async () => {
    if (dietItems.length === 0) return;

    setLoading(true);
    try {
      const result = await consumeMeal(mealType, dayOfWeek);

      if (result.success) {
        setConsumedToday(true);
        // Confetti celebration
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6'],
          });
        } catch {}

        toast({
          title: `Pasto ${mealMeta.label} Consumato!`,
          description: result.message,
          type: result.results.every((r) => r.isFullyFulfilled) ? 'success' : 'warning',
        });
      } else {
        toast({
          title: 'Attenzione',
          description: result.message,
          type: 'warning',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Errore',
        description: err?.message || 'Impossibile consumare il pasto.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn('relative overflow-hidden transition-all', consumedToday && 'opacity-70 bg-slate-50 dark:bg-slate-900/40')}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {getMealIcon()}
          </div>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {mealMeta.label}
              {consumedToday && (
                <Badge variant="success" className="text-[10px]">
                  Consumato
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> {mealMeta.timeHint}
            </p>
          </div>
        </div>

        {dietItems.length > 0 && (
          <Badge
            variant={allAvailable ? 'success' : hasMissing ? 'warning' : 'secondary'}
            className="text-[11px]"
          >
            {allAvailable
              ? 'Pronto in Dispensa'
              : hasMissing
              ? 'Ingredienti Insufficienti'
              : 'Nessun Ingrediente'}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {dietItems.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            Nessun alimento programmato per questo pasto.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {ingredientsStatus.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between text-sm first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      item.isAvailable
                        ? 'bg-emerald-500'
                        : item.isPartial
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    )}
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.food_item?.name || 'Alimento'}
                  </span>
                  {item.food_item?.perishable && (
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                      [❄️]
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {formatQuantity(item.quantity, item.food_item?.unit || 'g')}
                  </span>
                  <span
                    className={cn(
                      'text-[11px]',
                      item.isAvailable
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-rose-500 font-semibold'
                    )}
                  >
                    (disp: {formatQuantity(item.totalInStock, item.food_item?.unit || 'g')})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {dietItems.length > 0 && (
          <div className="pt-2">
            <Button
              onClick={handleConsume}
              disabled={loading || consumedToday}
              variant={consumedToday ? 'secondary' : 'default'}
              size="md"
              className="w-full justify-center shadow-xs"
            >
              {loading ? (
                'Elaborazione FEFO...'
              ) : consumedToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Già Consumato Oggi
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Consuma Pasto (Scala Scorte FEFO)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
