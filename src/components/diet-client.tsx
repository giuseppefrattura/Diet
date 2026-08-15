'use client';

import * as React from 'react';
import { DietPlan, FoodItem, MealType, MEAL_TYPES, DAYS_OF_WEEK } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  addDietPlanItem,
  updateDietPlanItem,
  deleteDietPlanItem,
  copyDayPlan,
  seedDefaultDietPlan,
} from '@/actions/diet';
import { useToast } from '@/components/ui/toast';
import { formatQuantity, getCurrentDayOfWeek, cn } from '@/lib/utils';
import {
  CalendarDays,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Sparkles,
  Sun,
  Coffee,
  Utensils,
  Apple,
  Moon,
  RotateCcw,
} from 'lucide-react';
import { FoodItemDialog } from './food-item-dialog';

interface DietClientProps {
  initialDietPlans: DietPlan[];
  foodItems: FoodItem[];
}

export function DietClient({
  initialDietPlans,
  foodItems,
}: DietClientProps) {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = React.useState<number>(getCurrentDayOfWeek());
  const [dietPlans, setDietPlans] = React.useState<DietPlan[]>(initialDietPlans);

  // Add / Edit Modal state
  const [showItemModal, setShowItemModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<DietPlan | null>(null);
  const [targetMealType, setTargetMealType] = React.useState<MealType>('colazione');
  const [selectedFoodId, setSelectedFoodId] = React.useState<string>(foodItems[0]?.id || '');
  const [quantity, setQuantity] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  // Copy Day Modal state
  const [showCopyModal, setShowCopyModal] = React.useState(false);
  const [copyToDay, setCopyToDay] = React.useState<number>(2);

  // Food Catalog creation modal
  const [showCreateFoodModal, setShowCreateFoodModal] = React.useState(false);

  React.useEffect(() => {
    setDietPlans(initialDietPlans);
  }, [initialDietPlans]);

  const selectedFood = foodItems.find((f) => f.id === selectedFoodId);
  const currentDayMeals = dietPlans.filter((p) => p.day_of_week === selectedDay);

  const handleOpenAdd = (mealType: MealType) => {
    setEditingItem(null);
    setTargetMealType(mealType);
    setSelectedFoodId(foodItems[0]?.id || '');
    setQuantity('');
    setShowItemModal(true);
  };

  const handleOpenEdit = (item: DietPlan) => {
    setEditingItem(item);
    setTargetMealType(item.meal_type);
    setSelectedFoodId(item.food_id);
    setQuantity(item.quantity.toString());
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!selectedFoodId || isNaN(qty) || qty <= 0) {
      toast({
        title: 'Attenzione',
        description: 'Inserisci una quantità valida maggiore di 0.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await updateDietPlanItem({
          id: editingItem.id,
          food_id: selectedFoodId,
          quantity: qty,
        });
        toast({
          title: 'Elemento Modificato',
          description: 'Pasto aggiornato con successo.',
          type: 'success',
        });
      } else {
        await addDietPlanItem({
          day_of_week: selectedDay,
          meal_type: targetMealType,
          food_id: selectedFoodId,
          quantity: qty,
        });
        toast({
          title: 'Alimento Aggiunto',
          description: 'Alimento inserito nel piano del pasto.',
          type: 'success',
        });
      }
      setShowItemModal(false);
    } catch (err: any) {
      toast({
        title: 'Errore',
        description: err?.message || 'Impossibile salvare il pasto.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDietPlanItem(id);
      toast({
        title: 'Alimento Rimosso',
        description: 'Alimento eliminato dal piano pasti.',
        type: 'info',
      });
    } catch (err) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare alimento.',
        type: 'error',
      });
    }
  };

  const handleCopyDay = async () => {
    setLoading(true);
    try {
      await copyDayPlan(selectedDay, copyToDay);
      const sourceName = DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name;
      const targetName = DAYS_OF_WEEK.find((d) => d.id === copyToDay)?.name;
      toast({
        title: 'Piano Copiato!',
        description: `Pasti di ${sourceName} duplicati con successo su ${targetName}.`,
        type: 'success',
      });
      setShowCopyModal(false);
    } catch (err) {
      toast({
        title: 'Errore',
        description: 'Impossibile copiare il piano del giorno.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSample = async () => {
    if (!confirm('Vuoi ripristinare il piano alimentare di esempio completo per tutti i 7 giorni?')) {
      return;
    }
    setLoading(true);
    try {
      await seedDefaultDietPlan();
      toast({
        title: 'Piano Esempio Ripristinato',
        description: 'Configurazione settimanale di default caricata.',
        type: 'success',
      });
    } catch (err) {
      toast({
        title: 'Errore',
        description: 'Impossibile ripristinare piano.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (type: MealType) => {
    switch (type) {
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
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Piano Dieta Settimanale
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Definisci i 5 pasti fissi per ciascun giorno della settimana (nessun conteggio calorie).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCopyModal(true)}
            className="gap-1.5 shadow-sm"
          >
            <Copy className="w-4 h-4" /> Copia Giorno
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetSample}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Ripristina Default
          </Button>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const dayItemsCount = dietPlans.filter((p) => p.day_of_week === day.id).length;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={cn(
                'px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all touch-target cursor-pointer flex items-center gap-2',
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              )}
            >
              <span>{day.name}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  isSelected
                    ? 'bg-emerald-700/80 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {dayItemsCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5 Meal Slots */}
      <div className="space-y-4">
        {MEAL_TYPES.map((mealTypeObj) => {
          const slotItems = currentDayMeals.filter((m) => m.meal_type === mealTypeObj.id);

          return (
            <Card key={mealTypeObj.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center">
                    {getMealIcon(mealTypeObj.id)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{mealTypeObj.label}</CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {mealTypeObj.timeHint}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenAdd(mealTypeObj.id)}
                  className="gap-1 text-xs h-8 px-2.5 border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                >
                  <Plus className="w-3.5 h-3.5" /> Aggiungi
                </Button>
              </CardHeader>

              <CardContent className="pt-3 space-y-2">
                {slotItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Nessun alimento programmato per questo pasto. Clicca &quot;Aggiungi&quot; per iniziare.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {slotItems.map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between text-sm first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {item.food_item?.name || 'Alimento'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({item.food_item?.category || 'Generale'})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            {formatQuantity(item.quantity, item.food_item?.unit || 'g')}
                          </span>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                            aria-label="Modifica"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            aria-label="Elimina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Aggiungi/Modifica Alimento nel Pasto */}
      <Dialog
        open={showItemModal}
        onOpenChange={setShowItemModal}
        title={editingItem ? 'Modifica Alimento Pasto' : 'Aggiungi Alimento al Pasto'}
        description={`Slot: ${MEAL_TYPES.find((m) => m.id === targetMealType)?.label} - ${DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}`}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Seleziona Alimento
              </label>
              <button
                type="button"
                onClick={() => setShowCreateFoodModal(true)}
                className="text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Crea Nuovo Alimento
              </button>
            </div>
            <Select
              value={selectedFoodId}
              onChange={(e) => setSelectedFoodId(e.target.value)}
            >
              {foodItems.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.category}) - {f.unit}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantità Prevista ({selectedFood?.unit || 'g'}) *
            </label>
            <Input
              type="number"
              step="any"
              min="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`es. ${selectedFood?.unit === 'g' ? '150' : '1'}`}
              required
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowItemModal(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" variant="default" size="sm" disabled={loading}>
              {loading ? 'Salvataggio...' : editingItem ? 'Aggiorna' : 'Aggiungi al Pasto'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Copia Giorno */}
      <Dialog
        open={showCopyModal}
        onOpenChange={setShowCopyModal}
        title="Duplica Piano Giorno"
        description={`Copia tutti i 5 pasti di ${DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name} su un altro giorno.`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Copia su Giorno:
            </label>
            <Select
              value={copyToDay}
              onChange={(e) => setCopyToDay(parseInt(e.target.value))}
            >
              {DAYS_OF_WEEK.filter((d) => d.id !== selectedDay).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>

          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
            ⚠️ I pasti attualmente configurati nel giorno di destinazione verranno sostituiti.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCopyModal(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleCopyDay}
              disabled={loading}
            >
              {loading ? 'Copia in corso...' : 'Conferma Duplicazione'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Sub-modal per creare al volo un nuovo alimento */}
      <FoodItemDialog
        open={showCreateFoodModal}
        onOpenChange={setShowCreateFoodModal}
        onSuccess={(newFood) => {
          setSelectedFoodId(newFood.id);
        }}
      />
    </div>
  );
}
