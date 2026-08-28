CREATE TABLE IF NOT EXISTS public.screening_org_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL,
  module text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  monthly_price_eur numeric,
  requested_by uuid,
  requested_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  cancelled_at timestamptz,
  current_period_end timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS screening_org_modules_org_module_key
  ON public.screening_org_modules (organisation_id, module);

GRANT SELECT, INSERT ON public.screening_org_modules TO authenticated;
GRANT ALL ON public.screening_org_modules TO service_role;

ALTER TABLE public.screening_org_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "screening_org_modules_select" ON public.screening_org_modules;
CREATE POLICY "screening_org_modules_select"
ON public.screening_org_modules FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = screening_org_modules.organisation_id
      AND m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "screening_org_modules_request" ON public.screening_org_modules;
CREATE POLICY "screening_org_modules_request"
ON public.screening_org_modules FOR INSERT TO authenticated
WITH CHECK (
  status = 'requested'
  AND requested_by = auth.uid()
  AND activated_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = screening_org_modules.organisation_id
      AND m.user_id = auth.uid()
      AND m.role IN ('admin', 'mlro')
  )
);

DROP POLICY IF EXISTS "screening_org_modules_admin_manage" ON public.screening_org_modules;
CREATE POLICY "screening_org_modules_admin_manage"
ON public.screening_org_modules FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.screening_org_modules_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  NEW.organisation_id := OLD.organisation_id;
  NEW.module := OLD.module;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS screening_org_modules_touch_trg ON public.screening_org_modules;
CREATE TRIGGER screening_org_modules_touch_trg
BEFORE UPDATE ON public.screening_org_modules
FOR EACH ROW EXECUTE FUNCTION public.screening_org_modules_touch();

ALTER TABLE public.screening_cases
  ADD COLUMN IF NOT EXISTS escalated_to uuid,
  ADD COLUMN IF NOT EXISTS escalated_by uuid,
  ADD COLUMN IF NOT EXISTS escalated_at timestamptz,
  ADD COLUMN IF NOT EXISTS escalation_note text;

CREATE OR REPLACE FUNCTION public.screening_module_active(_organisation_id uuid, _module text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.screening_org_modules m
    WHERE m.organisation_id = _organisation_id
      AND m.module = _module
      AND m.status = 'active'
      AND (m.current_period_end IS NULL OR m.current_period_end > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_screening_modules()
RETURNS TABLE (
  organisation_id uuid,
  module text,
  status text,
  monthly_price_eur numeric,
  requested_at timestamptz,
  activated_at timestamptz,
  current_period_end timestamptz,
  member_role text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.organization_id,
         om.module,
         COALESCE(om.status, 'not_requested'),
         om.monthly_price_eur,
         om.requested_at,
         om.activated_at,
         om.current_period_end,
         m.role::text
  FROM public.suite_org_members m
  LEFT JOIN public.screening_org_modules om
    ON om.organisation_id = m.organization_id
  WHERE m.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.screening_escalation_reviewers(_organisation_id uuid)
RETURNS TABLE (user_id uuid, full_name text, email text, role text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.user_id,
         COALESCE(p.full_name, p.email, 'Team member'),
         p.email,
         m.role::text
  FROM public.suite_org_members m
  LEFT JOIN public.profiles p ON p.id = m.user_id
  WHERE m.organization_id = _organisation_id
    AND m.role IN ('mlro', 'compliance_officer', 'admin')
    AND EXISTS (
      SELECT 1 FROM public.suite_org_members me
      WHERE me.organization_id = _organisation_id AND me.user_id = auth.uid()
    )
  ORDER BY CASE m.role::text WHEN 'mlro' THEN 1 WHEN 'compliance_officer' THEN 2 ELSE 3 END;
$$;

REVOKE ALL ON FUNCTION public.screening_module_active(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_user_screening_modules() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.screening_escalation_reviewers(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.screening_module_active(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_screening_modules() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.screening_escalation_reviewers(uuid) TO authenticated, service_role;