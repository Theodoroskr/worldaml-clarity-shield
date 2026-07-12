/**
 * Vite plugin: auto-generates public/rss.xml at build time from
 * src/data/blogPosts.ts, so /rss.xml is served statically and stays
 * in sync with the blog data file.
 */

import { Plugin } from "vite";
import fs from "fs";
import path from "path";

const BASE_URL = "https://worldaml.com";
const FEED_TITLE = "WorldAML Insights";
const FEED_DESCRIPTION =
  "Practical AML, KYC/KYB, sanctions and regulatory compliance analysis from the WorldAML team.";
const FEED_LANGUAGE = "en";
const FEED_AUTHOR_EMAIL = "info@worldaml.com";

interface RssItem {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function unquote(s: string): string {
  // Handle "..." with escaped quotes inside a TS/JS string literal
  return s.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, " ").trim();
}

/**
 * Regex-parses blogPosts.ts and returns each post's metadata.
 * Only reads fields we actually need for RSS.
 */
function extractPosts(filePath: string): RssItem[] {
  if (!fs.existsSync(filePath)) return [];
  const src = fs.readFileSync(filePath, "utf-8");

  // Split on `{` opening a post object — crude but works because each
  // post is a top-level object literal starting with `slug:`.
  const posts: RssItem[] = [];
  const blockRe = /\{\s*slug:\s*"([^"]+)"[\s\S]*?(?=\n\s{2,4}\{\s*slug:|\n\s*\];)/g;
  const matches = src.matchAll(blockRe);

  for (const m of matches) {
    const block = m[0];
    const slug = m[1];
    const title = block.match(/title:\s*"([^"]+)"/)?.[1];
    const descRaw =
      block.match(/description:\s*\n?\s*"((?:[^"\\]|\\.)*)"/)?.[1] ||
      block.match(/description:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
    const date = block.match(/date:\s*"([^"]+)"/)?.[1];
    const author = block.match(/author:\s*"([^"]+)"/)?.[1];
    const category = block.match(/category:\s*"([^"]+)"/)?.[1];
    const tagsBlock = block.match(/tags:\s*\[([\s\S]*?)\]/)?.[1];
    const tags = tagsBlock
      ? Array.from(tagsBlock.matchAll(/"([^"]+)"/g)).map((t) => t[1])
      : [];

    if (!title || !descRaw || !date) continue;

    posts.push({
      slug,
      title: unquote(title),
      description: unquote(descRaw),
      date,
      author: author ? unquote(author) : "WorldAML",
      category: category ? unquote(category) : "Compliance",
      tags,
    });
  }

  // Newest first
  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

function toRfc822(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

function buildRssXml(items: RssItem[]): string {
  const lastBuild = new Date().toUTCString();
  const latest = items[0]?.date ? toRfc822(items[0].date) : lastBuild;

  const itemsXml = items
    .map((it) => {
      const url = `${BASE_URL}/blog/${it.slug}`;
      const cats = [it.category, ...it.tags]
        .filter(Boolean)
        .map((c) => `    <category>${escapeXml(c)}</category>`)
        .join("\n");
      return `  <item>
    <title>${escapeXml(it.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${toRfc822(it.date)}</pubDate>
    <description>${escapeXml(it.description)}</description>
    <author>${FEED_AUTHOR_EMAIL} (${escapeXml(it.author)})</author>
${cats}
  </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(FEED_TITLE)}</title>
  <link>${BASE_URL}/blog</link>
  <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
  <description>${escapeXml(FEED_DESCRIPTION)}</description>
  <language>${FEED_LANGUAGE}</language>
  <lastBuildDate>${lastBuild}</lastBuildDate>
  <pubDate>${latest}</pubDate>
  <generator>WorldAML RSS Generator</generator>
${itemsXml}
</channel>
</rss>
`;
}

function generateRss(root: string): string {
  const posts = extractPosts(path.join(root, "src/data/blogPosts.ts"));
  return buildRssXml(posts);
}

export function rssGenerator(): Plugin {
  let projectRoot = "";
  const write = () => {
    const xml = generateRss(projectRoot);
    const outPath = path.join(projectRoot, "public/rss.xml");
    fs.writeFileSync(outPath, xml, "utf-8");
    console.log(`[rss] Generated ${outPath}`);
  };

  return {
    name: "vite-plugin-rss-generator",
    configResolved(config) {
      projectRoot = config.root;
    },
    buildStart() {
      write();
    },
    handleHotUpdate({ file }) {
      if (file.includes("blogPosts")) {
        write();
        console.log(`[rss] Regenerated after blog data change`);
      }
    },
  };
}
