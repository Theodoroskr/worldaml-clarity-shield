
-- 1. Extend suite_cases
ALTER TABLE public.suite_cases
  ADD COLUMN IF NOT EXISTS assignee_user_id uuid,
  ADD COLUMN IF NOT EXISTS due_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_hours integer,
  ADD COLUMN IF NOT EXISTS opened_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_by uuid,
  ADD COLUMN IF NOT EXISTS closure_reason text,
  ADD COLUMN IF NOT EXISTS closure_notes text,
  ADD COLUMN IF NOT EXISTS linked_entity_type text,
  ADD COLUMN IF NOT EXISTS linked_entity_id uuid;

CREATE INDEX IF NOT EXISTS idx_suite_cases_queue
  ON public.suite_cases (organisation_id, status, priority, due_at NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_suite_cases_assignee
  ON public.suite_cases (assignee_user_id);

-- 2. Auto-set opened_at / closed_at + require closure reason
CREATE OR REPLACE FUNCTION public.suite_cases_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.opened_at IS NULL THEN NEW.opened_at := now(); END IF;
    IF NEW.sla_hours IS NOT NULL AND NEW.due_at IS NULL THEN
      NEW.due_at := now() + make_interval(hours => NEW.sla_hours);
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status IN ('closed','resolved') AND (OLD.status IS DISTINCT FROM NEW.status) THEN
      IF NEW.closure_reason IS NULL OR length(trim(NEW.closure_reason)) = 0 THEN
        RAISE EXCEPTION 'A closure reason is required to close or resolve a case';
      END IF;
      IF NEW.closure_reason NOT IN (
        'resolved_no_action','false_positive','escalated_to_regulator',
        'sar_filed','customer_offboarded','duplicate','other'
      ) THEN
        RAISE EXCEPTION 'Invalid closure_reason: %', NEW.closure_reason;
      END IF;
      IF NEW.closed_at IS NULL THEN NEW.closed_at := now(); END IF;
      IF NEW.closed_by IS NULL THEN NEW.closed_by := auth.uid(); END IF;
    END IF;
    IF NEW.sla_hours IS DISTINCT FROM OLD.sla_hours AND NEW.sla_hours IS NOT NULL THEN
      NEW.due_at := COALESCE(NEW.opened_at, now()) + make_interval(hours => NEW.sla_hours);
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_suite_cases_lifecycle ON public.suite_cases;
CREATE TRIGGER trg_suite_cases_lifecycle
  BEFORE INSERT OR UPDATE ON public.suite_cases
  FOR EACH ROW EXECUTE FUNCTION public.suite_cases_lifecycle();

-- 3. Activity log (append-only)
CREATE TABLE IF NOT EXISTS public.suite_case_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.suite_cases(id) ON DELETE CASCADE,
  organisation_id uuid NOT NULL,
  actor_id uuid,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.suite_case_activity TO authenticated;
GRANT ALL ON public.suite_case_activity TO service_role;
ALTER TABLE public.suite_case_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "case_activity_org_select" ON public.suite_case_activity
  FOR SELECT TO authenticated
  USING (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "case_activity_org_insert" ON public.suite_case_activity
  FOR INSERT TO authenticated
  WITH CHECK (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE INDEX IF NOT EXISTS idx_case_activity_case ON public.suite_case_activity(case_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_suite_case_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.suite_case_activity(case_id, organisation_id, actor_id, action, details)
    VALUES (NEW.id, NEW.organisation_id, auth.uid(), 'created',
      jsonb_build_object('title', NEW.title, 'priority', NEW.priority, 'status', NEW.status));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.suite_case_activity(case_id, organisation_id, actor_id, action, details)
      VALUES (NEW.id, NEW.organisation_id, auth.uid(), 'status_changed',
        jsonb_build_object('from', OLD.status, 'to', NEW.status,
                           'closure_reason', NEW.closure_reason));
    END IF;
    IF OLD.assignee_user_id IS DISTINCT FROM NEW.assignee_user_id THEN
      INSERT INTO public.suite_case_activity(case_id, organisation_id, actor_id, action, details)
      VALUES (NEW.id, NEW.organisation_id, auth.uid(), 'assignee_changed',
        jsonb_build_object('from', OLD.assignee_user_id, 'to', NEW.assignee_user_id));
    END IF;
    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
      INSERT INTO public.suite_case_activity(case_id, organisation_id, actor_id, action, details)
      VALUES (NEW.id, NEW.organisation_id, auth.uid(), 'priority_changed',
        jsonb_build_object('from', OLD.priority, 'to', NEW.priority));
    END IF;
    IF OLD.due_at IS DISTINCT FROM NEW.due_at THEN
      INSERT INTO public.suite_case_activity(case_id, organisation_id, actor_id, action, details)
      VALUES (NEW.id, NEW.organisation_id, auth.uid(), 'due_at_changed',
        jsonb_build_object('from', OLD.due_at, 'to', NEW.due_at));
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_log_suite_case_change ON public.suite_cases;
CREATE TRIGGER trg_log_suite_case_change
  AFTER INSERT OR UPDATE ON public.suite_cases
  FOR EACH ROW EXECUTE FUNCTION public.log_suite_case_change();

-- 4. Watchers
CREATE TABLE IF NOT EXISTS public.suite_case_watchers (
  case_id uuid NOT NULL REFERENCES public.suite_cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  organisation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.suite_case_watchers TO authenticated;
GRANT ALL ON public.suite_case_watchers TO service_role;
ALTER TABLE public.suite_case_watchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "case_watchers_org_select" ON public.suite_case_watchers
  FOR SELECT TO authenticated
  USING (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "case_watchers_self_write" ON public.suite_case_watchers
  FOR INSERT TO authenticated
  WITH CHECK (organisation_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "case_watchers_self_delete" ON public.suite_case_watchers
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
