
-- Create form_submissions table
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL, -- 'free-trial', 'demo', 'contact-sales', 'get-started'
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  country TEXT,
  industry TEXT,
  message TEXT,
  products TEXT[], -- for contact-sales multi-select
  account_type TEXT, -- for get-started
  region TEXT, -- for free-trial region
  metadata JSONB DEFAULT '{}'::jsonb, -- extra flexible data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public forms, no auth required)
CREATE POLICY "Anyone can submit forms"
  ON public.form_submissions
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins should read (we'll use edge function for now)
-- No SELECT policy = no public reads
