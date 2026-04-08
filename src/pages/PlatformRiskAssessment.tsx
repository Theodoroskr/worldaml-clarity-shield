import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RAHeroSection from "@/components/risk-assessment/RAHeroSection";
import RAWhatIsSection from "@/components/risk-assessment/RAWhatIsSection";
import RAFeaturesSection from "@/components/risk-assessment/RAFeaturesSection";
import RAHowItWorksSection from "@/components/risk-assessment/RAHowItWorksSection";
import RAUseCasesSection from "@/components/risk-assessment/RAUseCasesSection";
import RACTASection from "@/components/risk-assessment/RACTASection";

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML Risk Assessment & Categorisation",
  applicationCategory: "FinancialApplication",
  description: "Customer risk assessment and categorisation software. Configurable risk matrix, automated scoring, Low/Medium/High tier assignment, and full audit trail. FATF RBA and AMLD aligned.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/platform/risk-assessment",
  offers: { "@type": "Offer", category: "SaaS", url: "https://www.worldaml.com/pricing" },
  provider: { "@type": "Organization", name: "WorldAML", url: "https://www.worldaml.com" },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a customer risk assessment in AML?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A customer risk assessment is a structured evaluation of the money laundering and terrorist financing risk posed by a specific customer relationship. It considers factors such as customer type, business activity, geographic risk, PEP status, and transaction profile to assign a risk tier — typically Low, Medium, or High — which determines the level of due diligence applied.",
      },
    },
    {
      "@type": "Question",
      name: "What is the risk-based approach (RBA) to AML?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The risk-based approach (RBA) is the FATF-mandated framework for AML compliance that requires firms to identify, assess, and understand their money laundering risks and apply proportionate controls. Instead of applying identical procedures to every customer, the RBA directs enhanced scrutiny to higher-risk relationships and simplified procedures to demonstrably low-risk ones.",
      },
    },
    {
      "@type": "Question",
      name: "What factors are used in AML customer risk scoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AML customer risk scoring typically considers: customer type (individual vs. corporate), geographic risk (country of residence and transaction corridors), business activity (industry sector, cash intensity), PEP status, product or service type, and delivery channel (face-to-face vs. digital). Each factor is weighted and aggregated to produce an overall risk score.",
      },
    },
    {
      "@type": "Question",
      name: "How often should customer risk assessments be reviewed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Customer risk assessments should be reviewed periodically and triggered by specific events. Periodic review cycles are typically annual for standard customers, semi-annual for high-risk customers, and quarterly for PEPs and correspondent banking relationships. Event-based triggers include sanctions hits, adverse media findings, changes in transaction behaviour, and changes in ownership or beneficial control.",
      },
    },
    {
      "@type": "Question",
      name: "What is an Enterprise-Wide Risk Assessment (EWRA)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An Enterprise-Wide Risk Assessment (EWRA) is the top-level assessment of a firm's inherent money laundering and terrorist financing risks across its entire business. It considers the firm's customer base, products and services, geographic footprint, and delivery channels. The EWRA informs the firm's AML policies and the calibration of its customer risk scoring methodology.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between inherent risk and residual risk in AML?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inherent risk is the level of money laundering risk present before any controls are applied — based on the nature of the business, customers, and products. Residual risk is the level of risk remaining after controls have been applied. Regulators assess both: they want to see that you have identified your inherent risks correctly and that your controls are proportionate to reduce residual risk to an acceptable level.",
      },
    },
    {
      "@type": "Question",
      name: "Can AML risk scoring be automated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Automated AML risk scoring applies a configurable scoring model to customer data at onboarding and continuously recalculates scores as new information arrives — from sanctions re-screens, adverse media hits, or changes in transaction behaviour. Automation ensures consistent, auditable scoring across the entire customer base and eliminates the subjectivity of manual assessments.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const PlatformRiskAssessment = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Customer Risk Assessment Software | AML Risk Categorisation | WorldAML"
      description="Automate customer risk scoring with WorldAML. Configurable risk matrix, EDD triggers, and full audit trail. FATF RBA and EU AMLD aligned."
      canonical="/platform/risk-assessment"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Platform", url: "/platform" },
        { name: "Risk Assessment", url: "/platform/risk-assessment" },
      ]}
      structuredData={structuredData}
    />
    <Header />
    <main className="flex-1">
      <RAHeroSection />
      <RAWhatIsSection />
      <RAFeaturesSection />
      <RAHowItWorksSection />
      <RAUseCasesSection />
      <RACTASection />
    </main>
    <Footer />
  </div>
);

export default PlatformRiskAssessment;
