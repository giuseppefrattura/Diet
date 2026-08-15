'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingListItem } from '@/lib/types/database';
import { commitShoppingToInventory, RestockItemPayload } from '@/actions/shopping';
import { useToast } from '@/components/ui/toast';
import { formatQuantity } from '@/lib/utils';
import { Refrigerator, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RestockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boughtItems: ShoppingListItem[];
  onComplete?: () => void;
}

export function RestockModal({
  open,
  onOpenChange,
  boughtItems,
  onComplete,
}: RestockModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  // Helper date
  const getSuggestedDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // State per memorizzare la data di scadenza di ciascun articolo
  const [expirations, setExpirations] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const initialExpirations: Record<string, string> = {};
    for (const item of boughtItems) {
      if (item.food_item?.perishable) {
        initialExpirations[item.id] = getSuggestedDate(6); // Default 6 giorni
      } else {
        initialExpirations[item.id] = '';
      }
    }
    setExpirations(initialExpirations);
  }, [boughtItems, open]);

  const handleDateChange = (id: string, date: string) => {
    setExpirations((prev) => ({ ...prev, [id]: date }));
  };

  const handleQuickAddDays = (id: string, days: number) => {
    setExpirations((prev) => ({ ...prev, [id]: getSuggestedDate(days) }));
  };

  const handleCommit = async () => {
    if (boughtItems.length === 0) return;

    // Verifica che tutti i cibi deperibili abbiano una data
    for (const item of boughtItems) {
      if (item.food_item?.perishable && !expirations[item.id]) {
        toast({
          title: 'Scadenza Mancante',
          description: `Inserisci la data di scadenza per "${item.food_item.name}".`,
          type: 'warning',
        });
        return;
      }
    }

    setLoading(true);
    try {
      const payload: RestockItemPayload[] = boughtItems.map((item) => ({
        shoppingId: item.id,
        foodId: item.food_id,
        quantity: item.quantity,
        expirationDate: expirations[item.id] || null,
      }));

      await commitShoppingToInventory(payload);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch {}

      toast({
        title: 'Dispensa Rifornita!',
        description: `${payload.length} articoli caricati nei lotti di dispensa.`,
        type: 'success',
      });

      onOpenChange(false);
      onComplete?.();
    } catch (err: any) {
      toast({
        title: 'Errore',
        description: err?.message || 'Impossibile trasferire gli articoli in dispensa.',
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
      title="Carica Spesa in Dispensa"
      description="Conferma i lotti acquistati e imposta le scadenze per i prodotti freschi."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {boughtItems.map((item) => {
            const isPerishable = item.food_item?.perishable;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {item.food_item?.name || 'Alimento'}
                    </span>
                    {isPerishable ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-md">
                        Deperibile
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 bg-slate-200 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md">
                        Lunga durata
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    +{formatQuantity(item.quantity, item.food_item?.unit || 'g')}
                  </span>
                </div>

                {/* Expiration date selector */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Data di Scadenza {isPerishable && <span className="text-rose-500 font-bold">*</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={expirations[item.id] || ''}
                      onChange={(e) => handleDateChange(item.id, e.target.value)}
                      className="text-xs h-9"
                      required={isPerishable}
                    />
                    {isPerishable && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickAddDays(item.id, 3)}
                          className="px-2 py-1 text-[10px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
                        >
                          +3gg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAddDays(item.id, 7)}
                          className="px-2 py-1 text-[10px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
                        >
                          +7gg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAddDays(item.id, 14)}
                          className="px-2 py-1 text-[10px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
                        >
                          +14gg
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annulla
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleCommit}
            disabled={loading || boughtItems.length === 0}
            className="gap-1.5"
          >
            {loading ? (
              'Caricamento...'
            ) : (
              <>
                <Refrigerator className="w-4 h-4" /> Conferma Carico ({boughtItems.length} lotti)
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
