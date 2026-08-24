-- Gortash Manager — schema + seed data
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT throughout.

-- ============================================================================
-- Access control: a tiny allowlist table drives Row Level Security.
-- Insert the two emails that are allowed to use this app (you + your DM):
--
--   insert into app_allowed_emails (email) values
--     ('you@example.com'),
--     ('your-dm@example.com')
--   on conflict do nothing;
--
-- Both emails must sign in with Google via Supabase Auth using these exact
-- addresses. Mirror the same list in the app's ALLOWED_EMAILS env var.
-- ============================================================================

create table if not exists app_allowed_emails (
  email text primary key
);

alter table app_allowed_emails enable row level security;

create or replace function is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from app_allowed_emails
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- Anyone signed in may read the allowlist (needed for is_allowed_user() to
-- work from the client), but never write to it.
drop policy if exists "read allowlist" on app_allowed_emails;
create policy "read allowlist" on app_allowed_emails
  for select to authenticated using (true);

-- ============================================================================
-- Character sheet (single row, id is always 1)
-- ============================================================================

create table if not exists character (
  id smallint primary key default 1 check (id = 1),
  name text not null default 'Gortash Valemont',
  race text not null default 'Half-Orc',
  class_name text not null default 'Fighter',
  subclass_name text not null default 'Orcish Rune Knight',
  background text not null default 'Soldier',
  alignment text not null default 'Lawful Evil',
  level int not null default 2,
  xp int not null default 0,

  str smallint not null default 17,
  dex smallint not null default 13,
  con smallint not null default 15,
  int smallint not null default 10,
  wis smallint not null default 12,
  cha smallint not null default 8,

  skill_proficiencies text[] not null default array['athletics','intimidation','perception','survival'],
  saving_throw_proficiencies text[] not null default array['str','con'],
  weapon_armor_proficiencies text[] not null default '{}',
  tool_proficiencies text[] not null default '{}',
  languages text[] not null default '{}',

  max_hp int not null default 20,
  current_hp int not null default 20,
  temp_hp int not null default 0,
  armor_class int not null default 16,
  initiative_misc int not null default 0,
  speed int not null default 30,
  hit_dice_total int not null default 2,
  hit_dice_current int not null default 2,

  inspiration boolean not null default false,

  second_wind_max int not null default 1,
  second_wind_used int not null default 0,
  action_surge_max int not null default 1,
  action_surge_used int not null default 0,
  indomitable_max int not null default 0,
  indomitable_used int not null default 0,
  warchiefs_might_max int not null default 0,
  warchiefs_might_used int not null default 0,
  packs_intercession_max int not null default 0,
  packs_intercession_used int not null default 0,

  known_runes text[] not null default '{}',
  rune_charges_used jsonb not null default '{}',

  conditions text[] not null default '{}',
  death_save_successes smallint not null default 0,
  death_save_failures smallint not null default 0,

  feats jsonb not null default '[]',
  asi_history jsonb not null default '[]',

  notes text not null default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table character add column if not exists weapon_armor_proficiencies text[] not null default '{}';
alter table character add column if not exists tool_proficiencies text[] not null default '{}';
alter table character add column if not exists languages text[] not null default '{}';

alter table character enable row level security;

drop policy if exists "allowlisted full access" on character;
create policy "allowlisted full access" on character
  for all to authenticated
  using (is_allowed_user())
  with check (is_allowed_user());

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists character_touch_updated_at on character;
create trigger character_touch_updated_at
  before update on character
  for each row execute function touch_updated_at();

-- ============================================================================
-- Attacks (weapons list, Combat tab)
-- ============================================================================

create table if not exists attacks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  to_hit_bonus int not null default 0,
  damage_dice text not null default '',
  damage_type text not null default '',
  properties text not null default '',
  sort_order int not null default 0
);

alter table attacks enable row level security;

