import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RAHeroSection from "@/components/risk-assessment/RAHeroSection";
import RAWhatIsSection from "@/components/risk-assessment/RAWhatIsSection";
import RAFeaturesSection from "@/components/risk-assessment/RAFeaturesSection";
import RAHowItWorksSection from "@/components/risk-assessment/RAHowItWorksSection";
import RAUseCasesSection from "@/components/risk-assessment/RAUseCasesSection";
import RACTASection from "@/components/risk-assessment/RACTASection";

const structuredData = {
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

const PlatformRiskAssessment = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Customer Risk Assessment Software | AML Risk Categorisation | WorldAML"
      description="Automate customer risk scoring and categorisation with WorldAML. Configurable risk matrix, Low/Medium/High tier assignment, EDD triggers, and audit trail. FATF RBA and EU AMLD aligned."
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
