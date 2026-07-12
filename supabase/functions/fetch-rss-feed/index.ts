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
