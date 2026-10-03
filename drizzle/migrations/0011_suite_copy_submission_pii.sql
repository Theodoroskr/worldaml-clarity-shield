
CREATE OR REPLACE FUNCTION public.suite_copy_submission_pii(_submission uuid, _customer uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s_org uuid; c_org uuid; enc bytea;
BEGIN
  SELECT organisation_id, data_pii_enc INTO s_org, enc FROM public.suite_onboarding_submissions WHERE id = _submission;
  SELECT organisation_id INTO c_org FROM public.suite_customers WHERE id = _customer;
  IF s_org IS NULL OR s_org <> c_org OR NOT public.screening_is_org_member(s_org) THEN
    RAISE EXCEPTION 'not_permitted' USING ERRCODE = '42501';
  END IF;
  IF enc IS NOT NULL THEN
    UPDATE public.suite_customers
       SET onboarding_pii_enc = private.merge_pii(onboarding_pii_enc, private.pii_decrypt(enc)::jsonb)
     WHERE id = _customer;
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.suite_copy_submission_pii(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.suite_copy_submission_pii(uuid, uuid) TO authenticated;
