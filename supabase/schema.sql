-- ============================================================
-- Life Dashboard — Full Schema + RLS Policies
-- Run this in the Supabase SQL editor after creating a project
-- ============================================================

-- ---------------------- SHARED ----------------------

create table if not exists user_preferences (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  daily_water_goal_ml  integer not null default 2000,
  daily_steps_goal     integer not null default 10000,
  weight_unit          text not null default 'kg' check (weight_unit in ('kg', 'lbs')),
  updated_at           timestamptz not null default now()
);

create table if not exists push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

-- ---------------------- HEALTH ----------------------

create table if not exists weight_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  logged_at  date not null default current_date,
  weight_kg  numeric(5,2) not null,
  notes      text,
  created_at timestamptz not null default now()
);

create table if not exists sleep_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  sleep_date   date not null default current_date,
  duration_min integer not null,
  quality      smallint check (quality between 1 and 5),
  bedtime      time,
  wake_time    time,
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists workout_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  logged_at    date not null default current_date,
  type         text not null,
  duration_min integer not null,
  intensity    smallint check (intensity between 1 and 5),
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists hydration_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  logged_at  timestamptz not null default now(),
  amount_ml  integer not null,
  created_at timestamptz not null default now()
);

create table if not exists daily_steps (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  step_date  date not null,
  steps      integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, step_date)
);

create table if not exists supplements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  dose       text,
  archived   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists supplement_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  supplement_id uuid not null references supplements(id) on delete cascade,
  taken_on      date not null default current_date,
  created_at    timestamptz not null default now(),
  unique (supplement_id, taken_on)
);

create table if not exists gym_schedules (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  week_start   date not null,
  planned_days integer[] not null,
  created_at   timestamptz not null default now(),
  unique (user_id, week_start)
);

create table if not exists gym_checkins (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  went         boolean not null,
  created_at   timestamptz not null default now(),
  unique (user_id, checkin_date)
);

-- ---------------------- FINANCE ----------------------

create table if not exists income_sources (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  pay_day_of_month  integer not null check (pay_day_of_month between 1 and 31),
  default_amount    numeric(12,2) not null,
  currency          text not null default 'GBP',
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

create table if not exists income_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  source_id   uuid not null references income_sources(id) on delete cascade,
  received_on date not null default current_date,
  amount      numeric(12,2) not null,
  notes       text,
  created_at  timestamptz not null default now()
);

create table if not exists budget_plans (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  month                date not null,
  total_income         numeric(12,2) not null default 0,
  savings_pct          numeric(5,2) not null default 20,
  savings_amount       numeric(12,2) not null default 0,
  status               text not null default 'draft' check (status in ('draft','active','closed')),
  created_at           timestamptz not null default now(),
  unique (user_id, month)
);

create table if not exists budget_categories (
  id           uuid primary key default gen_random_uuid(),
  plan_id      uuid not null references budget_plans(id) on delete cascade,
  category     text not null,
  limit_amount numeric(12,2) not null,
  created_at   timestamptz not null default now()
);

create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  txn_date    date not null default current_date,
  type        text not null check (type in ('income','expense')),
  amount      numeric(12,2) not null,
  category    text not null,
  description text,
  source      text not null default 'manual' check (source in ('manual','revolut')),
  external_id text,
  plan_id     uuid references budget_plans(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (user_id, external_id) -- prevents duplicate bank imports; external_id nulls are allowed to repeat
);

create table if not exists savings_goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  target_amount  numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  target_date    date,
  created_at     timestamptz not null default now()
);

create table if not exists bank_connections (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  provider         text not null default 'gocardless',
  institution_id   text not null,
  account_id       text,
  requisition_id   text not null,
  connected_at     timestamptz not null default now(),
  last_synced_at   timestamptz,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ---------------------- HABITS ----------------------

create table if not exists habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  frequency  text not null default 'daily' check (frequency in ('daily','weekly')),
  color      text,
  archived   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists habit_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  habit_id     uuid not null references habits(id) on delete cascade,
  completed_on date not null default current_date,
  created_at   timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create table if not exists goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  target_value  numeric,
  current_value numeric not null default 0,
  unit          text,
  due_date      date,
  completed     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------------------- STUDY ----------------------

create table if not exists study_modules (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  total_sections integer not null,
  archived       boolean not null default false,
  created_at     timestamptz not null default now()
);

create table if not exists study_sections (
  id             uuid primary key default gen_random_uuid(),
  module_id      uuid not null references study_modules(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  section_number integer not null,
  completed      boolean not null default false,
  completed_on   date,
  difficulty     smallint check (difficulty between 1 and 5),
  notes          text,
  next_review_on date,
  created_at     timestamptz not null default now()
);

create table if not exists study_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  module_id    uuid not null references study_modules(id) on delete cascade,
  section_id   uuid references study_sections(id) on delete set null,
  started_at   timestamptz not null,
  duration_min integer not null,
  notes        text,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- RLS POLICIES
-- Same pattern for every table: users can only see/modify their own rows
-- ============================================================

do $$ declare
  t text;
begin
  for t in select unnest(array[
    'user_preferences','push_subscriptions',
    'weight_logs','sleep_logs','workout_logs','hydration_logs','daily_steps',
    'supplements','supplement_logs','gym_schedules','gym_checkins',
    'income_sources','income_logs','budget_plans',
    'transactions','savings_goals','bank_connections',
    'habits','habit_completions','goals',
    'study_modules','study_sections','study_sessions'
  ]) loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "owner_policy" on %I for all
       using (user_id = auth.uid()) with check (user_id = auth.uid())', t
    );
  end loop;
end $$;

-- budget_categories doesn't have user_id — access via plan ownership
alter table budget_categories enable row level security;
create policy "owner_via_plan" on budget_categories for all
  using (
    exists (
      select 1 from budget_plans
      where budget_plans.id = budget_categories.plan_id
        and budget_plans.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from budget_plans
      where budget_plans.id = budget_categories.plan_id
        and budget_plans.user_id = auth.uid()
    )
  );
