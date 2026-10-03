import { supabase } from "@/integrations/supabase/client";

export type PiiTable = "screening_subjects" | "suite_customers" | "suite_ubo" | "suite_onboarding_submissions";

export interface RevealedPii {
  date_of_birth?: string | null;
  identification_number?: string | null;
  dob?: string | null;
  /** Sensitive form answers keyed by field path, e.g. "passport_number" or "ubos.0.date_of_birth". */
  extra?: Record<string, string>;
}

/**
 * Decrypts the sensitive fields of one record. Only Suite admins of the owning
 * company (or members granted "view sensitive data") succeed; every call is logged.
 */
export async function revealPii(table: PiiTable, id: string, purpose: string): Promise<RevealedPii> {
  const { data, error } = await supabase.rpc("suite_reveal_pii" as never, {
    _table: table,
    _id: id,
    _purpose: purpose,
  } as never);
  if (error) {
    if (/not_permitted/.test(error.message)) {
      throw new Error("You don't have permission to view sensitive details. Ask your Suite admin.");
    }
    throw new Error(error.message);
  }
  return (data ?? {}) as RevealedPii;
}

/** Returns the customer with its real date of birth filled in for regulator exports. */
export async function withRevealedCustomer<T extends { id?: string } | null>(customer: T, purpose: string): Promise<T> {
  if (!customer?.id) return customer;
  try {
    const pii = await revealPii("suite_customers", customer.id, purpose);
    return { ...customer, date_of_birth: pii.date_of_birth ?? null };
  } catch {
    return customer;
  }
}
