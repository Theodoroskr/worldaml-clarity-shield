import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SuiteHeroSection } from "@/components/suite/SuiteHeroSection";
import { WhatIsSuiteSection } from "@/components/suite/WhatIsSuiteSection";
import { KYCOnboardingSection } from "@/components/suite/KYCOnboardingSection";
import { KYBOnboardingSection } from "@/components/suite/KYBOnboardingSection";
import { AMLScreeningSection } from "@/components/suite/AMLScreeningSection";
import { RiskDecisioningSection } from "@/components/suite/RiskDecisioningSection";
import { SuiteLogsAuditSection } from "@/components/suite/SuiteLogsAuditSection";
import { SuiteIntegrationSection } from "@/components/suite/SuiteIntegrationSection";
import { SuiteCTASection } from "@/components/suite/SuiteCTASection";

const PlatformSuite = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compliance Suite"
        description="WorldAML Suite provides KYC/KYB onboarding, AML screening, risk decisioning, audit trails, and compliance reporting in one unified platform."
        canonical="/platform/suite"
      />
      <Header />
      <main className="flex-1">
        <SuiteHeroSection />
        <WhatIsSuiteSection />
        <KYCOnboardingSection />
        <KYBOnboardingSection />
        <AMLScreeningSection />
        <RiskDecisioningSection />
        <SuiteLogsAuditSection />
        <SuiteIntegrationSection />
        <SuiteCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default PlatformSuite;
