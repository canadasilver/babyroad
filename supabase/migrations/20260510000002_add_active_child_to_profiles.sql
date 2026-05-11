alter table public.profiles
  add column if not exists active_child_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_active_child_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_active_child_id_fkey
      foreign key (active_child_id)
      references public.children(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_profiles_active_child_id
  on public.profiles(active_child_id);
