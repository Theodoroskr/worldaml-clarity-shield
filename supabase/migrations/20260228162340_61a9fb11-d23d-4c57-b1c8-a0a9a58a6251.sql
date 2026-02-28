
CREATE TABLE public.sanctions_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid,
  query_name text NOT NULL,
  query_country text,
  query_type text DEFAULT 'individual',
  results_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sanctions_searches ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous + authenticated)
CREATE POLICY "Anyone can log a search"
ON public.sanctions_searches
FOR INSERT
WITH CHECK (true);

-- Authenticated users can view their own searches
CREATE POLICY "Users can view own searches"
ON public.sanctions_searches
FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Admins can view all searches
CREATE POLICY "Admins can view all searches"
ON public.sanctions_searches
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
