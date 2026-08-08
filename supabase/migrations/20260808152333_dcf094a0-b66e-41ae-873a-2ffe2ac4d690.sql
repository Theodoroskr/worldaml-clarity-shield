CREATE TABLE public.academy_basket_snapshots (
  user_id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  items TEXT[] NOT NULL DEFAULT '{}',
  currency TEXT NOT NULL DEFAULT 'eur',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reminder_3d_sent_at TIMESTAMPTZ,
  reminder_30d_sent_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_basket_snapshots TO authenticated;
GRANT ALL ON public.academy_basket_snapshots TO service_role;

ALTER TABLE public.academy_basket_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own basket snapshot"
ON public.academy_basket_snapshots FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_basket_snapshots_updated_at ON public.academy_basket_snapshots (updated_at);