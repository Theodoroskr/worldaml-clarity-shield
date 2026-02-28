import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import type { BestPractice, BestPracticeCategory } from "@/data/bestPractices";

const categoryColors: Record<BestPracticeCategory, string> = {
  "KYC/KYB": "bg-blue-100 text-blue-800 border-blue-200",
  "Sanctions Screening": "bg-red-100 text-red-800 border-red-200",
  "Ongoing Monitoring": "bg-amber-100 text-amber-800 border-amber-200",
  "Risk Assessment": "bg-violet-100 text-violet-800 border-violet-200",
  "Governance & Audit": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const institutionTypeColors: Record<string, string> = {
  "Global Standard-Setter": "bg-primary/10 text-primary",
  "Banking Supervisor": "bg-sky-100 text-sky-700",
  "Industry Association": "bg-indigo-100 text-indigo-700",
  "EU Regulation": "bg-blue-100 text-blue-700",
  "UK Regulator": "bg-rose-100 text-rose-700",
  "US Regulator": "bg-orange-100 text-orange-700",
  "GCC Regulator": "bg-teal-100 text-teal-700",
  "Global Bank": "bg-zinc-100 text-zinc-700",
  "International Body": "bg-purple-100 text-purple-700",
};

interface BestPracticeCardProps {
  item: BestPractice;
}

export const BestPracticeCard = ({ item }: BestPracticeCardProps) => {
  return (
    <article className="bg-card border border-divider rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all flex flex-col">
      {/* Category & Institution type */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <Badge
          variant="outline"
          className={`text-xs font-medium shrink-0 ${categoryColors[item.category]}`}
        >
          {item.category}
        </Badge>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
            institutionTypeColors[item.institutionType] ?? "bg-secondary text-text-secondary"
          }`}
        >
          {item.institutionType}
        </span>
      </div>

      {/* Institution name */}
      <p className="text-caption font-bold text-primary uppercase tracking-wider mb-1">
        {item.institution}
      </p>

      {/* Title */}
      <h3 className="text-body font-semibold text-navy mb-3 leading-snug">
        {item.title}
      </h3>

      {/* Summary */}
      <p className="text-body-sm text-text-secondary mb-4 leading-relaxed">
        {item.summary}
      </p>

      {/* Key Principles */}
      <ul className="space-y-2 mb-6 flex-1">
        {item.principles.map((principle, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-body-sm text-text-secondary">{principle}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="pt-4 border-t border-divider flex items-center justify-between gap-3 mt-auto">
        <Link
          to={item.relatedFeature.href}
          className="text-body-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
        >
          {item.relatedFeature.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption text-text-tertiary hover:text-text-secondary inline-flex items-center gap-1 transition-colors"
        >
          Source
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
};

export default BestPracticeCard;
