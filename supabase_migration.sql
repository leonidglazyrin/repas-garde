-- Repas Garde — schéma Supabase
-- Nouvelle installation. Pour une base existante, appliquer les ALTER indiqués plus bas.
do $$ begin create type member_role as enum ('gardienne','parent'); exception when duplicate_object then null; end $$;
do $$ begin create type meal_type as enum ('souper'); exception when duplicate_object then null; end $$;
do $$ begin create type approval_status as enum ('pending','approved','change_requested','not_ok'); exception when duplicate_object then null; end $$;
create table if not exists households(id uuid primary key default gen_random_uuid(),name text not null,invite_code text not null unique,created_at timestamptz not null default now());
create table if not exists members(id uuid primary key default gen_random_uuid(),household_id uuid not null references households(id) on delete cascade,name text not null,role member_role not null,profile_color text default '#7c3aed',restrictions text default '',created_at timestamptz not null default now());
create table if not exists children(id uuid primary key default gen_random_uuid(),household_id uuid not null references households(id) on delete cascade,name text not null,allergies text default '',dislikes text default '',notes text default '',created_at timestamptz not null default now());
create table if not exists weeks(id uuid primary key default gen_random_uuid(),household_id uuid not null references households(id) on delete cascade,week_start date not null,title text default '',created_at timestamptz not null default now(),unique(household_id,week_start));
create table if not exists meals(id uuid primary key default gen_random_uuid(),week_id uuid not null references weeks(id) on delete cascade,day_index int not null check(day_index between 0 and 6),meal_type meal_type not null default 'souper',title text not null default '',description text default '',ingredients text[] not null default '{}',notes text default '',profile_ids uuid[] not null default '{}',updated_by text default '',updated_at timestamptz not null default now());
create table if not exists meal_approvals(id uuid primary key default gen_random_uuid(),meal_id uuid not null references meals(id) on delete cascade,member_id uuid not null references members(id) on delete cascade,status approval_status not null default 'pending',comment text default '',updated_at timestamptz not null default now(),unique(meal_id,member_id));
create table if not exists meal_library(id text primary key,household_id uuid not null references households(id) on delete cascade,title text not null,description text default '',ingredients text[] not null default '{}',notes text default '',last_used_at timestamptz not null default now());
create table if not exists grocery_items(id uuid primary key default gen_random_uuid(),week_id uuid not null references weeks(id) on delete cascade,name text not null,category text default 'Divers',quantity text default '',checked boolean not null default false,source_meal_id uuid references meals(id) on delete set null,updated_by text default '',updated_at timestamptz not null default now());
create index if not exists idx_members_household on members(household_id);create index if not exists idx_weeks_household on weeks(household_id);create index if not exists idx_meals_week on meals(week_id);create index if not exists idx_grocery_week on grocery_items(week_id);create index if not exists idx_library_household on meal_library(household_id);
-- Migration d'une base existante :
-- alter table members add column if not exists profile_color text default '#7c3aed';
-- alter table members add column if not exists restrictions text default '';
-- alter table meals add column if not exists profile_ids uuid[] not null default '{}';

do $$ begin alter publication supabase_realtime add table households,members,children,weeks,meals,meal_approvals,meal_library,grocery_items; exception when duplicate_table then null; end $$;
alter table households enable row level security;alter table members enable row level security;alter table children enable row level security;alter table weeks enable row level security;alter table meals enable row level security;alter table meal_approvals enable row level security;alter table meal_library enable row level security;alter table grocery_items enable row level security;
create policy "anon read" on households for select to anon,authenticated using(true);create policy "anon write" on households for all to anon,authenticated using(true) with check(true);
create policy "anon read" on members for select to anon,authenticated using(true);create policy "anon write" on members for all to anon,authenticated using(true) with check(true);
create policy "anon read" on children for select to anon,authenticated using(true);create policy "anon write" on children for all to anon,authenticated using(true) with check(true);
create policy "anon read" on weeks for select to anon,authenticated using(true);create policy "anon write" on weeks for all to anon,authenticated using(true) with check(true);
create policy "anon read" on meals for select to anon,authenticated using(true);create policy "anon write" on meals for all to anon,authenticated using(true) with check(true);
create policy "anon read" on meal_approvals for select to anon,authenticated using(true);create policy "anon write" on meal_approvals for all to anon,authenticated using(true) with check(true);
create policy "anon read" on meal_library for select to anon,authenticated using(true);create policy "anon write" on meal_library for all to anon,authenticated using(true) with check(true);
create policy "anon read" on grocery_items for select to anon,authenticated using(true);create policy "anon write" on grocery_items for all to anon,authenticated using(true) with check(true);
