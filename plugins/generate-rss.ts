/**
 * Vite plugin: auto-generates public/rss.xml at build time from
 * src/data/blogPosts.ts, so /rss.xml is served statically and stays
 * in sync with the blog data file.
 */

import { Plugin } from "vite";
import fs from "fs";
import path from "path";
import { blogPosts, isPostPublished, type BlogSection } from "../src/data/blogPosts";

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
  /** Full article body as HTML, for <content:encoded>. */
  contentHtml: string;
  /** Absolute https URL of the post's hero image, if any. */
  heroImage?: string;
  heroImageAlt?: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Renders a post's sections as simple HTML (same order as the article page). */
export function sectionsToHtml(sections: BlogSection[]): string {
  return sections
    .map((s) => {
      const t = escapeHtml(s.text ?? "");
      switch (s.type) {
        case "intro":
        case "p":
          return `<p>${t}</p>`;
        case "h2":
          return `<h2>${t}</h2>`;
        case "h3":
          return `<h3>${t}</h3>`;
        case "callout":
          return `<blockquote><p>${t}</p></blockquote>`;
        case "ul":
        case "ol": {
          const lis = (s.items ?? []).map((i) => `<li>${escapeHtml(i)}</li>`).join("");
          return `<${s.type}>${lis}</${s.type}>`;
        }
        case "table": {
          const head = (s.headers ?? []).map((h) => `<th>${escapeHtml(h)}</th>`).join("");
          const body = (s.rows ?? [])
            .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
            .join("");
          return `<table>${head ? `<thead><tr>${head}</tr></thead>` : ""}<tbody>${body}</tbody></table>`;
        }
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cdata(s: string): string {
  // Safe CDATA — split any accidental "]]>" sequences.
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}


/** Reads every post from src/data/blogPosts.ts, oldest first. */
export function extractPosts(): RssItem[] {
  const posts: RssItem[] = blogPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    author: p.author || "WorldAML",
    category: p.category || "Compliance",
    tags: p.tags ?? [],
    contentHtml: sectionsToHtml(p.content ?? []),
    heroImage: p.heroImage,
    heroImageAlt: p.heroImageAlt ?? p.title,
  }));
  // Oldest first — drip release consumes backlog chronologically
  posts.sort((a, b) => a.date.localeCompare(b.date));
  return posts;
}

function toRfc822(dateStr: string | Date): string {
  const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export interface RssMeta {
  anchor: string;
  totalArticles: number;
  releasedCount: number;
  upcomingCount: number;
  nextRelease: {
    date: string;
    title: string;
    slug: string;
  } | null;
}

/**
 * Release schedule: each post goes live on its own `date` (see isPostPublished
 * in src/data/blogPosts.ts). New articles are dated Tuesdays and Fridays.
 * Writes public/rss-meta.json for the /rss page.
 */
export function applyReleaseSchedule(root: string, posts: RssItem[], now: Date = new Date()): RssItem[] {
  const released = posts.filter((p) => isPostPublished(p, now));
  const upcoming = posts.filter((p) => !isPostPublished(p, now));
  const next = upcoming[0];

  const meta: RssMeta = {
    anchor: now.toISOString(),
    totalArticles: posts.length,
    releasedCount: released.length,
    upcomingCount: upcoming.length,
    nextRelease: next
      ? { date: new Date(`${next.date}T00:00:00Z`).toISOString(), title: next.title, slug: next.slug }
      : null,
  };

  if (root) {
    try {
      fs.writeFileSync(path.join(root, "public/rss-meta.json"), JSON.stringify(meta, null, 2), "utf-8");
    } catch (e) {
      console.warn(`[rss] Could not persist meta:`, e);
    }
  }

  // Newest release first in the feed
  return [...released].reverse();
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
    <description>${cdata(it.description)}</description>
    <content:encoded>${cdata(
      `${it.contentHtml}\n<p><a href="${url}">Read the full article on WorldAML</a></p>`
    )}</content:encoded>
    <author>${FEED_AUTHOR_EMAIL} (${escapeXml(it.author)})</author>
    <dc:creator>${cdata(it.author)}</dc:creator>
${cats}
  </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
  const allPosts = extractPosts();
  const released = applyReleaseSchedule(root, allPosts);
  return buildRssXml(released);
}


export { buildRssXml };

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
