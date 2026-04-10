import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SuiteAppSidebar from "@/components/suite-app/SuiteAppSidebar";
import SuiteAppTopbar from "@/components/suite-app/SuiteAppTopbar";
import SuiteAccessRestricted from "@/components/suite-app/SuiteAccessRestricted";
import SEO from "@/components/SEO";

export default function SuiteAppLayout() {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/academy" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SEO title="Suite" description="WorldAML Compliance Suite — manage onboarding, screening, alerts, and cases." noindex />
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
