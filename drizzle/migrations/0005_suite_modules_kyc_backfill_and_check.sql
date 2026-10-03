INSERT INTO public.suite_module_access (organisation_id, module, status)
SELECT DISTINCT pa.organisation_id, m.k, 'active'::public.product_status
FROM public.product_access pa
CROSS JOIN (VALUES ('kyc_kyb'::public.suite_module_key), ('screening'::public.suite_module_key)) m(k)
WHERE pa.product = 'suite' AND pa.status IN ('active','trial') AND pa.organisation_id IS NOT NULL
ON CONFLICT (organisation_id, module) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_screening_module_from_product_access()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.organisation_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.product = 'screening' THEN
    INSERT INTO public.suite_module_access (organisation_id, module, status)
    VALUES (NEW.organisation_id, 'screening', NEW.status)
    ON CONFLICT (organisation_id, module) DO UPDATE SET status = EXCLUDED.status, updated_at = now();
  ELSIF NEW.product = 'suite' THEN
    INSERT INTO public.suite_module_access (organisation_id, module, status)
    VALUES (NEW.organisation_id, 'kyc_kyb', NEW.status)
    ON CONFLICT (organisation_id, module) DO UPDATE SET status = EXCLUDED.status, updated_at = now();
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.user_can_use_module(_module text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.current_user_suite_modules() m
    WHERE m.module = _module AND m.purchased AND m.enabled AND m.member_allowed
  );
$$;
REVOKE ALL ON FUNCTION public.user_can_use_module(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.user_can_use_module(text) TO authenticated;