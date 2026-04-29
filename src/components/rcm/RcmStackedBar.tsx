import { cn } from "@/lib/utils";

export type StackSegment = {
  key: string;
  label: string;
  count: number;
  className: string;
};

export function RcmStackedBar({ segments }: { segments: StackSegment[] }) {
  const total = segments.reduce((s, x) => s + x.count, 0);
  return (
    <div className="space-y-3">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted flex">
        {total === 0 ? (
          <div className="w-full bg-muted" />
        ) : (
          segments.map((seg) =>
            seg.count > 0 ? (
              <div
                key={seg.key}
                className={cn("h-full", seg.className)}
                style={{ width: `${(seg.count / total) * 100}%` }}
                title={`${seg.label}: ${seg.count}`}
              />
            ) : null
          )
        )}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {segments.map((seg) => (
          <li key={seg.key} className="flex items-center gap-2 min-w-0">
            <span className={cn("h-2.5 w-2.5 rounded-sm shrink-0", seg.className)} />
            <span className="text-muted-foreground truncate">{seg.label}</span>
            <span className="ms-auto font-medium tabular-nums">{seg.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
