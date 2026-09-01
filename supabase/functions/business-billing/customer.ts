/**
 * Resolves the Stripe customer for a business account.
 *
 * Order: the stored `business_accounts.stripe_customer_id` first, then a
 * one-off lookup by email. When the email lookup wins, the id is written back
 * so the next call is exact.
 */
export interface CustomerResolverDeps {
  /** Stored id on the caller's business account, if any. */
  storedCustomerId: string | null;
  /** Confirms a stored id still exists in Stripe. */
  verifyCustomer: (id: string) => Promise<boolean>;
  /** Email fallback lookup. */
  findCustomerByEmail: () => Promise<string | null>;
  /** Persists a newly resolved id back onto the business account. */
  persistCustomerId: (id: string) => Promise<void>;
}

export interface CustomerResolution {
  customerId: string | null;
  source: "stored" | "email" | "none";
}

export async function resolveStripeCustomer(deps: CustomerResolverDeps): Promise<CustomerResolution> {
  if (deps.storedCustomerId) {
    let ok = false;
    try {
      ok = await deps.verifyCustomer(deps.storedCustomerId);
    } catch {
      ok = false;
    }
    if (ok) return { customerId: deps.storedCustomerId, source: "stored" };
  }

  const byEmail = await deps.findCustomerByEmail();
  if (!byEmail) return { customerId: null, source: "none" };

  if (byEmail !== deps.storedCustomerId) {
    try {
      await deps.persistCustomerId(byEmail);
    } catch {
      /* persisting is an optimisation, never a hard failure */
    }
  }
  return { customerId: byEmail, source: "email" };
}
