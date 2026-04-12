
-- STR Reports table
CREATE TABLE public.str_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID REFERENCES public.suite_cases(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.suite_customers(id) ON DELETE SET NULL,
  report_number TEXT NOT NULL DEFAULT ('STR-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6)),
  filing_status TEXT NOT NULL DEFAULT 'draft',
  camlo_name TEXT,
  action_taken TEXT,
  grounds_for_suspicion TEXT,
  filed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Junction table linking transactions to STR reports
CREATE TABLE public.str_report_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.str_reports(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES public.suite_transactions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (report_id, transaction_id)
);

-- Validation trigger for filing_status
CREATE OR REPLACE FUNCTION public.validate_filing_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.filing_status NOT IN ('draft', 'filed', 'amended') THEN
    RAISE EXCEPTION 'Invalid filing_status: %', NEW.filing_status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_str_filing_status
  BEFORE INSERT OR UPDATE ON public.str_reports
  FOR EACH ROW EXECUTE FUNCTION public.validate_filing_status();

-- Updated_at trigger
CREATE TRIGGER update_str_reports_updated_at
  BEFORE UPDATE ON public.str_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for str_reports
ALTER TABLE public.str_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own str reports"
  ON public.str_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own str reports"
  ON public.str_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own str reports"
  ON public.str_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS for str_report_transactions
ALTER TABLE public.str_report_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own report transactions"
  ON public.str_report_transactions FOR SELECT
  USING (report_id IN (SELECT id FROM public.str_reports WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own report transactions"
  ON public.str_report_transactions FOR INSERT
  WITH CHECK (report_id IN (SELECT id FROM public.str_reports WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own report transactions"
  ON public.str_report_transactions FOR DELETE
  USING (report_id IN (SELECT id FROM public.str_reports WHERE user_id = auth.uid()));
