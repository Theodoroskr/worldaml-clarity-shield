import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SuiteAppSidebar from "@/components/suite-app/SuiteAppSidebar";
import SuiteAppTopbar from "@/components/suite-app/SuiteAppTopbar";

export default function SuiteAppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
