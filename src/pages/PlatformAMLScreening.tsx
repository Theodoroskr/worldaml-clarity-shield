import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AMLHeroSection from "@/components/aml-screening/AMLHeroSection";
import AMLWhatIsSection from "@/components/aml-screening/AMLWhatIsSection";
import AMLFeaturesSection from "@/components/aml-screening/AMLFeaturesSection";
import AMLDataSourcesSection from "@/components/aml-screening/AMLDataSourcesSection";
import AMLUseCasesSection from "@/components/aml-screening/AMLUseCasesSection";
import AMLCTASection from "@/components/aml-screening/AMLCTASection";

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML AML Screening & Monitoring",
  applicationCategory: "FinancialApplication",
  description: "AML screening and monitoring software covering sanctions, PEPs, adverse media, and RCAs. Powered by WorldCompliance® and Bridger Insight XG® data. FATF R.6, R.12, and R.16 aligned.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/platform/aml-screening",
  offers: { "@type": "Offer", category: "SaaS", url: "https://www.worldaml.com/pricing" },
  provider: { "@type": "Organization", name: "WorldAML", url: "https://www.worldaml.com" },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AML screening software?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AML screening software automatically checks customers, transactions, and counterparties against global sanctions lists, PEP databases, adverse media sources, and regulatory watchlists. It flags potential matches for analyst review, replacing manual checks and ensuring no designated individual or entity passes through undetected.",
      },
    },
    {
      "@type": "Question",
      name: "Which sanctions lists should I screen against?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At minimum, you should screen against OFAC SDN (USA), EU Consolidated Sanctions List, UN Security Council Consolidated List, and HM Treasury Financial Sanctions List (UK). Regulated firms should also screen regional lists relevant to their business geographies, including DFAT (Australia), SECO (Switzerland), and applicable GCC lists.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between real-time and batch AML screening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Real-time screening checks individuals or entities at the point of onboarding or transaction, returning results within milliseconds via API. Batch screening processes your entire customer base at once — typically triggered when a watchlist is updated — to identify any existing customers who have been newly designated.",
      },
    },
    {
      "@type": "Question",
      name: "What are PEPs in AML compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Politically Exposed Persons (PEPs) are individuals who hold or have held prominent public functions, such as heads of state, senior politicians, central bank officials, and senior executives of state-owned enterprises. PEPs are considered higher risk for bribery and corruption and require Enhanced Due Diligence (EDD) under FATF Recommendation 12 and EU AMLD.",
      },
    },
    {
      "@type": "Question",
      name: "How often should sanctions screening be performed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sanctions screening must occur at onboarding and on an ongoing basis whenever lists are updated. OFAC and other major sanctions authorities can add designations with same-day effect, so ongoing monitoring should be near-real-time. Relying on annual re-screening is insufficient and creates regulatory exposure.",
      },
    },
    {
      "@type": "Question",
      name: "What is adverse media screening in AML?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Adverse media screening — also called negative news screening — searches global news sources, court records, and regulatory databases for negative information about a customer. It captures intelligence on financial crime, corruption, fraud, and regulatory sanctions before they appear on formal watchlists, providing an early warning signal for compliance teams.",
      },
    },
    {
      "@type": "Question",
      name: "How do I reduce false positives in AML screening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reducing false positives requires calibrated fuzzy name matching (using phonetic algorithms and edit-distance scoring), screening all aliases listed for designated entities, applying risk-tiered match thresholds, and documenting all false positive disposals with analyst rationale. Regular tuning of thresholds based on alert-to-SAR conversion rates is also essential.",
      },
    },
    {
      "@type": "Question",
      name: "What regulations require AML screening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AML screening is required by FATF Recommendations 6, 12, and 16; the EU Anti-Money Laundering Directives (4AMLD, 5AMLD, 6AMLD); the UK Money Laundering Regulations 2017; the US Bank Secrecy Act and OFAC regulations; and jurisdiction-specific AML laws in over 200 countries that have adopted the FATF framework.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const PlatformAMLScreening = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="AML Screening & Monitoring Software | Sanctions & PEP Screening | WorldAML"
      description="AML screening software covering sanctions, PEPs, adverse media, and RCAs. Real-time and batch screening powered by WorldCompliance® and Bridger Insight XG®. FATF aligned."
      canonical="/platform/aml-screening"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Platform", url: "/platform" },
        { name: "AML Screening & Monitoring", url: "/platform/aml-screening" },
      ]}
      structuredData={structuredData}
    />
    <Header />
    <main className="flex-1">
      <AMLHeroSection />
      <AMLWhatIsSection />
      <AMLFeaturesSection />
      <AMLDataSourcesSection />
      <AMLUseCasesSection />
      <AMLCTASection />
    </main>
    <Footer />
  </div>
);

export default PlatformAMLScreening;
