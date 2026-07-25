import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, ClipboardList, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { usePortalSession } from "@/hooks/usePortalSession";
import { cn } from "@/lib/utils";

export default function CustomerPortalLayout() {
  const s = usePortalSession();
  const nav = useNavigate();

  const links = [
    { to: "/portal", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/portal/documents", label: "Documents", icon: FileText },
    { to: "/portal/activity", label: "Activity", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/portal" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-5 h-5 text-accent" />
            Compliance Portal
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {s.customerName ?? s.email}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => { await supabase.auth.signOut(); nav("/portal/login"); }}
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => cn(
                "px-3 py-2 text-sm border-b-2 -mb-px flex items-center gap-1.5",
                isActive ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <l.icon className="w-4 h-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
