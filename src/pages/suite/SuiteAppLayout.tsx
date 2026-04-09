import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SuiteAppSidebar from "@/components/suite-app/SuiteAppSidebar";
import SuiteAppTopbar from "@/components/suite-app/SuiteAppTopbar";
import SuiteAccessRestricted from "@/components/suite-app/SuiteAccessRestricted";

export default function SuiteAppLayout() {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <SuiteAccessRestricted />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
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
