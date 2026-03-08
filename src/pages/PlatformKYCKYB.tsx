import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KYCHeroSection from "@/components/kyc-kyb/KYCHeroSection";
import KYCWhatIsSection from "@/components/kyc-kyb/KYCWhatIsSection";
import KYCFeaturesSection from "@/components/kyc-kyb/KYCFeaturesSection";
import KYCHowItWorksSection from "@/components/kyc-kyb/KYCHowItWorksSection";
import KYCUseCasesSection from "@/components/kyc-kyb/KYCUseCasesSection";
import KYCCTASection from "@/components/kyc-kyb/KYCCTASection";

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML KYC & KYB",
  applicationCategory: "FinancialApplication",
  description: "KYC and KYB onboarding software for regulated institutions. Identity verification, sanctions and PEP screening, UBO mapping, and EDD workflows in a single compliance platform.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/platform/kyc-kyb",
  offers: { "@type": "Offer", category: "SaaS", url: "https://www.worldaml.com/pricing" },
  provider: { "@type": "Organization", name: "WorldAML", url: "https://www.worldaml.com" },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between KYC and KYB?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KYC (Know Your Customer) verifies the identity of individual persons. KYB (Know Your Business) verifies the identity of legal entities — companies, partnerships, and trusts — and requires identifying and verifying the Ultimate Beneficial Owners (UBOs) who ultimately own or control the entity. Both are required for regulated financial institutions serving individual and corporate clients.",
      },
    },
    {
      "@type": "Question",
      name: "What is a UBO in KYB compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Ultimate Beneficial Owner (UBO) is any natural person who ultimately owns or controls a legal entity, typically defined as holding 25% or more of shares or voting rights, or exercising effective control by other means. Under EU AMLD, UK MLRs 2017, and FATF Recommendation 10, regulated firms must identify and verify all UBOs before establishing a business relationship.",
      },
    },
    {
      "@type": "Question",
      name: "What documents are required for KYC verification?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Standard KYC requires a government-issued photo ID (passport, national ID card, or driving licence) and proof of address (utility bill, bank statement, or official correspondence dated within 3 months). For enhanced due diligence, additional documentation such as source of funds evidence, employment records, or tax returns may be required.",
      },
    },
    {
      "@type": "Question",
      name: "How long does KYB onboarding typically take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Manual KYB onboarding for a corporate entity with a complex ownership structure can take 2–4 weeks due to the need to research multiple registries, identify UBOs across jurisdictions, and collect verification documents. Automated KYB platforms can reduce this to hours by pulling data directly from company registries and routing UBOs through automated KYC workflows.",
      },
    },
    {
      "@type": "Question",
      name: "What is Enhanced Due Diligence (EDD) in KYC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Enhanced Due Diligence (EDD) is a higher level of scrutiny applied to high-risk customers, including PEPs, customers from high-risk jurisdictions, and complex corporate structures. EDD requires obtaining senior management approval, establishing source of wealth and source of funds, and conducting enhanced ongoing monitoring — typically semi-annual or quarterly reviews.",
      },
    },
    {
      "@type": "Question",
      name: "What regulations govern KYC and KYB requirements?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KYC and KYB requirements are primarily governed by FATF Recommendation 10 (Customer Due Diligence), the EU Anti-Money Laundering Directives (most recently 6AMLD and the 2024 AML Package), the UK Money Laundering Regulations 2017, and the US Bank Secrecy Act. The EU's Corporate Transparency Act 2024 and the US Corporate Transparency Act also impose beneficial ownership registration requirements.",
      },
    },
    {
      "@type": "Question",
      name: "Can KYC be done digitally without face-to-face verification?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Digital or remote KYC — using document scanning, liveness checks, and biometric matching — is accepted under most regulatory frameworks provided appropriate controls are in place. Non-face-to-face onboarding is not automatically high-risk, but firms must apply appropriate verification standards and consider whether enhanced controls are needed based on their overall risk assessment.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const PlatformKYCKYB = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="KYC & KYB Onboarding Software | Customer Due Diligence | WorldAML"
      description="KYC and KYB compliance software for banks, payment processors, and fintechs. Identity verification, sanctions screening, UBO mapping, and EDD workflows — FATF R.10 and AMLD aligned."
      canonical="/platform/kyc-kyb"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Platform", url: "/platform" },
        { name: "KYC & KYB", url: "/platform/kyc-kyb" },
      ]}
      structuredData={structuredData}
    />
    <Header />
    <main className="flex-1">
      <KYCHeroSection />
      <KYCWhatIsSection />
      <KYCFeaturesSection />
      <KYCHowItWorksSection />
      <KYCUseCasesSection />
      <KYCCTASection />
    </main>
    <Footer />
  </div>
);

export default PlatformKYCKYB;
