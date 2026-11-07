import { describe, it, expect } from "vitest";
import { SANCTIONS_CHECK_SEO, SANCTIONS_LISTS_SEO } from "@/data/searchSnippets";

const SUFFIX = " | WorldAML";
const TITLE_WINDOW = 61;
const DESCRIPTION_WINDOW = 158;

describe("sanctions lists page snippet", () => {
  it("fits Google's title and description windows", () => {
    expect(`${SANCTIONS_LISTS_SEO.title}${SUFFIX}`.length).toBeLessThanOrEqual(TITLE_WINDOW);
    expect(SANCTIONS_LISTS_SEO.description.length).toBeLessThanOrEqual(DESCRIPTION_WINDOW);
  });

  it("leads with sanctions lists and names OFAC, EU, UN and UK in the title", () => {
    const t = SANCTIONS_LISTS_SEO.title.toLowerCase();
    expect(t.startsWith("global sanctions lists")).toBe(true);
    for (const list of ["ofac", "eu", "un", "uk"]) expect(t).toContain(list);
  });
});

describe("free sanctions check snippet", () => {
  it("fits Google's title and description windows", () => {
    expect(`${SANCTIONS_CHECK_SEO.title}${SUFFIX}`.length).toBeLessThanOrEqual(TITLE_WINDOW);
    expect(SANCTIONS_CHECK_SEO.description.length).toBeLessThanOrEqual(DESCRIPTION_WINDOW);
  });

  it("starts with 'free sanctions check' and mentions OFAC", () => {
    const t = SANCTIONS_CHECK_SEO.title.toLowerCase();
    expect(t.startsWith("free sanctions check")).toBe(true);
    expect(t).toContain("ofac");
  });

  it("does not promise the paid platform's 1,900+ lists for the free tool", () => {
    expect(SANCTIONS_CHECK_SEO.description).not.toMatch(/1,?900/);
    expect(SANCTIONS_CHECK_SEO.title).not.toMatch(/1,?900/);
  });
});
