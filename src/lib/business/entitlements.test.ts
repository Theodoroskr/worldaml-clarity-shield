import { describe, it, expect } from "vitest";
import { mapEntitlements, normaliseStatus, isActiveStatus, PRODUCT_TO_SOLUTION_KEY } from "./entitlements";
import type { ProductAccessRow, ScreeningSubscriptionRow } from "./entitlements";

const access = (o: Partial<ProductAccessRow> = {}): ProductAccessRow => ({
  id: "pa-1",
  organisation_id: "org-1",
  product: "screening",
  plan: "demo",
  status: "active",
  seats: 1,
  seats_used: 1,
  started_at: "2026-01-01T00:00:00Z",
  current_period_end: "2027-01-01T00:00:00Z",
  metadata: null,
  ...o,
});

const sub = (o: Partial<ScreeningSubscriptionRow> = {}): ScreeningSubscriptionRow => ({
  id: "sub-1",
  organisation_id: "org-1",
  plan: "demo",
  status: "active",
  monitor_quota: 0,
  search_quota_annual: 5,
  seat_quota: 1,
  current_period_end: "2027-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  ...o,
});

describe("mapEntitlements", () => {
  it("returns nothing when the account has no products", () => {
    expect(mapEntitlements("ba-1", [], [])).toEqual([]);
  });

  it("maps a screening product_access row onto the worldaml solution key", () => {
    const [e] = mapEntitlements("ba-1", [access()], [sub()]);
    expect(e.product_key).toBe("worldaml");
    expect(e.business_account_id).toBe("ba-1");
    expect(e.plan).toBe("demo");
    expect(e.status).toBe("active");
    expect(e.setup_complete).toBe(true);
    expect(e.renews_at).toBe("2027-01-01T00:00:00Z");
    expect(e.usage_used).toBe(1);
    expect(e.usage_limit).toBe(1);
    expect(e.usage_unit).toBe("seats");
  });

  it("does not duplicate screening when both tables have a row", () => {
    const rows = mapEntitlements("ba-1", [access()], [sub()]);
    expect(rows).toHaveLength(1);
  });

  it("falls back to the screening subscription when product_access is missing", () => {
    const rows = mapEntitlements("ba-1", [], [sub({ plan: "growth", seat_quota: 3 })]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ product_key: "worldaml", plan: "growth", seats: 3, id: "sub-1" });
  });

  it("maps worldid and academy access", () => {
    const rows = mapEntitlements("ba-1", [
      access({ id: "pa-2", product: "worldid", plan: "pro" }),
      access({ id: "pa-3", product: "academy", plan: "team" }),
    ], []);
    expect(rows.map((r) => r.product_key)).toEqual(["worldid", "academy"]);
  });

  it("treats trial as active and inactive plans as not set up", () => {
    const rows = mapEntitlements("ba-1", [
      access({ id: "pa-4", product: "worldid", status: "trial" }),
      access({ id: "pa-5", product: "academy", status: "cancelled" }),
    ], []);
    expect(rows[0].status).toBe("trialing");
    expect(rows[0].setup_complete).toBe(true);
    expect(rows[1].setup_complete).toBe(false);
  });

  it("prefers an active screening subscription for enrichment", () => {
    const rows = mapEntitlements("ba-1", [], [
      sub({ id: "old", status: "cancelled", plan: "demo" }),
      sub({ id: "live", status: "active", plan: "scale" }),
    ]);
    expect(rows[0].id).toBe("live");
  });

  it("tolerates a missing business account id", () => {
    const [e] = mapEntitlements(null, [access()], []);
    expect(e.business_account_id).toBe("");
  });

  it("passes unknown products through unchanged", () => {
    const [e] = mapEntitlements("ba-1", [access({ product: "something_new" })], []);
    expect(e.product_key).toBe("something_new");
  });
});

describe("status helpers", () => {
  it("normalises", () => {
    expect(normaliseStatus("trial")).toBe("trialing");
    expect(normaliseStatus(null)).toBe("inactive");
    expect(normaliseStatus("ACTIVE")).toBe("active");
  });
  it("detects active statuses", () => {
    expect(isActiveStatus("active")).toBe(true);
    expect(isActiveStatus("trialing")).toBe(true);
    expect(isActiveStatus("cancelled")).toBe(false);
    expect(isActiveStatus(null)).toBe(false);
  });
  it("keeps the product key map stable", () => {
    expect(PRODUCT_TO_SOLUTION_KEY.screening).toBe("worldaml");
  });
});

const member = (o: Partial<import("./entitlements").ProductMemberRow> = {}) => ({
  id: "pm-1",
  organisation_id: "org-1",
  product: "screening",
  role: "admin",
  created_at: "2026-01-01T00:00:00Z",
  ...o,
});

describe("product_members as an entitlement source", () => {
  it("surfaces screening from membership alone", () => {
    const rows = mapEntitlements("ba-1", [], [], [member()]);
    expect(rows).toHaveLength(1);
    expect(rows[0].product_key).toBe("worldaml");
    expect(rows[0].status).toBe("active");
    expect(rows[0].setup_complete).toBe(true);
  });

  it("does not duplicate screening when product_access already covers it", () => {
    const rows = mapEntitlements("ba-1", [access()], [sub()], [member()]);
    expect(rows.filter((r) => r.product_key === "worldaml")).toHaveLength(1);
  });

  it("does not duplicate screening when only a subscription exists", () => {
    const rows = mapEntitlements("ba-1", [], [sub()], [member()]);
    expect(rows.filter((r) => r.product_key === "worldaml")).toHaveLength(1);
  });

  it("enriches a membership-only screening row from the subscription", () => {
    const rows = mapEntitlements("ba-1", [], [], [member()]);
    expect(rows[0].plan).toBeNull();
  });

  it("hides suite entirely", () => {
    const rows = mapEntitlements(
      "ba-1",
      [access({ id: "pa-suite", product: "suite", plan: "suite" })],
      [],
      [member({ id: "pm-suite", product: "suite" })],
    );
    expect(rows).toHaveLength(0);
  });
});
