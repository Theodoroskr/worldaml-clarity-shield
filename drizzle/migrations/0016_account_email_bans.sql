CREATE TABLE public.account_email_bans (
 email text PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now(),
 reason text NOT NULL,
 CONSTRAINT account_email_bans_normalized CHECK (email = lower(btrim(email)))
);
GRANT SELECT ON public.account_email_bans TO authenticated;
GRANT ALL ON public.account_email_bans TO service_role;
REVOKE ALL ON public.account_email_bans FROM anon;
ALTER TABLE public.account_email_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can read account bans" ON public.account_email_bans FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.reject_banned_account_email() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF EXISTS (SELECT 1 FROM public.account_email_bans WHERE email = lower(btrim(NEW.email))) THEN
  RAISE EXCEPTION 'This email address is not permitted to register.' USING ERRCODE = '42501';
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.reject_banned_account_email() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER reject_banned_account_email BEFORE INSERT OR UPDATE OF email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.reject_banned_account_email();