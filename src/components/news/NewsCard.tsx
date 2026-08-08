import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, ChevronDown, ChevronUp } from "lucide-react";

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
  /** Untruncated update text, revealed by the "Show more" control when longer than the summary. */
  fullSummary?: string;
  trustTier: TrustTier;
}

// Internal linking strategy based on category.
// `href: null` renders the label as plain, unclickable text.
const categoryLinks: Record<NewsCategory, { label: string; href: string | null }[]> = {
  "Regulatory Updates": [
    { label: "WorldAML API", href: "/api" },
    { label: "Industries", href: "/industries" },
  ],
  "Sanctions & Enforcement": [
    { label: "AML Screening", href: "/api" },
    { label: "Industries", href: "/industries" },
  ],
  "AML & Financial Crime": [
    { label: "Ongoing Monitoring", href: null },
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

const PREVIEW_LENGTH = 220;

/** Cut at a word boundary so the preview never ends mid-word. */
function previewOf(text: string): string {
  if (text.length <= PREVIEW_LENGTH) return text;
  const window = text.slice(0, PREVIEW_LENGTH);
  const wordEnd = window.lastIndexOf(" ");
  return `${(wordEnd > 0 ? window.slice(0, wordEnd) : window).replace(/[,;:.\-–—]+$/, "").trim()}…`;
}

export const NewsCard = ({ item }: NewsCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const relatedLinks = categoryLinks[item.category];

  const fullText = item.fullSummary && item.fullSummary.length > item.summary.length
    ? item.fullSummary
    : item.summary;
  const preview = previewOf(fullText);
  const isLong = fullText.length > preview.length;

  return (
    <article className="bg-card border border-divider rounded-lg p-6 hover:border-primary/30 transition-colors flex flex-col h-full">
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

      {/* Title — shown in full, never clipped */}
      <h3 className="text-body font-semibold text-navy mb-2">
        {item.title}
      </h3>

      {/* Summary — long updates collapse behind a "Show more" control */}
      <div className="mb-4 flex-1">
        <p className="text-body-sm text-text-secondary whitespace-pre-line">
          {expanded ? fullText : preview}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="mt-2 inline-flex items-center gap-1 text-caption font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {expanded ? "Show less" : "Show more"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>


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
      <div className="pt-4 border-t border-divider mt-auto">
        <span className="text-caption text-text-tertiary">Related: </span>
        {relatedLinks.map((link, index) => (
          <span key={link.label}>
            {link.href ? (
              <Link
                to={link.href}
                className="text-caption text-primary hover:text-primary/80 transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <span className="text-caption text-text-secondary">{link.label}</span>
            )}
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
