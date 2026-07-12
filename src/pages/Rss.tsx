import { useEffect, useState } from "react";
import { Rss, Copy, Check, ExternalLink, Calendar, Clock } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FEED_URL = "https://worldaml.com/rss.xml";

interface RssMeta {
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

const readers = [
  { name: "Feedly", url: `https://feedly.com/i/subscription/feed/${encodeURIComponent(FEED_URL)}` },
  { name: "Inoreader", url: `https://www.inoreader.com/?add_feed=${encodeURIComponent(FEED_URL)}` },
  { name: "NewsBlur", url: `https://newsblur.com/?url=${encodeURIComponent(FEED_URL)}` },
  { name: "The Old Reader", url: `https://theoldreader.com/feeds/subscribe?url=${encodeURIComponent(FEED_URL)}` },
];

function formatReleaseDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatReleaseUtc(iso: string): string {
  const d = new Date(iso);
  return d.toUTCString();
}

const RssPage = () => {
  const [copied, setCopied] = useState(false);
  const [meta, setMeta] = useState<RssMeta | null>(null);

  useEffect(() => {
    fetch("/rss-meta.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setMeta(data))
      .catch(() => setMeta(null));
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(FEED_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="RSS Feed — WorldAML Compliance Insights"
        description="Subscribe to the WorldAML RSS feed for AML, KYC/KYB, sanctions and regulatory compliance analysis. Ingest into your reader, intranet, Slack, or Teams."
        canonical="/rss"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "RSS Feed", url: "/rss" },
        ]}
      />
      <Header />
      <main className="flex-1">
        <section className="bg-surface-subtle border-b border-divider py-16 md:py-20">
          <div className="container-enterprise max-w-3xl">
            <Badge variant="secondary" className="mb-4">For Compliance Teams</Badge>
            <h1 className="text-display-sm md:text-display font-bold text-navy mb-4 flex items-center gap-3">
              <Rss className="w-8 h-8 text-primary" />
              RSS Feed
            </h1>
            <p className="text-body-lg text-text-secondary">
              Ingest WorldAML's compliance insights into your reader, intranet, Slack, Microsoft Teams, or internal news digest. The feed is public, free, and updated whenever we publish new analysis.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container-enterprise max-w-3xl space-y-10">
            {/* Feed URL */}
            <div className="rounded-lg border border-divider bg-card p-6">
              <h2 className="text-lg font-semibold text-navy mb-3">Feed URL</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <code className="flex-1 px-4 py-3 rounded-md bg-surface-subtle border border-divider text-sm break-all font-mono">
                  {FEED_URL}
                </code>
                <Button onClick={copy} variant="outline" className="gap-2 shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy URL"}
                </Button>
                <Button asChild className="gap-2 shrink-0">
                  <a href="/rss.xml" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    View feed
                  </a>
                </Button>
              </div>
            <p className="text-caption text-text-tertiary mt-3">
                RSS 2.0 · UTF-8 · Includes title, description, publication date, author, and categories.
              </p>
            </div>

            {/* Next scheduled release */}
            {meta && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
                <h2 className="text-lg font-semibold text-navy mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Next scheduled release
                </h2>
                {meta.nextRelease ? (
                  <div className="space-y-2">
                    <p className="text-body text-navy">
                      <strong>{meta.nextRelease.title}</strong>
                    </p>
                    <div className="flex items-start gap-2 text-body-sm text-text-secondary">
                      <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p>{formatReleaseDate(meta.nextRelease.date)}</p>
                        <p className="text-text-tertiary">{formatReleaseUtc(meta.nextRelease.date)}</p>
                      </div>
                    </div>
                    <p className="text-caption text-text-tertiary mt-3">
                      {meta.releasedCount} of {meta.totalArticles} articles released so far. New articles appear roughly once a day.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-body text-navy">All scheduled articles are currently live.</p>
                    <p className="text-caption text-text-tertiary">
                      {meta.releasedCount} of {meta.totalArticles} articles released. The feed will update as soon as new analysis is published.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* One-click subscribe */}
            <div>
              <h2 className="text-lg font-semibold text-navy mb-4">Subscribe with one click</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {readers.map((r) => (
                  <a
                    key={r.name}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-md border border-divider bg-card hover:border-primary hover:bg-surface-subtle transition-colors text-center text-sm font-medium text-navy"
                  >
                    {r.name}
                  </a>
                ))}
              </div>
            </div>

            {/* For enterprises */}
            <div>
              <h2 className="text-lg font-semibold text-navy mb-3">For enterprises & compliance teams</h2>
              <ul className="space-y-3 text-body-sm text-text-secondary">
                <li>
                  <strong className="text-navy">Slack:</strong> add the RSS app and run{" "}
                  <code className="px-1.5 py-0.5 rounded bg-surface-subtle text-xs font-mono">/feed subscribe {FEED_URL}</code>
                  {" "}in a channel.
                </li>
                <li>
                  <strong className="text-navy">Microsoft Teams:</strong> add the RSS connector to a channel and paste the URL above.
                </li>
                <li>
                  <strong className="text-navy">Intranet / SharePoint:</strong> point any RSS/News web part at the feed URL.
                </li>
                <li>
                  <strong className="text-navy">GRC / knowledge tools:</strong> Notion, Confluence, and most reader apps support standard RSS 2.0.
                </li>
                <li>
                  <strong className="text-navy">Custom automation:</strong> Zapier, Make, and n8n all have native RSS triggers — route new posts into email digests, ticketing systems, or your compliance workspace.
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-divider bg-surface-subtle p-6 text-body-sm text-text-secondary">
              Republishing our content? Attribution to WorldAML with a link back to the original article is required. For content partnerships or a custom feed (e.g. by category or jurisdiction), <a href="/contact-sales" className="text-primary hover:underline">get in touch</a>.
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RssPage;
