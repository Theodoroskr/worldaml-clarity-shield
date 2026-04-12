
CREATE TABLE public.periodic_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  report_title TEXT NOT NULL,
  regulator TEXT NOT NULL,
  period_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::integer,
  filing_status TEXT NOT NULL DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  filed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_type, regulator, period_year)
);

ALTER TABLE public.periodic_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own periodic reports"
ON public.periodic_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own periodic reports"
ON public.periodic_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own periodic reports"
ON public.periodic_reports FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own periodic reports"
ON public.periodic_reports FOR DELETE
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.validate_periodic_report_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.filing_status NOT IN ('draft', 'completed', 'filed') THEN
    RAISE EXCEPTION 'Invalid filing_status: %', NEW.filing_status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_periodic_report_status_trigger
BEFORE INSERT OR UPDATE ON public.periodic_reports
FOR EACH ROW EXECUTE FUNCTION public.validate_periodic_report_status();

CREATE TRIGGER update_periodic_reports_updated_at
BEFORE UPDATE ON public.periodic_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
