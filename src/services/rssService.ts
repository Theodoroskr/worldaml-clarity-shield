import type { NewsItem, NewsCategory, TrustTier } from "@/components/news/NewsCard";

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
  {
    url: "https://www.fatf-gafi.org/rss/fatf-news.xml",
    source: "Financial Action Task Force",
    category: "Regulatory Updates",
    trustTier: "A",
  },
  {
    url: "https://ofac.treasury.gov/system/files/rss/sdn_rss.xml",
    source: "Office of Foreign Assets Control",
    category: "Sanctions & Enforcement",
    trustTier: "A",
  },
  {
    url: "https://www.fca.org.uk/news/rss.xml",
    source: "Financial Conduct Authority",
    category: "AML & Financial Crime",
    trustTier: "A",
  },
  {
    url: "https://www.fincen.gov/rss-feeds",
    source: "Financial Crimes Enforcement Network",
    category: "Regulatory Updates",
    trustTier: "A",
  },
];

// API response types
interface Rss2JsonItem {
  title: string;
  pubDate: string;
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

// Extract plain text from HTML
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

// Truncate text to specified length
function truncate(text: string, maxLength: number = 200): string {
  const clean = stripHtml(text).trim();
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + "...";
}

// Generate unique ID from feed item
function generateId(item: Rss2JsonItem, feedUrl: string): string {
  const base = `${feedUrl}-${item.title}-${item.pubDate}`;
  return btoa(base).replace(/[^a-zA-Z0-9]/g, "").substring(0, 16);
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

    const items: NewsItem[] = data.items.map((item) => ({
      id: generateId(item, config.url),
      title: item.title,
      source: config.source,
      sourceUrl: item.link,
      publishedAt: (() => {
        if (!item.pubDate) return new Date().toISOString().split("T")[0];
        const parsed = new Date(item.pubDate);
        return isNaN(parsed.getTime()) ? new Date().toISOString().split("T")[0] : parsed.toISOString().split("T")[0];
      })(),
      category: config.category,
      tags: extractTags(item.title, item.description),
      summary: truncate(item.description),
      trustTier: config.trustTier,
    }));

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
