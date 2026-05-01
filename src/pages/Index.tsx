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
        title="AML Screening Software for US, UK, EU & UAE Compliance"
        description="Enterprise AML sanctions screening, KYC/KYB, PEP checks & adverse media monitoring. Trusted by compliance teams in the US, UK, Europe and UAE. 1,900+ global lists."
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
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "WorldAML",
            "url": "https://www.worldaml.com",
            "logo": "https://www.worldaml.com/og-image.png",
            "areaServed": [
              { "@type": "Country", "name": "United States" },
              { "@type": "Country", "name": "United Kingdom" },
              { "@type": "Country", "name": "United Arab Emirates" },
              { "@type": "AdministrativeArea", "name": "European Union" }
            ],
            "knowsLanguage": "en",
            "description": "AML compliance platform providing sanctions screening, KYC/KYB verification, PEP checks and transaction monitoring for regulated firms in the US, UK, EU and Middle East."
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