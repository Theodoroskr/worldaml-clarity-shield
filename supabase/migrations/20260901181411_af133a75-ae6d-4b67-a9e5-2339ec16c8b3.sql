-- Restrict column-level access to file links on academy_templates
REVOKE SELECT ON public.academy_templates FROM anon;
REVOKE SELECT ON public.academy_templates FROM authenticated;

GRANT SELECT (id, slug, title, description, category, file_format, file_size_kb, is_published, sort_order, jurisdictions, created_at, updated_at)
  ON public.academy_templates TO anon;
GRANT SELECT (id, slug, title, description, category, file_format, file_size_kb, is_published, sort_order, jurisdictions, created_at, updated_at)
  ON public.academy_templates TO authenticated;

-- Admin write paths keep needing full column access
GRANT INSERT, UPDATE, DELETE ON public.academy_templates TO authenticated;
GRANT ALL ON public.academy_templates TO service_role;