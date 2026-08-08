CREATE TABLE public.business_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  contact_name TEXT,
  country TEXT,
  industry TEXT,
  phone TEXT,
  company_size TEXT,
  products_of_interest TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.business_accounts TO authenticated;
GRANT ALL ON public.business_accounts TO service_role;
ALTER TABLE public.business_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers manage their own business account"
ON public.business_accounts FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all business accounts"
ON public.business_accounts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update business accounts"
ON public.business_accounts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_business_accounts_updated_at
BEFORE UPDATE ON public.business_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.business_quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_account_id UUID REFERENCES public.business_accounts(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  product TEXT NOT NULL,
  plan TEXT,
  seats INTEGER,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.business_quote_requests TO authenticated;
GRANT UPDATE ON public.business_quote_requests TO authenticated;
GRANT ALL ON public.business_quote_requests TO service_role;
ALTER TABLE public.business_quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers view their own quote requests"
ON public.business_quote_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Buyers create their own quote requests"
ON public.business_quote_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all quote requests"
ON public.business_quote_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update quote requests"
ON public.business_quote_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_business_quote_requests_user ON public.business_quote_requests(user_id);
CREATE INDEX idx_business_quote_requests_status ON public.business_quote_requests(status);

CREATE TRIGGER update_business_quote_requests_updated_at
BEFORE UPDATE ON public.business_quote_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();