
-- 1) Table
CREATE TABLE public.academy_pending_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  grant_kind TEXT NOT NULL DEFAULT 'annual_pass',
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ,
  granted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX academy_pending_grants_email_kind_idx
  ON public.academy_pending_grants (lower(email), grant_kind);

-- 2) Grants (admin-only surface)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_pending_grants TO authenticated;
GRANT ALL ON public.academy_pending_grants TO service_role;

-- 3) RLS
ALTER TABLE public.academy_pending_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage pending grants"
  ON public.academy_pending_grants
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4) updated_at trigger (reuses existing helper)
CREATE TRIGGER academy_pending_grants_set_updated_at
BEFORE UPDATE ON public.academy_pending_grants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Auto-apply on profile creation
CREATE OR REPLACE FUNCTION public.apply_academy_pending_grants()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g RECORD;
  v_slug TEXT;
BEGIN
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  FOR g IN
    SELECT * FROM public.academy_pending_grants
    WHERE lower(email) = lower(NEW.email) AND granted_at IS NULL
  LOOP
    IF g.grant_kind = 'annual_pass' THEN
      v_slug := '__annual_pass__';
    ELSE
      v_slug := g.grant_kind;
    END IF;

    INSERT INTO public.academy_course_purchases (
      user_id, course_slug, status, amount_cents, currency, expires_at
    ) VALUES (
      NEW.user_id,
      v_slug,
      'paid',
      0,
      'eur',
      now() + INTERVAL '365 days'
    )
    ON CONFLICT DO NOTHING;

    UPDATE public.academy_pending_grants
    SET granted_at = now(), granted_user_id = NEW.user_id
    WHERE id = g.id;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_academy_pending_grants
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.apply_academy_pending_grants();
