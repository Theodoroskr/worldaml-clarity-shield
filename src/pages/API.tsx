import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { APIHeroSection } from "@/components/api/APIHeroSection";
import { WhatIsAPISection } from "@/components/api/WhatIsAPISection";
import { CustomerScreeningSection } from "@/components/api/CustomerScreeningSection";
import { CompanyScreeningSection } from "@/components/api/CompanyScreeningSection";
import { APICompanyPricingSection } from "@/components/api/APICompanyPricingSection";
import { OngoingMonitoringSection } from "@/components/api/OngoingMonitoringSection";
import { RiskAssessmentSection } from "@/components/api/RiskAssessmentSection";
import { TechnicalSpecsSection } from "@/components/api/TechnicalSpecsSection";
import { WhoItsForSection } from "@/components/api/WhoItsForSection";
import { SuiteIntegrationSection } from "@/components/api/SuiteIntegrationSection";
import { APICTASection } from "@/components/api/APICTASection";

const APIPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <APIHeroSection />
        <WhatIsAPISection />
        <CustomerScreeningSection />
        <CompanyScreeningSection />
        <APICompanyPricingSection />
        <OngoingMonitoringSection />
        <RiskAssessmentSection />
        <TechnicalSpecsSection />
        <WhoItsForSection />
        <SuiteIntegrationSection />
        <APICTASection />
      </main>
      <Footer />
    </div>
  );
};

export default APIPage;
