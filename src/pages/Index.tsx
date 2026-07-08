import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewHeroSection from "@/components/home/NewHeroSection";
import StatsSection from "@/components/home/StatsSection";
import BusinessImpactSection from "@/components/home/BusinessImpactSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import GlobalReachSection from "@/components/home/GlobalReachSection";
import AcademyPromoSection from "@/components/home/AcademyPromoSection";
import TrustedByLogos from "@/components/TrustedByLogos";
import HomeCTASection from "@/components/home/HomeCTASection";
import IndustriesSection from "@/components/home/IndustriesSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
       title="AML, KYC & Sanctions Screening Platform"
       description="Enterprise AML sanctions, PEP, adverse media & KYC/KYB screening across 1,900+ global lists. Trusted by US, UK, EU and UAE compliance teams."
        canonical="/"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "WorldAML - AML Screening Platform",
            "description": "Enterprise-grade financial crime screening infrastructure for regulated organisations in the US, UK, EU and UAE.",
            "url": "https://www.worldaml.com/",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "WorldAML",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web"
            }
          }
        ]}
      />
      <Header />
      <main className="flex-1">
        <NewHeroSection />
        <BusinessImpactSection />
        <StatsSection />
        <IndustriesSection />
        <HowItWorksSection />
        <GlobalReachSection />
        <AcademyPromoSection />
        <TrustedByLogos 
          title="Trusted by Regulated Organisations"
          description="Financial institutions, fintechs, and compliance teams rely on WorldAML for their financial crime screening requirements."
        />
        <HomeCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;