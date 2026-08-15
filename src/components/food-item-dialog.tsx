'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { FoodItem, FOOD_CATEGORIES } from '@/lib/types/database';
import { addFoodItem, updateFoodItem, deleteFoodItem } from '@/actions/inventory';
import { useToast } from '@/components/ui/toast';
import { Trash2, Plus } from 'lucide-react';

interface FoodItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodItem?: FoodItem | null;
  onSuccess?: (item: { id: string; name: string }) => void;
}

export function FoodItemDialog({
  open,
  onOpenChange,
  foodItem,
  onSuccess,
}: FoodItemDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState('');
  const [unit, setUnit] = React.useState('g');
  const [category, setCategory] = React.useState<string>('Generale');
  const [perishable, setPerishable] = React.useState(true);

  React.useEffect(() => {
    if (foodItem) {
      setName(foodItem.name);
      setUnit(foodItem.unit);
      setCategory(foodItem.category || 'Generale');
      setPerishable(foodItem.perishable);
    } else {
      setName('');
      setUnit('g');
      setCategory('Generale');
      setPerishable(true);
    }
  }, [foodItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (foodItem) {
        await updateFoodItem({
          id: foodItem.id,
          name,
          unit,
          perishable,
          category,
        });
        toast({
          title: 'Alimento Aggiornato',
          description: `"${name}" modificato con successo nel catalogo.`,
          type: 'success',
        });
        onSuccess?.({ id: foodItem.id, name });
      } else {
        const res = await addFoodItem({
          name,
          unit,
          perishable,
          category,
        });
        toast({
          title: 'Nuovo Alimento Creato',
          description: `"${name}" aggiunto al catalogo alimenti.`,
          type: 'success',
        });
        if (res.id) {
          onSuccess?.({ id: res.id, name });
        }
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Errore',
        description: err?.message || 'Si è verificato un errore durante il salvataggio.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!foodItem) return;
    if (!confirm(`Sei sicuro di voler eliminare "${foodItem.name}" dal catalogo? Verranno rimossi anche i lotti e i pasti associati.`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteFoodItem(foodItem.id);
      toast({
        title: 'Alimento Eliminato',
        description: `"${foodItem.name}" è stato rimosso dal catalogo.`,
        type: 'info',
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare questo alimento.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={foodItem ? 'Modifica Alimento Master' : 'Crea Nuovo Alimento'}
      description="Inserisci le caratteristiche di base dell'alimento nel catalogo."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nome Alimento *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Petto di Pollo, Mela, Avena"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Unità di Misura
            </label>
            <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="g">Grammi (g)</option>
              <option value="ml">Millilitri (ml)</option>
              <option value="pz">Pezzi (pz)</option>
              <option value="kg">Chilogrammi (kg)</option>
              <option value="l">Litri (l)</option>
              <option value="fette">Fette</option>
              <option value="cucchiai">Cucchiai</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Categoria
            </label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {FOOD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Perishable Checkbox */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Alimento Deperibile (Frigo / Scadenza)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Se attivo, richiederà obbligatoriamente una data di scadenza nei lotti e negli acquisti.
            </p>
          </div>
          <input
            type="checkbox"
            checked={perishable}
            onChange={(e) => setPerishable(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
          {foodItem ? (
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
              {loading ? 'Salvataggio...' : foodItem ? 'Aggiorna' : 'Crea Alimento'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
