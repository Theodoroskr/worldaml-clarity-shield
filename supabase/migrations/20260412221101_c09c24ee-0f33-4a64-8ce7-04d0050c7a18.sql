ALTER TABLE public.suite_alert_rules
  ADD COLUMN IF NOT EXISTS source_regulator text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_citation text DEFAULT NULL;