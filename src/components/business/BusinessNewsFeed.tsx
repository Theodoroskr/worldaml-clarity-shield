import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Newspaper, BookOpen, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { blogPosts } from "@/data/blogPosts";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/** Regulatory news + WorldAML insights, surfaced inside the business portal. */
export function BusinessNewsFeed() {
  const { items, isLoading, isLive } = useRSSFeeds();
  const news = items.slice(0, 5);
  const insights = [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <section className="grid lg:grid-cols-2 gap-4">
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-teal" /> Regulatory & sanctions news
            </CardTitle>
            {isLive && (
              <Badge variant="outline" className="border-teal/30 bg-teal/10 text-teal text-[10px] gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> Live
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Sourced from public regulators and authorities.</p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ul className="divide-y divide-border/70 flex-1">
            {isLoading && news.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground">Loading latest updates…</li>
            )}
            {news.map((n) => (
              <li key={n.id} className="py-2.5 first:pt-0">
                <a
                  href={n.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <p className="text-sm font-medium text-foreground group-hover:text-teal transition-colors line-clamp-2">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {n.source} · {fmt(n.publishedAt)} · {n.category}
                  </p>
                </a>
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" size="sm" className="mt-3 self-start">
            <Link to="/business/resources">All news &amp; resources <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal" /> WorldAML insights
          </CardTitle>
          <p className="text-xs text-muted-foreground">Practical guidance from our compliance team.</p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ul className="divide-y divide-border/70 flex-1">
            {insights.map((p) => (
              <li key={p.slug} className="py-2.5 first:pt-0">
                <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="group block">
                  <p className="text-sm font-medium text-foreground group-hover:text-teal transition-colors line-clamp-2">
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {p.category} · {p.readTime} min read
                  </p>
                </a>
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" size="sm" className="mt-3 self-start">
            <a href="/blog" target="_blank" rel="noopener noreferrer">
              Read the blog <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
