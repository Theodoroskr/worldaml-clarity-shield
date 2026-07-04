
-- 1) Event log
CREATE TABLE public.outreach_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.outreach_events TO authenticated;
GRANT ALL ON public.outreach_events TO service_role;
ALTER TABLE public.outreach_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own outreach events"
  ON public.outreach_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_outreach_events_user_type_time
  ON public.outreach_events (user_id, event_type, created_at DESC);

-- 2) Queue
CREATE TABLE public.outreach_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  template_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  sent_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cancel_reason TEXT,
  skip_reason TEXT,
  promo_code TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.outreach_queue TO authenticated;
GRANT ALL ON public.outreach_queue TO service_role;
ALTER TABLE public.outreach_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view outreach queue"
  ON public.outreach_queue FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can cancel queued outreach"
  ON public.outreach_queue FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE UNIQUE INDEX uniq_pending_outreach_per_trigger
  ON public.outreach_queue (user_id, trigger_type)
  WHERE status = 'scheduled';

CREATE INDEX idx_outreach_queue_due
  ON public.outreach_queue (scheduled_at)
  WHERE status = 'scheduled';

CREATE TRIGGER trg_outreach_queue_updated
  BEFORE UPDATE ON public.outreach_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Enqueue helper (idempotent per trigger_type per user)
CREATE OR REPLACE FUNCTION public.enqueue_outreach(
  _user_id UUID,
  _trigger_type TEXT,
  _template_id TEXT,
  _metadata JSONB DEFAULT '{}'::jsonb,
  _delay INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email TEXT;
  _new_id UUID;
BEGIN
  SELECT email INTO _email FROM public.profiles WHERE user_id = _user_id;
  IF _email IS NULL THEN RETURN NULL; END IF;

  INSERT INTO public.outreach_queue
    (user_id, recipient_email, trigger_type, template_id, metadata, scheduled_at)
  VALUES
    (_user_id, _email, _trigger_type, _template_id, _metadata, now() + _delay)
  ON CONFLICT (user_id, trigger_type) WHERE status = 'scheduled'
  DO NOTHING
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_outreach(UUID, TEXT, TEXT, JSONB, INTERVAL) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.enqueue_outreach(UUID, TEXT, TEXT, JSONB, INTERVAL) TO service_role;

-- 4) Auto-enqueue seminar discount when academy_progress.completed_at is set
CREATE OR REPLACE FUNCTION public.enqueue_seminar_discount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.completed_at IS NULL) THEN
    PERFORM public.enqueue_outreach(
      NEW.user_id,
      'seminar_discount',
      'seminar-discount-suite',
      jsonb_build_object('course_id', NEW.course_id),
      INTERVAL '24 hours'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enqueue_seminar_discount ON public.academy_progress;
CREATE TRIGGER trg_enqueue_seminar_discount
  AFTER INSERT OR UPDATE OF completed_at ON public.academy_progress
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_seminar_discount();
