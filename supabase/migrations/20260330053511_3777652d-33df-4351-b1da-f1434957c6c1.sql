
-- 1. Create auto_approve_domains table
CREATE TABLE public.auto_approve_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.auto_approve_domains ENABLE ROW LEVEL SECURITY;

-- 3. RLS: Admins can do everything
CREATE POLICY "Admins can manage auto_approve_domains"
ON public.auto_approve_domains
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. RLS: Authenticated users can read (needed for signup check)
CREATE POLICY "Authenticated users can read auto_approve_domains"
ON public.auto_approve_domains
FOR SELECT
TO authenticated
USING (true);

-- 5. RLS: Anon users can read (needed for signup flow before auth)
CREATE POLICY "Anon can read auto_approve_domains"
ON public.auto_approve_domains
FOR SELECT
TO anon
USING (true);

-- 6. Seed infocreditgroup.com
INSERT INTO public.auto_approve_domains (domain) VALUES ('infocreditgroup.com');

-- 7. Create trigger function for auto-approval
CREATE OR REPLACE FUNCTION public.auto_approve_trusted_domain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _domain text;
BEGIN
  -- Extract domain from email
  _domain := lower(split_part(NEW.email, '@', 2));
  
  -- Check if domain is in trusted list
  IF EXISTS (
    SELECT 1 FROM public.auto_approve_domains WHERE domain = _domain
  ) THEN
    NEW.status := 'approved';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. Attach trigger to profiles table (BEFORE INSERT)
CREATE TRIGGER trg_auto_approve_trusted_domain
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_trusted_domain();
