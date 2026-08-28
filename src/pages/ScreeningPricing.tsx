import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScreeningProductNav from "@/components/screening/ScreeningProductNav";
import AMLPackagesSection from "@/components/aml-screening/AMLPackagesSection";
import ScreeningPlanComparison from "@/components/aml-screening/ScreeningPlanComparison";
import AMLCTASection from "@/components/aml-screening/AMLCTASection";
import { SOLUTION_BY_KEY } from "@/lib/businessCatalogue";

const solution = SOLUTION_BY_KEY["worldaml"];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "WorldAML Screening & Monitoring",
  description:
    "Sanctions, PEP and adverse media screening with ongoing monitoring, case management and full audit trail.",
  brand: { "@type": "Organization", name: "WorldAML" },
  offers: (solution?.plans ?? [])
    .filter((p) => p.price && /\d/.test(p.price))
    .map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: (p.price ?? "").replace(/[^\d.]/g, ""),
      priceCurrency: "EUR",
      url: "https://www.worldaml.com/screening-monitoring/pricing",
      availability: "https://schema.org/InStock",
    })),
};

const ScreeningPricing = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Screening & Monitoring Pricing & Packages"
      description="Annual pricing for WorldAML Screening & Monitoring. Platform plans from €590/year and API-only plans from €1,950/year with monitoring and audit-ready evidence."
      canonical="/screening-monitoring/pricing"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Screening & Monitoring", url: "/screening-monitoring" },
        { name: "Pricing", url: "/screening-monitoring/pricing" },
      ]}
      structuredData={structuredData}
    />
    <Header />
    <ScreeningProductNav />
    <main className="flex-1">
      <section className="section-padding pb-0">
        <div className="container-enterprise max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Screening &amp; Monitoring pricing
          </h1>
          <p className="mt-3 text-muted-foreground">
            Same pricing whether you are signed in or not. Buy online, activate immediately, and start
            screening in the workspace.
          </p>
        </div>
      </section>
      <AMLPackagesSection />
      <ScreeningPlanComparison />
      <AMLCTASection />
    </main>
    <Footer />
  </div>
);

export default ScreeningPricing;
