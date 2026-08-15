# Requirements Document: Diet & Smart Fridge Inventory Management System

## 1. Overview & Goal
The objective is to build a full-stack Web Application (CRUD) designed to manage food supplies (fridge/pantry), enforce a fixed, non-calorie-tracked dietary plan, track expiration dates for perishable items, and automatically generate an optimized grocery shopping list accessible from mobile devices on the go.

The system emphasizes high responsiveness, minimal friction for mobile use (in-store shopping), and automated stock deduction using a First Expired, First Out (FEFO) strategy.

---

## 2. Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router, Server Actions, React Server Components)
- **Language**: TypeScript (strict mode)
- **Styling & UI**: Tailwind CSS, Lucide Icons, Shadcn UI / Radix primitives
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security, `@supabase/ssr`)
- **Hosting & Deployment**: Vercel (Edge-ready, automatic CI/CD)
- **Client Mode**: Mobile-First Progressive Web App (PWA) with Manifest and Service Worker caching

---

## 3. Core Functional Requirements

### 3.1. Master Food Catalog (`food_items`)
- Catalog of all recognizable foods/ingredients.
- Fields: name, default unit of measure (`g`, `ml`, `pz`, `kg`, etc.), perishable flag (`boolean`), food category.
- Full CRUD operations.

### 3.2. Inventory & Batch Management (`inventory_items`)
- Represents actual physical items present in the fridge or pantry.
- Supports multiple batches for the same food item (e.g., two bottles of milk bought at different times).
- Selective expiration dates:
  - **Perishable items**: Require `expiration_date`.
  - **Non-perishable items**: `expiration_date` is strictly nullable.
- Visual alerts/filters:
  - Expired (red)
  - Expiring within 3 days (amber)
  - Safe / Non-perishable (neutral/green)

### 3.3. Fixed Meal Plan (`diet_plans`)
- Fixed weekly template (Days 1 to 7: Monday to Sunday).
- Meal types: `colazione`, `spuntino_mattina`, `pranzo`, `merenda`, `cena`.
- Each slot defines required food items and strict quantities.
- **Explicit exclusion**: No calorie, macronutrient, or energy calculation is performed.

### 3.4. Automatic Shopping List Generation (`shopping_list`)
- Calculation of required supplies over a configurable time window $T$ (e.g., next 3 days, weekend, full week):
  $$\text{Needed Quantity} = \max\left(0, \sum_{t \in T} \text{DietaryRequirement}_t - \text{InventoryQuantity}\right)$$
- Shopping List view optimized for mobile/in-store shopping:
  - Single-tap checkboxes to mark items as bought.
  - Optimistic UI updates (`useOptimistic`) for instant responsiveness without network lag.
  - Button to automatically transfer bought items into `inventory_items` (prompting for expiration date only if item is perishable).

### 3.5. Daily Meal Consumption (FEFO Logic)
- Single-tap "Mark meal as consumed" action.
- Automatic inventory decrement:
  - Queries available batches of each ingredient ordered by `expiration_date ASC NULLS LAST`.
  - Consumes and deletes/updates batches sequentially until required quantity is fulfilled.

---

## 4. Database Schema (PostgreSQL DDL)

```sql
-- Extensions
create extension if not exists "uuid-ossp";

-- Meal type enum
create type meal_type_enum as enum (
  'colazione',
  'spuntino_mattina',
  'pranzo',
  'merenda',
  'cena'
);

-- 1. Master Food Items
create table public.food_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    unit text not null default 'g',
    perishable boolean not null default false,
    category text default 'Generale',
    created_at timestamptz default now()
);

-- 2. Inventory Items (Batches)
create table public.inventory_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    food_id uuid references public.food_items(id) on delete cascade not null,
    quantity numeric(10, 2) not null check (quantity > 0),
    expiration_date date, -- Nullable for non-perishables
    created_at timestamptz default now()
);

-- 3. Diet Plans (Weekly Template)
create table public.diet_plans (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    day_of_week smallint not null check (day_of_week between 1 and 7), -- 1=Mon, 7=Sun
    meal_type meal_type_enum not null,
    food_id uuid references public.food_items(id) on delete cascade not null,
    quantity numeric(10, 2) not null check (quantity > 0),
    created_at timestamptz default now()
);

-- 4. Shopping List
create table public.shopping_list (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    food_id uuid references public.food_items(id) on delete cascade not null,
    quantity numeric(10, 2) not null check (quantity > 0),
    is_bought boolean not null default false,
    created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table public.food_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.diet_plans enable row level security;
alter table public.shopping_list enable row level security;

create policy "User food items access" on public.food_items for all using (auth.uid() = user_id);
create policy "User inventory access" on public.inventory_items for all using (auth.uid() = user_id);
create policy "User diet plans access" on public.diet_plans for all using (auth.uid() = user_id);
create policy "User shopping list access" on public.shopping_list for all using (auth.uid() = user_id);
```

---

## 5. Next.js Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Today's meals & imminent expirations
│   │   ├── inventory/
│   │   │   └── page.tsx           # Stock management, batch addition
│   │   ├── diet/
│   │   │   └── page.tsx           # Weekly meal plan configuration
│   │   └── shopping/
│   │       └── page.tsx           # Mobile-first interactive grocery checklist
│   ├── manifest.ts                # PWA Web App Manifest
│   └── layout.tsx
├── components/
│   ├── ui/                        # Button, Input, Dialog, Badge, Checkbox
│   ├── inventory-batch-dialog.tsx
│   ├── meal-card.tsx
│   └── shopping-list-client.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase Client
│   │   ├── server.ts              # Server Actions / RSC Supabase Client
│   │   └── middleware.ts          # Auth session validator & route guard
│   └── types/
│       └── database.ts            # Generated Supabase DB types
└── actions/
    ├── inventory.ts               # FEFO consumption, stock adjustments
    ├── shopping.ts                # Delta calculation, mark as bought, restock
    └── diet.ts                    # Weekly meal plan modifications
```

---

## 6. Business Logic & Server Actions Specs

### 6.1. FEFO Consumption (`actions/inventory.ts`)
1. Authenticate user via Supabase session.
2. Select all `inventory_items` where `food_id = :foodId` and `user_id = :userId` ordered by `expiration_date ASC NULLS LAST`.
3. Sequentially decrement batch quantities until `requiredQuantity` reaches 0.
4. Delete exhausted batches (`quantity == 0`) and update partial batches.
5. Invalidate paths (`/inventory`, `/`).

### 6.2. Smart Shopping List Generator (`actions/shopping.ts`)
1. Receive target date range or days window (e.g. 1 to 7 days).
2. Compute total theoretical requirement per food item from `diet_plans`.
3. Compute total physical stock per food item from `inventory_items`.
4. Upsert/populate `shopping_list` with `quantity = max(0, total_required - total_stock)` where `quantity > 0`.
5. Mark item as bought toggles `is_bought`.
6. "Commit Shopping": adds bought items to `inventory_items` and clears bought rows from `shopping_list`.

---

## 7. Non-Functional & Mobile Requirements

- **Performance**: Instant UI feedback on mobile touch events via React 19 / Next.js 16 optimistic state.
- **PWA Capabilities**: Fullscreen standalone display mode (`manifest.ts`), touch-friendly targets (minimum 48px height for checkable items).
- **Zero Caloric Overhead**: Strictly avoid any calorie calculation engine or nutritional data API calls.
