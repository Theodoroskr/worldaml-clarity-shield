import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LaneBadge from "@/components/LaneBadge";
import WorldIDHeroSection from "@/components/worldid/WorldIDHeroSection";
import WorldIDOverviewSection from "@/components/worldid/WorldIDOverviewSection";
import WorldIDHowItWorksSection from "@/components/worldid/WorldIDHowItWorksSection";
import WorldIDCapabilitiesSection from "@/components/worldid/WorldIDCapabilitiesSection";
import WorldIDCoverageSection from "@/components/worldid/WorldIDCoverageSection";
import WorldIDIntegrationsSection from "@/components/worldid/WorldIDIntegrationsSection";
import WorldIDPricingSection from "@/components/worldid/WorldIDPricingSection";
import WorldIDBundleSection from "@/components/worldid/WorldIDBundleSection";
import WorldIDTrustSection from "@/components/worldid/WorldIDTrustSection";
import WorldIDFAQSection from "@/components/worldid/WorldIDFAQSection";
import WorldIDCTASection from "@/components/worldid/WorldIDCTASection";
import WorldIDStickyCTA from "@/components/worldid/WorldIDStickyCTA";

const WorldID = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="WorldID - Identity Verification"
        description="Digital identity verification with document authentication, biometric liveness detection, and face matching. Verify customers in seconds via API."
        canonical="/products/worldid"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: "WorldID", url: "/products/worldid" },
        ]}
      />
      <Header />
      <main className="flex-grow relative">
        <LaneBadge lane="platform" />
        <WorldIDHeroSection />
        <WorldIDOverviewSection />
        <WorldIDHowItWorksSection />
        <WorldIDCapabilitiesSection />
        <WorldIDCoverageSection />
        <WorldIDIntegrationsSection />
        <WorldIDPricingSection />
        <WorldIDBundleSection />
        <WorldIDTrustSection />
        <WorldIDFAQSection />
        <WorldIDCTASection />
        <WorldIDStickyCTA />
      </main>
      <Footer />
    </div>
  );
};

export default WorldID;
