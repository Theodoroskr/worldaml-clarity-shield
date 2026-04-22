
-- 1. Extend academy_courses with role-based taxonomy and outcomes
ALTER TABLE public.academy_courses
  ADD COLUMN IF NOT EXISTS role_track text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS learning_outcomes text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS estimated_words integer NOT NULL DEFAULT 0;

-- Validate role_track values
CREATE OR REPLACE FUNCTION public.validate_course_role_track()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role_track NOT IN ('all', 'mlro', 'analyst', 'compliance_officer', 'founder') THEN
    RAISE EXCEPTION 'Invalid role_track: %', NEW.role_track;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_course_role_track_trg ON public.academy_courses;
CREATE TRIGGER validate_course_role_track_trg
BEFORE INSERT OR UPDATE ON public.academy_courses
FOR EACH ROW EXECUTE FUNCTION public.validate_course_role_track();

-- 2. Templates library
CREATE TABLE IF NOT EXISTS public.academy_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'policy',
  file_url text NOT NULL,
  file_format text NOT NULL DEFAULT 'docx',
  file_size_kb integer,
  preview_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  jurisdictions text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.academy_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published templates" ON public.academy_templates;
CREATE POLICY "Anyone can view published templates"
  ON public.academy_templates
  FOR SELECT
  TO public
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage templates" ON public.academy_templates;
CREATE POLICY "Admins can manage templates"
  ON public.academy_templates
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_academy_templates_updated_at ON public.academy_templates;
CREATE TRIGGER update_academy_templates_updated_at
BEFORE UPDATE ON public.academy_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Pro Certificate purchases (one-off Stripe payment unlocking verified credential)
CREATE TABLE IF NOT EXISTS public.academy_pro_certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  certificate_id uuid NOT NULL REFERENCES public.academy_certificates(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE,
  amount_cents integer NOT NULL DEFAULT 4900,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.academy_pro_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own pro certificates" ON public.academy_pro_certificates;
CREATE POLICY "Users view own pro certificates"
  ON public.academy_pro_certificates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all pro certificates" ON public.academy_pro_certificates;
CREATE POLICY "Admins view all pro certificates"
  ON public.academy_pro_certificates
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Deny direct inserts on pro certificates" ON public.academy_pro_certificates;
CREATE POLICY "Deny direct inserts on pro certificates"
  ON public.academy_pro_certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny direct updates on pro certificates" ON public.academy_pro_certificates;
CREATE POLICY "Deny direct updates on pro certificates"
  ON public.academy_pro_certificates
  FOR UPDATE
  TO authenticated
  USING (false);

DROP TRIGGER IF EXISTS update_academy_pro_certificates_updated_at ON public.academy_pro_certificates;
CREATE TRIGGER update_academy_pro_certificates_updated_at
BEFORE UPDATE ON public.academy_pro_certificates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_academy_pro_certificates_user ON public.academy_pro_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_pro_certificates_cert ON public.academy_pro_certificates(certificate_id);
