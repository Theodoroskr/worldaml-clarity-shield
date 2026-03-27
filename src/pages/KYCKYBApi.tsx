import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { KYCKYBApiHeroSection } from "@/components/kyc-kyb-api/KYCKYBApiHeroSection";
import { KYCKYBApiWhatIsSection } from "@/components/kyc-kyb-api/KYCKYBApiWhatIsSection";
import { KYCKYBApiEndpointsSection } from "@/components/kyc-kyb-api/KYCKYBApiEndpointsSection";
import { KYCKYBApiWorkflowSection } from "@/components/kyc-kyb-api/KYCKYBApiWorkflowSection";
import { KYCKYBApiUseCasesSection } from "@/components/kyc-kyb-api/KYCKYBApiUseCasesSection";
import { KYCKYBApiCTASection } from "@/components/kyc-kyb-api/KYCKYBApiCTASection";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a KYC/KYB API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A KYC/KYB API allows businesses to programmatically verify individual identities (KYC) and corporate entities (KYB) through automated document checks, registry lookups, UBO mapping, and AML screening.",
      },
    },
    {
      "@type": "Question",
      name: "What checks does the KYC API perform?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The KYC API supports identity document verification, biometric matching, liveness detection, sanctions screening, PEP checks, and adverse media screening — all in a single API call or orchestrated workflow.",
      },
    },
    {
      "@type": "Question",
      name: "Can I verify companies (KYB) through the API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The KYB endpoint verifies corporate entities against company registries in 100+ jurisdictions, identifies Ultimate Beneficial Owners, and screens directors and related parties.",
      },
    },
  ],
};

const softwareStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML KYC & KYB API",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Programmatic KYC and KYB verification API with identity checks, UBO mapping, document verification, and AML screening.",
  url: "https://www.worldaml.com/kyc-kyb-api",
  offers: {
    "@type": "Offer",
    category: "API Access",
    url: "https://www.worldaml.com/get-started",
  },
};

const KYCKYBApiPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="KYC & KYB API — Programmatic Identity Verification"
        description="Automate KYC and KYB checks via API. Verify identities, map UBOs, check documents, and trigger EDD workflows programmatically through a single integration."
        canonical="/kyc-kyb-api"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "KYC & KYB API", url: "/kyc-kyb-api" },
        ]}
        structuredData={[faqStructuredData, softwareStructuredData]}
      />
      <Header />
      <main className="flex-1">
        <KYCKYBApiHeroSection />
        <KYCKYBApiWhatIsSection />
        <KYCKYBApiEndpointsSection />
        <KYCKYBApiWorkflowSection />
        <KYCKYBApiUseCasesSection />
        <KYCKYBApiCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default KYCKYBApiPage;
