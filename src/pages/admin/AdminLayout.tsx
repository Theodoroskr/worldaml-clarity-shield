import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users, FileText, GitBranch, CreditCard, ArrowLeft, Shield, Bell, Building2, Megaphone, Handshake, Globe, KeyRound, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Shield },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Organizations", path: "/admin/organizations", icon: Building2 },
  { label: "Alert Rules", path: "/admin/alert-rules", icon: Bell },
  { label: "Forms", path: "/admin/forms", icon: FileText },
  { label: "Workflows", path: "/admin/workflows", icon: GitBranch },
  { label: "Pricing", path: "/admin/pricing", icon: CreditCard },
  { label: "Leads", path: "/admin/leads", icon: Megaphone },
  { label: "Partners", path: "/admin/partners", icon: Handshake },
  { label: "Trusted Domains", path: "/admin/trusted-domains", icon: Globe },
  { label: "Suite Access", path: "/admin/suite-access", icon: KeyRound },
  { label: "Audit Log", path: "/admin/audit-log", icon: ScrollText },
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
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(n => (
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
