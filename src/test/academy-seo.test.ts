import { describe, it, expect } from "vitest";
import { ACADEMY_SEO } from "@/data/academySeo";

/** The SEO component appends the site name; the Academy subdomain's is longer. */
const BRAND_SUFFIXES = [" | WorldAML", " | WorldAML Academy"];

/** Google's practical display window — text past this is cut from the result. */
const TITLE_WINDOW = 55;
const DESCRIPTION_WINDOW = 155;

const visibleTitle = (suffix: string) => `${ACADEMY_SEO.title}${suffix}`.slice(0, TITLE_WINDOW).toLowerCase();

describe("Academy search snippet", () => {
  it("shows free AML certification inside the visible title window on both hosts", () => {
    for (const suffix of BRAND_SUFFIXES) {
      const shown = visibleTitle(suffix);
      expect(shown).toContain("free");
      expect(shown).toContain("aml certification");
      expect(shown).toContain("online");
    }
  });

  it("shows the CPD certificate trust signal inside the visible title window", () => {
    for (const suffix of BRAND_SUFFIXES) {
      const shown = visibleTitle(suffix);
      expect(shown).toContain("cpd");
      expect(shown).toContain("certificate");
    }
  });

  it("keeps the description short enough not to be truncated", () => {
    expect(ACADEMY_SEO.description.length).toBeLessThanOrEqual(DESCRIPTION_WINDOW + 3);
  });

  it("keeps the free / verifiable / CPD signals inside the visible description window", () => {
    const shown = ACADEMY_SEO.description.slice(0, DESCRIPTION_WINDOW).toLowerCase();
    expect(shown).toContain("free aml certification");
    expect(shown).toContain("cpd-accredited");
    expect(shown).toContain("verifiable certificate");
  });
});
