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
});
