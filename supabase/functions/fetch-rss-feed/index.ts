import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Minimal RSS/Atom parser using regex — no XML lib to keep bundle small.
function unescape(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function pick(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? unescape(m[1]) : null;
}

function pickAttr(block: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*\\/?\\s*>`, "i");
  const m = block.match(re);
  return m ? m[1] : null;
}

interface ParsedItem {
  guid: string;
  title: string | null;
  link: string | null;
  summary: string | null;
  content: string | null;
  author: string | null;
  published_at: string | null;
}

interface ParsedFeed {
  title: string | null;
  description: string | null;
  site_url: string | null;
  items: ParsedItem[];
}

function parseFeed(xml: string): ParsedFeed {
  const isAtom = /<feed[\s>][\s\S]*<\/feed>/i.test(xml);
  const items: ParsedItem[] = [];

  if (isAtom) {
    const feedBlock = xml.match(/<feed[\s\S]*?>([\s\S]*)<\/feed>/i)?.[1] ?? xml;
    const channelTitle = pick(feedBlock, "title");
    const channelDesc = pick(feedBlock, "subtitle");
    const channelLink = pickAttr(feedBlock, "link", "href");

    const entryRe = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    let m;
    while ((m = entryRe.exec(feedBlock))) {
      const b = m[1];
      const link = pickAttr(b, "link", "href");
      const id = pick(b, "id");
      const title = pick(b, "title");
      const summary = pick(b, "summary");
      const content = pick(b, "content");
      const updated = pick(b, "updated") || pick(b, "published");
      const author = pick(b, "name");
      items.push({
        guid: id || link || title || crypto.randomUUID(),
        title,
        link,
        summary,
        content,
        author,
        published_at: updated,
      });
    }
    return { title: channelTitle, description: channelDesc, site_url: channelLink, items };
  }

  // RSS 2.0
  const channelBlock = xml.match(/<channel[\s\S]*?>([\s\S]*)<\/channel>/i)?.[1] ?? xml;
  const channelTitle = pick(channelBlock, "title");
  const channelDesc = pick(channelBlock, "description");
  const channelLink = pick(channelBlock, "link");

  const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(channelBlock))) {
    const b = m[1];
    const title = pick(b, "title");
    const link = pick(b, "link");
    const guid = pick(b, "guid") || link || title || crypto.randomUUID();
    const summary = pick(b, "description");
    const content = pick(b, "content:encoded") || pick(b, "content");
    const author = pick(b, "author") || pick(b, "dc:creator");
    const pubDate = pick(b, "pubDate") || pick(b, "dc:date");
    let published_at: string | null = null;
    if (pubDate) {
      const d = new Date(pubDate);
      if (!isNaN(d.getTime())) published_at = d.toISOString();
    }
    items.push({ guid, title, link, summary, content, author, published_at });
  }
  return { title: channelTitle, description: channelDesc, site_url: channelLink, items };
}

// ---- SSRF protection -------------------------------------------------------
const MAX_FEED_BYTES = 5 * 1024 * 1024; // 5 MB
const FETCH_TIMEOUT_MS = 10_000;

function isPrivateIp(host: string): boolean {
  // IPv4
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reserved
    return false;
  }
  // IPv6
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "::1" || h === "::" ) return true;
  if (/^(fc|fd|fe8|fe9|fea|feb)/.test(h)) return true; // ULA + link-local
  if (h.startsWith("::ffff:")) return isPrivateIp(h.slice(7));
  return false;
}

async function assertSafeFeedUrl(raw: string): Promise<URL> {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error("Invalid URL"); }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http(s) feed URLs are allowed");
  }
  const host = u.hostname.toLowerCase().replace(/\.$/, "");
  if (
    host === "localhost" ||
    host === "metadata" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host.endsWith(".local") ||
    host === "metadata.google.internal"
  ) {
    throw new Error("Feed host is not permitted");
  }
  if (isPrivateIp(host)) throw new Error("Feed host is not permitted");

  // Resolve DNS where available and reject private/loopback targets.
  if (!/^[\d.]+$/.test(host) && !host.includes(":")) {
    try {
      const addrs: string[] = [];
      for (const rt of ["A", "AAAA"] as const) {
        try {
          const r = await (Deno as any).resolveDns?.(host, rt);
          if (Array.isArray(r)) addrs.push(...r);
        } catch { /* record type missing */ }
      }
      if (addrs.length && addrs.every((ip) => isPrivateIp(ip))) {
        throw new Error("Feed host resolves to a private address");
      }
      if (addrs.some((ip) => isPrivateIp(ip))) {
        throw new Error("Feed host resolves to a private address");
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("Feed host")) throw e;
      // DNS lookup unavailable in this runtime — rely on literal checks above.
    }
  }
  return u;
}

async function fetchFeedText(rawUrl: string): Promise<string> {
  const url = await assertSafeFeedUrl(rawUrl);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "WorldAML-RSS/1.0",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      redirect: "manual",
      signal: ctrl.signal,
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("Redirect without location");
      // Re-validate the redirect target once, then fetch it without following further.
      const next = await assertSafeFeedUrl(new URL(loc, url).toString());
      const res2 = await fetch(next.toString(), {
        headers: { "User-Agent": "WorldAML-RSS/1.0" },
        redirect: "manual",
        signal: ctrl.signal,
      });
      if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
      const t2 = await res2.text();
      return t2.slice(0, MAX_FEED_BYTES);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_FEED_BYTES) throw new Error("Feed too large");
    const text = await res.text();
    if (text.length > MAX_FEED_BYTES) throw new Error("Feed too large");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { feed_id, feed_url } = body as { feed_id?: string; feed_url?: string };

    // Resolve feed row (create if only URL supplied)
    let feedRow: { id: string; feed_url: string } | null = null;
    if (feed_id) {
      const { data, error } = await supabase
        .from("rss_feeds").select("id, feed_url").eq("id", feed_id).eq("user_id", userId).single();
      if (error || !data) {
        return new Response(JSON.stringify({ error: "Feed not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      feedRow = data;
    } else if (feed_url) {
      try { new URL(feed_url); } catch {
        return new Response(JSON.stringify({ error: "Invalid URL" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase.from("rss_feeds")
        .upsert({ user_id: userId, feed_url }, { onConflict: "user_id,feed_url" })
        .select("id, feed_url").single();
      if (error) throw error;
      feedRow = data;
    } else {
      return new Response(JSON.stringify({ error: "feed_id or feed_url required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the feed
    let xml = "";
    try {
      const res = await fetch(feedRow!.feed_url, {
        headers: { "User-Agent": "WorldAML-RSS/1.0", Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      xml = await res.text();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabase.from("rss_feeds").update({
        last_fetched_at: new Date().toISOString(),
        last_fetch_status: "error",
        last_fetch_error: msg,
      }).eq("id", feedRow!.id);
      return new Response(JSON.stringify({ error: `Fetch failed: ${msg}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = parseFeed(xml);

    let inserted = 0;
    if (parsed.items.length > 0) {
      const rows = parsed.items.map((it) => ({
        feed_id: feedRow!.id,
        user_id: userId,
        guid: it.guid,
        title: it.title,
        link: it.link,
        summary: it.summary,
        content: it.content,
        author: it.author,
        published_at: it.published_at,
      }));
      const { data, error } = await supabase.from("rss_items")
        .upsert(rows, { onConflict: "feed_id,guid", ignoreDuplicates: true })
        .select("id");
      if (error) throw error;
      inserted = data?.length ?? 0;
    }

    const { count } = await supabase.from("rss_items")
      .select("id", { count: "exact", head: true })
      .eq("feed_id", feedRow!.id);

    await supabase.from("rss_feeds").update({
      title: parsed.title,
      description: parsed.description,
      site_url: parsed.site_url,
      last_fetched_at: new Date().toISOString(),
      last_fetch_status: "ok",
      last_fetch_error: null,
      item_count: count ?? 0,
    }).eq("id", feedRow!.id);

    return new Response(
      JSON.stringify({ feed_id: feedRow!.id, inserted, total_items: count ?? 0, parsed: parsed.items.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("fetch-rss-feed error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
