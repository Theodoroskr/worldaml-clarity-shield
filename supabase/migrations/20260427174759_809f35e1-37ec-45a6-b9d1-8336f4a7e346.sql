-- Append-only audit trail for SoF declarations
CREATE TABLE public.suite_sof_audit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  declaration_id UUID NOT NULL REFERENCES public.suite_sof_declarations(id) ON DELETE CASCADE,
  organisation_id UUID,
  actor_user_id UUID,
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_sof_audit_decl ON public.suite_sof_audit_events(declaration_id, created_at DESC);
CREATE INDEX idx_sof_audit_org ON public.suite_sof_audit_events(organisation_id);

ALTER TABLE public.suite_sof_audit_events ENABLE ROW LEVEL SECURITY;

-- Validate event_type via trigger (avoid CHECK constraint per project memory)
CREATE OR REPLACE FUNCTION public.validate_sof_audit_event_type()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.event_type NOT IN ('status_change','notes_update','document_verification','ai_reconciliation','submission','expiry') THEN
    RAISE EXCEPTION 'Invalid SoF audit event_type: %', NEW.event_type;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_validate_sof_audit_event_type
BEFORE INSERT OR UPDATE ON public.suite_sof_audit_events
FOR EACH ROW EXECUTE FUNCTION public.validate_sof_audit_event_type();

-- RLS: org members or platform admins can SELECT. No client INSERT/UPDATE/DELETE (append-only via SECURITY DEFINER triggers + edge fn).
CREATE POLICY "admins_select_sof_audit" ON public.suite_sof_audit_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "org_members_select_sof_audit" ON public.suite_sof_audit_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.suite_sof_declarations d
      LEFT JOIN public.suite_org_members m ON m.organization_id = d.organisation_id AND m.user_id = auth.uid()
      WHERE d.id = suite_sof_audit_events.declaration_id
        AND (m.user_id IS NOT NULL OR d.user_id = auth.uid())
    )
  );

-- Trigger: declaration status / reviewer_notes changes
CREATE OR REPLACE FUNCTION public.log_sof_declaration_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _actor UUID := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.suite_sof_audit_events (declaration_id, organisation_id, actor_user_id, event_type, summary, details)
    VALUES (NEW.id, NEW.organisation_id, _actor, 'status_change',
      'Declaration created with status: ' || NEW.status,
      jsonb_build_object('new_status', NEW.status));
    RETURN NEW;
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.suite_sof_audit_events (declaration_id, organisation_id, actor_user_id, event_type, summary, details)
    VALUES (NEW.id, NEW.organisation_id, _actor,
      CASE WHEN NEW.status = 'submitted' THEN 'submission'
           WHEN NEW.status = 'expired' THEN 'expiry'
           ELSE 'status_change' END,
      'Status changed: ' || COALESCE(OLD.status,'(none)') || ' → ' || NEW.status,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
  END IF;

  IF OLD.reviewer_notes IS DISTINCT FROM NEW.reviewer_notes THEN
    INSERT INTO public.suite_sof_audit_events (declaration_id, organisation_id, actor_user_id, event_type, summary, details)
    VALUES (NEW.id, NEW.organisation_id, _actor, 'notes_update',
      'Reviewer notes updated',
      jsonb_build_object(
        'old_length', COALESCE(length(OLD.reviewer_notes),0),
        'new_length', COALESCE(length(NEW.reviewer_notes),0),
        'old_notes', OLD.reviewer_notes,
        'new_notes', NEW.reviewer_notes
      ));
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER trg_log_sof_declaration_changes
AFTER INSERT OR UPDATE ON public.suite_sof_declarations
FOR EACH ROW EXECUTE FUNCTION public.log_sof_declaration_changes();

-- Trigger: document verification changes
CREATE OR REPLACE FUNCTION public.log_sof_document_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _actor UUID := auth.uid();
  _org UUID;
BEGIN
  SELECT organisation_id INTO _org FROM public.suite_sof_declarations WHERE id = NEW.declaration_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.suite_sof_audit_events (declaration_id, organisation_id, actor_user_id, event_type, summary, details)
    VALUES (NEW.declaration_id, _org, _actor, 'document_verification',
      'Document uploaded: ' || COALESCE(NEW.file_name,'(unnamed)'),
      jsonb_build_object('document_id', NEW.id, 'file_name', NEW.file_name, 'verification_status', NEW.verification_status, 'action', 'uploaded'));
    RETURN NEW;
  END IF;

  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    INSERT INTO public.suite_sof_audit_events (declaration_id, organisation_id, actor_user_id, event_type, summary, details)
    VALUES (NEW.declaration_id, _org, _actor, 'document_verification',
      'Document ' || NEW.verification_status || ': ' || COALESCE(NEW.file_name,'(unnamed)'),
      jsonb_build_object(
        'document_id', NEW.id,
        'file_name', NEW.file_name,
        'old_status', OLD.verification_status,
        'new_status', NEW.verification_status
      ));
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER trg_log_sof_document_changes
AFTER INSERT OR UPDATE ON public.suite_sof_documents
FOR EACH ROW EXECUTE FUNCTION public.log_sof_document_changes();