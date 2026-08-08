CREATE OR REPLACE FUNCTION public.news_clean_text(_raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT btrim(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            replace(replace(replace(replace(replace(
              regexp_replace(COALESCE(_raw, ''), '<[^>]*>', ' ', 'g'),
              '&amp;', '&'), '&lt;', '<'), '&gt;', '>'), '&quot;', '"'), '&nbsp;', ' '),
            '<[^>]*>', ' ', 'g'),
          'https?://\S+', ' ', 'g'),
        '\s+', ' ', 'g'),
      '^[\s\-–—:•|]+', '', 'g')
  );
$$;

UPDATE public.news_updates
SET title = COALESCE(NULLIF(public.news_clean_text(title), ''), title),
    summary = public.news_clean_text(summary),
    full_summary = NULLIF(public.news_clean_text(full_summary), '');

UPDATE public.news_updates
SET summary = ''
WHERE lower(btrim(summary)) = lower(btrim(title));

UPDATE public.news_updates
SET full_summary = NULL
WHERE full_summary IS NOT NULL
  AND lower(btrim(full_summary)) = lower(btrim(title));
