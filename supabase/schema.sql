-- ==============================================================================
-- Schema SQL per Supabase: Diet & Smart Fridge Inventory Management System
-- Eseguire questo script nell'editor SQL della dashboard Supabase.
-- ==============================================================================

-- 1. Abilitazione estensioni
create extension if not exists "uuid-ossp";

-- 2. Creazione Enum per i tipi di pasto
do $$
begin
    if not exists (select 1 from pg_type where typname = 'meal_type_enum') then
        create type meal_type_enum as enum (
            'colazione',
            'spuntino_mattina',
            'pranzo',
            'merenda',
            'cena'
        );
    end if;
end$$;

-- 3. Tabella Catalogo Alimenti (food_items)
create table if not exists public.food_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    unit text not null default 'g',
    perishable boolean not null default false,
    category text default 'Generale',
    created_at timestamptz default now()
);

-- 4. Tabella Lotti in Dispensa/Frigo (inventory_items)
create table if not exists public.inventory_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    food_id uuid references public.food_items(id) on delete cascade not null,
    quantity numeric(10, 2) not null check (quantity > 0),
    expiration_date date, -- Nullable per alimenti non deperibili
    created_at timestamptz default now()
);

-- 5. Tabella Piano Alimentare Settimanale (diet_plans)
create table if not exists public.diet_plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    day_of_week smallint not null check (day_of_week between 1 and 7), -- 1=Lun, 7=Dom
    meal_type meal_type_enum not null,
    food_id uuid references public.food_items(id) on delete cascade not null,
    quantity numeric(10, 2) not null check (quantity > 0),
    created_at timestamptz default now()
);

-- 6. Tabella Lista della Spesa (shopping_list)
create table if not exists public.shopping_list (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    food_id uuid references public.food_items(id) on delete cascade not null,
    quantity numeric(10, 2) not null check (quantity > 0),
    is_bought boolean not null default false,
    created_at timestamptz default now()
);

-- Indici per performance
create index if not exists idx_food_items_user on public.food_items(user_id);
create index if not exists idx_inventory_items_food on public.inventory_items(user_id, food_id);
create index if not exists idx_inventory_items_fefo on public.inventory_items(user_id, food_id, expiration_date asc nulls last);
create index if not exists idx_diet_plans_day_meal on public.diet_plans(user_id, day_of_week, meal_type);
create index if not exists idx_shopping_list_user on public.shopping_list(user_id);

-- 7. Configurazione Row Level Security (RLS)
alter table public.food_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.diet_plans enable row level security;
alter table public.shopping_list enable row level security;

-- Policies
create policy "User food items access" on public.food_items
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "User inventory access" on public.inventory_items
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "User diet plans access" on public.diet_plans
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "User shopping list access" on public.shopping_list
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
