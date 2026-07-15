ALTER TABLE public.deal_registrations
  ADD COLUMN IF NOT EXISTS linked_customer_id uuid REFERENCES public.suite_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS actual_arr_eur integer,
  ADD COLUMN IF NOT EXISTS won_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS deal_registrations_linked_customer_idx
  ON public.deal_registrations(linked_customer_id);