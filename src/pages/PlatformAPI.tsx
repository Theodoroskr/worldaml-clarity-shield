import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { APIHeroSection } from "@/components/api/APIHeroSection";
import { WhatIsAPISection } from "@/components/api/WhatIsAPISection";
import { RiskLogicSection } from "@/components/api/RiskLogicSection";
import { APIArchitectureSection } from "@/components/api/APIArchitectureSection";
import { GovernanceAuditSection } from "@/components/api/GovernanceAuditSection";
import { APIUseCasesSection } from "@/components/api/APIUseCasesSection";
import { APICTASection } from "@/components/api/APICTASection";

const PlatformAPI = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compliance API"
        description="Integrate AML screening, KYC/KYB onboarding, and ongoing monitoring into your systems via the WorldAML RESTful API."
        canonical="/platform/api"
      />
      <Header />
      <main className="flex-1">
        <APIHeroSection />
        <WhatIsAPISection />
        <RiskLogicSection />
        <APIArchitectureSection />
        <GovernanceAuditSection />
        <APIUseCasesSection />
        <APICTASection />
      </main>
      <Footer />
    </div>
  );
};

export default PlatformAPI;
