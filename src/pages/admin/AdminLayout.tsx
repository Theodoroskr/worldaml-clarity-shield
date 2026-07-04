import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users, FileText, GitBranch, CreditCard, ArrowLeft, Shield, Bell, Building2, ScrollText, Landmark, ShieldCheck, RefreshCw, Receipt, Handshake, Globe, GraduationCap, TrendingUp, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; path: string; icon: any; section?: string };

const NAV: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Shield, section: "Platform" },
  { label: "Users", path: "/admin/users", icon: Users, section: "Platform" },
  { label: "Organizations", path: "/admin/organizations", icon: Building2, section: "Platform" },
  { label: "Domains", path: "/admin/domains", icon: Globe, section: "Platform" },
  { label: "Partners", path: "/admin/partners", icon: Handshake, section: "Platform" },
  { label: "Alert Rules", path: "/admin/alert-rules", icon: Bell, section: "Platform" },
  { label: "Forms", path: "/admin/forms", icon: FileText, section: "Platform" },
  { label: "Workflows", path: "/admin/workflows", icon: GitBranch, section: "Platform" },
  { label: "Pricing", path: "/admin/pricing", icon: CreditCard, section: "Platform" },
  { label: "Audit Log", path: "/admin/audit-log", icon: ScrollText, section: "Platform" },
  { label: "Regulatory Hub", path: "/admin/regulatory", icon: Landmark, section: "Platform" },
  { label: "Security Audit", path: "/admin/security", icon: ShieldCheck, section: "Platform" },
  { label: "Outreach Queue", path: "/admin/outreach-queue", icon: Send, section: "Platform" },

  { label: "Academy Signups", path: "/admin/academy-users", icon: GraduationCap, section: "Academy" },
  { label: "Funnel Metrics", path: "/admin/academy-funnel", icon: TrendingUp, section: "Academy" },
  { label: "Purchase Status", path: "/admin/purchase-status", icon: Receipt, section: "Academy" },
  { label: "Reconcile Purchases", path: "/admin/reconcile-purchases", icon: RefreshCw, section: "Academy" },
];


export default function AdminLayout() {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
    if (!isLoading && user && !isAdmin) navigate("/dashboard");
  }, [user, isLoading, isAdmin, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

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
                  {n.label}
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
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
