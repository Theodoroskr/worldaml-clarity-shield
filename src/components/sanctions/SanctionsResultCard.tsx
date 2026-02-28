import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, Globe, Tag, Building2, User, Flag, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  Exact:    { dot: "bg-destructive", label: "Exact Match",       row: "border-destructive/30 bg-destructive/[0.03]" },
  High:     { dot: "bg-orange-500",  label: "High Confidence",   row: "border-orange-200/60" },
  Possible: { dot: "bg-yellow-500",  label: "Possible Match",    row: "border-border" },
};

const sourceConfig: Record<string, { color: string; short: string }> = {
  "OFAC SDN":             { color: "bg-blue-50 text-blue-700 border-blue-200",     short: "OFAC" },
  "EU Consolidated List": { color: "bg-indigo-50 text-indigo-700 border-indigo-200", short: "EU" },
  "UN Security Council":  { color: "bg-violet-50 text-violet-700 border-violet-200", short: "UN" },
  "HMT Asset Freeze":     { color: "bg-sky-50 text-sky-700 border-sky-200",        short: "HMT" },
};

const categoryConfig: Record<string, { icon: typeof User; label: string; color: string }> = {
  individual:   { icon: User,      label: "Individual",   color: "bg-muted text-muted-foreground border-border" },
  company:      { icon: Building2, label: "Company",      color: "bg-muted text-muted-foreground border-border" },
  organization: { icon: Building2, label: "Organisation", color: "bg-muted text-muted-foreground border-border" },
  country:      { icon: Flag,      label: "Country",      color: "bg-muted text-muted-foreground border-border" },
};

interface Props {
  result: SanctionsResult;
  index: number;
  locked?: boolean;
}

export const SanctionsResultCard = ({ result, index, locked = false }: Props) => {
  const conf = confidenceConfig[result.confidence];
  const src  = sourceConfig[result.list_source] ?? { color: "bg-muted text-muted-foreground border-border", short: "Other" };
  const cat  = categoryConfig[result.entity_type?.toLowerCase()] ?? categoryConfig["organization"];
  const CatIcon = cat.icon;

  return (
    <div className={cn(
      "relative border rounded-xl overflow-hidden transition-all",
      conf.row,
      locked && "select-none"
    )}>
      {/* Locked overlay */}
      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[3px] rounded-xl px-6 text-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-navy/10 border border-navy/20">
            <Lock className="w-4 h-4 text-navy" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-body-sm">Sign up to view this result</p>
            <p className="text-xs text-muted-foreground mt-0.5">Free account · 5 searches included</p>
          </div>
          <Button size="sm" asChild>
            <Link to="/signup">Create Free Account</Link>
          </Button>
        </div>
      )}

      {/* Top bar: index + confidence */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b",
        result.confidence === "Exact" ? "bg-destructive/5 border-destructive/20" : "bg-muted/40 border-border/60"
      )}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground w-5">{String(index + 1).padStart(2, "0")}</span>
          <span className={cn("w-2 h-2 rounded-full flex-shrink-0", conf.dot)} />
          <span className="text-xs font-semibold text-foreground">{conf.label}</span>
          <span className="text-xs text-muted-foreground">· {Math.round(result.match_score * 100)}% match</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Category badge */}
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium", cat.color)}>
            <CatIcon className="w-3 h-3" />
            {cat.label}
          </span>
          {/* Source badge */}
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium", src.color)}>
            {src.short}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className={cn("p-4 space-y-3", locked && "blur-[6px] pointer-events-none")}>
        {/* Name + full source */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-2">
            <Shield className={cn(
              "w-4 h-4 flex-shrink-0 mt-0.5",
              result.confidence === "Exact" ? "text-destructive" : "text-muted-foreground"
            )} />
            <div>
              <p className="font-bold text-foreground leading-snug">{result.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{result.list_source}</p>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          {result.nationality && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <strong className="text-foreground">{result.nationality}</strong>
            </span>
          )}
          {result.designation_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Designated <strong className="text-foreground">{result.designation_date}</strong>
            </span>
          )}
          {result.programs?.length > 0 && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {result.programs.join(" · ")}
            </span>
          )}
        </div>

        {/* Aliases */}
        {result.aliases?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Also known as</p>
            <div className="flex flex-wrap gap-1.5">
              {result.aliases.slice(0, 5).map((alias) => (
                <span key={alias} className="px-2 py-0.5 bg-muted rounded-md text-xs text-foreground/70 border border-border/50">
                  {alias}
                </span>
              ))}
              {result.aliases.length > 5 && (
                <span className="px-2 py-0.5 text-xs text-muted-foreground">+{result.aliases.length - 5} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        "px-4 py-2 border-t border-border/50 flex items-center justify-between bg-muted/20",
        locked && "blur-[3px] pointer-events-none"
      )}>
        <span className="text-xs text-muted-foreground">Updated {result.list_updated}</span>
        <span className="text-xs text-muted-foreground font-mono">ID: {result.id}</span>
      </div>
    </div>
  );
};
