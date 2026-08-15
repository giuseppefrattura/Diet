'use client';

import * as React from 'react';
import { ShoppingListItem, FoodItem } from '@/lib/types/database';
import {
  generateShoppingList,
  toggleShoppingItemBought,
  addManualShoppingItem,
  deleteShoppingItem,
} from '@/actions/shopping';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatQuantity, cn } from '@/lib/utils';
import { RestockModal } from './restock-modal';
import {
  ShoppingBag,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Refrigerator,
  Calendar,
  Layers,
} from 'lucide-react';

interface ShoppingListClientProps {
  initialItems: ShoppingListItem[];
  foodItems: FoodItem[];
}

export function ShoppingListClient({ initialItems, foodItems }: ShoppingListClientProps) {
  const { toast } = useToast();
  const [items, setItems] = React.useState<ShoppingListItem[]>(initialItems);
  const [selectedWindow, setSelectedWindow] = React.useState<number>(3);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showRestockModal, setShowRestockModal] = React.useState(false);

  // Manual item state
  const [manualFoodId, setManualFoodId] = React.useState(foodItems[0]?.id || '');
  const [manualQty, setManualQty] = React.useState('');

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Optimistic toggle for instant touch feedback
  const handleToggle = async (item: ShoppingListItem) => {
    const nextBoughtState = !item.is_bought;

    // Optimistic local update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_bought: nextBoughtState } : i))
    );

    try {
      await toggleShoppingItemBought(item.id, nextBoughtState);
    } catch (err) {
      // Rollback on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_bought: !nextBoughtState } : i))
      );
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare lo stato.',
        type: 'error',
      });
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateShoppingList({ daysWindow: selectedWindow });
      toast({
        title: 'Lista della Spesa Generata!',
        description: `Calcolato il fabbisogno differenziale per i prossimi ${selectedWindow} giorni sottraendo le scorte in dispensa.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Errore',
        description: err?.message || 'Impossibile generare la lista.',
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(manualQty);
    if (!manualFoodId || isNaN(qty) || qty <= 0) return;

    try {
      await addManualShoppingItem(manualFoodId, qty);
      const food = foodItems.find((f) => f.id === manualFoodId);
      toast({
        title: 'Articolo Aggiunto',
        description: `${qty} ${food?.unit || 'g'} di ${food?.name} aggiunti alla lista.`,
        type: 'success',
      });
      setShowAddModal(false);
      setManualQty('');
    } catch (err: any) {
      toast({
        title: 'Errore',
        description: err?.message || 'Impossibile aggiungere articolo.',
        type: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setItems((prev) => prev.filter((i) => i.id !== id));
      await deleteShoppingItem(id);
    } catch (err) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare articolo.',
        type: 'error',
      });
    }
  };

  const boughtItems = items.filter((i) => i.is_bought);
  const pendingItems = items.filter((i) => !i.is_bought);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Smart Generator Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Calcolo Automatico Delta</h2>
              <p className="text-xs text-emerald-100">Fabbisogno Dieta − Scorte Dispensa</p>
            </div>
          </div>
        </div>

        {/* Time Window Buttons */}
        <div>
          <label className="block text-xs font-semibold text-emerald-100 mb-2">
            Finestra di Calcolo Fabbisogno:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { days: 1, label: '1 Giorno' },
              { days: 3, label: '3 Giorni' },
              { days: 5, label: '5 Giorni' },
              { days: 7, label: 'Settimana' },
            ].map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setSelectedWindow(opt.days)}
                className={cn(
                  'py-2 px-2 rounded-xl text-xs font-semibold transition-all touch-target cursor-pointer',
                  selectedWindow === opt.days
                    ? 'bg-white text-emerald-800 shadow-md scale-[1.02]'
                    : 'bg-white/15 text-white hover:bg-white/25'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            variant="secondary"
            className="flex-1 bg-white text-emerald-800 hover:bg-emerald-50 border-none font-bold"
          >
            {isGenerating ? 'Calcolo in corso...' : `Genera Spesa per ${selectedWindow} Giorni`}
          </Button>

          <Button
            type="button"
            onClick={() => setShowAddModal(true)}
            variant="outline"
            className="bg-white/15 border-white/30 text-white hover:bg-white/25"
          >
            <Plus className="w-4 h-4" /> Altro Articolo
          </Button>
        </div>
      </div>

      {/* Action Bar when items are bought */}
      {boughtItems.length > 0 && (
        <div className="sticky top-4 z-30 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-300 dark:border-emerald-700 shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {boughtItems.length} {boughtItems.length === 1 ? 'articolo acquistato' : 'articoli acquistati'}
              </p>
              <p className="text-[11px] text-slate-500">Pronto per essere caricato in frigo/dispensa</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setShowRestockModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md font-bold text-xs"
          >
            <Refrigerator className="w-4 h-4" /> Carica in Dispensa
          </Button>
        </div>
      )}

      {/* Main Checklist */}
      <div className="space-y-4">
        {/* Pending Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Da Comprare ({pendingItems.length})
            </h3>
          </div>

          {pendingItems.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                La lista della spesa è vuota!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Clicca &quot;Genera Spesa&quot; per calcolare automaticamente il fabbisogno dei prossimi giorni oppure aggiungi articoli manualmente.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition-all duration-200"
                >
                  <button
                    onClick={() => handleToggle(item)}
                    className="flex items-center gap-3.5 text-left flex-1 min-w-0 touch-target py-1 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 hover:border-emerald-500 transition-colors">
                      <Circle className="w-4 h-4 text-transparent" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate block">
                        {item.food_item?.name || 'Alimento'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.food_item?.category || 'Generale'} {item.food_item?.perishable ? '• ❄️ Fresco' : '• 📦 Dispensa'}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      {formatQuantity(item.quantity, item.food_item?.unit || 'g')}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="touch-target p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      aria-label="Rimuovi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Items */}
        {boughtItems.length > 0 && (
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Nel Carrello / Acquistati ({boughtItems.length})
              </h3>
            </div>

            <div className="space-y-2 opacity-85">
              {boughtItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs"
                >
                  <button
                    onClick={() => handleToggle(item)}
                    className="flex items-center gap-3.5 text-left flex-1 min-w-0 touch-target py-1 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm line-through text-slate-500 dark:text-slate-400 truncate block">
                        {item.food_item?.name || 'Alimento'}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        Acquistato ✓
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-sm text-slate-500 dark:text-slate-400 line-through bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                      {formatQuantity(item.quantity, item.food_item?.unit || 'g')}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="touch-target p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      aria-label="Rimuovi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Aggiungi Articolo Manuale */}
      <Dialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Aggiungi Articolo alla Spesa"
        description="Inserisci un prodotto da acquistare anche al di fuori del piano dieta."
      >
        <form onSubmit={handleAddManual} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alimento
            </label>
            <Select
              value={manualFoodId}
              onChange={(e) => setManualFoodId(e.target.value)}
            >
              {foodItems.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name} ({food.unit})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantità
            </label>
            <Input
              type="number"
              step="any"
              min="0.1"
              value={manualQty}
              onChange={(e) => setManualQty(e.target.value)}
              placeholder="es. 500"
              required
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Annulla
            </Button>
            <Button type="submit" variant="default" size="sm">
              Aggiungi alla Lista
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Commit Restock to Inventory */}
      <RestockModal
        open={showRestockModal}
        onOpenChange={setShowRestockModal}
        boughtItems={boughtItems}
        onComplete={() => {
          setItems((prev) => prev.filter((i) => !i.is_bought));
        }}
      />
    </div>
  );
}
