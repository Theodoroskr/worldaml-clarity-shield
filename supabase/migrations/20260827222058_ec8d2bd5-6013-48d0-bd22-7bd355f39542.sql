ALTER TABLE public.screening_matches
  ADD COLUMN IF NOT EXISTS profile_fetched_at timestamptz;

CREATE OR REPLACE FUNCTION public.admin_screening_profile_audit(
  _search text DEFAULT NULL,
  _limit integer DEFAULT 200
)
RETURNS TABLE (
  event_id uuid,
  occurred_at timestamptz,
  actor_id uuid,
  actor_email text,
  actor_name text,
  organisation_id uuid,
  organisation_name text,
  match_id uuid,
  matched_name text,
  case_id uuid,
  case_reference text,
  description text,
  metadata jsonb,
  profile_cached_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id,
    e.created_at,
    e.actor_id,
    u.email::text,
    COALESCE(p.full_name, '')::text,
    e.organisation_id,
    COALESCE(o.name, '')::text,
    e.match_id,
    COALESCE(m.matched_name, '')::text,
    e.case_id,
    COALESCE(c.case_reference, '')::text,
    e.description,
    e.metadata,
    m.profile_fetched_at
  FROM public.screening_audit_events e
  LEFT JOIN auth.users u ON u.id = e.actor_id
  LEFT JOIN public.profiles p ON p.id = e.actor_id
  LEFT JOIN public.suite_organizations o ON o.id = e.organisation_id
  LEFT JOIN public.screening_matches m ON m.id = e.match_id
  LEFT JOIN public.screening_cases c ON c.id = e.case_id
  WHERE public.has_role(auth.uid(), 'admin')
    AND e.event_type = 'profile_enriched'
    AND (
      _search IS NULL OR _search = '' OR
      u.email ILIKE '%' || _search || '%' OR
      m.matched_name ILIKE '%' || _search || '%' OR
      o.name ILIKE '%' || _search || '%'
    )
  ORDER BY e.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 200), 1), 1000);
$$;

REVOKE ALL ON FUNCTION public.admin_screening_profile_audit(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_screening_profile_audit(text, integer) TO authenticated;