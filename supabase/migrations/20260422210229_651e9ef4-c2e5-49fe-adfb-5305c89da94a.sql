-- Add expiry column for 1-month access window
ALTER TABLE public.academy_course_purchases
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Drop the unique paid index so users can repurchase after expiry
DROP INDEX IF EXISTS public.idx_acp_user_slug_paid;

-- Replace with a non-unique index for fast lookup of paid purchases
CREATE INDEX IF NOT EXISTS idx_acp_user_slug_paid
  ON public.academy_course_purchases (user_id, course_slug)
  WHERE status = 'paid';

-- Index for filtering active (non-expired) purchases
CREATE INDEX IF NOT EXISTS idx_acp_active
  ON public.academy_course_purchases (user_id, course_slug, expires_at)
  WHERE status = 'paid';