
CREATE TABLE public.admin_upsell_email_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  template_id TEXT NOT NULL,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_upsell_email_log TO authenticated;
GRANT ALL ON public.admin_upsell_email_log TO service_role;

ALTER TABLE public.admin_upsell_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view upsell email log"
  ON public.admin_upsell_email_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_upsell_log_recipient ON public.admin_upsell_email_log(recipient_user_id, created_at DESC);
CREATE INDEX idx_upsell_log_email ON public.admin_upsell_email_log(recipient_email, created_at DESC);
