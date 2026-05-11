import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Clock, Mail, LogOut, ShieldCheck } from "lucide-react";

const PendingApproval = () => {
  const { user, profile, isLoading, signOut, isApproved } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
    if (!isLoading && isApproved) {
      navigate("/dashboard");
    }
  }, [user, isLoading, isApproved, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Account Pending Approval" description="Your WorldAML account is under review." noindex />
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 mb-6">
            <Clock className="h-9 w-9 text-amber-500" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-navy mb-3">Account Under Review</h1>
          <p className="text-text-secondary text-lg mb-8">
            Thank you for registering, {profile?.user_id === user.id && profile?.full_name ? profile.full_name.split(" ")[0] : "there"}.
            Your account is currently being reviewed by our compliance team.
          </p>

          {/* Info cards */}
          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-divider bg-surface-subtle">
              <Mail className="h-5 w-5 text-teal mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-navy text-sm">Confirmation sent to</p>
                <p className="text-text-secondary text-sm">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border border-divider bg-surface-subtle">
              <ShieldCheck className="h-5 w-5 text-teal mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-navy text-sm">What happens next?</p>
                <p className="text-text-secondary text-sm">
                  Our team typically reviews new accounts within 1–2 business days. You'll receive an
                  email at <strong>{user.email}</strong> once your account is approved.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Button variant="default" onClick={() => navigate("/support")}>
              Contact Support
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PendingApproval;
