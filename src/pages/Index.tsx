import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrustArchitectureSection from "@/components/home/TrustArchitectureSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ProductSplitSection from "@/components/home/ProductSplitSection";
import APIIntelligenceSection from "@/components/home/APIIntelligenceSection";
import GlobalReachSection from "@/components/home/GlobalReachSection";
import IndustriesSection from "@/components/home/IndustriesSection";
import PricingPreviewSection from "@/components/home/PricingPreviewSection";
import FinalCTASection from "@/components/home/FinalCTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustArchitectureSection />
        <HowItWorksSection />
        <ProductSplitSection />
        <APIIntelligenceSection />
        <GlobalReachSection />
        <IndustriesSection />
        <PricingPreviewSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
