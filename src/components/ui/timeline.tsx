import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail?: string;
  icon?: LucideIcon;
  type?: "screening" | "case" | "document" | "status" | "review" | "system";
  before?: string;
  after?: string;
}

const typeColors: Record<string, string> = {
  screening: "bg-purple-100 text-purple-700 border-purple-200",
  case: "bg-red-100 text-red-700 border-red-200",
  document: "bg-blue-100 text-blue-700 border-blue-200",
  status: "bg-amber-100 text-amber-700 border-amber-200",
  review: "bg-emerald-100 text-emerald-700 border-emerald-200",
  system: "bg-muted text-muted-foreground border-border",
};

const typeDot: Record<string, string> = {
  screening: "bg-purple-500",
  case: "bg-red-500",
  document: "bg-blue-500",
  status: "bg-amber-500",
  review: "bg-emerald-500",
  system: "bg-muted-foreground",
};

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-0", className)}>
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-3 group">
          <div className="flex flex-col items-center shrink-0 w-6">
            <div className={cn("w-2.5 h-2.5 rounded-full border-2 border-card mt-1 shrink-0 z-10", typeDot[event.type ?? "system"])} />
            {i < events.length - 1 && (
              <div className="w-px flex-1 bg-border min-h-[24px]" />
            )}
          </div>
          <div className="pb-4 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">{event.action}</span>
                {event.type && (
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium", typeColors[event.type])}>
                    {event.type}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-mono shrink-0">{event.timestamp}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              by <span className="font-medium text-foreground">{event.actor}</span>
              {event.detail && <> — {event.detail}</>}
            </div>
            {(event.before || event.after) && (
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                {event.before && <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 line-through">{event.before}</span>}
                {event.before && event.after && <span className="text-muted-foreground">→</span>}
                {event.after && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{event.after}</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
