import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Verifica di sicurezza del CRON_SECRET (se impostato su Vercel / .env)
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('key');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const isBearerValid = authHeader === `Bearer ${cronSecret}`;
      const isQueryValid = queryKey === cronSecret;

      if (!isBearerValid && !isQueryValid) {
        return NextResponse.json(
          { error: 'Non autorizzato: token CRON_SECRET non valido o mancante.' },
          { status: 401 }
        );
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Credenziali Supabase non configurate.' },
        { status: 500 }
      );
    }

    // Client Supabase per il cron job
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    // 2. Recupera tutti i lotti con data di scadenza definita
    const { data: inventoryItems, error } = await supabase
      .from('inventory_items')
      .select('id, user_id, food_id, quantity, expiration_date, created_at, food_items(name, unit, perishable, category)')
      .not('expiration_date', 'is', null);

    if (error) {
      console.error('[CRON 01:00] Errore query inventory_items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredItems: any[] = [];
    const warningItems: any[] = [];
    let safeCount = 0;

    for (const item of (inventoryItems || [])) {
      if (!item.expiration_date) continue;

      const expDate = new Date(item.expiration_date);
      expDate.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const foodName = (item.food_items as any)?.name || 'Alimento';
      const unit = (item.food_items as any)?.unit || 'g';

      const alertData = {
        batchId: item.id,
        userId: item.user_id,
        foodName,
        quantity: item.quantity,
        unit,
        expirationDate: item.expiration_date,
        daysLeft: diffDays,
      };

      if (diffDays < 0) {
        expiredItems.push({
          ...alertData,
          status: 'EXPIRED',
          message: `SCADUTO da ${Math.abs(diffDays)} giorni`,
        });
      } else if (diffDays <= 3) {
        warningItems.push({
          ...alertData,
          status: 'WARNING',
          message: diffDays === 0 ? 'Scade OGGI' : diffDays === 1 ? 'Scade DOMANI' : `Scade tra ${diffDays} giorni`,
        });
      } else {
        safeCount++;
      }
    }

    const summary = {
      timestamp: new Date().toISOString(),
      executionTime: '01:00 AM Cron Check',
      totalBatchesChecked: inventoryItems?.length || 0,
      expiredCount: expiredItems.length,
      warningCount: warningItems.length,
      safeCount,
    };

    console.log('[CRON 01:00] Controllo scadenze notturno completato con successo:', summary);
    if (expiredItems.length > 0) {
      console.warn('[CRON 01:00] Lotti scaduti rilevati:', expiredItems);
    }
    if (warningItems.length > 0) {
      console.info('[CRON 01:00] Lotti in scadenza imminente (<= 3gg):', warningItems);
    }

    return NextResponse.json({
      success: true,
      summary,
      alerts: {
        expired: expiredItems,
        expiringSoon: warningItems,
      },
    });
  } catch (err: any) {
    console.error('[CRON 01:00] Eccezione durante il controllo scadenze:', err);
    return NextResponse.json(
      { error: err?.message || 'Errore interno durante il controllo notturno.' },
      { status: 500 }
    );
  }
}
