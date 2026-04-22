-- Add Stripe + pricing columns to academy_courses
ALTER TABLE public.academy_courses
  ADD COLUMN IF NOT EXISTS stripe_product_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS price_eur_cents integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_academy_courses_stripe_price ON public.academy_courses(stripe_price_id);
