import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, BookOpen, Award, Library,
  User, CreditCard, LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { academyHref } from "@/lib/academyHost";

export interface NavEntry {
  label: string;
  to: string;
  icon: any;
  /** external = full page navigation (different host or non-shell route) */
  external?: boolean;
}
export interface NavGroup {
  label: string;
  items: NavEntry[];
}

/**
 * Academy learner navigation ONLY.
 * Admin, WorldAML Suite, RCM and partner surfaces are intentionally absent —
 * those live in their own layouts and must never appear here.
 */
export function useAppNav(): NavGroup[] {
  return [
    { label: "", items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }] },
    {
      label: "My Learning",
      items: [
        { label: "My Courses", to: "/my-learning", icon: GraduationCap },
        { label: "Browse Courses", to: academyHref("/academy"), icon: BookOpen, external: true },
        { label: "Certificates", to: "/certificates", icon: Award },
      ],
    },
    {
      label: "Resources",
      items: [
        { label: "Compliance Resources", to: "/resources/best-practices", icon: Library, external: true },
        { label: "Templates & Toolkit", to: academyHref("/academy/templates"), icon: BookOpen, external: true },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Profile", to: "/account/profile", icon: User },
        { label: "Subscription & Billing", to: "/account/billing", icon: CreditCard },
        { label: "Help & Support", to: "/support", icon: LifeBuoy, external: true },
      ],
    },
  ];
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
      {groups.map((group, gi) => (
        <div key={group.label || `g${gi}`} className="space-y-0.5">
          {!collapsed && group.label && (
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
              <a key={`${gi}-${item.label}`} href={item.to} className={classes} title={item.label} onClick={onNavigate}>
                {content}
              </a>
            ) : (
              <NavLink key={`${gi}-${item.label}`} to={item.to} className={classes} title={item.label} onClick={onNavigate}>
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
    <a href={academyHref("/academy")} className="flex h-14 items-center gap-2 border-b border-border px-4 shrink-0">
      {collapsed ? <Logo size="sm" iconOnly /> : <Logo size="sm" />}
    </a>
  );
}
