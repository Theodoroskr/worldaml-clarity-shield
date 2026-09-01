import { describe, it, expect, vi } from "vitest";
import { resolveStripeCustomer } from "./customer";

const deps = (o: Partial<Parameters<typeof resolveStripeCustomer>[0]> = {}) => ({
  storedCustomerId: null,
  verifyCustomer: vi.fn(async () => true),
  findCustomerByEmail: vi.fn(async () => null),
  persistCustomerId: vi.fn(async () => {}),
  ...o,
});

describe("resolveStripeCustomer", () => {
  it("uses the stored customer id without an email lookup", async () => {
    const d = deps({ storedCustomerId: "cus_stored" });
    const r = await resolveStripeCustomer(d);
    expect(r).toEqual({ customerId: "cus_stored", source: "stored" });
    expect(d.findCustomerByEmail).not.toHaveBeenCalled();
  });

  it("falls back to email when the stored id no longer exists", async () => {
    const d = deps({
      storedCustomerId: "cus_dead",
      verifyCustomer: vi.fn(async () => false),
      findCustomerByEmail: vi.fn(async () => "cus_live"),
    });
    const r = await resolveStripeCustomer(d);
    expect(r).toEqual({ customerId: "cus_live", source: "email" });
    expect(d.persistCustomerId).toHaveBeenCalledWith("cus_live");
  });

  it("persists the id found by email", async () => {
    const d = deps({ findCustomerByEmail: vi.fn(async () => "cus_new") });
    await resolveStripeCustomer(d);
    expect(d.persistCustomerId).toHaveBeenCalledWith("cus_new");
  });

  it("returns none when no customer exists", async () => {
    const d = deps();
    expect(await resolveStripeCustomer(d)).toEqual({ customerId: null, source: "none" });
    expect(d.persistCustomerId).not.toHaveBeenCalled();
  });

  it("survives a verification error and a persistence error", async () => {
    const d = deps({
      storedCustomerId: "cus_x",
      verifyCustomer: vi.fn(async () => { throw new Error("stripe down"); }),
      findCustomerByEmail: vi.fn(async () => "cus_y"),
      persistCustomerId: vi.fn(async () => { throw new Error("db down"); }),
    });
    const r = await resolveStripeCustomer(d);
    expect(r).toEqual({ customerId: "cus_y", source: "email" });
  });
});
