-- ==============================================================================
-- Opzionale: Configurazione Cron Job nativo in Supabase (pg_cron)
-- ==============================================================================
-- Se desideri eseguire il controllo notturno direttamente all'interno di PostgreSQL:
-- 1. Vai in Supabase Dashboard -> Database -> Extensions e abilita "pg_cron".
-- 2. Esegui questo script nell'SQL Editor.

-- Funzione di verifica scadenze
create or replace function public.check_expired_food_batches()
returns table (
    batch_id uuid,
    user_id uuid,
    food_name text,
    quantity numeric,
    expiration_date date,
    days_until_expiration integer,
    status text
) language plpgsql security definer as $$
begin
    return query
    select
        i.id as batch_id,
        i.user_id,
        f.name as food_name,
        i.quantity,
        i.expiration_date,
        (i.expiration_date - current_date)::integer as days_until_expiration,
        case
            when i.expiration_date < current_date then 'EXPIRED'
            when (i.expiration_date - current_date) <= 3 then 'WARNING'
            else 'SAFE'
        end as status
    from public.inventory_items i
    join public.food_items f on f.id = i.food_id
    where i.expiration_date is not null
      and i.expiration_date <= (current_date + interval '3 days')
    order by i.expiration_date asc;
end;
$$;

-- Esegui ogni notte alle 01:00 UTC (richiede estensione pg_cron abilitata)
-- select cron.schedule('nightly-food-expiration-check', '0 1 * * *', 'select public.check_expired_food_batches();');
