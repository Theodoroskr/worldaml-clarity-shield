
CREATE TABLE public.rss_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  site_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  last_fetch_status TEXT,
  last_fetch_error TEXT,
  item_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, feed_url)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rss_feeds TO authenticated;
GRANT ALL ON public.rss_feeds TO service_role;

ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own feeds"
  ON public.rss_feeds FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER rss_feeds_updated_at
  BEFORE UPDATE ON public.rss_feeds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.rss_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID NOT NULL REFERENCES public.rss_feeds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guid TEXT NOT NULL,
  title TEXT,
  link TEXT,
  summary TEXT,
  content TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (feed_id, guid)
);

CREATE INDEX rss_items_feed_published_idx
  ON public.rss_items (feed_id, published_at DESC NULLS LAST);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rss_items TO authenticated;
GRANT ALL ON public.rss_items TO service_role;

ALTER TABLE public.rss_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own rss items"
  ON public.rss_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
