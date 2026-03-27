import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { SanctionsApiHeroSection } from "@/components/sanctions-api/SanctionsApiHeroSection";
import { SanctionsApiWhatIsSection } from "@/components/sanctions-api/SanctionsApiWhatIsSection";
import { SanctionsApiListsSection } from "@/components/sanctions-api/SanctionsApiListsSection";
import { SanctionsApiUseCasesSection } from "@/components/sanctions-api/SanctionsApiUseCasesSection";
import { SanctionsApiCTASection } from "@/components/sanctions-api/SanctionsApiCTASection";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What sanctions lists does the API cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WorldAML's Sanctions Screening API covers 200+ global sanctions and watchlists including OFAC SDN, EU Consolidated List, UN Security Council, HMT, DFAT, and regional regulatory lists.",
      },
    },
    {
      "@type": "Question",
      name: "Does the API support fuzzy matching?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The API supports configurable fuzzy matching with Levenshtein distance thresholds, phonetic matching (Soundex, Metaphone), and automatic alias resolution to minimise false positives.",
      },
    },
    {
      "@type": "Question",
      name: "Can I screen entities in batch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The batch endpoint allows you to submit thousands of entities in a single request for portfolio-wide re-screening, with results delivered via webhook or polling.",
      },
    },
  ],
};

const softwareStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML Sanctions Screening API",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Real-time sanctions screening API covering 200+ global watchlists with fuzzy matching, batch processing, and ongoing monitoring.",
  url: "https://www.worldaml.com/sanctions-screening-api",
  offers: {
    "@type": "Offer",
    category: "API Access",
    url: "https://www.worldaml.com/get-started",
  },
};

const SanctionsScreeningApiPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Sanctions Screening API — Real-Time Global List Coverage"
        description="Screen individuals and entities against 200+ global sanctions lists via API. Fuzzy matching, batch processing, and ongoing monitoring in a single integration."
        canonical="/sanctions-screening-api"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Sanctions Screening API", url: "/sanctions-screening-api" },
        ]}
        structuredData={[faqStructuredData, softwareStructuredData]}
      />
      <Header />
      <main className="flex-1">
        <SanctionsApiHeroSection />
        <SanctionsApiWhatIsSection />
        <SanctionsApiListsSection />
        <SanctionsApiUseCasesSection />
        <SanctionsApiCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default SanctionsScreeningApiPage;
