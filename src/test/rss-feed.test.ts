import { describe, it, expect } from "vitest";
import { extractPosts, buildRssXml } from "../../plugins/generate-rss";
import { blogPosts } from "@/data/blogPosts";

describe("RSS feed", () => {
  it("includes every blog post", () => {
    expect(extractPosts()).toHaveLength(blogPosts.length);
  });

  it("carries the full article text for each post, not just the summary", () => {
    const xml = buildRssXml(extractPosts().reverse());
    const encoded = xml.match(/<content:encoded>/g) ?? [];
    expect(encoded).toHaveLength(blogPosts.length);
    const post = blogPosts[0];
    const lastPara = [...post.content].reverse().find((s) => s.type === "p" && s.text)!;
    const plain = xml.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    expect(plain).toContain(lastPara.text!);
  });

  it("attaches the hero image to items that have one", () => {
    const xml = buildRssXml(extractPosts().reverse());
    const withImage = blogPosts.filter((p) => p.heroImage);
    expect(withImage.length).toBeGreaterThan(0);
    const enclosures = xml.match(/<enclosure url="https:\/\/worldaml\.com\/images\/blog\//g) ?? [];
    const media = xml.match(/<media:content url="https:\/\/worldaml\.com\/images\/blog\//g) ?? [];
    expect(enclosures).toHaveLength(withImage.length);
    expect(media).toHaveLength(withImage.length);
    for (const p of withImage) {
      expect(xml).toContain(`<enclosure url="${p.heroImage}" type="image/jpeg" />`);
      expect(xml).toContain(`<img src="${p.heroImage}"`);
    }
  });
});
