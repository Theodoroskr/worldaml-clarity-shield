// Build-time script to generate /public/rss.xml from blog posts
import { blogPosts } from "../src/data/blogPosts";

const SITE_URL = "https://worldaml.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractPlainText(post: (typeof blogPosts)[0]): string {
  const intro = post.content.find((s) => s.type === "intro");
  return intro?.text || post.description;
}

function generateRSS(): string {
  const now = new Date().toUTCString();

  const items = blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50)
    .map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      const link = `${SITE_URL}/blog/${post.slug}`;
      const description = extractPlainText(post);

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(post.category)}</category>
      <author>${escapeXml(post.author)}</author>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WorldAML Blog – Compliance Intelligence</title>
    <link>${SITE_URL}/blog</link>
    <description>Expert insights on AML compliance, sanctions screening, KYC/KYB, risk assessment, and regulatory updates from WorldAML.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

// Write to public/rss.xml
const fs = await import("fs");
fs.writeFileSync("public/rss.xml", generateRSS(), "utf-8");
console.log("✅ public/rss.xml generated with", blogPosts.length, "posts");
