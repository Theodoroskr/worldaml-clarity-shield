create table public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_account_id uuid not null references public.business_accounts(id) on delete cascade,
  organisation_id uuid references public.suite_organizations(id) on delete set null,
  product public.product_key not null,
  plan_code text not null,
  seats integer not null default 1 check (seats > 0),
  amount_cents integer,
  currency text not null default 'EUR',
  interval text not null default 'month' check (interval in ('month','year','one_time')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'active' check (status in ('trialing','active','past_due','canceled','paused','incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  source text not null default 'self_serve' check (source in ('self_serve','quote','manual')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index business_subscriptions_org_product_uq on public.business_subscriptions (organisation_id, product) where status in ('trialing','active','past_due','paused');
grant select on public.business_subscriptions to authenticated;
grant all on public.business_subscriptions to service_role;
alter table public.business_subscriptions enable row level security;
create policy "Members view own account subscriptions" on public.business_subscriptions for select to authenticated using (
  exists (select 1 from public.business_members bm where bm.business_account_id = business_subscriptions.business_account_id and bm.user_id = auth.uid())
  or public.has_role(auth.uid(), 'admin')
);
create policy "Admins manage subscriptions" on public.business_subscriptions for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.business_invoices (
  id uuid primary key default gen_random_uuid(),
  business_account_id uuid not null references public.business_accounts(id) on delete cascade,
  organisation_id uuid references public.suite_organizations(id) on delete set null,
  business_subscription_id uuid references public.business_subscriptions(id) on delete set null,
  stripe_invoice_id text not null unique,
  number text,
  status text not null default 'open',
  amount_due_cents integer not null default 0,
  amount_paid_cents integer not null default 0,
  currency text not null default 'EUR',
  hosted_invoice_url text,
  invoice_pdf_url text,
  period_start timestamptz,
  period_end timestamptz,
  paid_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.business_invoices to authenticated;
grant all on public.business_invoices to service_role;
alter table public.business_invoices enable row level security;
create policy "Members view own account invoices" on public.business_invoices for select to authenticated using (
  exists (select 1 from public.business_members bm where bm.business_account_id = business_invoices.business_account_id and bm.user_id = auth.uid())
  or public.has_role(auth.uid(), 'admin')
);
create policy "Admins manage invoices" on public.business_invoices for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  payload jsonb not null default '{}',
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant all on public.stripe_webhook_events to service_role;
alter table public.stripe_webhook_events enable row level security;

create or replace function public.set_business_billing_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end
$$ language plpgsql set search_path = public;
create trigger trg_business_subscriptions_updated before update on public.business_subscriptions for each row execute function public.set_business_billing_updated_at();
create trigger trg_business_invoices_updated before update on public.business_invoices for each row execute function public.set_business_billing_updated_at();

drop table if exists public.business_entitlements;