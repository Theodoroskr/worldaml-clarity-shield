import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DemoHeroSection from "@/components/demo/DemoHeroSection";
import DashboardOverview from "@/components/demo/DashboardOverview";
import EntityProfileCard from "@/components/demo/EntityProfileCard";
import CompanyProfileCard from "@/components/demo/CompanyProfileCard";
import AuditTrailPanel from "@/components/demo/AuditTrailPanel";
import DemoCTASection from "@/components/demo/DemoCTASection";

const Demo = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <DemoHeroSection />
        <DashboardOverview />
        <EntityProfileCard />
        <CompanyProfileCard />
        <AuditTrailPanel />
        <DemoCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Demo;
