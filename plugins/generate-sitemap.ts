/**
 * Vite plugin: auto-generates public/sitemap.xml at build time.
 *
 * It reads the route table, dynamic data files (blog, markets, EU sanctions,
 * academy courses), and produces a fully up-to-date sitemap so it never
 * drifts out of sync with the actual routes.
 */

import { Plugin } from "vite";
import fs from "fs";
import path from "path";

const BASE_URL = "https://worldaml.com";

/* ------------------------------------------------------------------ */
/*  Route registry — single source of truth for the sitemap           */
/* ------------------------------------------------------------------ */

interface SitemapEntry {
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

/**
 * Static routes that are always present.
 * Auth / admin / suite / internal routes are intentionally excluded.
 */
const STATIC_ROUTES: SitemapEntry[] = [
  // Main pages
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/pricing", changefreq: "monthly", priority: 0.9 },
  { path: "/demo", changefreq: "monthly", priority: 0.9 },
  { path: "/contact-sales", changefreq: "monthly", priority: 0.8 },
  { path: "/get-started", changefreq: "monthly", priority: 0.8 },

  // Platform (Lane 1)
  { path: "/platform", changefreq: "monthly", priority: 0.9 },
  { path: "/platform/suite", changefreq: "monthly", priority: 0.8 },
  { path: "/platform/api", changefreq: "monthly", priority: 0.8 },
  { path: "/platform/security", changefreq: "monthly", priority: 0.7 },
  { path: "/platform/transaction-monitoring", changefreq: "monthly", priority: 0.8 },
  { path: "/platform/regulatory-reporting", changefreq: "monthly", priority: 0.8 },
  { path: "/platform/kyc-kyb", changefreq: "monthly", priority: 0.8 },
  { path: "/platform/aml-screening", changefreq: "monthly", priority: 0.8 },
  { path: "/platform/risk-assessment", changefreq: "monthly", priority: 0.8 },

  // Data Sources (Lane 2)
  { path: "/data-sources", changefreq: "monthly", priority: 0.9 },
  { path: "/data-sources/resources", changefreq: "monthly", priority: 0.7 },
  { path: "/data-sources/worldcompliance", changefreq: "monthly", priority: 0.8 },
  { path: "/data-sources/worldcompliance/demo", changefreq: "monthly", priority: 0.7 },
  { path: "/data-sources/worldcompliance/pricing", changefreq: "monthly", priority: 0.7 },
  { path: "/data-sources/worldcompliance/eu-me", changefreq: "monthly", priority: 0.6 },
  { path: "/data-sources/worldcompliance/uk-ie", changefreq: "monthly", priority: 0.6 },
  { path: "/data-sources/worldcompliance/na", changefreq: "monthly", priority: 0.6 },
  { path: "/data-sources/bridger-xg", changefreq: "monthly", priority: 0.8 },
  { path: "/data-sources/bridger-xg/eu-me", changefreq: "monthly", priority: 0.6 },
  { path: "/data-sources/bridger-xg/uk-ie", changefreq: "monthly", priority: 0.6 },
  { path: "/data-sources/bridger-xg/na", changefreq: "monthly", priority: 0.6 },

  // Products
  { path: "/products/worldid", changefreq: "monthly", priority: 0.9 },

  // API Landing Pages
  { path: "/aml-api", changefreq: "monthly", priority: 0.9 },
  { path: "/sanctions-screening-api", changefreq: "monthly", priority: 0.9 },
  { path: "/kyc-kyb-api", changefreq: "monthly", priority: 0.9 },

  // Resources
  { path: "/resources/sanctions-lists", changefreq: "monthly", priority: 0.9 },
  { path: "/resources/aml-regulations", changefreq: "monthly", priority: 0.8 },
  { path: "/resources/glossary", changefreq: "monthly", priority: 0.8 },
  { path: "/resources/best-practices", changefreq: "monthly", priority: 0.7 },

  // Company
  { path: "/about", changefreq: "monthly", priority: 0.6 },
  { path: "/about-us/why-worldaml", changefreq: "monthly", priority: 0.7 },
  { path: "/support", changefreq: "monthly", priority: 0.6 },
  { path: "/faq", changefreq: "monthly", priority: 0.6 },
  { path: "/news", changefreq: "daily", priority: 0.7 },
  { path: "/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/academy", changefreq: "weekly", priority: 0.8 },
  { path: "/partners", changefreq: "monthly", priority: 0.6 },
  { path: "/partners/apply", changefreq: "monthly", priority: 0.5 },

  // Tools
  { path: "/sanctions-check", changefreq: "monthly", priority: 0.8 },
  { path: "/free-aml-check", changefreq: "monthly", priority: 0.8 },
  { path: "/data-coverage", changefreq: "monthly", priority: 0.7 },
  { path: "/eu-sanctions-map", changefreq: "monthly", priority: 0.8 },

  // Industries
  { path: "/industries", changefreq: "monthly", priority: 0.7 },
  { path: "/industries/banking", changefreq: "monthly", priority: 0.7 },
  { path: "/industries/fintech", changefreq: "monthly", priority: 0.7 },
  { path: "/industries/crypto", changefreq: "monthly", priority: 0.7 },
  { path: "/industries/gaming", changefreq: "monthly", priority: 0.7 },
  { path: "/industries/legal", changefreq: "monthly", priority: 0.7 },
  { path: "/industries/payments", changefreq: "monthly", priority: 0.7 },

  // Legal
  { path: "/privacy", changefreq: "yearly", priority: 0.3 },
  { path: "/terms", changefreq: "yearly", priority: 0.3 },
  { path: "/cookies", changefreq: "yearly", priority: 0.3 },
  { path: "/access-your-data", changefreq: "yearly", priority: 0.3 },
];

/* ------------------------------------------------------------------ */
/*  Helpers to extract slugs from TypeScript data files               */
/* ------------------------------------------------------------------ */

function extractSlugs(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const slugRegex = /slug:\s*["']([^"']+)["']/g;
    const slugs: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = slugRegex.exec(content)) !== null) {
      slugs.push(match[1]);
    }
    return slugs;
  } catch {
    console.warn(`[sitemap] Could not read ${filePath}`);
    return [];
  }
}

