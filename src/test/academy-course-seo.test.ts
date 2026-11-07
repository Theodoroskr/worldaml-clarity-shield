import { describe, it, expect } from "vitest";
import { ACADEMY_COURSE_SEO } from "@/data/academyCourseSeo";
import { ACADEMY_PRICING, FREE_ACADEMY_COURSES } from "@/data/academyPricing";

// The SEO component appends " | WorldAML" (11 chars); Google shows ~60.
const TITLE_MAX = 49;
const DESCRIPTION_MAX = 158;

describe("Academy course search snippets", () => {
  it("has a snippet for every free and priced course", () => {
    const required = [...FREE_ACADEMY_COURSES, ...Object.keys(ACADEMY_PRICING)];
    const missing = required.filter((slug) => !ACADEMY_COURSE_SEO[slug]);
    expect(missing).toEqual([]);
  });

  it("keeps every title inside Google's title window", () => {
    const tooLong = Object.entries(ACADEMY_COURSE_SEO)
      .filter(([, s]) => s.title.length > TITLE_MAX)
      .map(([slug, s]) => `${slug} (${s.title.length})`);
    expect(tooLong).toEqual([]);
  });

  it("keeps every description inside Google's snippet window", () => {
    const tooLong = Object.entries(ACADEMY_COURSE_SEO)
      .filter(([, s]) => s.description.length > DESCRIPTION_MAX)
      .map(([slug, s]) => `${slug} (${s.description.length})`);
    expect(tooLong).toEqual([]);
  });

  it("says 'free' in the title of each free course", () => {
    for (const slug of FREE_ACADEMY_COURSES) {
      expect(ACADEMY_COURSE_SEO[slug].title.toLowerCase()).toContain("free");
    }
  });
});
