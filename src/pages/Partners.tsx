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
      canonical="/partners"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Partner Program", url: "/partners" },
      ]}
      structuredData={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "WorldAML Partner Program",
        description: "Join the WorldAML partner program as a referral, affiliate, or reseller partner. Earn commissions on every client you refer.",
        url: "https://www.worldaml.com/partners",
        mainEntity: {
          "@type": "Offer",
          name: "WorldAML Partner Program",
          description: "Earn commissions by referring clients to WorldAML's compliance platform. Three tiers: referral, affiliate, and reseller.",
          category: "Partner Program",
        },
      }}
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
