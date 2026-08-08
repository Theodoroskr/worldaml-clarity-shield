UPDATE public.news_updates
SET summary = btrim(regexp_replace(regexp_replace(summary, '<[^>]*$', '', 'g'), '\s+', ' ', 'g')),
    full_summary = NULLIF(btrim(regexp_replace(regexp_replace(COALESCE(full_summary,''), '<[^>]*$', '', 'g'), '\s+', ' ', 'g')), '')
WHERE summary ~ '<' OR full_summary ~ '<';

UPDATE public.news_updates
SET summary = ''
WHERE lower(btrim(summary)) = lower(btrim(title))
   OR btrim(summary) ~ '^\S{1,40}\s*…?$' AND lower(btrim(summary)) = lower(btrim(title));
