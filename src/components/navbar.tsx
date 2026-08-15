'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Refrigerator, CalendarDays, ShoppingBag, UtensilsCrossed, Apple, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/actions/auth';

export const NAV_ITEMS = [
  { href: '/', label: 'Oggi', icon: LayoutDashboard },
  { href: '/inventory', label: 'Dispensa', icon: Refrigerator },
  { href: '/diet', label: 'Dieta', icon: CalendarDays },
  { href: '/shopping', label: 'Spesa', icon: ShoppingBag },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Top/Side Navigation */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 p-6">
        <div className="flex items-center gap-3 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Diet Fridge <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Smart Food & FEFO</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 my-6 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200',
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-slate-500')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Quick hint box */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 mb-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs mb-1">
            <Apple className="w-4 h-4" /> Algoritmo FEFO
          </div>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
            I lotti in scadenza vengono consumati per primi automaticamente.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnetti Account</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Fixed, touch-friendly min 48px targets) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center touch-target flex-1 py-1.5 rounded-xl transition-all duration-200 active:scale-95',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                <div
                  className={cn(
                    'p-1.5 rounded-xl transition-colors',
                    isActive && 'bg-emerald-100 dark:bg-emerald-950/60'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] tracking-tight mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
