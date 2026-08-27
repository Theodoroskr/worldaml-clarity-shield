import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Sub-navigation for the standalone WorldAML Screening & Monitoring product area.
 * Kept separate from the Platform nav — this is its own product, not a Platform module.
 */
const ITEMS = [
  { to: "/screening-monitoring", label: "Overview" },
  { to: "/screening-monitoring/pricing", label: "Pricing" },
  { to: "/sanctions-screening-api", label: "API & Docs" },
  { to: "/screening", label: "Open workspace" },
];

export default function ScreeningProductNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Screening & Monitoring"
      className="border-b border-divider bg-surface-subtle"
    >
      <div className="container-enterprise flex items-center gap-1 overflow-x-auto py-2">
        <span className="mr-3 shrink-0 text-sm font-semibold text-foreground">
          Screening &amp; Monitoring
        </span>
        {ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors",
              pathname === item.to
                ? "bg-background text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
