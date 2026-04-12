
-- 1. Add subscription columns to profiles (NO CHECK constraint — use trigger)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS suite_access_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suite_access_granted_by UUID;

-- Validation trigger for subscription_tier
CREATE OR REPLACE FUNCTION public.validate_subscription_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.subscription_tier NOT IN ('free', 'academy', 'suite', 'enterprise') THEN
    RAISE EXCEPTION 'Invalid subscription_tier: %', NEW.subscription_tier;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_subscription_tier
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_subscription_tier();

-- 2. Add monitoring_status to suite_transactions (NO CHECK — use trigger)
ALTER TABLE public.suite_transactions
  ADD COLUMN IF NOT EXISTS monitoring_status TEXT NOT NULL DEFAULT 'pending';

CREATE OR REPLACE FUNCTION public.validate_monitoring_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.monitoring_status NOT IN ('pending', 'clear', 'flagged', 'reviewed') THEN
    RAISE EXCEPTION 'Invalid monitoring_status: %', NEW.monitoring_status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_monitoring_status
  BEFORE INSERT OR UPDATE ON public.suite_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_monitoring_status();

CREATE INDEX IF NOT EXISTS idx_suite_transactions_monitoring
  ON public.suite_transactions(user_id, monitoring_status);

-- 3. Add transaction_id and rule_id to suite_alerts
ALTER TABLE public.suite_alerts
  ADD COLUMN IF NOT EXISTS transaction_id UUID,
  ADD COLUMN IF NOT EXISTS rule_id UUID;

-- 4. Computed view: who has suite access
CREATE OR REPLACE VIEW public.suite_access AS
SELECT
  p.user_id,
  p.email,
  p.subscription_tier,
  (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.user_id AND ur.role = 'admin'
    )
    OR p.subscription_tier IN ('suite', 'enterprise')
  ) AS has_suite_access
FROM public.profiles p;

-- 5. Helper function — call from frontend safely
CREATE OR REPLACE FUNCTION public.current_user_has_suite_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.suite_access
    WHERE user_id = auth.uid() AND has_suite_access = true
  );
$$;

-- 6. Admin function: grant suite access by email
CREATE OR REPLACE FUNCTION public.admin_grant_suite_access(target_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_uid UUID;
BEGIN
  SELECT user_id INTO target_uid FROM public.profiles WHERE email = target_email;
  IF target_uid IS NULL THEN
    RAISE EXCEPTION 'User not found: %', target_email;
  END IF;
  UPDATE public.profiles
  SET
    subscription_tier = 'suite',
    suite_access_granted_at = NOW(),
    suite_access_granted_by = auth.uid()
  WHERE user_id = target_uid;
END;
$$;

-- 7. Revoke suite access
CREATE OR REPLACE FUNCTION public.admin_revoke_suite_access(target_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_uid UUID;
BEGIN
  SELECT user_id INTO target_uid FROM public.profiles WHERE email = target_email;
  IF target_uid IS NULL THEN
    RAISE EXCEPTION 'User not found: %', target_email;
  END IF;
  UPDATE public.profiles
  SET subscription_tier = 'free', suite_access_granted_at = NULL
  WHERE user_id = target_uid;
END;
$$;

-- 8. Allow UPDATE on suite_transactions for monitoring_status updates
CREATE POLICY "Users can update own transactions"
  ON public.suite_transactions
  FOR UPDATE
  USING (auth.uid() = user_id);
