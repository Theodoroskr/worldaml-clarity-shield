REVOKE SELECT ON public.academy_templates FROM anon, authenticated;

GRANT SELECT (id, slug, title, description, category, file_format, file_size_kb, is_published, sort_order, jurisdictions, created_at, updated_at)
ON public.academy_templates TO anon, authenticated;

GRANT ALL ON public.academy_templates TO service_role;