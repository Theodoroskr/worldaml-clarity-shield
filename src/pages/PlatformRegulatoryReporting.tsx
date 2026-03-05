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

const structuredData = {
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

const PlatformRegulatoryReporting = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Regulatory Reporting Software | CRS FATCA FINTRAC | WorldAML"
        description="Automate CRS, FATCA, and FINTRAC regulatory reporting with WorldAML. Account classification, OECD XML generation, pre-submission validation, and deadline tracking in one platform."
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
