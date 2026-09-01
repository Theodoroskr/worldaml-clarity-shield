/**
 * The business portal is a *view layer* over the platform's real entitlement
 * tables (`product_access` + `screening_subscriptions`). It no longer keeps its
 * own parallel copy of what a company owns.
 */

export interface ProductAccessRow {
  id: string;
  organisation_id: string;
  product: string;
  plan: string | null;
  status: string | null;
  seats: number | null;
  seats_used: number | null;
  started_at: string | null;
  current_period_end: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ScreeningSubscriptionRow {
  id: string;
  organisation_id: string;
  plan: string | null;
  status: string | null;
  monitor_quota: number | null;
  search_quota_annual: number | null;
  seat_quota: number | null;
  current_period_end: string | null;
  created_at?: string | null;
}

export interface ProductMemberRow {
  id: string;
  organisation_id: string;
  product: string;
  role?: string | null;
  created_at?: string | null;
}

export interface BusinessEntitlement {
  id: string;
  business_account_id: string;
  product_key: string;
  plan: string | null;
  status: string;
  activated_at: string | null;
  renews_at: string | null;
  usage_used: number | null;
  usage_limit: number | null;
  usage_unit: string | null;
  seats: number | null;
  setup_complete: boolean;
}

/** `product_access.product` → business catalogue solution key. */
export const PRODUCT_TO_SOLUTION_KEY: Record<string, string> = {
  screening: "worldaml",
  suite: "suite",
  academy: "academy",
  worldid: "worldid",
};

const ACTIVE_STATUSES = new Set(["active", "trial", "trialing"]);

/** Normalises platform statuses onto the portal's vocabulary. */
export function normaliseStatus(status: string | null | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "trial") return "trialing";
  return s || "inactive";
}

export function isActiveStatus(status: string | null | undefined): boolean {
  return ACTIVE_STATUSES.has((status ?? "").toLowerCase());
}

/**
 * Builds the portal's product list from the real entitlement rows.
 * `screening_subscriptions` only enriches the screening row (quotas); it never
 * creates a duplicate entry when `product_access` already covers screening.
 */
export function mapEntitlements(
  businessAccountId: string | null,
  access: ProductAccessRow[],
  screening: ScreeningSubscriptionRow[] = [],
  members: ProductMemberRow[] = [],
): BusinessEntitlement[] {
  const accountId = businessAccountId ?? "";
  const sub = screening.find((s) => isActiveStatus(s.status)) ?? screening[0] ?? null;
  // The Compliance Suite is not yet commercially available in the portal.
  const visibleAccess = access.filter((a) => a.product !== "suite");

  const rows: BusinessEntitlement[] = visibleAccess.map((a) => {
    const productKey = PRODUCT_TO_SOLUTION_KEY[a.product] ?? a.product;
    const isScreening = a.product === "screening";
    const seats = a.seats ?? (isScreening ? sub?.seat_quota ?? null : null);
    return {
      id: a.id,
      business_account_id: accountId,
      product_key: productKey,
      plan: a.plan ?? (isScreening ? sub?.plan ?? null : null),
      status: normaliseStatus(a.status),
      activated_at: a.started_at ?? null,
      renews_at: a.current_period_end ?? (isScreening ? sub?.current_period_end ?? null : null),
      usage_used: a.seats_used ?? null,
      usage_limit: seats,
      usage_unit: seats != null ? "seats" : null,
      seats,
      setup_complete: isActiveStatus(a.status),
    };
  });

  // A screening subscription with no matching product_access row still counts.
  if (sub && !visibleAccess.some((a) => a.product === "screening")) {
    rows.push({
      id: sub.id,
      business_account_id: accountId,
      product_key: "worldaml",
      plan: sub.plan ?? null,
      status: normaliseStatus(sub.status),
      activated_at: sub.created_at ?? null,
      renews_at: sub.current_period_end ?? null,
      usage_used: null,
      usage_limit: sub.seat_quota ?? null,
      usage_unit: sub.seat_quota != null ? "seats" : null,
      seats: sub.seat_quota ?? null,
      setup_complete: isActiveStatus(sub.status),
    });
  }

  // Membership of a product (product_members) is also real access — this is how
  // Screening is actually provisioned today.
  for (const m of members) {
    if (m.product === "suite") continue;
    const productKey = PRODUCT_TO_SOLUTION_KEY[m.product] ?? m.product;
    if (rows.some((r) => r.product_key === productKey)) continue;
    rows.push({
      id: m.id,
      business_account_id: accountId,
      product_key: productKey,
      plan: m.product === "screening" ? sub?.plan ?? null : null,
      status: "active",
      activated_at: m.created_at ?? null,
      renews_at: m.product === "screening" ? sub?.current_period_end ?? null : null,
      usage_used: null,
      usage_limit: null,
      usage_unit: null,
      seats: null,
      setup_complete: true,
    });
  }

  return rows;
}
