-- Allow anonymous visitors to browse published academy templates (listing metadata only).
-- file_url remains excluded from the column grant; downloads stay gated by get_academy_template_file_url().

CREATE POLICY "Anyone can view published templates"
  ON public.academy_templates
  FOR SELECT
  TO anon
  USING (is_published = true);

GRANT SELECT (
  id, slug, title, description, category, file_format, file_size_kb,
  preview_url, is_published, sort_order, jurisdictions, created_at, updated_at
) ON public.academy_templates TO anon;