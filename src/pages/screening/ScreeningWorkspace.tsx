import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import SuiteScreeningV2 from "@/pages/suite/SuiteScreeningV2";

/**
 * Standalone WorldAML Screening & Monitoring workspace.
 * Lives outside the Compliance Suite — provider-independent
 * investigation UI available as its own product area.
 */
export default function ScreeningWorkspace() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Screening & Monitoring | WorldAML"
        description="Provider-independent sanctions, PEP, watchlist and adverse media screening workspace with case management and ongoing monitoring."
        noindex
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <SuiteScreeningV2 />
      </main>
      <Footer />
    </div>
  );
}
