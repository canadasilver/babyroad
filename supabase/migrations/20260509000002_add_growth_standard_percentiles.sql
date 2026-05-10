-- ============================================================
-- growth_standard_percentiles
-- Public reference table for infant growth standard data.
--
-- Source files:
-- - 국민건강보험공단_영유아성장도표LMS기준_20240731.csv
-- - 국민건강보험공단_영유아성장도표백분위수기준_20240731.csv
--
-- The current seed uses actual LMS CSV values. p50 is mapped from the
-- LMS M value. Other percentile columns are kept nullable for future
-- direct percentile data or derived/admin-approved imports.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.growth_standard_percentiles (
  id uuid primary key default gen_random_uuid(),
  standard_source text not null,
  sex text not null,
  metric text not null,
  age_month integer not null,
  p3 numeric null,
  p15 numeric null,
  p50 numeric null,
  p85 numeric null,
  p97 numeric null,
  l_value numeric null,
  m_value numeric null,
  s_value numeric null,
  created_at timestamptz default now(),

  constraint growth_standard_percentiles_unique
    unique (standard_source, sex, metric, age_month),
  constraint growth_standard_percentiles_sex_check
    check (sex in ('male', 'female')),
  constraint growth_standard_percentiles_metric_check
    check (metric in ('height', 'weight', 'head_circumference')),
  constraint growth_standard_percentiles_age_month_check
    check (age_month >= 0)
);

comment on table public.growth_standard_percentiles is
  'Infant growth standard reference data. Public SELECT only; writes are intended for SQL Editor/admin seed execution.';
comment on column public.growth_standard_percentiles.standard_source is
  'Example: nhis_infant_growth_percentile_2017';
comment on column public.growth_standard_percentiles.p50 is
  '50th percentile reference value. For the bundled NHIS LMS seed this is the LMS M value from the CSV.';

create index if not exists idx_growth_standard_percentiles_lookup
  on public.growth_standard_percentiles (standard_source, sex, metric, age_month);

alter table public.growth_standard_percentiles enable row level security;

drop policy if exists "growth_standard_percentiles_select_public"
  on public.growth_standard_percentiles;

create policy "growth_standard_percentiles_select_public"
  on public.growth_standard_percentiles
  for select
  to anon, authenticated
  using (true);

-- No INSERT / UPDATE / DELETE policies are created.
-- With RLS enabled, client writes are denied by default.
