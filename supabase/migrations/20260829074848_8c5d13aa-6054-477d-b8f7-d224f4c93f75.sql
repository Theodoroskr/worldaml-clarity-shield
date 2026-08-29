ALTER TABLE public.screening_matches
  ADD COLUMN IF NOT EXISTS winning_name text,
  ADD COLUMN IF NOT EXISTS winning_name_kind text;

-- Backfill the primary name as the winning candidate where the basis already
-- indicates a primary-name match (exact / reordered / partial / fuzzy).
-- Alias-basis rows are left null because the specific alias is not recoverable
-- from historical data.
UPDATE public.screening_matches
SET winning_name = matched_name,
    winning_name_kind = 'primary_name'
WHERE winning_name IS NULL
  AND match_basis IN ('exact_name', 'reordered_name', 'partial_name', 'fuzzy_name');