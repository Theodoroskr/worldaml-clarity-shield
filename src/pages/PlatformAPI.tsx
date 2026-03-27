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

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML Compliance API",
  applicationCategory: "FinancialApplication",
  description:
    "RESTful compliance API providing AML screening, KYC/KYB onboarding, risk scoring, transaction monitoring, and regulatory reporting as granular microservices. Integrate compliance directly into your platform.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/platform/api",
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
      name: "What is a compliance API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A compliance API is a RESTful web service that exposes AML and KYC compliance functions — such as sanctions screening, identity verification, PEP checks, and risk scoring — as programmable endpoints. Rather than using a standalone compliance platform, regulated firms embed these functions directly into their onboarding flows, banking platforms, or back-office systems via API calls, receiving structured JSON responses with match results and risk decisions.",
      },
    },
    {
      "@type": "Question",
      name: "How does a KYC API work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A KYC API accepts structured customer data — name, date of birth, nationality, document details — and runs it through identity verification, sanctions screening, PEP database checks, and adverse media searches in a single call or a series of chained calls. The API returns a structured response including match results, confidence scores, and a recommended risk decision, which the calling system uses to automate onboarding accept/reject logic or route cases to manual review.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between API and platform access for AML compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Platform access (also called no-code or dashboard access) provides a browser-based interface for compliance analysts to run manual checks, review cases, and generate reports without writing any code. API access embeds the same compliance functions directly into your own software, enabling automated, high-volume screening at the point of transaction or onboarding. Most enterprise compliance programmes use both: API for automated real-time screening and platform for analyst review workflows.",
      },
    },
    {
      "@type": "Question",
      name: "What sanctions screening API endpoints does WorldAML provide?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WorldAML's Sanctions Screening API endpoints support individual person screening, company/entity screening, and batch screening. Each endpoint accepts name, date of birth, nationality, and jurisdiction parameters and returns match results from 500+ global watchlists including OFAC SDN, EU Consolidated, UN Security Council, HM Treasury, DFAT, and regional GCC and APAC lists. Results include match score, list source, entity details, and a recommended pass/review/block decision.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the WorldAML API for ongoing monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The WorldAML Ongoing Monitoring API re-screens your existing customer base automatically whenever a watchlist is updated, without requiring individual API calls per customer. You register customer profiles via the API, and the system triggers alerts when a profile matches a new or updated watchlist entry. Alerts are returned via webhook or available via polling endpoint, complete with the specific list update that triggered the match.",
      },
    },
    {
      "@type": "Question",
      name: "What authentication and security standards does the WorldAML API use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The WorldAML API uses OAuth 2.0 with JWT bearer tokens for authentication and TLS 1.3 for all data in transit. API keys are scoped to specific endpoint groups, enabling least-privilege access control. All API requests and responses are logged with timestamps for audit trail purposes. The infrastructure is hosted on ISO 27001-certified cloud infrastructure with 99.9% uptime SLAs.",
      },
    },
    {
      "@type": "Question",
      name: "Is there an API for beneficial ownership and UBO verification?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. WorldAML's KYB API includes beneficial ownership resolution endpoints that accept a company registration number and jurisdiction, query connected business registry databases, and return the full UBO structure — including entity type, ownership percentage, and directorship data. Each identified beneficial owner is automatically queued for individual KYC screening, enabling end-to-end corporate due diligence in a single workflow.",
      },
    },
    {
      "@type": "Question",
      name: "What is the latency of the WorldAML sanctions screening API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WorldAML's real-time sanctions screening API returns results in under 500 milliseconds for individual screening calls under normal load conditions, making it suitable for inline integration into onboarding journeys and payment flows where user experience is critical. Batch screening endpoints process up to 10,000 records per job and are designed for overnight or on-demand portfolio re-screening rather than inline use.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const PlatformAPI = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compliance API | KYC AML Sanctions Screening API | WorldAML"
        description="RESTful compliance API for AML screening, KYC/KYB onboarding, sanctions checks, risk scoring, and ongoing monitoring. Integrate compliance directly into your platform in days."
        canonical="/platform/api"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Platform", url: "/platform" },
          { name: "Compliance API", url: "/platform/api" },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">
        <APIHeroSection />
        <WhatIsAPISection />
        <RiskLogicSection />
        <APIArchitectureSection />
        <GovernanceAuditSection />
        <APIUseCasesSection />

        {/* API Product Cross-Links */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-subheadline text-navy mb-8 text-center">Explore API Products</h2>
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { to: "/aml-api", title: "AML API", desc: "Automate AML screening with a single API call — sanctions, PEPs, adverse media, and RCAs." },
                { to: "/sanctions-screening-api", title: "Sanctions Screening API", desc: "Real-time screening against 200+ global sanctions and watchlists with fuzzy matching." },
                { to: "/kyc-kyb-api", title: "KYC / KYB API", desc: "Programmatic identity verification, UBO mapping, and corporate registry checks." },
              ].map((item) => (
                <a key={item.to} href={item.to} className="p-6 rounded-lg border border-divider bg-card hover:border-teal/30 transition-colors block">
                  <h3 className="text-body font-semibold text-navy mb-2">{item.title}</h3>
                  <p className="text-body-sm text-text-secondary">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <APICTASection />
      </main>
      <Footer />
    </div>
  );
};

export default PlatformAPI;
