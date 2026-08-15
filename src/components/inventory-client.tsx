'use client';

import * as React from 'react';
import { InventoryItem, FoodItem, FOOD_CATEGORIES } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { InventoryBatchDialog } from './inventory-batch-dialog';
import { FoodItemDialog } from './food-item-dialog';
import {
  formatDate,
  formatQuantity,
  getDaysUntilExpiration,
  getExpirationStatus,
  cn,
} from '@/lib/utils';
import {
  Refrigerator,
  BookOpen,
  Plus,
  Search,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';

interface InventoryClientProps {
  initialInventory: InventoryItem[];
  initialFoodItems: FoodItem[];
}

export function InventoryClient({
  initialInventory,
  initialFoodItems,
}: InventoryClientProps) {
  const [activeTab, setActiveTab] = React.useState<'stock' | 'catalog'>('stock');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'expiring' | 'perishable' | 'pantry'>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');

  // Modals state
  const [showAddBatchModal, setShowAddBatchModal] = React.useState(false);
  const [editingBatch, setEditingBatch] = React.useState<InventoryItem | null>(null);
  const [showAddFoodModal, setShowAddFoodModal] = React.useState(false);
  const [editingFood, setEditingFood] = React.useState<FoodItem | null>(null);

  // Filtered Stock Items (Sorted FEFO: expiration_date ASC NULLS LAST)
  const filteredStock = initialInventory
    .filter((item) => {
      const foodName = item.food_item?.name?.toLowerCase() || '';
      const category = item.food_item?.category?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      const matchesSearch = foodName.includes(query) || category.includes(query);

      if (!matchesSearch) return false;

      const isPerishable = Boolean(item.food_item?.perishable);
      const status = getExpirationStatus(item.expiration_date, isPerishable);

      if (statusFilter === 'expiring') return status === 'expired' || status === 'warning';
      if (statusFilter === 'perishable') return isPerishable;
      if (statusFilter === 'pantry') return !isPerishable;
      return true;
    })
    .sort((a, b) => {
      if (!a.expiration_date && !b.expiration_date) return 0;
      if (!a.expiration_date) return 1;
      if (!b.expiration_date) return -1;
      return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
    });

  // Filtered Food Catalog
  const filteredCatalog = initialFoodItems.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || food.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dispensa & Frigo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Gestisci le scorte fisiche dei lotti e il catalogo alimenti master.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'stock' ? (
            <Button
              onClick={() => {
                setEditingBatch(null);
                setShowAddBatchModal(true);
              }}
              size="sm"
              className="gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Aggiungi Lotto
            </Button>
          ) : (
            <Button
              onClick={() => {
                setEditingFood(null);
                setShowAddFoodModal(true);
              }}
              size="sm"
              className="gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nuovo Alimento
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 max-w-md">
        <button
          onClick={() => setActiveTab('stock')}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'stock'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          )}
        >
          <Refrigerator className="w-4 h-4 text-emerald-500" />
          Scorte Lotti ({initialInventory.length})
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
            activeTab === 'catalog'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          )}
        >
          <BookOpen className="w-4 h-4 text-teal-500" />
          Catalogo Alimenti ({initialFoodItems.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'stock' ? 'Cerca lotti in dispensa...' : 'Cerca alimenti nel catalogo...'}
            className="pl-9"
          />
        </div>

        {activeTab === 'stock' ? (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'Tutti' },
              { id: 'expiring', label: '⚠️ In Scadenza' },
              { id: 'perishable', label: '❄️ Frigo/Freschi' },
              { id: 'pantry', label: '📦 Dispensa' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-target cursor-pointer',
                  statusFilter === f.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full sm:w-56">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tutte le Categorie</option>
              {FOOD_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* TAB 1: STOCK INVENTORY */}
      {activeTab === 'stock' && (
        <div className="space-y-3">
          {filteredStock.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <Refrigerator className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nessun lotto trovato
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Aggiungi nuove scorte per rifornire la tua dispensa.
              </p>
              <Button
                onClick={() => setShowAddBatchModal(true)}
                size="sm"
                className="mt-4"
              >
                <Plus className="w-4 h-4" /> Aggiungi Lotto Ora
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStock.map((item) => {
                const isPerishable = Boolean(item.food_item?.perishable);
                const daysLeft = getDaysUntilExpiration(item.expiration_date);
                const status = getExpirationStatus(item.expiration_date, isPerishable);

                return (
                  <Card
                    key={item.id}
                    className="p-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            {item.food_item?.name || 'Alimento'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.food_item?.category || 'Generale'}
                          </p>
                        </div>

                        <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
                          {formatQuantity(item.quantity, item.food_item?.unit || 'g')}
                        </span>
                      </div>

                      {/* Expiration Info */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {formatDate(item.expiration_date)}
                          </span>
                        </div>

                        {status === 'expired' && (
                          <Badge variant="danger" className="text-[10px]">
                            <AlertCircle className="w-3 h-3" /> Scaduto
                          </Badge>
                        )}
                        {status === 'warning' && (
                          <Badge variant="warning" className="text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> {daysLeft === 0 ? 'Scade Oggi' : daysLeft === 1 ? 'Scade Domani' : `${daysLeft} gg rimasti`}
                          </Badge>
                        )}
                        {status === 'safe' && (
                          <Badge variant="success" className="text-[10px]">
                            {daysLeft} gg rimasti
                          </Badge>
                        )}
                        {status === 'none' && (
                          <Badge variant="secondary" className="text-[10px]">
                            Non deperibile
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBatch(item);
                          setShowAddBatchModal(true);
                        }}
                        className="text-xs h-8 px-2.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Modifica Lotto
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FOOD CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCatalog.map((food) => (
              <Card
                key={food.id}
                className="p-4 hover:border-teal-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {food.name}
                    </h3>
                    <Badge variant={food.perishable ? 'warning' : 'secondary'} className="text-[10px]">
                      {food.perishable ? '❄️ Deperibile' : '📦 Dispensa'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {food.category} • Unità: <span className="font-mono font-semibold">{food.unit}</span>
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingFood(food);
                      setShowAddFoodModal(true);
                    }}
                    className="text-xs h-8 px-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Modifica
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingBatch(null);
                      setShowAddBatchModal(true);
                    }}
                    className="text-xs h-8 px-2 text-emerald-600 border-emerald-300 dark:border-emerald-800"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aggiungi Scorta
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <InventoryBatchDialog
        open={showAddBatchModal}
        onOpenChange={setShowAddBatchModal}
        foodItems={initialFoodItems}
        batch={editingBatch}
      />

      <FoodItemDialog
        open={showAddFoodModal}
        onOpenChange={setShowAddFoodModal}
        foodItem={editingFood}
      />
    </div>
  );
}
