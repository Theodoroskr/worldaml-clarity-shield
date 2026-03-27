import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnerHeroSection from "@/components/partners/PartnerHeroSection";
import PartnerBenefitsSection from "@/components/partners/PartnerBenefitsSection";

const Partners = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Partner Program — Earn with WorldAML"
      description="Join the WorldAML partner program. Refer clients, earn commissions, and grow your compliance business as a referral, affiliate, or reseller partner."
    />
    <Header />
    <main className="flex-1">
      <PartnerHeroSection />
      <PartnerBenefitsSection />
    </main>
    <Footer />
  </div>
);

export default Partners;
