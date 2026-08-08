import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

type Category =
  | "Regulatory Updates"
  | "Sanctions & Enforcement"
  | "AML & Financial Crime"
  | "GCC Regulatory Updates";

interface FeedConfig {
  url: string;
  source: string;
  category: Category;
}

// Monthly web search, one query per News page category (Google News RSS).
const SEARCHES: { query: string; category: Category }[] = [
  {
    category: "Sanctions & Enforcement",
    query: '(OFAC OR OFSI OR "EU sanctions" OR "UN Security Council") (sanctions OR designations OR enforcement) when:45d',
  },
  {
    category: "AML & Financial Crime",
    query: '("money laundering" OR "financial crime") (fine OR enforcement OR investigation OR "transaction monitoring") when:45d',
  },
  {
    category: "Regulatory Updates",
    query: '(FATF OR "European Commission" OR AMLA OR FinCEN OR FCA) ("AML" OR "anti-money laundering" OR "compliance rules") when:45d',
  },
  {
    category: "GCC Regulatory Updates",
    query: '(UAE OR Saudi OR Qatar OR Bahrain OR Kuwait OR Oman OR DIFC OR ADGM) (AML OR "central bank" OR compliance OR sanctions) when:45d',
  },
];

function searchFeedUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-GB&gl=GB&ceid=GB:en`;
}

// Authoritative public sources, mapped to the categories used on the News page.
const FEEDS: FeedConfig[] = [
  // Sanctions & Enforcement
  { url: "https://www.gov.uk/government/organisations/office-of-financial-sanctions-implementation.atom", source: "Office of Financial Sanctions Implementation", category: "Sanctions & Enforcement" },
  // AML & Financial Crime
  { url: "https://www.fca.org.uk/news/rss.xml", source: "Financial Conduct Authority", category: "AML & Financial Crime" },
  // Regulatory Updates
  { url: "https://www.eba.europa.eu/news-press/news/rss.xml", source: "European Banking Authority", category: "Regulatory Updates" },
  { url: "https://www.esma.europa.eu/rss.xml", source: "European Securities and Markets Authority", category: "Regulatory Updates" },
  // Category web searches (fills gaps the direct feeds do not cover, incl. the GCC)
  ...SEARCHES.map(({ query, category }) => ({
    url: searchFeedUrl(query),
    source: "",
    category,
  })),
];


const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
};

function decode(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;|&#39;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decode(match[1]) : "";
}

function link(block: string): string {
  const plain = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (plain && plain[1].trim()) return decode(plain[1]);
  const href = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return href ? href[1] : "";
}

function toIsoDate(raw: string): string {
  const parsed = raw ? new Date(raw) : new Date(NaN);
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return date.toISOString().slice(0, 10);
}

function summarise(text: string, max = 320): string {
  if (text.length <= max) return text;
  const window = text.slice(0, max);
  const sentenceEnd = Math.max(window.lastIndexOf(". "), window.lastIndexOf("! "), window.lastIndexOf("? "));
  if (sentenceEnd > max * 0.5) return window.slice(0, sentenceEnd + 1).trim();
  const wordEnd = window.lastIndexOf(" ");
  return `${(wordEnd > 0 ? window.slice(0, wordEnd) : window).replace(/[,;:.\-–—]+$/, "").trim()}…`;
}

const TAG_RULES: [RegExp, string][] = [
  [/sanction|sdn|designat/i, "sanctions"],
  [/enforce|fine|penalt/i, "enforcement_action"],
  [/crypto|virtual asset|vasp/i, "crypto"],
  [/kyc|due diligence|cdd/i, "kyc"],
  [/beneficial owner|ubo/i, "ubo"],
  [/money launder|aml|cft/i, "aml"],
  [/payment|psp/i, "payments"],
];

function extractTags(text: string): string[] {
  const tags = TAG_RULES.filter(([re]) => re.test(text)).map(([, t]) => t);
  return tags.length ? [...new Set(tags)].slice(0, 4) : ["regulatory"];
}

/**
 * Fetch the raw feed XML. Some hosts block datacenter egress, so public
 * read-only mirrors are tried as fallbacks (raw XML first, then JSON).
 */
const XML_MIRRORS = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchFeedXml(url: string): Promise<string> {
  const attempts: string[] = [];

  const tryFetch = async (target: string, label: string) => {
    try {
      const response = await fetch(target, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WorldAML-NewsBot/1.0",
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        },
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) {
        attempts.push(`${label} ${response.status}`);
        return null;
      }
      const text = await response.text();
      if (!/<(item|entry)[\s>]/i.test(text)) {
        attempts.push(`${label} no-items`);
        return null;
      }
      return text;
    } catch (error) {
      attempts.push(`${label} ${(error as Error).name}`);
      return null;
    }
  };

  const directXml = await tryFetch(url, "direct");
  if (directXml) return directXml;

  for (const [index, mirror] of XML_MIRRORS.entries()) {
    const mirrored = await tryFetch(mirror(url), `mirror${index + 1}`);
    if (mirrored) return mirrored;
  }

  // Last resort: JSON conversion service, rebuilt into minimal RSS.
  try {
    const proxy = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(25_000),
    });
    const data = proxy.ok ? await proxy.json() : null;
    if (data?.status === "ok" && Array.isArray(data.items)) {
      const escape = (value: string) => `<![CDATA[${String(value ?? "").replace(/\]\]>/g, "")}]]>`;
      return data.items
        .map((item: Record<string, string>) =>
          `<item><title>${escape(item.title)}</title><description>${escape(item.description)}</description>` +
          `<link>${escape(item.link)}</link><pubDate>${escape(item.pubDate)}</pubDate>` +
          `<source>${escape(item.author ?? "")}</source></item>`,
        )
        .join("");
    }
    attempts.push(`json ${proxy.status}`);
  } catch (error) {
    attempts.push(`json ${(error as Error).name}`);
  }

  throw new Error(attempts.join(", "));
}


async function parseFeed(config: FeedConfig) {
  const xml = await fetchFeedXml(config.url);


  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) ?? [];
  return blocks.slice(0, 12).map((block) => {
    // Search results carry the publisher in a <source> tag and as a " - Publisher" title suffix.
    const publisher = tag(block, "source");
    let title = tag(block, "title");
    if (publisher && title.endsWith(`- ${publisher}`)) {
      title = title.slice(0, -(publisher.length + 2)).trim();
    }

    const bodyRaw = tag(block, "description") || tag(block, "summary") || tag(block, "content");
    let body = bodyRaw.toLowerCase().startsWith(title.toLowerCase())
      ? bodyRaw.slice(title.length).replace(/^[\s\-–—:.]+/, "").trim() || bodyRaw
      : bodyRaw;
    // Aggregator descriptions are often just a repeated headline + publisher name.
    if (body.length < 60 || body.toLowerCase().includes(title.toLowerCase())) body = title;

    return {
      title,
      summary: summarise(body),
      full_summary: body,
      source: config.source || publisher || "Web search",
      source_url: link(block) || config.url,
      category: config.category,
      published_at: toIsoDate(tag(block, "pubDate") || tag(block, "updated") || tag(block, "published")),
      tags: extractTags(`${title} ${body}`),
      trust_tier: config.source ? "A" : "B",
    };
  }).filter((item) => item.title && item.source_url);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const perFeed: Record<string, number | string> = {};
  let stored = 0;

  const ingest = async (config: FeedConfig, retries: number) => {
    try {
      let items = await parseFeed(config).catch(() => null);
      // Public mirrors rate-limit rapid calls; back off and retry.
      for (let attempt = 0; !items && attempt < retries; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 4_000));
        items = await parseFeed(config).catch(() => null);
      }
      if (!items) throw new Error("feed unavailable");

      if (items.length === 0) {
        perFeed[config.url] = 0;
        return;
      }
      const { error } = await supabase
        .from("news_updates")
        .upsert(items, { onConflict: "source_url" });
      if (error) throw new Error(error.message);
      perFeed[config.url] = items.length;
      stored += items.length;
    } catch (err) {
      perFeed[config.url] = `error: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`Feed failed ${config.url}`, err);
    }
  };

  // Direct regulator feeds are reliable — fetch them together.
  const directFeeds = FEEDS.filter((feed) => feed.source);
  const searchFeeds = FEEDS.filter((feed) => !feed.source);

  const run = async () => {
    await Promise.all(directFeeds.map((config) => ingest(config, 0)));
    // Search mirrors are rate-limited — fetch them one at a time.
    for (const config of searchFeeds) await ingest(config, 1);

    // Keep the table lean: drop anything older than 18 months.
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 18);
    await supabase.from("news_updates").delete().lt("published_at", cutoff.toISOString().slice(0, 10));
    console.log("news refresh complete", stored, JSON.stringify(perFeed));
  };

  const url = new URL(req.url);
  if (url.searchParams.get("wait") === "1") {
    await run();
    return new Response(JSON.stringify({ success: true, stored, perFeed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Default: run in the background so the monthly cron call returns instantly.
  // @ts-ignore EdgeRuntime is provided by the Supabase runtime.
  EdgeRuntime.waitUntil(run());
  return new Response(JSON.stringify({ success: true, queued: true }), {
    status: 202,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

});
