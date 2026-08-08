import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DateRange, PORTAL_LABELS, PortalKey, RANGE_LABELS, RangeKey,
} from "@/lib/adminAnalytics";

interface Props {
  rangeKey: RangeKey;
  onRangeKey: (k: RangeKey) => void;
  custom: DateRange;
  onCustom: (r: DateRange) => void;
  portal: PortalKey;
  onPortal: (p: PortalKey) => void;
  onRefresh: () => void;
  refreshing?: boolean;
  onDownload?: () => void;
  lastUpdated?: string | null;
}

export default function AdminFilters({
  rangeKey, onRangeKey, custom, onCustom, portal, onPortal,
  onRefresh, refreshing, onDownload, lastUpdated,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={rangeKey} onValueChange={(v) => onRangeKey(v as RangeKey)}>
        <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
        <SelectContent className="bg-popover z-50">
          {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
            <SelectItem key={k} value={k}>{RANGE_LABELS[k]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {rangeKey === "custom" && (
        <div className="flex items-center gap-1">
          {(["from", "to"] as const).map((field) => (
            <Popover key={field}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 font-normal")}>
                  <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                  {format(custom[field], "d MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                <Calendar
                  mode="single"
                  selected={custom[field]}
                  onSelect={(d) => d && onCustom({ ...custom, [field]: d })}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          ))}
        </div>
      )}

      <Select value={portal} onValueChange={(v) => onPortal(v as PortalKey)}>
        <SelectTrigger className="w-[170px] h-9"><SelectValue /></SelectTrigger>
        <SelectContent className="bg-popover z-50">
          {(Object.keys(PORTAL_LABELS) as PortalKey[]).map((k) => (
            <SelectItem key={k} value={k}>{PORTAL_LABELS[k]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" className="h-9" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
        Refresh
      </Button>

      {onDownload && (
        <Button variant="outline" size="sm" className="h-9" onClick={onDownload}>
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      )}

      {lastUpdated && (
        <span className="text-[11px] text-muted-foreground ml-1">
          Last updated {format(new Date(lastUpdated), "HH:mm")} · cached up to 1 min
        </span>
      )}
    </div>
  );
}
