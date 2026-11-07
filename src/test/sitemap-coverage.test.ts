import { describe, it, expect } from "vitest";
import path from "path";
import { generateSitemap } from "../../plugins/generate-sitemap";
import { PRERENDERED_PATHS, RETIRED_PATHS } from "../../plugins/seo-prerender";

const root = path.resolve(__dirname, "../..");
const paths = [...generateSitemap(root).matchAll(/<loc>https:\/\/worldaml\.com([^<]*)<\/loc>/g)].map((m) => m[1]);

describe("published sitemap", () => {
  it("lists the AML compliance software guide and the paid KYC course", () => {
    expect(paths).toContain("/aml-compliance-software");
    expect(paths).toContain("/academy/kyc-customer-due-diligence");
    expect(paths).toContain("/academy/aml-fundamentals");
  });

  it("leaves out addresses that redirect elsewhere", () => {
    const retired = new Set(RETIRED_PATHS());
    expect(paths.filter((p) => retired.has(p))).toEqual([]);
    expect(paths.some((p) => p.startsWith("/data-coverage"))).toBe(false);
    expect(paths.some((p) => p.startsWith("/data-sources"))).toBe(false);
  });

  it("leaves out sign-in and sign-up pages", () => {
    expect(paths).not.toContain("/login");
    expect(paths).not.toContain("/signup");
  });

  it("gives every listed page its own build-time title", () => {
    const prerendered = new Set(PRERENDERED_PATHS());
    const withoutOwnHead = paths.filter((p) => !prerendered.has(p));
    expect(withoutOwnHead).toEqual([]);
  });

  it("has no duplicate entries", () => {
    expect(new Set(paths).size).toBe(paths.length);
  });
});
