import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import NewHeroSection from "@/components/home/NewHeroSection";
import StatsSection from "@/components/home/StatsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import GlobalReachSection from "@/components/home/GlobalReachSection";
import TrustedByLogos from "@/components/TrustedByLogos";
import HomeCTASection from "@/components/home/HomeCTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <NewHeroSection />
        <StatsSection />
        <HowItWorksSection />
        <GlobalReachSection />
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