// Shared partner referral-code resolution + attribution.
// Used by public forms (submit-form) and Academy checkout so a code entered by
// a prospect is attributed to the partner AND visible to admins.

// deno-lint-ignore-file no-explicit-any

export interface ResolvedPartner {
  partner_id: string;
  referral_code: string;
  display_name: string | null;
}

export function normaliseCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (code.length < 4 || code.length > 40) return null;
  return code;
}

/** Look up an active partner by referral code. Returns null when invalid. */
export async function resolvePartnerByCode(
  serviceClient: any,
  rawCode: unknown,
): Promise<ResolvedPartner | null> {
  const code = normaliseCode(rawCode);
  if (!code) return null;
  const { data, error } = await serviceClient
    .from("partners")
    .select("id, display_name, referral_code, is_active")
    .eq("referral_code", code)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return {
    partner_id: data.id,
    referral_code: data.referral_code,
    display_name: data.display_name ?? null,
  };
}

/**
 * Record a referral against a partner. Idempotent per (code, email, source):
 * an existing row is left untouched so repeat submissions do not duplicate.
 */
export async function recordReferral(
  serviceClient: any,
  params: {
    partner: ResolvedPartner;
    email?: string | null;
    source: string;
    status?: "clicked" | "signed_up" | "converted";
  },
): Promise<string | null> {
  const email = params.email?.trim().toLowerCase() || null;
  try {
    if (email) {
      const { data: existing } = await serviceClient
        .from("referrals")
        .select("id")
        .eq("partner_id", params.partner.partner_id)
        .eq("referred_email", email)
        .eq("source", params.source)
        .maybeSingle();
      if (existing?.id) return existing.id;
    }
    const { data, error } = await serviceClient
      .from("referrals")
      .insert({
        partner_id: params.partner.partner_id,
        referral_code_used: params.partner.referral_code,
        referred_email: email,
        status: params.status ?? "signed_up",
        source: params.source,
      })
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("recordReferral failed:", error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error("recordReferral threw:", (err as any)?.message ?? err);
    return null;
  }
}
