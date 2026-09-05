-- =====================================================================
--  Repas Garde — Planification des repas de garde d'enfants
--  Schéma Supabase + Realtime + RLS
--  À exécuter dans Supabase Studio > SQL Editor (ou apply_migration)
-- =====================================================================

-- ---------- Types ----------
do $$ begin
  create type member_role as enum ('gardienne', 'parent');
exception when duplicate_object then null; end $$;
do $$ begin
  create type meal_type as enum ('dejeuner', 'diner', 'souper', 'collation');
exception when duplicate_object then null; end $$;
do $$ begin
  create type approval_status as enum ('pending', 'approved', 'change_requested', 'not_ok');
exception when duplicate_object then null; end $$;

-- ---------- Tables ----------
create table if not exists households (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  invite_code  text not null unique,
  created_at   timestamptz not null default now()
);

create table if not exists members (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  role         member_role not null,
  created_at   timestamptz not null default now()
);
create index if not exists idx_members_household on members(household_id);

create table if not exists children (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  allergies    text default '',     -- allergies / restrictions alimentaires
  dislikes     text default '',     -- aliments non appréciés
  notes        text default '',     -- préférences, infos utiles
  created_at   timestamptz not null default now()
);
create index if not exists idx_children_household on children(household_id);

create table if not exists weeks (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  week_start   date not null,       -- lundi de la semaine (YYYY-MM-DD)
  title        text default '',
  created_at   timestamptz not null default now(),
  unique (household_id, week_start)
);
create index if not exists idx_weeks_household on weeks(household_id);

create table if not exists meals (
  id           uuid primary key default gen_random_uuid(),
  week_id      uuid not null references weeks(id) on delete cascade,
  day_index    int not null check (day_index between 0 and 6),  -- 0 = lundi
  meal_type    meal_type not null,
  title        text not null default '',
  description  text default '',
  ingredients  text[] not null default '{}',
  notes        text default '',
  updated_by   text default '',   -- nom du membre qui a modifié
  updated_at   timestamptz not null default now()
);
create index if not exists idx_meals_week on meals(week_id);

create table if not exists meal_approvals (
  id           uuid primary key default gen_random_uuid(),
  meal_id      uuid not null references meals(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  status       approval_status not null default 'pending',
  comment      text default '',
  updated_at   timestamptz not null default now(),
  unique (meal_id, member_id)
);
create index if not exists idx_approvals_meal on meal_approvals(meal_id);

create table if not exists grocery_items (
  id           uuid primary key default gen_random_uuid(),
  week_id      uuid not null references weeks(id) on delete cascade,
  name         text not null,
  category     text default 'Divers',
  quantity     text default '',
  checked      boolean not null default false,
  source_meal_id uuid references meals(id) on delete set null,
  updated_by   text default '',
  updated_at   timestamptz not null default now()
);
create index if not exists idx_grocery_week on grocery_items(week_id);

-- ---------- Realtime ----------
-- Active la publication realtime pour toutes les tables (multi-utilisateurs voient les modifs en direct)
do $$ begin
  alter publication supabase_realtime add table households, members, children, weeks, meals, meal_approvals, grocery_items;
exception when duplicate_table then null; end $$;

-- ---------- Row Level Security ----------
-- L'app utilise un code d'invitation partagé par foyer (pas d'auth Supabase).
-- On autorise l'accès anon : la "sécurité" repose sur la connaissance du code d'invitation.
-- Pour un contrôle plus strict, activez Supabase Auth et adaptez ces politiques.
alter table households        enable row level security;
alter table members           enable row level security;
alter table children          enable row level security;
alter table weeks            enable row level security;
alter table meals             enable row level security;
alter table meal_approvals    enable row level security;
alter table grocery_items     enable row level security;

-- Politiques permissives (anon) — le filtrage par foyer se fait côté app via le code d'invitation.
create policy "anon read"  on households   for select to anon, authenticated using (true);
create policy "anon write" on households   for all    to anon, authenticated using (true) with check (true);

create policy "anon read"  on members      for select to anon, authenticated using (true);
create policy "anon write" on members      for all    to anon, authenticated using (true) with check (true);

create policy "anon read"  on children     for select to anon, authenticated using (true);
create policy "anon write" on children     for all    to anon, authenticated using (true) with check (true);

create policy "anon read"  on weeks        for select to anon, authenticated using (true);
create policy "anon write" on weeks        for all    to anon, authenticated using (true) with check (true);

create policy "anon read"  on meals        for select to anon, authenticated using (true);
create policy "anon write" on meals        for all    to anon, authenticated using (true) with check (true);

create policy "anon read"  on meal_approvals for select to anon, authenticated using (true);
create policy "anon write" on meal_approvals for all    to anon, authenticated using (true) with check (true);

create policy "anon read"  on grocery_items for select to anon, authenticated using (true);
create policy "anon write" on grocery_items for all    to anon, authenticated using (true) with check (true);

-- ---------- Trigger updated_at ----------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_meals_updated_at     on meals;
create trigger trg_meals_updated_at     before update on meals        for each row execute function set_updated_at();

drop trigger if exists trg_approvals_updated_at on meal_approvals;
create trigger trg_approvals_updated_at before update on meal_approvals for each row execute function set_updated_at();

drop trigger if exists trg_grocery_updated_at   on grocery_items;
create trigger trg_grocery_updated_at   before update on grocery_items for each row execute function set_updated_at();
