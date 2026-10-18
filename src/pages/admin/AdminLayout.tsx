import { useEffect } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users, FileText, GitBranch, CreditCard, ArrowLeft, Shield, Bell, Building2, ScrollText, Landmark, ShieldCheck, RefreshCw, Receipt, Handshake, Globe, GraduationCap, TrendingUp, Send, ImageIcon, Lock, BarChart3, Stethoscope, FileSearch, Briefcase, Award, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminNotificationProvider, useAdminNotifications } from "@/hooks/useAdminNotifications";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";



type NavItem = { label: string; path: string; icon: any; section?: string };

const NAV: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Shield, section: "Overview" },
  { label: "Analytics", path: "/admin/analytics", icon: TrendingUp, section: "Overview" },
  { label: "Reports", path: "/admin/reports", icon: BarChart3, section: "Overview" },
  { label: "Notifications", path: "/admin/notifications", icon: Bell, section: "Overview" },

  { label: "Organizations", path: "/admin/organizations", icon: Building2, section: "WorldAML Suite" },
  { label: "Suite Modules", path: "/admin/suite-modules", icon: ShieldCheck, section: "WorldAML Suite" },
  { label: "Screening & Monitoring", path: "/admin/screening-product", icon: ShieldCheck, section: "WorldAML Suite" },
  { label: "Profile Enrichment Audit", path: "/admin/screening-profile-audit", icon: FileSearch, section: "WorldAML Suite" },
  { label: "Alert Rules", path: "/admin/alert-rules", icon: Bell, section: "WorldAML Suite" },
  { label: "Workflows", path: "/admin/workflows", icon: GitBranch, section: "WorldAML Suite" },
  { label: "Pricing", path: "/admin/pricing", icon: CreditCard, section: "WorldAML Suite" },

  { label: "Users", path: "/admin/users", icon: Users, section: "Users & Access" },
  { label: "Clients & Access", path: "/admin/clients-access", icon: Briefcase, section: "Users & Access" },
  { label: "Identities & Profiles", path: "/admin/identities", icon: GitBranch, section: "Users & Access" },
  { label: "Internal Access", path: "/admin/internal-access", icon: Lock, section: "Users & Access" },

  { label: "Forms & Leads", path: "/admin/forms", icon: FileText, section: "Commercial & Growth" },
  { label: "Outreach Queue", path: "/admin/outreach-queue", icon: Send, section: "Commercial & Growth" },
  { label: "Business Buyers", path: "/admin/business", icon: Building2, section: "Commercial & Growth" },
  { label: "Partners", path: "/admin/partners", icon: Handshake, section: "Commercial & Growth" },
  { label: "Partner Assets", path: "/admin/partner-assets", icon: ImageIcon, section: "Commercial & Growth" },
  { label: "Domains", path: "/admin/domains", icon: Globe, section: "Commercial & Growth" },

  { label: "Academy Signups", path: "/admin/academy-users", icon: GraduationCap, section: "Academy" },
  { label: "Funnel Metrics", path: "/admin/academy-funnel", icon: TrendingUp, section: "Academy" },
  { label: "Purchase Status", path: "/admin/purchase-status", icon: Receipt, section: "Academy" },
  { label: "Reconcile Purchases", path: "/admin/reconcile-purchases", icon: RefreshCw, section: "Academy" },
  { label: "Recognition & Badges", path: "/admin/recognition", icon: Award, section: "Academy" },

  { label: "Security Audit", path: "/admin/security", icon: ShieldCheck, section: "Security & Governance" },
  { label: "Regulatory Hub", path: "/admin/regulatory", icon: Landmark, section: "Security & Governance" },
  { label: "Audit Log", path: "/admin/audit-log", icon: ScrollText, section: "Security & Governance" },
  { label: "Data Quality", path: "/admin/data-quality", icon: Stethoscope, section: "Security & Governance" },
];


function AdminShell() {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { countsByPath } = useAdminNotifications();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
    if (!isLoading && user && !isAdmin) navigate("/dashboard");
  }, [user, isLoading, isAdmin, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  // Hard route-level block: non-admins never render any admin chrome or child route.
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground text-sm">Admin Panel</span>
        </div>
        <nav className="flex-1 p-2 space-y-3 overflow-y-auto">
          {Array.from(new Set(NAV.map(n => n.section || "Main"))).map(section => (
            <div key={section} className="space-y-0.5">
              <div className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section}
              </div>
              {NAV.filter(n => (n.section || "Main") === section).map(n => (
                <button
                  key={n.path}
                  onClick={() => navigate(n.path)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname.startsWith(n.path)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <n.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{n.label}</span>
                  {(countsByPath[n.path] ?? 0) > 0 && (
                    <span
                      className={cn(
                        "min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-semibold flex items-center justify-center",
                        n.path === "/admin/security" || n.path === "/admin/purchase-status"
                          ? "bg-destructive"
                          : "bg-amber-500"
                      )}
                      title={`${countsByPath[n.path]} item${countsByPath[n.path] === 1 ? "" : "s"} need attention`}
                    >
                      {countsByPath[n.path]}
                    </span>
                  )}
                </button>
              ))}

            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <button onClick={() => navigate("/suite")} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Suite
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 shrink-0 border-b border-border bg-card flex items-center justify-end gap-1 px-4">
          <AdminNotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminNotificationProvider>
      <AdminShell />
    </AdminNotificationProvider>
  );
}
