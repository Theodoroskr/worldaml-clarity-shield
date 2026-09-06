-- provider_raw_responses / provider_references: anon had full table grants (RLS admin-only, but grants were far too broad)
REVOKE ALL ON public.provider_raw_responses FROM anon;
REVOKE ALL ON public.provider_references FROM anon;
REVOKE ALL ON public.provider_raw_responses FROM authenticated;
REVOKE ALL ON public.provider_references FROM authenticated;
GRANT SELECT ON public.provider_raw_responses TO authenticated;
GRANT SELECT ON public.provider_references TO authenticated;
GRANT ALL ON public.provider_raw_responses TO service_role;
GRANT ALL ON public.provider_references TO service_role;

-- academy_basket_snapshots: remove residual anon privileges; owner-scoped access for authenticated only
REVOKE ALL ON public.academy_basket_snapshots FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_basket_snapshots TO authenticated;
GRANT ALL ON public.academy_basket_snapshots TO service_role;

-- academy_templates: drop residual non-select privileges for anon; keep metadata-only column reads
REVOKE ALL ON public.academy_templates FROM anon;
GRANT SELECT (id, slug, title, description, category, file_format, file_size_kb, is_published, sort_order, jurisdictions, created_at, updated_at)
  ON public.academy_templates TO anon;
GRANT ALL ON public.academy_templates TO service_role;