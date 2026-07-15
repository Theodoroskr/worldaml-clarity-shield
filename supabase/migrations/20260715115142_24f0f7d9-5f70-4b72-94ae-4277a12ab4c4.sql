-- Audit log for partner-program admin actions
CREATE TABLE IF NOT EXISTS public.partner_admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_label text,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.partner_admin_audit_log TO authenticated;
GRANT ALL ON public.partner_admin_audit_log TO service_role;

ALTER TABLE public.partner_admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view partner audit log"
  ON public.partner_admin_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert partner audit log"
  ON public.partner_admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND actor_user_id = auth.uid()
  );

CREATE INDEX IF NOT EXISTS partner_admin_audit_log_created_idx
  ON public.partner_admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS partner_admin_audit_log_entity_idx
  ON public.partner_admin_audit_log(entity_type, entity_id);


-- Per-user notification preferences for partner-program alerts
CREATE TABLE IF NOT EXISTS public.partner_notification_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  notify_new_application boolean NOT NULL DEFAULT true,
  notify_new_deal boolean NOT NULL DEFAULT true,
  notify_deal_status_change boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_notification_settings TO authenticated;
GRANT ALL ON public.partner_notification_settings TO service_role;

ALTER TABLE public.partner_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view partner notification settings"
  ON public.partner_notification_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can upsert own notification settings"
  ON public.partner_notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND user_id = auth.uid()
  );

CREATE POLICY "Admin can update own notification settings"
  ON public.partner_notification_settings FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND user_id = auth.uid()
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND user_id = auth.uid()
  );

CREATE POLICY "Admin can delete own notification settings"
  ON public.partner_notification_settings FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND user_id = auth.uid()
  );

CREATE TRIGGER trg_partner_notification_settings_updated_at
  BEFORE UPDATE ON public.partner_notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();