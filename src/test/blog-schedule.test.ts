import { describe, it, expect } from "vitest";
import path from "path";
import { blogPosts, getPublishedPosts, isPostPublished } from "@/data/blogPosts";
import { applyReleaseSchedule, extractPosts } from "../../plugins/generate-rss";
import { generateSitemap } from "../../plugins/generate-sitemap";

const NEW_BATCH = blogPosts.filter((p) => p.date >= "2026-11-12");

describe("twice-weekly article schedule", () => {
  it("has the 24-article batch released on Tuesdays and Fridays", () => {
    expect(NEW_BATCH).toHaveLength(24);
    for (const p of NEW_BATCH) {
      const day = new Date(`${p.date}T00:00:00Z`).getUTCDay();
      expect([2, 5]).toContain(day); // Tue = 2, Fri = 5
    }
  });

  it("releases a post on its date, not before", () => {
    const post = { date: "2026-11-13" };
    expect(isPostPublished(post, new Date("2026-11-12T23:59:00Z"))).toBe(false);
    expect(isPostPublished(post, new Date("2026-11-13T00:00:00Z"))).toBe(true);
  });

  it("keeps unreleased posts out of the blog list and the feed", () => {
    const before = new Date("2026-11-12T12:00:00Z");
    const slugs = getPublishedPosts(before).map((p) => p.slug);
    expect(slugs).not.toContain("how-to-choose-aml-screening-provider");
    const feed = applyReleaseSchedule("", extractPosts(), before).map((p) => p.slug);
    expect(feed).not.toContain("how-to-choose-aml-screening-provider");
    expect(feed).toHaveLength(blogPosts.length - 24);

    const after = new Date("2026-11-17T09:00:00Z");
    const feedLater = applyReleaseSchedule("", extractPosts(), after).map((p) => p.slug);
    expect(feedLater.slice(0, 2)).toEqual(["eu-aml-package-amla-2027-guide", "how-to-choose-aml-screening-provider"]);
  });

  it("lists only released articles in the Google page list", () => {
    const xml = generateSitemap(path.resolve(__dirname, "../.."));
    const released = getPublishedPosts();
    for (const p of blogPosts) {
      const listed = xml.includes(`/blog/${p.slug}</loc>`);
      expect(listed).toBe(released.includes(p));
    }
  });
});