drop policy if exists "allowlisted full access" on attacks;
create policy "allowlisted full access" on attacks
  for all to authenticated
  using (is_allowed_user())
  with check (is_allowed_user());

-- ============================================================================
-- Inventory
-- ============================================================================

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity int not null default 1,
  notes text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Drop the equipped flag from an earlier revision of ability adjustments —
-- items no longer link to ability adjustments.
alter table inventory_items drop column if exists equipped;

alter table inventory_items enable row level security;

drop policy if exists "allowlisted full access" on inventory_items;
create policy "allowlisted full access" on inventory_items
  for all to authenticated
  using (is_allowed_user())
  with check (is_allowed_user());

-- ============================================================================
-- Ability score adjustments
-- ============================================================================
-- Each row is one recorded contribution to an ability score on top of its
-- (directly editable) base: a description and an amount. `kind` is 'buff'
-- (adds the amount), 'debuff' (subtracts it), or 'set' (a floor the score
-- can't fall below while the row exists — matching item text like "your
-- score becomes 19, unaffected if already 19+"). Added and removed freely;
-- nothing here is baked into the base score.

create table if not exists ability_adjustments (
  id uuid primary key default gen_random_uuid(),
  ability text not null check (ability in ('str','dex','con','int','wis','cha')),
  label text not null,
  kind text not null default 'buff' check (kind in ('buff','debuff','set')),
  amount int not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Migrate the earlier revision: drop source/inventory_item_id and collapse
-- the old add/set kind into buff/debuff/set.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'ability_adjustments' and column_name = 'source'
  ) then
    alter table ability_adjustments drop constraint if exists ability_adjustments_kind_check;
    alter table ability_adjustments alter column kind set default 'buff';
    update ability_adjustments set kind = 'buff' where kind = 'add';
    alter table ability_adjustments add constraint ability_adjustments_kind_check
      check (kind in ('buff','debuff','set'));
    alter table ability_adjustments drop column source;
    alter table ability_adjustments drop column if exists inventory_item_id;
  end if;
end $$;

alter table ability_adjustments enable row level security;

drop policy if exists "allowlisted full access" on ability_adjustments;
create policy "allowlisted full access" on ability_adjustments
  for all to authenticated
  using (is_allowed_user())
  with check (is_allowed_user());

-- ============================================================================
-- Racial traits
-- ============================================================================
-- Each row is one named feature granted by the character's race (e.g.
-- "Darkvision") plus a description. Added and removed freely — distinct from
-- ability_adjustments, which are numeric contributions to an ability score.

create table if not exists racial_traits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table racial_traits enable row level security;

drop policy if exists "allowlisted full access" on racial_traits;
create policy "allowlisted full access" on racial_traits
  for all to authenticated
  using (is_allowed_user())
  with check (is_allowed_user());

-- ============================================================================
-- Wallet ledger
-- ============================================================================
-- Each row is one income or expense transaction and can carry an amount in
-- one or more coin denominations at once (e.g. +12 gp and +30 sp together).
-- The wallet balance is never stored — it's always derived by summing every
-- transaction's amounts, per denomination.

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  occurred_on date not null default current_date,
  amount_cp integer not null default 0,
  amount_sp integer not null default 0,
  amount_ep integer not null default 0,
  amount_gp integer not null default 0,
  amount_pp integer not null default 0,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- Migrate pre-multi-currency installs: the old single `amount` column
-- (implicitly gold pieces) becomes `amount_gp`, and the other four
-- denomination columns are added alongside it.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'wallet_transactions' and column_name = 'amount'
  ) then
    alter table wallet_transactions rename column amount to amount_gp;
    alter table wallet_transactions alter column amount_gp type integer using round(amount_gp)::integer;
    alter table wallet_transactions alter column amount_gp set default 0;
    alter table wallet_transactions alter column amount_gp set not null;
    alter table wallet_transactions add column if not exists amount_cp integer not null default 0;
    alter table wallet_transactions add column if not exists amount_sp integer not null default 0;
    alter table wallet_transactions add column if not exists amount_ep integer not null default 0;
    alter table wallet_transactions add column if not exists amount_pp integer not null default 0;
  end if;
