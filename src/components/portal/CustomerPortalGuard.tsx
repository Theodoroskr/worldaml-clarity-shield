import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePortalSession } from "@/hooks/usePortalSession";
import { Loader2 } from "lucide-react";

export default function CustomerPortalGuard() {
  const s = usePortalSession();
  const loc = useLocation();

  if (s.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!s.authed) {
    return <Navigate to="/portal/login" state={{ from: loc.pathname }} replace />;
  }

  if (!s.customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold">Access not enabled</h1>
          <p className="text-sm text-muted-foreground">
            {s.error ?? "Your account isn't linked to a customer record yet. Please contact the team that invited you."}
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
