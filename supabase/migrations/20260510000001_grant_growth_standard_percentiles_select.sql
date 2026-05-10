-- Allow the app roles to read public growth standard reference data.
-- RLS still controls row access through growth_standard_percentiles_select_public.

grant select on public.growth_standard_percentiles to anon, authenticated;
