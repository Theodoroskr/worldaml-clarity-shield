import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Loader2, Building2, LayoutDashboard, Compass, Boxes, GraduationCap, Users,
  Building, CreditCard, LifeBuoy, UserCircle, ShieldCheck, ArrowLeft, ChevronDown, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessAccount } from "@/hooks/useBusinessAccount";
import { usePortalAccess } from "@/hooks/usePortalAccess";
import { supabase } from "@/integrations/supabase/client";
import { PENDING_BUSINESS_KEY } from "@/pages/business/BusinessSignup";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_GROUPS: { label: string; items: { label: string; path: string; icon: typeof Building2; end?: boolean }[] }[] = [
  { label: "Overview", items: [{ label: "Dashboard", path: "/business/dashboard", icon: LayoutDashboard }] },
  {
    label: "Solutions",
    items: [
      { label: "Explore Solutions", path: "/business/solutions", icon: Compass },
      { label: "My Products", path: "/business/products", icon: Boxes },
    ],
  },
  { label: "Academy for Business", items: [{ label: "Training & Academy", path: "/business/training", icon: GraduationCap }] },
  {
    label: "Organisation",
    items: [
      { label: "Team", path: "/business/team", icon: Users },
      { label: "Company Profile", path: "/business/company", icon: Building },
    ],
  },
  { label: "Billing", items: [{ label: "Plans & Billing", path: "/business/billing", icon: CreditCard }] },
  { label: "Support", items: [{ label: "Help & Support", path: "/business/support", icon: LifeBuoy }] },
  {
    label: "Account",
    items: [
      { label: "My Profile", path: "/business/profile", icon: UserCircle },
      { label: "Security", path: "/business/security", icon: ShieldCheck },
    ],
  },
];

export default function BusinessLayout() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { account, isLoading, refetch } = useBusinessAccount();
  const { academyAccess, partnerAccess } = usePortalAccess();
  const location = useLocation();
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState(false);

  // Finish sign-up for buyers who confirmed their email after registering.
  useEffect(() => {
    if (!user || isLoading || account || claiming) return;
    const pending = localStorage.getItem(PENDING_BUSINESS_KEY);
    if (!pending) return;
    setClaiming(true);
    (async () => {
      try {
        const payload = JSON.parse(pending);
        await supabase.from("business_accounts").insert({ ...payload, user_id: user.id });
        localStorage.removeItem(PENDING_BUSINESS_KEY);
        try {
          await supabase.functions.invoke("send-business-welcome", {
            body: { company_name: payload.company_name, contact_name: payload.contact_name },
          });
        } catch (e) {
          console.warn("Welcome email failed (non-blocking):", e);
        }
        await refetch();
      } finally {
        setClaiming(false);
      }
    })();
  }, [user, isLoading, account, claiming, refetch]);

  if (authLoading || isLoading || claiming) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/business/login?next=${next}`} replace />;
  }

  if (!account) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/business/signup?next=${next}`} replace />;
  }

  const initials = (account.contact_name || account.company_name || "?")
    .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen flex bg-muted/40">
      <SEO title="Business Portal" description="Manage your WorldAML solutions, team and account." noindex />

      <aside className="w-64 bg-navy text-primary-foreground flex flex-col shrink-0 border-r border-navy/40">
        <div className="px-5 py-4 border-b border-primary-foreground/10">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal" />
            <span className="font-bold text-sm tracking-tight">WorldAML Business</span>
          </div>
          <p className="mt-1 text-xs text-primary-foreground/60 truncate">{account.company_name}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/40">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((n) => (
                  <NavLink
                    key={n.path}
                    to={n.path}
                    className={({ isActive }) => cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-teal/15 text-teal font-medium"
                        : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                    )}
                  >
                    <n.icon className="w-4 h-4" />
                    {n.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-2 border-t border-primary-foreground/10">
          <NavLink to="/" className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to worldaml.com
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b border-border flex items-center justify-end gap-2 px-6 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate("/business/support")}>
            <LifeBuoy className="w-4 h-4 mr-1.5" /> Support
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border px-2 py-1 hover:bg-muted transition-colors">
                <span className="w-7 h-7 rounded-full bg-navy text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  {initials}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="truncate">
                <span className="block text-sm">{account.contact_name || user.email}</span>
                <span className="block text-xs font-normal text-muted-foreground truncate">{account.company_name}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/business/profile")}>My Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/business/security")}>Security</DropdownMenuItem>
              {(academyAccess || partnerAccess) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Switch Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/business/dashboard")}>
                    <Building2 className="w-4 h-4 mr-2 text-teal" /> Business — {account.company_name}
                  </DropdownMenuItem>
                  {academyAccess && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <GraduationCap className="w-4 h-4 mr-2 opacity-60" /> WorldAML Academy
                    </DropdownMenuItem>
                  )}
                  {partnerAccess && (
                    <DropdownMenuItem onClick={() => navigate("/partner/dashboard")}>
                      <Users className="w-4 h-4 mr-2 opacity-60" /> Partner Portal
                    </DropdownMenuItem>
                  )}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => { await signOut(); navigate("/business/login"); }}>
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
