import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortalLoginForm from "@/components/auth/PortalLoginForm";
import { Handshake } from "lucide-react";

export default function PartnerLogin() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="WorldAML Partner Portal Login" description="Sign in to the WorldAML Partner Portal to access partner resources, opportunities and your account." noindex />
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <PortalLoginForm
          portal="partner"
          title="WorldAML Partner Portal"
          subtitle="Access your partner resources, opportunities and account."
          icon={<div className="h-11 w-11 rounded-xl bg-navy/10 text-navy flex items-center justify-center"><Handshake className="h-5 w-5" /></div>}
          footer={
            <>
              <div className="font-medium text-navy">Interested in becoming a WorldAML Partner?</div>
              <Link to="/partner/signup" className="mt-2 inline-block text-teal hover:underline font-medium">
                Apply to Become a Partner
              </Link>
              <p className="mt-2 text-xs text-muted-foreground">
                Partner Portal access is granted by WorldAML after your application is reviewed and approved.
              </p>
            </>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