/**
 * Extract top-level keys from a Record-style TypeScript data file.
 * Matches patterns like:  `keyname: {`  inside `coverageData = {`
 */
function extractRecordKeys(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    // Match keys after the opening `= {` of coverageData
    const dataStart = content.indexOf("coverageData");
    if (dataStart === -1) return [];
    const rest = content.slice(dataStart);
    const keyRegex = /^\s{2}(\w[\w-]*):\s*\{/gm;
    const keys: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = keyRegex.exec(rest)) !== null) {
      keys.push(match[1]);
    }
    return keys;
  } catch {
    console.warn(`[sitemap] Could not read ${filePath}`);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  XML builder                                                       */
/* ------------------------------------------------------------------ */

function buildSitemapXml(entries: SitemapEntry[]): string {
  const today = new Date().toISOString().split("T")[0];

  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/* ------------------------------------------------------------------ */
/*  Main generator                                                    */
/* ------------------------------------------------------------------ */

function generateSitemap(root: string): string {
  const entries: SitemapEntry[] = [...STATIC_ROUTES];

  // Dynamic: blog posts → /blog/:slug
  const blogSlugs = extractSlugs(path.join(root, "src/data/blogPosts.ts"));
  for (const slug of blogSlugs) {
    entries.push({ path: `/blog/${slug}`, changefreq: "monthly", priority: 0.7 });
  }

  // Dynamic: market pages → /markets/:market
  const marketSlugs = extractSlugs(path.join(root, "src/data/marketPages.ts"));
  for (const slug of marketSlugs) {
    entries.push({ path: `/markets/${slug}`, changefreq: "monthly", priority: 0.7 });
  }

  // Dynamic: EU sanctions regimes → /eu-sanctions/:slug
  const euSlugs = extractSlugs(path.join(root, "src/data/euSanctionsRegimes.ts"));
  for (const slug of euSlugs) {
    entries.push({ path: `/eu-sanctions/${slug}`, changefreq: "monthly", priority: 0.6 });
  }

  // Dynamic: data coverage country pages → /data-coverage/:country
  const countryKeys = extractRecordKeys(path.join(root, "src/data/worldComplianceSources.ts"));
  for (const key of countryKeys) {
    entries.push({ path: `/data-coverage/${key}`, changefreq: "monthly", priority: 0.5 });
  }

  // Dynamic: academy courses (read from academy data or hard-coded known slugs)
  const knownAcademyCourses = [
    "aml-fundamentals",
    "kyc-essentials",
    "international-sanctions-compliance",
    "transaction-monitoring-fundamentals",
    "risk-based-approach",
    "ubo-identification",
    "pep-screening-essentials",
    "adverse-media-monitoring",
    "regulatory-reporting-essentials",
    "edd-procedures",
  ];
  for (const slug of knownAcademyCourses) {
    entries.push({ path: `/academy/${slug}`, changefreq: "monthly", priority: 0.6 });
  }

  return buildSitemapXml(entries);
}

/* ------------------------------------------------------------------ */
/*  Vite plugin                                                       */
/* ------------------------------------------------------------------ */

export function sitemapGenerator(): Plugin {
  let projectRoot = "";

  return {
    name: "vite-plugin-sitemap-generator",
    configResolved(config) {
      projectRoot = config.root;
    },
    buildStart() {
      const xml = generateSitemap(projectRoot);
      const outPath = path.join(projectRoot, "public/sitemap.xml");
      fs.writeFileSync(outPath, xml, "utf-8");
      console.log(`[sitemap] Generated ${outPath} with sitemap entries`);
    },
    handleHotUpdate({ file }) {
      if (
        file.includes("blogPosts") ||
        file.includes("marketPages") ||
        file.includes("euSanctionsRegimes") ||
        file.includes("worldComplianceSources")
      ) {
        const xml = generateSitemap(projectRoot);
        const outPath = path.join(projectRoot, "public/sitemap.xml");
        fs.writeFileSync(outPath, xml, "utf-8");
        console.log(`[sitemap] Regenerated after data file change`);
      }
    },
  };
}
