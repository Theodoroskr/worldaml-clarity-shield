import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, BookOpen, Award, Search, Library,
  User, CreditCard, LifeBuoy, ShieldCheck, Building2, Landmark, Handshake,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { academyHref } from "@/lib/academyHost";
import { useEntitlements } from "@/hooks/useEntitlements";

export interface NavEntry {
  label: string;
  to: string;
  icon: any;
  /** external = full page navigation (different host or legacy app area) */
  external?: boolean;
}
export interface NavGroup {
  label: string;
  items: NavEntry[];
}

export function useAppNav(): NavGroup[] {
  const { hasSuite, hasRcm, hasPartnerPortal, isAdmin } = useEntitlements();

  const groups: NavGroup[] = [
    { label: "Home", items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }] },
  ];

  if (hasSuite) {
    groups.push({
      label: "Compliance",
      items: [
        { label: "Suite Workspace", to: "/suite", icon: Building2, external: true },
        { label: "Screening", to: "/suite/screening", icon: ShieldCheck, external: true },
        { label: "Alerts", to: "/suite/alerts", icon: Landmark, external: true },
        { label: "Case Queue", to: "/suite/case-queue", icon: Library, external: true },
      ],
    });
  }

  if (hasRcm) {
    groups.push({
      label: "Regulatory (RCM)",
      items: [
        { label: "RCM Dashboard", to: "/rcm", icon: Landmark, external: true },
        { label: "Obligations", to: "/rcm/obligations", icon: Library, external: true },
      ],
    });
  }

  groups.push({
    label: "My Learning",
    items: [
      { label: "Continue Learning", to: "/my-learning", icon: PlayCircle },
      { label: "My Courses", to: "/my-learning", icon: GraduationCap },
      { label: "Browse Courses", to: academyHref("/academy"), icon: BookOpen, external: true },
      { label: "Certificates", to: "/certificates", icon: Award },
    ],
  });

  groups.push({
    label: "Tools",
    items: [{ label: "Sanctions Quick Check", to: "/sanctions-check", icon: Search, external: true }],
  });

  groups.push({
    label: "Resources",
    items: [
      { label: "Compliance Resources", to: "/resources/best-practices", icon: Library, external: true },
    ],
  });

  if (hasPartnerPortal) {
    groups.push({
      label: "Partner",
      items: [{ label: "Partner Portal", to: "/partner-portal", icon: Handshake, external: true }],
    });
  }

  const account: NavEntry[] = [
    { label: "Profile", to: "/account/profile", icon: User },
    { label: "Subscription & Billing", to: "/account/billing", icon: CreditCard },
    { label: "Help & Support", to: "/support", icon: LifeBuoy, external: true },
  ];
  if (isAdmin) account.push({ label: "Admin Panel", to: "/admin/dashboard", icon: ShieldCheck, external: true });
  groups.push({ label: "Account", items: account });

  return groups;
}

interface Props {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function AppSidebarNav({ collapsed = false, onNavigate }: Props) {
  const groups = useAppNav();
  const { pathname } = useLocation();

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
      {groups.map((group) => (
        <div key={group.label} className="space-y-0.5">
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </div>
          )}
          {group.items.map((item) => {
            const active = !item.external && pathname === item.to;
            const classes = cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "bg-accent/10 text-accent font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            );
            const content = (
              <>
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            );
            return item.external ? (
              <a key={`${group.label}-${item.label}`} href={item.to} className={classes} title={item.label} onClick={onNavigate}>
                {content}
              </a>
            ) : (
              <NavLink key={`${group.label}-${item.label}`} to={item.to} className={classes} title={item.label} onClick={onNavigate}>
                {content}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function SidebarBrand({ collapsed }: { collapsed?: boolean }) {
  return (
    <a href="/" className="flex h-14 items-center gap-2 border-b border-border px-4 shrink-0">
      {collapsed ? <Logo size="sm" iconOnly /> : <Logo size="sm" />}
    </a>
  );
}
