import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TMHeroSection from "@/components/transaction-monitoring/TMHeroSection";
import TMWhatIsSection from "@/components/transaction-monitoring/TMWhatIsSection";
import TMFeaturesSection from "@/components/transaction-monitoring/TMFeaturesSection";
import TMHowItWorksSection from "@/components/transaction-monitoring/TMHowItWorksSection";
import TMRegulatorySection from "@/components/transaction-monitoring/TMRegulatorySection";
import TMUseCasesSection from "@/components/transaction-monitoring/TMUseCasesSection";
import TMCTASection from "@/components/transaction-monitoring/TMCTASection";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML Transaction Monitoring",
  applicationCategory: "FinancialApplication",
  description:
    "Real-time AML transaction monitoring software for banks, VASPs, and payment processors. Configurable rule engine, typology detection, SAR workflow, and regulatory reporting aligned with FATF Recommendation 20.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/platform/transaction-monitoring",
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

const PlatformTransactionMonitoring = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Transaction Monitoring Software | AML Platform"
        description="Real-time AML transaction monitoring software for banks, VASPs, and payment processors. Detect suspicious activity, automate SAR filing, and satisfy FATF Rec. 20 requirements with WorldAML."
        canonical="/platform/transaction-monitoring"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Platform", url: "/platform" },
          { name: "Transaction Monitoring", url: "/platform/transaction-monitoring" },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">
        <TMHeroSection />
        <TMWhatIsSection />
        <TMFeaturesSection />
        <TMHowItWorksSection />
        <TMRegulatorySection />
        <TMUseCasesSection />
        <TMCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default PlatformTransactionMonitoring;
