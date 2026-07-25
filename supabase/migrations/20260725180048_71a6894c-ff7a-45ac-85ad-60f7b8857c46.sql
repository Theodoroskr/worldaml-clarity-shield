CREATE TABLE public.suite_screening_whitelist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.suite_customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  match_key TEXT NOT NULL,
  match_name TEXT NOT NULL,
  list_type TEXT,
  match_id TEXT,
  reason TEXT NOT NULL,
  reviewed_by TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  hit_count INTEGER NOT NULL DEFAULT 0,
  last_hit_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX suite_screening_whitelist_unique_active
  ON public.suite_screening_whitelist (customer_id, match_key)
  WHERE revoked_at IS NULL;

CREATE INDEX suite_screening_whitelist_org_idx ON public.suite_screening_whitelist (organisation_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_screening_whitelist TO authenticated;
GRANT ALL ON public.suite_screening_whitelist TO service_role;

ALTER TABLE public.suite_screening_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view whitelist entries"
ON public.suite_screening_whitelist FOR SELECT TO authenticated
USING (
  organisation_id IN (SELECT organisation_id FROM public.suite_org_members WHERE user_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Org members can create whitelist entries"
ON public.suite_screening_whitelist FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    organisation_id IS NULL
    OR organisation_id IN (SELECT organisation_id FROM public.suite_org_members WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Org members can update whitelist entries"
ON public.suite_screening_whitelist FOR UPDATE TO authenticated
USING (
  organisation_id IN (SELECT organisation_id FROM public.suite_org_members WHERE user_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Org members can delete whitelist entries"
ON public.suite_screening_whitelist FOR DELETE TO authenticated
USING (
  organisation_id IN (SELECT organisation_id FROM public.suite_org_members WHERE user_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE TRIGGER update_suite_screening_whitelist_updated_at
BEFORE UPDATE ON public.suite_screening_whitelist
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();