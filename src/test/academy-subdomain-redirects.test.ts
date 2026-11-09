import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";
import { generateSitemap } from "../../plugins/generate-sitemap";
import { RETIRED_PATHS } from "../../plugins/seo-prerender";
import { PUBLIC_ACADEMY_COURSE_SLUGS } from "../data/academyCourseSeo";

const root = path.resolve(__dirname, "../..");

// academy.worldaml.com is redirected by hosting to worldaml.com with the path
// kept, so old subdomain links arrive at worldaml.com/<course>.
describe("old academy.worldaml.com addresses", () => {
  it("send every course's old subdomain path to its /academy page", () => {
    const retired = new Set(RETIRED_PATHS());
    const missing = PUBLIC_ACADEMY_COURSE_SLUGS.filter((slug) => !retired.has(`/${slug}`));
    expect(missing).toEqual([]);
    expect(retired.has("/templates")).toBe(true);
  });

  it("are never listed for Google", () => {
    expect(generateSitemap(root)).not.toContain("academy.worldaml.com");
    const robots = fs.readFileSync(path.join(root, "public/robots.txt"), "utf-8");
    expect(robots).not.toContain("sitemap-academy");
  });
});
