import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RRHeroSection from "@/components/regulatory-reporting/RRHeroSection";
import RRWhatIsSection from "@/components/regulatory-reporting/RRWhatIsSection";
import RRFeaturesSection from "@/components/regulatory-reporting/RRFeaturesSection";
import RRJurisdictionsSection from "@/components/regulatory-reporting/RRJurisdictionsSection";
import RRHowItWorksSection from "@/components/regulatory-reporting/RRHowItWorksSection";
import RRUseCasesSection from "@/components/regulatory-reporting/RRUseCasesSection";
import RRCTASection from "@/components/regulatory-reporting/RRCTASection";

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML Regulatory Reporting",
  applicationCategory: "FinancialApplication",
  description:
    "Automated CRS, FATCA, and FINTRAC regulatory reporting module. Classify accounts, generate OECD XML, validate submissions, and file with relevant tax and financial intelligence authorities.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/platform/regulatory-reporting",
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
      name: "What is CRS regulatory reporting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Common Reporting Standard (CRS) is an OECD framework requiring financial institutions to identify and report financial account information held by non-resident customers to their local tax authority, which then exchanges the data with other participating jurisdictions. Over 100 countries have committed to CRS, making it the global standard for automatic exchange of financial account information (AEOI).",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between CRS and FATCA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FATCA (Foreign Account Tax Compliance Act) is a US law requiring foreign financial institutions to report accounts held by US persons directly to the IRS. CRS is the OECD's multilateral equivalent, adopted by over 100 jurisdictions. FATCA is US-centric and bilateral; CRS is multilateral and broader. Most global financial institutions must comply with both.",
      },
    },
    {
      "@type": "Question",
      name: "What is FINTRAC reporting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FINTRAC (Financial Transactions and Reports Analysis Centre of Canada) is Canada's financial intelligence unit. Regulated entities must submit Suspicious Transaction Reports (STRs) whenever there are reasonable grounds to suspect a transaction (completed or attempted) is related to money laundering or terrorist activity financing — there is no monetary threshold for an STR, it must be filed as soon as practicable, and the client must not be tipped off. Threshold-based reports also apply: Large Cash Transaction Reports (LCTRs), Electronic Funds Transfer Reports (EFTRs), Large Virtual Currency Transaction Reports (LVCTRs), and Casino Disbursement Reports (CDRs). Reports are submitted electronically via the FINTRAC Web Reporting System (FWR) or the FINTRAC API; paper filing is only permitted when electronic submission is not technically possible. Non-compliance carries significant administrative penalties.",
      },
    },
    {
      "@type": "Question",
      name: "What is account classification in CRS and FATCA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Account classification is the process of determining whether a financial account is reportable under CRS or FATCA. It involves identifying account holders, applying due diligence procedures (self-certification, indicia searches), classifying entities as Active NFEs, Passive NFEs, or Financial Institutions, and determining residency for tax purposes. Incorrect classification is a common source of regulatory findings.",
      },
    },
    {
      "@type": "Question",
      name: "What is OECD XML schema for CRS reporting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The OECD XML schema is the standardised data format required for submitting CRS reports to tax authorities. It defines the structure, data elements, and validation rules for reportable account data. Financial institutions must generate valid XML files that pass pre-submission validation before filing. WorldAML's regulatory reporting module automates XML generation and validates files against the OECD schema before submission.",
      },
    },
    {
      "@type": "Question",
      name: "Who must comply with CRS reporting requirements?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CRS obligations apply to Reporting Financial Institutions (RFIs) in participating jurisdictions, including banks, custodians, investment entities, insurance companies, and certain collective investment vehicles. Obligations vary by jurisdiction but generally require annual reporting of account holder name, address, tax identification number (TIN), account balance, and income. Non-reporting financial institutions and excluded accounts have specific criteria.",
      },
    },
    {
      "@type": "Question",
      name: "What are the penalties for CRS and FATCA non-compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FATCA non-compliance can result in a 30% withholding tax on US-sourced payments and termination of the institution's IGA status. CRS penalties vary by jurisdiction but include significant fines, reputational damage, and in some cases criminal liability for senior management. Tax authorities are increasingly cross-referencing CRS data to identify under-reporting and are issuing enforcement actions.",
      },
    },
    {
      "@type": "Question",
      name: "How does automated regulatory reporting reduce compliance risk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Automated regulatory reporting reduces risk by eliminating manual data extraction errors, enforcing consistent account classification logic, running pre-submission XML validation checks, maintaining a full audit trail of classification decisions, and tracking filing deadlines automatically. Automation ensures reports are accurate, timely, and defensible in the event of a regulatory review.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const PlatformRegulatoryReporting = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Regulatory Reporting Software | CRS FATCA FINTRAC | WorldAML"
        description="Automate CRS, FATCA, and FINTRAC regulatory reporting with WorldAML. Account classification, OECD XML generation, and deadline tracking."
        canonical="/platform/regulatory-reporting"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Platform", url: "/platform" },
          { name: "Regulatory Reporting", url: "/platform/regulatory-reporting" },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">
        <RRHeroSection />
        <RRWhatIsSection />
        <RRFeaturesSection />
        <RRJurisdictionsSection />
        <RRHowItWorksSection />
        <RRUseCasesSection />
        <RRCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default PlatformRegulatoryReporting;
