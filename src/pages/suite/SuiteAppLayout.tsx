import { Outlet, Navigate, Link } from "react-router-dom";
import { useAccess } from "@/hooks/useAccess";
import SuiteAppSidebar from "@/components/suite-app/SuiteAppSidebar";
import SuiteAppTopbar from "@/components/suite-app/SuiteAppTopbar";
import SEO from "@/components/SEO";
import { Lock } from "lucide-react";

export default function SuiteAppLayout() {
  const { isLoading, isAuthenticated, hasSuiteAccess, subscriptionTier } = useAccess();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasSuiteAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center space-y-5 p-8 bg-card border border-border rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Suite access required</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Your current plan is <span className="font-semibold capitalize">{subscriptionTier}</span>.
              Upgrade to access the WorldAML Compliance Suite.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              to="/pricing"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View plans
            </Link>
            <Link
              to="/contact-sales"
              className="px-5 py-2.5 border border-border text-sm text-muted-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SEO
        title="Suite"
        description="WorldAML Compliance Suite — manage onboarding, screening, alerts, and cases."
        noindex
      />
      <SuiteAppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <SuiteAppTopbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
