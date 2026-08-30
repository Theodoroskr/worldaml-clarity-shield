import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AMLHeroSection from "@/components/aml-screening/AMLHeroSection";
import AMLWhatIsSection from "@/components/aml-screening/AMLWhatIsSection";
import AMLFeaturesSection from "@/components/aml-screening/AMLFeaturesSection";
import AMLUseCasesSection from "@/components/aml-screening/AMLUseCasesSection";
import AMLPackagesSection from "@/components/aml-screening/AMLPackagesSection";
import ScreeningPlanComparison from "@/components/aml-screening/ScreeningPlanComparison";
import AMLCTASection from "@/components/aml-screening/AMLCTASection";
import StickyDemoCTA from "@/components/StickyDemoCTA";
import ScreeningProductNav from "@/components/screening/ScreeningProductNav";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WORLDAML Screening & Monitoring",
  applicationCategory: "FinancialApplication",
  description: "WORLDAML Screening & Monitoring software covering sanctions, PEPs, adverse media, and RCAs. FATF R.6, R.12, and R.16 aligned.",
  operatingSystem: "Web",
  url: "https://worldaml.com/screening-monitoring",
  offers: { "@type": "Offer", category: "SaaS", url: "https://worldaml.com/screening-monitoring/pricing" },
  provider: { "@type": "Organization", name: "WorldAML", url: "https://worldaml.com" },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AML screening software?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AML screening software automatically checks customers, transactions, and counterparties against global sanctions lists, PEP databases, adverse media sources, and regulatory watchlists. It flags potential matches for analyst review, replacing manual checks and ensuring no designated individual or entity passes through undetected.",
      },
    },
    {
      "@type": "Question",
      name: "Which sanctions lists should I screen against?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At minimum, you should screen against OFAC SDN (USA), EU Consolidated Sanctions List, UN Security Council Consolidated List, and HM Treasury Financial Sanctions List (UK). Regulated firms should also screen regional lists relevant to their business geographies, including DFAT (Australia), SECO (Switzerland), and applicable GCC lists.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between real-time and batch AML screening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Real-time screening checks individuals or entities at the point of onboarding or transaction, returning results within milliseconds via API. Batch screening processes your entire customer base at once — typically triggered when a watchlist is updated — to identify any existing customers who have been newly designated.",
      },
    },
    {
      "@type": "Question",
      name: "What are PEPs in AML compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Politically Exposed Persons (PEPs) are individuals who hold or have held prominent public functions, such as heads of state, senior politicians, central bank officials, and senior executives of state-owned enterprises. PEPs are considered higher risk for bribery and corruption and require Enhanced Due Diligence (EDD) under FATF Recommendation 12 and EU AMLD.",
      },
    },
    {
      "@type": "Question",
      name: "How often should sanctions screening be performed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sanctions screening must occur at onboarding and on an ongoing basis whenever lists are updated. OFAC and other major sanctions authorities can add designations with same-day effect, so ongoing monitoring should be near-real-time. Relying on annual re-screening is insufficient and creates regulatory exposure.",
      },
    },
    {
      "@type": "Question",
      name: "What is adverse media screening in AML?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Adverse media screening — also called negative news screening — searches global news sources, court records, and regulatory databases for negative information about a customer. It captures intelligence on financial crime, corruption, fraud, and regulatory sanctions before they appear on formal watchlists, providing an early warning signal for compliance teams.",
      },
    },
    {
      "@type": "Question",
      name: "How do I reduce false positives in AML screening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reducing false positives requires calibrated fuzzy name matching (using phonetic algorithms and edit-distance scoring), screening all aliases listed for designated entities, applying risk-tiered match thresholds, and documenting all false positive disposals with analyst rationale. Regular tuning of thresholds based on alert-to-SAR conversion rates is also essential.",
      },
    },
    {
      "@type": "Question",
      name: "What regulations require AML screening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AML screening is required by FATF Recommendations 6, 12, and 16; the EU Anti-Money Laundering Directives (4AMLD, 5AMLD, 6AMLD); the UK Money Laundering Regulations 2017; the US Bank Secrecy Act and OFAC regulations; and jurisdiction-specific AML laws in over 200 countries that have adopted the FATF framework.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const ScreeningMonitoring = () => {
  useEffect(() => {
    // Fire-and-forget: only tracked for authenticated users; edge function requires JWT
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      supabase.functions.invoke("log-outreach-event", {
        body: { event_type: "aml_page_view", path: "/screening-monitoring" },
      }).catch(() => {});
    });
  }, []);

  // Checkout cancel deep link: /screening-monitoring?canceled=true#packages
  const [searchParams, setSearchParams] = useSearchParams();
  const [cancelBanner, setCancelBanner] = useState(searchParams.get("canceled") === "true");

  useEffect(() => {
    if (searchParams.get("canceled") !== "true") return;
    // Strip the query param so a refresh doesn't re-show the banner.
    const next = new URLSearchParams(searchParams);
    next.delete("canceled");
    const hash = window.location.hash;
    setSearchParams(next, { replace: true });
    if (hash) window.history.replaceState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}${hash}`);
  }, [searchParams, setSearchParams]);

  // Deep links from the portal / checkout cancel land on #packages.
  useEffect(() => {
    if (window.location.hash !== "#packages") return;
    const t = window.setTimeout(() => {
      document.getElementById("packages")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => window.clearTimeout(t);
  }, []);

  return (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="WORLDAML Screening & Monitoring — Sanctions & PEP"
      description="WORLDAML Screening & Monitoring software covering sanctions, PEPs, adverse media, and RCAs. Real-time and batch screening across 1,900+ global lists."
      canonical="/screening-monitoring"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Screening & Monitoring", url: "/screening-monitoring" },
      ]}
      structuredData={structuredData}
    />
    <Header />
    <ScreeningProductNav />
    {cancelBanner && (
      <div className="bg-amber-500/10 border-b border-amber-500/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 text-sm text-foreground">
          <XCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Checkout was canceled — no charge was made. Pick a plan below whenever you're ready.</span>
          <button
            type="button"
            onClick={() => setCancelBanner(false)}
            className="text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      </div>
    )}
    <main className="flex-1">
      <AMLHeroSection />
      <AMLWhatIsSection />
      <AMLFeaturesSection />
      <AMLUseCasesSection />
      <AMLPackagesSection />
      <ScreeningPlanComparison />
      <AMLCTASection />
    </main>
    <Footer />
    <StickyDemoCTA product="aml" label="Book an AML Demo" />
    </div>
  );
};

export default ScreeningMonitoring;
