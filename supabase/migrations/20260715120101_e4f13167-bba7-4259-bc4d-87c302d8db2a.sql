
CREATE TABLE public.partner_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  notify_referral_new BOOLEAN NOT NULL DEFAULT true,
  notify_referral_converted BOOLEAN NOT NULL DEFAULT true,
  notify_deal_new BOOLEAN NOT NULL DEFAULT true,
  notify_deal_status_change BOOLEAN NOT NULL DEFAULT true,
  notify_deal_won BOOLEAN NOT NULL DEFAULT true,
  notify_payouts BOOLEAN NOT NULL DEFAULT true,
  notify_monthly_summary BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (partner_id, email)
);

CREATE INDEX partner_contacts_partner_id_idx ON public.partner_contacts(partner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_contacts TO authenticated;
GRANT ALL ON public.partner_contacts TO service_role;

ALTER TABLE public.partner_contacts ENABLE ROW LEVEL SECURITY;

-- Partner owner (the user whose partners.user_id = auth.uid()) can fully manage their contacts.
CREATE POLICY "Partners manage own contacts"
  ON public.partner_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = partner_contacts.partner_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = partner_contacts.partner_id
        AND p.user_id = auth.uid()
    )
  );

-- Admins can view and manage every partner's contacts.
CREATE POLICY "Admins manage all partner contacts"
  ON public.partner_contacts
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_partner_contacts_updated_at
  BEFORE UPDATE ON public.partner_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
