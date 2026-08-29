ALTER TABLE public.screening_matches
  ADD COLUMN IF NOT EXISTS match_types text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS match_type_labels text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS match_basis text,
  ADD COLUMN IF NOT EXISTS provider_relevance integer;

UPDATE public.screening_matches
SET match_types = COALESCE((
      SELECT array_agg(x::text) FROM jsonb_array_elements_text(profile->'match_types') AS x
    ), '{}'::text[]),
    match_type_labels = COALESCE((
      SELECT array_agg(x::text) FROM jsonb_array_elements_text(profile->'match_type_labels') AS x
    ), '{}'::text[]),
    provider_relevance = NULLIF(profile->>'provider_relevance', '')::integer,
    match_basis = COALESCE(
      match_basis,
      CASE
        WHEN name_similarity = 100 THEN 'exact_name'
        WHEN name_similarity >= 98 THEN 'reordered_name'
        WHEN name_similarity >= 92 THEN 'partial_name'
        WHEN name_similarity IS NULL THEN 'provider_only'
        ELSE 'fuzzy_name'
      END)
WHERE profile IS NOT NULL;

COMMENT ON COLUMN public.screening_matches.match_basis IS 'How the displayed name similarity was derived: exact_name | exact_alias | reordered_name | partial_name | fuzzy_name | provider_only | unknown';