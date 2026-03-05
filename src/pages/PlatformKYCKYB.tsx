import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KYCHeroSection from "@/components/kyc-kyb/KYCHeroSection";
import KYCWhatIsSection from "@/components/kyc-kyb/KYCWhatIsSection";
import KYCFeaturesSection from "@/components/kyc-kyb/KYCFeaturesSection";
import KYCHowItWorksSection from "@/components/kyc-kyb/KYCHowItWorksSection";
import KYCUseCasesSection from "@/components/kyc-kyb/KYCUseCasesSection";
import KYCCTASection from "@/components/kyc-kyb/KYCCTASection";

const structuredData = {
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
