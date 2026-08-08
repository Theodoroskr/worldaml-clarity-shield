CREATE TABLE IF NOT EXISTS public.product_purchase_notifications (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  product text not null,
  plan text,
  customer_email text,
  customer_name text,
  amount_cents integer,
  currency text,
  mode text,
  emails_sent_at timestamptz,
  email_error text,
  created_at timestamptz not null default now()
);

GRANT ALL ON public.product_purchase_notifications TO service_role;
GRANT SELECT ON public.product_purchase_notifications TO authenticated;

ALTER TABLE public.product_purchase_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view product purchase notifications" ON public.product_purchase_notifications;
CREATE POLICY "Admins can view product purchase notifications"
ON public.product_purchase_notifications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));