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

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML Compliance Suite",
  applicationCategory: "FinancialApplication",
  description:
    "Unified compliance platform combining KYC/KYB onboarding, AML screening, risk assessment, transaction monitoring, regulatory reporting, and audit trails in a single integrated suite.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/platform/suite",
  offers: {
    "@type": "Offer",
    category: "SaaS",
    url: "https://www.worldaml.com/pricing",
  },
  provider: {
    "@type": "Organization",
    name: "WorldAML",
    url: "https://www.worldaml.com",
  },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a compliance management suite?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A compliance management suite is an integrated platform that consolidates multiple compliance functions — KYC/KYB onboarding, AML screening, risk assessment, transaction monitoring, and regulatory reporting — into a single system. Instead of managing disparate point solutions, compliance teams operate from one unified interface with shared data, consistent audit trails, and centralised case management.",
      },
    },
    {
      "@type": "Question",
      name: "What modules are included in the WorldAML Suite?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The WorldAML Suite includes seven core modules: KYC & KYB onboarding, AML Screening & Monitoring (sanctions, PEP, adverse media), Risk Assessment & Categorisation, Transaction Monitoring, Regulatory Reporting (CRS, FATCA, FINTRAC), WorldID digital identity verification, and a Logs & Audit Trail module. All modules are interoperable and share a unified customer record.",
      },
    },
    {
      "@type": "Question",
      name: "How does KYC differ from KYB in a compliance suite?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KYC (Know Your Customer) refers to the identity verification and due diligence process for individual customers, including identity document verification, liveness checks, and PEP/sanctions screening. KYB (Know Your Business) applies the same principles to legal entities, requiring UBO (Ultimate Beneficial Owner) mapping, corporate registry verification, directorship checks, and company-level risk assessment.",
      },
    },
    {
      "@type": "Question",
      name: "What is a risk-based approach in AML compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A risk-based approach (RBA) means calibrating compliance controls proportionally to the money laundering and terrorist financing risks posed by customers, products, geographies, and delivery channels. Higher-risk customers require Enhanced Due Diligence (EDD); lower-risk customers may qualify for Simplified Due Diligence (SDD). The RBA is mandated by FATF Recommendation 1 and embedded in all major AML frameworks globally.",
      },
    },
    {
      "@type": "Question",
      name: "What is an audit trail in compliance software?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An audit trail is a chronological log of all compliance-related actions taken within the platform — screening runs, risk decisions, case notes, document uploads, and report filings — each time-stamped and attributed to a specific user. A complete audit trail is essential for demonstrating regulatory compliance during examinations and is required under most AML frameworks including EU AMLD, UK MLRs, and FinCEN regulations.",
      },
    },
    {
      "@type": "Question",
      name: "Can the WorldAML Suite be accessed via API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every module in the WorldAML Suite is accessible via a RESTful API, enabling financial institutions and fintechs to embed compliance capabilities directly into their own onboarding flows, banking platforms, or back-office systems. The API supports customer screening, KYC/KYB checks, risk scoring, transaction monitoring, and report generation as individual microservices.",
      },
    },
    {
      "@type": "Question",
      name: "How does unified compliance software reduce operational costs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Unified compliance platforms reduce costs by eliminating duplicate data entry across systems, consolidating vendor contracts, reducing integration maintenance overhead, enabling shared customer profiles across modules, and automating manual review queues. Institutions that replace 4-6 point solutions with a single suite typically report 30-50% reductions in compliance operational spend.",
      },
    },
    {
      "@type": "Question",
      name: "What regulations does the WorldAML Suite help comply with?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The WorldAML Suite supports compliance with FATF Recommendations, EU Anti-Money Laundering Directives (4AMLD through 6AMLD), UK Money Laundering Regulations 2017, US Bank Secrecy Act and OFAC regulations, Canadian FINTRAC requirements, CRS and FATCA tax reporting obligations, and jurisdiction-specific AML frameworks across 35+ countries.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const PlatformSuite = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compliance Suite | KYC KYB AML Risk Reporting | WorldAML"
        description="WorldAML Suite provides KYC/KYB onboarding, AML screening, risk decisioning, transaction monitoring, regulatory reporting, and audit trails in one unified compliance platform."
        canonical="/platform/suite"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Platform", url: "/platform" },
          { name: "Compliance Suite", url: "/platform/suite" },
        ]}
        structuredData={structuredData}
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
