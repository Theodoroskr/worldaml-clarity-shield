import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import ProductModulesSection from "@/components/home/ProductModulesSection";
import StatsSection from "@/components/home/StatsSection";
import AdverseMediaSection from "@/components/home/AdverseMediaSection";
import IndustriesSection from "@/components/home/IndustriesSection";
import PricingTeaserSection from "@/components/home/PricingTeaserSection";
import SupportSection from "@/components/home/SupportSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProductModulesSection />
        <StatsSection />
        <AdverseMediaSection />
        <IndustriesSection />
        <PricingTeaserSection />
        <SupportSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
