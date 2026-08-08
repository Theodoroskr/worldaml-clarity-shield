CREATE OR REPLACE FUNCTION public.validate_partner_asset_category()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.category NOT IN (
    'brochure','one_pager','presentation','deck','social','email_template','email_campaign',
    'campaign_kit','brand_asset','logo','banner','case_study','contract','brand_guide','video'
  ) THEN
    RAISE EXCEPTION 'Invalid partner_asset category: %', NEW.category;
  END IF;
  IF NEW.certification_min NOT IN ('bronze','silver','gold') THEN
    RAISE EXCEPTION 'Invalid certification_min: %', NEW.certification_min;
  END IF;
  RETURN NEW;
END;
$$;