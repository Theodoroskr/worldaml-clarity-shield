ALTER TABLE public.str_reports
ADD COLUMN IF NOT EXISTS fwr_payload JSONB;

COMMENT ON COLUMN public.str_reports.fwr_payload IS 'FINTRAC FWR-ready structured payload snapshot (schema v1.0). Used for electronic submission via FINTRAC API and as a machine-readable companion to the PDF export.';