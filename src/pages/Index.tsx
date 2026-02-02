import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewHeroSection from "@/components/home/NewHeroSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <NewHeroSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
