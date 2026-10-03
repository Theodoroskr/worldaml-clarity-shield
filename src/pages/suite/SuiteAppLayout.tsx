import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAccess } from "@/hooks/useAccess";
import { usePortalAccess } from "@/hooks/usePortalAccess";
import { useOrganisation } from "@/hooks/useOrganisation";
import SuiteAppSidebar from "@/components/suite-app/SuiteAppSidebar";
import SuiteAppTopbar from "@/components/suite-app/SuiteAppTopbar";
import SEO from "@/components/SEO";
import { Lock, Loader2 } from "lucide-react";
import { useSuiteModules } from "@/hooks/useSuiteModules";
import { useIdleSignOut } from "@/hooks/useIdleSignOut";
import { requirementFor, MODULE_LABELS } from "@/lib/suite/moduleRoutes";

export default function SuiteAppLayout() {
  const { subscriptionTier } = useAccess();
  const portal = usePortalAccess();
  const isLoading = portal.isLoading;
  const isAuthenticated = portal.signedIn;
  const hasSuiteAccess = portal.suiteAccess;
  const { org, orgId, isLoading: orgLoading, isAdmin: isOrgAdmin } = useOrganisation();
  const location = useLocation();
  const modules = useSuiteModules();
  useIdleSignOut(30);


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

  // First-run onboarding gate: send admins into the wizard until they finish it.
  const onSetup = location.pathname.startsWith("/suite/setup");
  if (!orgLoading && !onSetup) {
    const needsSetup = !orgId || (org && !(org as any).onboarding_completed_at);
    if (needsSetup) return <Navigate to="/suite/setup" replace />;
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
          {modules.isLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : modules.canOpen(location.pathname) ? (
            <Outlet />
          ) : (
            <ModuleUnavailable pathname={location.pathname} isOrgAdmin={isOrgAdmin} />
          )}
        </main>
      </div>
    </div>
  );
}

function ModuleUnavailable({ pathname, isOrgAdmin }: { pathname: string; isOrgAdmin: boolean }) {
  const req = requirementFor(pathname);
  const names = req === "core" ? "" : req.map((m) => MODULE_LABELS[m]).join(" or ");
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-md text-center space-y-4 p-8 bg-card border border-border rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Not available</h1>
        <p className="text-sm text-muted-foreground">
          {isOrgAdmin
            ? `This page needs the ${names} module. Add it or switch it on in Settings > Modules.`
            : `This page needs the ${names} module. Ask your Suite admin for access.`}
        </p>
        {isOrgAdmin ? (
          <Link to="/suite/settings?tab=modules" className="inline-block px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
            Add this module
          </Link>
        ) : (
          <Link to="/suite" className="inline-block px-5 py-2.5 border border-border text-sm text-muted-foreground rounded-lg hover:bg-muted">
            Back to dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
