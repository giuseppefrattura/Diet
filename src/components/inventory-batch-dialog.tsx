'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { FoodItem, InventoryItem } from '@/lib/types/database';
import { addInventoryBatch, updateInventoryBatch, deleteInventoryBatch } from '@/actions/inventory';
import { useToast } from '@/components/ui/toast';
import { Calendar, Trash2, Plus, Sparkles } from 'lucide-react';
import { FoodItemDialog } from './food-item-dialog';

interface InventoryBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodItems: FoodItem[];
  batch?: InventoryItem | null;
  defaultFoodId?: string;
}

export function InventoryBatchDialog({
  open,
  onOpenChange,
  foodItems,
  batch,
  defaultFoodId,
}: InventoryBatchDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [foodId, setFoodId] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<string>('');
  const [expirationDate, setExpirationDate] = React.useState<string>('');
  const [showCreateFoodModal, setShowCreateFoodModal] = React.useState(false);

  const selectedFood = foodItems.find((f) => f.id === foodId);

  // Helper per calcolare data predefinita (+5 giorni per cibi freschi)
  const getSuggestedExpDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  };

  React.useEffect(() => {
    if (batch) {
      setFoodId(batch.food_id);
      setQuantity(batch.quantity.toString());
      setExpirationDate(batch.expiration_date || '');
    } else {
      const initialId = defaultFoodId || (foodItems.length > 0 ? foodItems[0].id : '');
      setFoodId(initialId);
      setQuantity('');
      
      const item = foodItems.find((f) => f.id === initialId);
      if (item?.perishable) {
        setExpirationDate(getSuggestedExpDate());
      } else {
        setExpirationDate('');
      }
    }
  }, [batch, defaultFoodId, foodItems, open]);

  // Se cambia alimento selezionato, aggiorna il default della scadenza
  const handleFoodChange = (newFoodId: string) => {
    setFoodId(newFoodId);
    const item = foodItems.find((f) => f.id === newFoodId);
    if (item?.perishable && !expirationDate) {
      setExpirationDate(getSuggestedExpDate());
    } else if (!item?.perishable && !batch) {
      setExpirationDate('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseFloat(quantity);
    if (!foodId || isNaN(qtyNum) || qtyNum <= 0) {
      toast({
        title: 'Attenzione',
        description: 'Inserisci una quantità valida maggiore di 0.',
        type: 'warning',
      });
      return;
    }

    if (selectedFood?.perishable && !expirationDate) {
      toast({
        title: 'Data di scadenza richiesta',
        description: 'Questo alimento è deperibile: specifica la data di scadenza.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      if (batch) {
        await updateInventoryBatch({
          id: batch.id,
          quantity: qtyNum,
          expiration_date: selectedFood?.perishable ? expirationDate : expirationDate || null,
        });
        toast({
          title: 'Lotto Aggiornato',
          description: `Quantità aggiornata in dispensa.`,
          type: 'success',
        });
      } else {
        await addInventoryBatch({
          food_id: foodId,
          quantity: qtyNum,
          expiration_date: selectedFood?.perishable ? expirationDate : expirationDate || null,
        });
        toast({
          title: 'Lotto Aggiunto',
          description: `${qtyNum} ${selectedFood?.unit || 'g'} di ${selectedFood?.name} inseriti in dispensa.`,
          type: 'success',
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Errore',
        description: err?.message || 'Impossibile salvare il lotto.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!batch) return;
    if (!confirm('Rimuovere questo lotto dalla dispensa?')) return;

    setLoading(true);
    try {
      await deleteInventoryBatch(batch.id);
      toast({
        title: 'Lotto Rimosso',
        description: 'Lotto eliminato dalla dispensa.',
        type: 'info',
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il lotto.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title={batch ? 'Modifica Lotto Dispensa' : 'Aggiungi Scorte / Lotto'}
        description="Inserisci le provviste fisicamente presenti in frigo o dispensa."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alimento dal Catalogo
              </label>
              <button
                type="button"
                onClick={() => setShowCreateFoodModal(true)}
                className="text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Crea Nuovo
              </button>
            </div>
            <Select
              value={foodId}
              onChange={(e) => handleFoodChange(e.target.value)}
              disabled={Boolean(batch)}
            >
              {foodItems.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name} ({food.category}) {food.perishable ? '❄️ Deperibile' : '📦 Lunga conservazione'}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantità ({selectedFood?.unit || 'g'}) *
            </label>
            <Input
              type="number"
              step="any"
              min="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`es. ${selectedFood?.unit === 'g' ? '250' : '1'}`}
              required
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data di Scadenza
                {selectedFood?.perishable ? (
                  <span className="text-rose-500 font-bold">*</span>
                ) : (
                  <span className="text-slate-400 font-normal">(Opzionale)</span>
                )}
              </label>
            </div>
            <Input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              required={selectedFood?.perishable}
            />
            {selectedFood?.perishable ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                ❄️ Alimento deperibile: la data è obbligatoria per garantire il funzionamento dell&apos;algoritmo FEFO.
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                📦 Alimento non deperibile a lunga conservazione (data opzionale).
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
            {batch ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" /> Elimina
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button type="submit" variant="default" size="sm" disabled={loading}>
                {loading ? 'Salvataggio...' : batch ? 'Aggiorna Lotto' : 'Inserisci in Dispensa'}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>

      {/* Sotto-modal per creare un alimento rapido al volo */}
      <FoodItemDialog
        open={showCreateFoodModal}
        onOpenChange={setShowCreateFoodModal}
        onSuccess={(newFood) => {
          setFoodId(newFood.id);
        }}
      />
    </>
  );
}
