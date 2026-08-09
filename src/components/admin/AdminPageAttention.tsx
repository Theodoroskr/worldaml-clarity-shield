import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

/** Small "N items need attention" indicator shown beside an admin page title. */
export default function AdminPageAttention({ path, className }: { path: string; className?: string }) {
  const { forPath } = useAdminNotifications();
  const count = forPath(path).length;
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 align-middle",
        className,
      )}
      title={`${count} item${count === 1 ? "" : "s"} need attention`}
    >
      <AlertTriangle className="h-3 w-3" /> {count}
    </span>
  );
}
