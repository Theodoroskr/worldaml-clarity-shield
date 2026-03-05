import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AMLHeroSection from "@/components/aml-screening/AMLHeroSection";
import AMLWhatIsSection from "@/components/aml-screening/AMLWhatIsSection";
import AMLFeaturesSection from "@/components/aml-screening/AMLFeaturesSection";
import AMLDataSourcesSection from "@/components/aml-screening/AMLDataSourcesSection";
import AMLUseCasesSection from "@/components/aml-screening/AMLUseCasesSection";
import AMLCTASection from "@/components/aml-screening/AMLCTASection";

const structuredData = {
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
