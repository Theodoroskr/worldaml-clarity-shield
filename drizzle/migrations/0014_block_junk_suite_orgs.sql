CREATE OR REPLACE FUNCTION public.suite_block_selfserve_org_names()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF lower(trim(NEW.name)) IN ('gmail.com','googlemail.com','gmial.com','yahoo.com','hotmail.com','hotmail.co.uk','outlook.com','live.com','msn.com','icloud.com','me.com','aol.com','protonmail.com','proton.me','gmx.com','gmx.de','mail.com','yandex.com','zoho.com','qq.com','163.com','o2.pl','wp.pl','onet.pl','interia.pl','my organisation')
  THEN
    RAISE EXCEPTION 'Suite organisations must be real companies, not personal email domains (%).', NEW.name
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_suite_block_selfserve_org_names ON public.suite_organizations;
CREATE TRIGGER trg_suite_block_selfserve_org_names
BEFORE INSERT OR UPDATE OF name ON public.suite_organizations
FOR EACH ROW EXECUTE FUNCTION public.suite_block_selfserve_org_names();