CREATE TABLE public.news_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_summary TEXT,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  trust_tier TEXT NOT NULL DEFAULT 'A',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news_updates TO anon;
GRANT SELECT ON public.news_updates TO authenticated;
GRANT ALL ON public.news_updates TO service_role;

ALTER TABLE public.news_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News updates are publicly readable"
ON public.news_updates FOR SELECT
USING (true);

CREATE INDEX news_updates_category_published_idx
ON public.news_updates (category, published_at DESC);