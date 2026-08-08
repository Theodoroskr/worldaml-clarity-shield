import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  PlusCircle,
  DollarSign,
  Wallet,
  ImageIcon,
  Boxes,
  UserCircle,
  Settings,
  ArrowLeft,
  Handshake,
  LifeBuoy,
  Contact as ContactIcon,
  Award,

} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; path: string; icon: any; end?: boolean };

const GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: "Overview",
    items: [{ label: "Dashboard", path: "/partner/dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    group: "Opportunities",
    items: [
      { label: "My Deals", path: "/partner/deals", icon: Briefcase, end: true },
      { label: "Register a Deal", path: "/partner/deals/new", icon: PlusCircle },
      { label: "Referrals", path: "/partner/referrals", icon: Users },
    ],
  },
  {
    group: "Partner Enablement",
    items: [
      { label: "Products & Solutions", path: "/partner/products", icon: Boxes },
      { label: "Resources & Materials", path: "/partner/assets", icon: ImageIcon },
      { label: "Certification", path: "/partner/certification", icon: Award },
    ],

  },
  {
    group: "Earnings",
    items: [
      { label: "Commissions", path: "/partner/commissions", icon: DollarSign, end: true },
      { label: "Payouts", path: "/partner/payouts", icon: Wallet },
    ],
  },
  {
    group: "Support",
    items: [{ label: "Partner Manager", path: "/partner/manager", icon: LifeBuoy }],
  },
  {
    group: "Account",
    items: [
      { label: "Company Profile", path: "/partner/profile", icon: UserCircle },
      { label: "Team Contacts", path: "/partner/contacts", icon: ContactIcon },
      { label: "Settings", path: "/partner/settings", icon: Settings },
    ],
  },
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

      <nav className="flex-1 p-2 space-y-3 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g.group}>
            <div className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {g.group}
            </div>
            <div className="space-y-0.5">
              {g.items.map((n) => {
                const active = n.end
                  ? location.pathname === n.path
                  : location.pathname.startsWith(n.path);
                return (
                  <NavLink
                    key={n.path}
                    to={n.path}
                    end={n.end}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-colors",
                      active
                        ? "bg-teal/10 text-teal font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <n.icon className="w-4 h-4 shrink-0" />
                    {n.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> WorldAML Academy
        </button>
      </div>
    </aside>
  );
}