end $$;

alter table wallet_transactions enable row level security;

drop policy if exists "allowlisted full access" on wallet_transactions;
create policy "allowlisted full access" on wallet_transactions
  for all to authenticated
  using (is_allowed_user())
  with check (is_allowed_user());

-- ============================================================================
-- Quests
-- ============================================================================

create table if not exists quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'active' check (status in ('active','completed','failed')),
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table quests enable row level security;

drop policy if exists "allowlisted full access" on quests;
create policy "allowlisted full access" on quests
  for all to authenticated
  using (is_allowed_user())
  with check (is_allowed_user());

drop trigger if exists quests_touch_updated_at on quests;
create trigger quests_touch_updated_at
  before update on quests
  for each row execute function touch_updated_at();

-- ============================================================================
-- Session logs
-- ============================================================================

create table if not exists session_logs (
  id uuid primary key default gen_random_uuid(),
  logged_on date not null default current_date,
  entry text not null,
  created_at timestamptz not null default now()
);

alter table session_logs enable row level security;

drop policy if exists "allowlisted full access" on session_logs;
create policy "allowlisted full access" on session_logs
  for all to authenticated
  using (is_allowed_user())
  with check (is_allowed_user());

-- ============================================================================
-- Seed data — Gortash Valemont, level 2 Half-Orc Fighter
-- ============================================================================

insert into character (id) values (1) on conflict (id) do nothing;

insert into attacks (name, to_hit_bonus, damage_dice, damage_type, properties, sort_order)
select * from (values
  ('Greataxe', 5, '1d12+3', 'slashing', 'Heavy, Two-Handed', 0),
  ('Handaxe', 5, '1d6+3', 'slashing', 'Light, Thrown (20/60)', 1),
  ('Light Crossbow', 3, '1d8+1', 'piercing', 'Ammunition (20 bolts), Loading, Range 80/320, Two-Handed', 2)
) as v(name, to_hit_bonus, damage_dice, damage_type, properties, sort_order)
where not exists (select 1 from attacks);

insert into inventory_items (name, quantity, notes, sort_order)
select * from (values
  ('Chain Mail', 1, 'Worn. AC 16, no Dex bonus.', 0),
  ('Greataxe', 1, '', 1),
  ('Handaxe', 1, '', 2),
  ('Light Crossbow', 1, '', 3),
  ('Crossbow Bolts', 20, '', 4),
  ('Explorer''s Pack', 1, 'Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 ft hempen rope.', 5),
  ('Insignia of Rank', 1, 'Soldier background item.', 6),
  ('Trophy from a Fallen Enemy', 1, 'Soldier background item.', 7),
  ('Set of Bone Dice', 1, 'Soldier background item.', 8),
  ('Common Clothes', 1, '', 9),
  ('Valemont Runestones', 1, 'Family heirloom from Mother — strange orcish symbols, currently dormant. "Almost strong enough to wield it." Unlocks Rune Carver at level 3.', 10)
) as v(name, quantity, notes, sort_order)
where not exists (select 1 from inventory_items);

insert into ability_adjustments (ability, label, kind, amount, sort_order)
select * from (values
  ('str', 'Half-Orc', 'buff', 2, 0),
  ('con', 'Half-Orc', 'buff', 1, 1)
) as v(ability, label, kind, amount, sort_order)
where not exists (select 1 from ability_adjustments);

insert into quests (title, status, description)
select 'Stabilize the Smuggling Route', 'active',
  'Father''s orders: reassert control over House Valemont''s smuggling route through Vaelanthir and report back. Recent reports say there''s trouble.'
where not exists (select 1 from quests);

insert into session_logs (entry)
select 'Arrived in Vaelanthir. The portal was kept open for a reason — time to find out why.'
where not exists (select 1 from session_logs);
