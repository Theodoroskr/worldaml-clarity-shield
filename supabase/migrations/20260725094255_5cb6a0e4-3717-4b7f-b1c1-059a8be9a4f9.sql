-- 1. mentions column on existing case notes
ALTER TABLE public.suite_case_notes
  ADD COLUMN IF NOT EXISTS mentions uuid[] NOT NULL DEFAULT '{}'::uuid[];

-- 2. customer notes table
CREATE TABLE IF NOT EXISTS public.suite_customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.suite_customers(id) ON DELETE CASCADE,
  organisation_id uuid NOT NULL REFERENCES public.suite_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  mentions uuid[] NOT NULL DEFAULT '{}'::uuid[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suite_customer_notes TO authenticated;
GRANT ALL ON public.suite_customer_notes TO service_role;

ALTER TABLE public.suite_customer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cust_notes_read_same_org" ON public.suite_customer_notes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.suite_org_members m
    WHERE m.organization_id = suite_customer_notes.organisation_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "cust_notes_insert_same_org" ON public.suite_customer_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.suite_org_members m
      WHERE m.organization_id = organisation_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "cust_notes_update_own" ON public.suite_customer_notes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cust_notes_delete_own" ON public.suite_customer_notes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_cust_notes_customer ON public.suite_customer_notes(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cust_notes_org ON public.suite_customer_notes(organisation_id);

-- 3. reassignment note column
ALTER TABLE public.suite_cases
  ADD COLUMN IF NOT EXISTS last_reassignment_note text;

-- 4. mention notification trigger (case + customer notes)
CREATE OR REPLACE FUNCTION public.log_mention_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref uuid;
  org uuid;
  kind_str text;
BEGIN
  IF NEW.mentions IS NULL OR array_length(NEW.mentions, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'suite_case_notes' THEN
    ref := NEW.case_id;
    org := NEW.organisation_id;
    kind_str := 'case_mention';
  ELSE
    ref := NEW.customer_id;
    org := NEW.organisation_id;
    kind_str := 'customer_mention';
  END IF;

  IF org IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.suite_notification_log (organisation_id, kind, reference_id, recipients, alert_ids)
  VALUES (org, kind_str, ref, NEW.mentions, ARRAY[]::uuid[]);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_notes_mentions ON public.suite_case_notes;
CREATE TRIGGER trg_case_notes_mentions
  AFTER INSERT ON public.suite_case_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_mention_notifications();

DROP TRIGGER IF EXISTS trg_cust_notes_mentions ON public.suite_customer_notes;
CREATE TRIGGER trg_cust_notes_mentions
  AFTER INSERT ON public.suite_customer_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_mention_notifications();

-- 5. reassignment activity + notification trigger
CREATE OR REPLACE FUNCTION public.log_case_reassignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.assignee_user_id IS DISTINCT FROM OLD.assignee_user_id THEN
    INSERT INTO public.suite_case_activity (case_id, organisation_id, actor_id, action, details)
    VALUES (
      NEW.id,
      COALESCE(NEW.organisation_id, OLD.organisation_id),
      auth.uid(),
      'reassigned',
      jsonb_build_object(
        'from', OLD.assignee_user_id,
        'to', NEW.assignee_user_id,
        'note', COALESCE(NEW.last_reassignment_note, '')
      )
    );

    IF NEW.assignee_user_id IS NOT NULL AND NEW.organisation_id IS NOT NULL THEN
      INSERT INTO public.suite_notification_log (organisation_id, kind, reference_id, recipients, alert_ids)
      VALUES (NEW.organisation_id, 'case_reassigned', NEW.id, ARRAY[NEW.assignee_user_id], ARRAY[]::uuid[]);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_reassignment ON public.suite_cases;
CREATE TRIGGER trg_case_reassignment
  AFTER UPDATE OF assignee_user_id ON public.suite_cases
  FOR EACH ROW EXECUTE FUNCTION public.log_case_reassignment();

-- 6. updated_at trigger on customer notes
CREATE TRIGGER trg_cust_notes_updated
  BEFORE UPDATE ON public.suite_customer_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();