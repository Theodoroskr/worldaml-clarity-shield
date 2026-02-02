import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { APIHeroSection } from "@/components/api/APIHeroSection";
import { WhatIsAPISection } from "@/components/api/WhatIsAPISection";
import { RiskLogicSection } from "@/components/api/RiskLogicSection";
import { APIArchitectureSection } from "@/components/api/APIArchitectureSection";
import { GovernanceAuditSection } from "@/components/api/GovernanceAuditSection";
import { APIUseCasesSection } from "@/components/api/APIUseCasesSection";
import { APICTASection } from "@/components/api/APICTASection";

const APIPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
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

export default APIPage;
