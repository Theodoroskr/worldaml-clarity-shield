import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2, Building2, LayoutGrid, Receipt, MessageSquareQuote, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessAccount } from "@/hooks/useBusinessAccount";
import { supabase } from "@/integrations/supabase/client";
import { PENDING_BUSINESS_KEY } from "@/pages/business/BusinessSignup";
import SEO from "@/components/SEO";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Products & Pricing", path: "/business/dashboard", icon: LayoutGrid },
  { label: "Subscriptions & Invoices", path: "/business/billing", icon: Receipt },
  { label: "Quotes & Sales Requests", path: "/business/quotes", icon: MessageSquareQuote },
];

export default function BusinessLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const { account, isLoading, refetch } = useBusinessAccount();
  const location = useLocation();
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

  return (
    <div className="min-h-screen flex bg-muted/30">
      <SEO title="Business Portal" description="Manage your WorldAML products, subscriptions and quotes." noindex />
      <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-sm">Business Portal</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground truncate">{account.company_name}</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map((n) => (
            <NavLink
              key={n.path}
              to={n.path}
              className={({ isActive }) => cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <NavLink to="/" className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to worldaml.com
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
