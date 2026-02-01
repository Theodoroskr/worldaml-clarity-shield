import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SuiteHeroSection } from "@/components/suite/SuiteHeroSection";
import { WhatIsSuiteSection } from "@/components/suite/WhatIsSuiteSection";
import { KYCOnboardingSection } from "@/components/suite/KYCOnboardingSection";
import { KYBOnboardingSection } from "@/components/suite/KYBOnboardingSection";
import { AMLScreeningSection } from "@/components/suite/AMLScreeningSection";
import { SuiteMonitoringSection } from "@/components/suite/SuiteMonitoringSection";
import { RiskDecisioningSection } from "@/components/suite/RiskDecisioningSection";
import { ComplianceOversightSection } from "@/components/suite/ComplianceOversightSection";
import { SuiteAPIAccessSection } from "@/components/suite/SuiteAPIAccessSection";
import { SuiteWhoItsForSection } from "@/components/suite/SuiteWhoItsForSection";
import { SuiteAPIIntegrationSection } from "@/components/suite/SuiteAPIIntegrationSection";
import { SuiteCTASection } from "@/components/suite/SuiteCTASection";

const Suite = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <SuiteHeroSection />
        <WhatIsSuiteSection />
        <KYCOnboardingSection />
        <KYBOnboardingSection />
        <AMLScreeningSection />
        <SuiteMonitoringSection />
        <RiskDecisioningSection />
        <ComplianceOversightSection />
        <SuiteAPIAccessSection />
        <SuiteWhoItsForSection />
        <SuiteAPIIntegrationSection />
        <SuiteCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Suite;
