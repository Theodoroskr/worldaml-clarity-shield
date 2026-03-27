import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnerApplicationForm from "@/components/partners/PartnerApplicationForm";
import { Loader2 } from "lucide-react";

const PartnerApply = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Apply to Partner Program — WorldAML"
        description="Submit your partner application to join the WorldAML partner program. Choose from referral, affiliate, or reseller tiers."
        canonical="/partners/apply"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Partner Program", url: "/partners" },
          { name: "Apply", url: "/partners/apply" },
        ]}
      />
      <Header />
      <main className="flex-1 py-16 md:py-24 bg-surface-subtle">
        <div className="container-enterprise">
          <PartnerApplicationForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PartnerApply;
