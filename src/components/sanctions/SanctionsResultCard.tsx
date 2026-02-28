import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, Globe, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface SanctionsResult {
  id: string;
  name: string;
  aliases: string[];
  entity_type: string;
  nationality: string;
  list_source: string;
  list_updated: string;
  designation_date: string;
  programs: string[];
  match_score: number;
  matched_on: string;
  confidence: "Exact" | "High" | "Possible";
}

const confidenceConfig = {
  Exact: { className: "bg-destructive/10 text-destructive border-destructive/20", label: "Exact Match" },
  High:  { className: "bg-orange-100 text-orange-700 border-orange-200", label: "High Confidence" },
  Possible: { className: "bg-amber-50 text-amber-700 border-amber-200", label: "Possible Match" },
};

const sourceColors: Record<string, string> = {
  "OFAC SDN": "bg-blue-50 text-blue-700 border-blue-200",
  "EU Consolidated List": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "UN Security Council": "bg-violet-50 text-violet-700 border-violet-200",
  "HMT Asset Freeze": "bg-sky-50 text-sky-700 border-sky-200",
};

interface Props {
  result: SanctionsResult;
  index: number;
}

export const SanctionsResultCard = ({ result, index }: Props) => {
  const conf = confidenceConfig[result.confidence];
  const srcColor = sourceColors[result.list_source] ?? "bg-muted text-muted-foreground border-border";

  return (
    <div className={cn(
      "border rounded-xl p-5 space-y-4 bg-card",
      result.confidence === "Exact" && "border-destructive/30 bg-destructive/5",
      result.confidence === "High" && "border-orange-200",
      result.confidence === "Possible" && "border-amber-100",
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Shield className={cn("w-4 h-4 flex-shrink-0", result.confidence === "Exact" ? "text-destructive" : "text-orange-500")} />
          <span className="font-semibold text-foreground text-body">{result.name}</span>
          {result.entity_type && (
            <span className="text-body-sm text-muted-foreground capitalize">({result.entity_type})</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn("text-xs font-medium border", conf.className)}>
            {conf.label}
          </Badge>
          <Badge variant="outline" className={cn("text-xs font-medium border", srcColor)}>
            {result.list_source}
          </Badge>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid sm:grid-cols-2 gap-3 text-body-sm">
        {result.nationality && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Nationality: <strong className="text-foreground">{result.nationality}</strong></span>
          </div>
        )}
        {result.designation_date && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Designated: <strong className="text-foreground">{result.designation_date}</strong></span>
          </div>
        )}
        {result.programs?.length > 0 && (
          <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
            <Tag className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Programs: <strong className="text-foreground">{result.programs.join(", ")}</strong></span>
          </div>
        )}
        {result.aliases?.length > 0 && (
          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-xs mb-1.5">Also known as:</p>
            <div className="flex flex-wrap gap-1.5">
              {result.aliases.slice(0, 6).map((alias) => (
                <span key={alias} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                  {alias}
                </span>
              ))}
              {result.aliases.length > 6 && (
                <span className="px-2 py-0.5 text-xs text-muted-foreground">+{result.aliases.length - 6} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          List last updated: {result.list_updated}
        </span>
        <span className="text-xs text-muted-foreground">
          Score: {Math.round(result.match_score * 100)}%
        </span>
      </div>
    </div>
  );
};
