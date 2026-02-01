import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar } from "lucide-react";

export type NewsCategory = 
  | "Regulatory Updates" 
  | "Sanctions & Enforcement" 
  | "AML & Financial Crime" 
  | "GCC Regulatory Updates";

export type TrustTier = "A" | "B" | "C";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: NewsCategory;
  tags: string[];
  summary: string;
  trustTier: TrustTier;
}

// Internal linking strategy based on category
const categoryLinks: Record<NewsCategory, { label: string; href: string }[]> = {
  "Regulatory Updates": [
    { label: "WorldAML API", href: "/api" },
    { label: "Industries", href: "/industries" },
  ],
  "Sanctions & Enforcement": [
    { label: "AML Screening", href: "/api" },
    { label: "Industries", href: "/industries" },
  ],
  "AML & Financial Crime": [
    { label: "Ongoing Monitoring", href: "/api" },
    { label: "Industries", href: "/industries" },
  ],
  "GCC Regulatory Updates": [
    { label: "Industries", href: "/industries" },
    { label: "WorldAML API", href: "/api" },
  ],
};

const categoryColors: Record<NewsCategory, string> = {
  "Regulatory Updates": "bg-blue-100 text-blue-800 border-blue-200",
  "Sanctions & Enforcement": "bg-red-100 text-red-800 border-red-200",
  "AML & Financial Crime": "bg-amber-100 text-amber-800 border-amber-200",
  "GCC Regulatory Updates": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

interface NewsCardProps {
  item: NewsItem;
}

export const NewsCard = ({ item }: NewsCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const relatedLinks = categoryLinks[item.category];

  return (
    <article className="bg-card border border-divider rounded-lg p-6 hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <Badge 
          variant="outline" 
          className={`text-xs font-medium ${categoryColors[item.category]}`}
        >
          {item.category}
        </Badge>
        <div className="flex items-center gap-1 text-text-tertiary text-caption">
          <Calendar className="w-3 h-3" />
          <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-body font-semibold text-navy mb-2 line-clamp-2">
        {item.title}
      </h3>

      {/* Summary */}
      <p className="text-body-sm text-text-secondary mb-4 line-clamp-2">
        {item.summary}
      </p>

      {/* Source */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-caption text-text-tertiary">Source:</span>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
        >
          {item.source}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Related Links */}
      <div className="pt-4 border-t border-divider">
        <span className="text-caption text-text-tertiary">Related: </span>
        {relatedLinks.map((link, index) => (
          <span key={link.href}>
            <Link
              to={link.href}
              className="text-caption text-primary hover:text-primary/80 transition-colors"
            >
              {link.label}
            </Link>
            {index < relatedLinks.length - 1 && (
              <span className="text-text-tertiary"> • </span>
            )}
          </span>
        ))}
      </div>
    </article>
  );
};

export default NewsCard;
