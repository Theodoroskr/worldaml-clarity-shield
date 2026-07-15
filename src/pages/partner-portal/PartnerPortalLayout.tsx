import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Loader2, Handshake, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePartner } from "@/hooks/usePartner";
import PortalSidebar from "@/components/partner-portal/PortalSidebar";
import PortalTopbar from "@/components/partner-portal/PortalTopbar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

export default function PartnerPortalLayout() {
  const { user, isLoading: authLoading } = useAuth();
  const { partner, isLoading } = usePartner();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login?next=/partner-portal");
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }
  if (!user) return null;

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <SEO title="Partner Portal" description="WorldAML Channel Partner Portal" noindex />
        <div className="max-w-md text-center space-y-5 p-8 bg-card border border-border rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mx-auto">
            <Handshake className="w-5 h-5 text-teal" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Join the Partner Program</h1>
            <p className="text-sm text-muted-foreground mt-2">
              You don't have a partner account yet. Apply to get access to referral tracking,
              commissions, marketing assets and more.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/partners/apply")}>Apply now</Button>
            <Button variant="outline" onClick={() => navigate("/partners")}>
              Learn about the program
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!partner.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <SEO title="Partner Portal" description="Partner application under review" noindex />
        <div className="max-w-md text-center space-y-5 p-8 bg-card border border-border rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Application under review</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Your partner application has been received. Our partnerships team will review it and
              activate your portal within 1–2 business days.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Go to dashboard
          </Button>
        </div>
      </div>
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
