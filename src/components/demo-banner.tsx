'use client';

import * as React from 'react';
import { Database, ShieldCheck, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function DemoBanner() {
  const [configured, setConfigured] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setConfigured(isSupabaseConfigured());
  }, []);

  if (configured === null) return null;

  return (
    <div className="w-full bg-slate-900 text-slate-200 text-xs px-4 py-2 flex items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          {configured ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Supabase Database Connesso
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Database className="w-4 h-4" /> Modalità Demo Locale Attiva (In-Memory)
            </span>
          )}
          <span className="hidden sm:inline text-slate-400">
            {configured
              ? 'Tutti i dati sono sincronizzati con PostgreSQL e RLS.'
              : 'Nessun DB esterno richiesto. Puoi testare ogni funzionalità liberamente.'}
          </span>
        </div>
      </div>
    </div>
  );
}
