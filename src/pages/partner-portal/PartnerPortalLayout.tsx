import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePartner } from "@/hooks/usePartner";
import PortalSidebar from "@/components/partner-portal/PortalSidebar";
import PortalTopbar from "@/components/partner-portal/PortalTopbar";
import PartnerOnboarding from "@/pages/partner-portal/Onboarding";
import SEO from "@/components/SEO";

export default function PartnerPortalLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const { partner, isLoading } = usePartner();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login?next=/partner-portal");
  }, [user, authLoading, navigate]);

  // First-login setup: active partner who hasn't finished onboarding gets routed to welcome wizard
  useEffect(() => {
    if (!partner?.is_active) return;
    if (partner.onboarding_completed_at) return;
    if (location.pathname.startsWith("/partner-portal/welcome")) return;
    navigate("/partner-portal/welcome", { replace: true });
  }, [partner?.is_active, partner?.onboarding_completed_at, location.pathname, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }
  if (!user) return null;

  // No partner record OR application still pending → onboarding flow (application + status tracker)
  if (!partner || !partner.is_active) {
    return (
      <>
        <SEO title="Partner Onboarding" description="WorldAML Partner Program onboarding" noindex />
        <PartnerOnboarding />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SEO
        title="Partner Portal"
        description="WorldAML Channel Partner Portal — referrals, commissions & marketing assets."
        noindex
      />
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalTopbar partner={partner} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
