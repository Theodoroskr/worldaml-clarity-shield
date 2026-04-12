ALTER TABLE public.suite_transactions
  ADD COLUMN method_of_transaction text,
  ADD COLUMN source_of_funds text,
  ADD COLUMN conductor_name text,
  ADD COLUMN third_party_indicator text DEFAULT 'own_behalf',
  ADD COLUMN disposition text,
  ADD COLUMN beneficiary_name text;