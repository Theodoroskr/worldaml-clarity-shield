import type { NewsItem, NewsCategory, TrustTier } from "@/components/news/NewsCard";
import { cleanSummary, cleanTitle, truncateSummary } from "@/lib/newsSummary";

// RSS-to-JSON proxy service (free tier, no API key needed)
const RSS2JSON_API = "https://api.rss2json.com/v1/api.json";

// Feed configuration with source mapping
interface FeedConfig {
  url: string;
  source: string;
  category: NewsCategory;
  trustTier: TrustTier;
}

export const RSS_FEEDS: FeedConfig[] = [
  // FCA — confirmed working, pubDate comes as null so parsePubDate handles it
  {
    url: "https://www.fca.org.uk/news/rss.xml",
    source: "Financial Conduct Authority",
    category: "AML & Financial Crime",
    trustTier: "A",
  },
  // EBA — European Banking Authority, confirmed active feed
  {
    url: "https://www.eba.europa.eu/news-press/news/rss.xml",
    source: "European Banking Authority",
    category: "Regulatory Updates",
    trustTier: "A",
  },
  // ESMA — European Securities and Markets Authority
  {
    url: "https://www.esma.europa.eu/rss.xml",
    source: "European Securities and Markets Authority",
    category: "Regulatory Updates",
    trustTier: "A",
  },
  // DFSA — Dubai Financial Services Authority (GCC coverage)
  {
    url: "https://www.dfsa.ae/rss/news",
    source: "Dubai Financial Services Authority",
    category: "GCC Regulatory Updates",
    trustTier: "A",
  },
];

// API response types
interface Rss2JsonItem {
  title: string;
  pubDate: string | null;
  link: string;
  description: string;
  author?: string;
  thumbnail?: string;
}

interface Rss2JsonResponse {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
  };
  items: Rss2JsonItem[];
}

// Simple in-memory cache
const cache: Map<string, { data: NewsItem[]; timestamp: number }> = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Safe date parser — new Date(null) returns epoch, so we must guard explicitly
function parsePubDate(pubDate: string | null | undefined): string {
  if (pubDate == null || pubDate === "") return new Date().toISOString().split("T")[0];
  const parsed = new Date(pubDate);
  if (isNaN(parsed.getTime()) || parsed.getFullYear() < 2000) return new Date().toISOString().split("T")[0];
  return parsed.toISOString().split("T")[0];
}

// Title/summary cleaning lives in `@/lib/newsSummary` so the live feeds, the
// stored monthly updates and the curated fallbacks all present identical fields.


// Generate a stable, collision-free ID from a feed item.
// (A base64 prefix was previously used, which produced identical IDs for every item
// of the same feed and made React reuse stale cards when filtering.)
function generateId(item: Rss2JsonItem, feedUrl: string): string {
  const base = `${feedUrl}|${item.title}|${item.pubDate}|${item.link}`;
  let hash = 2166136261;
  for (let i = 0; i < base.length; i++) {
    hash ^= base.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `rss-${(hash >>> 0).toString(36)}-${base.length.toString(36)}`;
}

// Extract tags from title/description
function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tagMap: Record<string, string[]> = {
    crypto: ["crypto", "virtual asset", "bitcoin", "blockchain"],
    sanctions: ["sanction", "ofac", "sdn", "designation"],
    aml: ["aml", "anti-money", "money laundering"],
    kyc: ["kyc", "due diligence", "customer identification"],
    enforcement_action: ["fine", "penalty", "enforcement", "prosecut"],
  };

  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.push(tag);
    }
  }
  return tags.length > 0 ? tags : ["regulatory"];
}

// Fetch a single RSS feed
export async function fetchRssFeed(config: FeedConfig): Promise<NewsItem[]> {
  const cacheKey = config.url;
  const cached = cache.get(cacheKey);

  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  try {
    const encodedUrl = encodeURIComponent(config.url);
    const response = await fetch(`${RSS2JSON_API}?rss_url=${encodedUrl}`);

    if (!response.ok) {
      console.warn(`RSS fetch failed for ${config.source}: ${response.status}`);
      return [];
    }

    const data: Rss2JsonResponse = await response.json();

    if (data.status !== "ok") {
      console.warn(`RSS parse failed for ${config.source}`);
      return [];
    }

    const items: NewsItem[] = data.items.map((item) => {
      const title = cleanTitle(item.title);
      const body = cleanSummary(item.description, title);
      return {
        id: generateId(item, config.url),
        title,
        source: config.source,
        sourceUrl: item.link,
        publishedAt: parsePubDate(item.pubDate),
        category: config.category,
        tags: extractTags(item.title, item.description),
        summary: truncateSummary(body) || title,
        fullSummary: body || undefined,
        trustTier: config.trustTier,
      };
    }).filter((item) => item.title && item.sourceUrl);


    // Update cache
    cache.set(cacheKey, { data: items, timestamp: Date.now() });

    return items;
  } catch (error) {
    console.warn(`RSS fetch error for ${config.source}:`, error);
    return [];
  }
}

// Fetch all configured feeds
export async function fetchAllFeeds(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((config) => fetchRssFeed(config))
  );

  const allItems: NewsItem[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Sort by date (newest first)
  return allItems.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
