import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Trash2, ExternalLink, Rss, Loader2 } from "lucide-react";
import { z } from "zod";
import SEO from "@/components/SEO";

interface RssFeed {
  id: string;
  feed_url: string;
  title: string | null;
  description: string | null;
  site_url: string | null;
  is_active: boolean;
  last_fetched_at: string | null;
  last_fetch_status: string | null;
  last_fetch_error: string | null;
  item_count: number;
}

interface RssItem {
  id: string;
  feed_id: string;
  title: string | null;
  link: string | null;
  summary: string | null;
  author: string | null;
  published_at: string | null;
  fetched_at: string;
}

const urlSchema = z.string().trim().url({ message: "Enter a valid URL" }).max(2000);

export default function SuiteRss() {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [items, setItems] = useState<RssItem[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFeeds = async () => {
    const { data, error } = await supabase
      .from("rss_feeds").select("*").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setFeeds((data ?? []) as RssFeed[]);
    setLoading(false);
  };

  const loadItems = async (feedId: string | null) => {
    let q = supabase.from("rss_items").select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(100);
    if (feedId) q = q.eq("feed_id", feedId);
    const { data, error } = await q;
    if (error) { toast.error(error.message); return; }
    setItems((data ?? []) as RssItem[]);
  };

  useEffect(() => { loadFeeds(); }, []);
  useEffect(() => { loadItems(selectedFeed); }, [selectedFeed]);

  const addFeed = async () => {
    const parsed = urlSchema.safeParse(newUrl);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-rss-feed", {
        body: { feed_url: parsed.data },
      });
      if (error) throw error;
      toast.success(`Added feed — ${data?.inserted ?? 0} new items`);
      setNewUrl("");
      await loadFeeds();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add feed");
    } finally { setAdding(false); }
  };

  const refetch = async (feedId: string) => {
    setFetchingId(feedId);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-rss-feed", {
        body: { feed_id: feedId },
      });
      if (error) throw error;
      toast.success(`Refreshed — ${data?.inserted ?? 0} new items`);
      await loadFeeds();
      if (selectedFeed === feedId) await loadItems(feedId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Fetch failed");
    } finally { setFetchingId(null); }
  };

  const deleteFeed = async (feedId: string) => {
    if (!confirm("Delete this feed and all its items?")) return;
    const { error } = await supabase.from("rss_feeds").delete().eq("id", feedId);
    if (error) { toast.error(error.message); return; }
    toast.success("Feed deleted");
    if (selectedFeed === feedId) setSelectedFeed(null);
    await loadFeeds();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <SEO title="RSS Feeds" description="Ingest and browse RSS feeds." noindex />
      <div className="flex items-center gap-3">
        <Rss className="w-5 h-5 text-accent" />
        <h1 className="text-2xl font-bold">RSS Feeds</h1>
      </div>

      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com/feed.xml"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !adding && addFeed()}
          />
          <Button onClick={addFeed} disabled={adding || !newUrl.trim()}>
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add feed"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Paste an RSS or Atom feed URL. We'll fetch and store the items.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Feed list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold">Feeds</h2>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedFeed(null)}
            >
              All items
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground p-3">Loading…</p>
          ) : feeds.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3">No feeds yet.</p>
          ) : feeds.map((f) => (
            <Card
              key={f.id}
              className={`p-3 cursor-pointer transition-colors ${selectedFeed === f.id ? "border-accent" : ""}`}
              onClick={() => setSelectedFeed(f.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{f.title || f.feed_url}</div>
                  <div className="text-xs text-muted-foreground truncate">{f.feed_url}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-[10px]">{f.item_count} items</Badge>
                    {f.last_fetch_status === "error" && (
                      <Badge variant="destructive" className="text-[10px]">error</Badge>
                    )}
                  </div>
                  {f.last_fetch_error && (
                    <p className="text-[10px] text-destructive mt-1 truncate">{f.last_fetch_error}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); refetch(f.id); }}
                    disabled={fetchingId === f.id}
                    className="p-1.5 rounded hover:bg-muted"
                    title="Refresh"
                  >
                    {fetchingId === f.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <RefreshCw className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFeed(f.id); }}
                    className="p-1.5 rounded hover:bg-muted text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold px-1">
            {selectedFeed ? "Feed items" : "All items"} ({items.length})
          </h2>
          {items.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground text-center">
              No items to show.
            </Card>
          ) : items.map((it) => (
            <Card key={it.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm">{it.title || "(untitled)"}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {it.author && <span>{it.author}</span>}
                    {it.published_at && <span>· {new Date(it.published_at).toLocaleString()}</span>}
                  </div>
                  {it.summary && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3"
                       dangerouslySetInnerHTML={{ __html: it.summary.replace(/<script[\s\S]*?<\/script>/gi, "") }} />
                  )}
                </div>
                {it.link && (
                  <a
                    href={it.link} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-muted shrink-0"
                    title="Open"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
