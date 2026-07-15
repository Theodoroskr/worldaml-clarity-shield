import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  ImageIcon,
  UserCircle,
  Settings,
  ArrowLeft,
  Handshake,
  Contact as ContactIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", path: "/partner-portal", icon: LayoutDashboard, end: true },
  { label: "Referrals", path: "/partner-portal/referrals", icon: Users },
  { label: "Deals", path: "/partner-portal/deals", icon: Briefcase },
  { label: "Commissions", path: "/partner-portal/commissions", icon: DollarSign },
  { label: "Marketing Assets", path: "/partner-portal/assets", icon: ImageIcon },
  { label: "Contacts", path: "/partner-portal/contacts", icon: ContactIcon },
  { label: "Profile", path: "/partner-portal/profile", icon: UserCircle },
  { label: "Settings", path: "/partner-portal/settings", icon: Settings },
];

export default function PortalSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-teal/10 text-teal flex items-center justify-center">
          <Handshake className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            WorldAML
          </div>
          <div className="text-sm font-bold text-foreground">Partner Portal</div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV.map((n) => {
          const active = n.end
            ? location.pathname === n.path
            : location.pathname.startsWith(n.path);
          return (
            <NavLink
              key={n.path}
              to={n.path}
              end={n.end}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-teal/10 text-teal font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>
    </aside>
  );
}
