import { RefreshCw, Radio } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  /** When the currently displayed data was fetched. */
  updatedAt?: Date | number | null;
  /** True only when the figures come from a realtime subscription. */
  live?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Honest freshness indicator. Cached/aggregated figures show the time they were
 * fetched; only genuinely subscribed data is labelled "Live".
 */
export default function DataFreshness({ updatedAt, live, refreshing, onRefresh, className }: Props) {
  const stamp = updatedAt ? new Date(updatedAt) : null;
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      {live ? (
        <span className="inline-flex items-center gap-1 text-teal font-medium">
          <Radio className="h-3.5 w-3.5" /> Live
        </span>
      ) : (
        <span>Last updated: {stamp ? format(stamp, "HH:mm") : "—"}</span>
      )}
      {onRefresh && (
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          <span className="ml-1">Refresh</span>
        </Button>
      )}
    </div>
  );
}
