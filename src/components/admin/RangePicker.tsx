import { CalendarRange } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RANGE_OPTIONS, type RangeKey } from "@/lib/academyAdmin";

/** Consistent date-range control shared by the Academy admin pages. */
export function RangePicker({
  value,
  onChange,
  from,
  to,
  onFromChange,
  onToChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CalendarRange className="w-3.5 h-3.5 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as RangeKey)}>
        <SelectTrigger className="w-44 h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="h-9 px-2 rounded-md border border-input bg-background text-sm"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="h-9 px-2 rounded-md border border-input bg-background text-sm"
          />
        </div>
      )}
    </div>
  );
}
