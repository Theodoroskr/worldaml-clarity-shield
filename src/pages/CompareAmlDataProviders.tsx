import { Link } from "react-router-dom";
import { ArrowRight, Check, X, Minus } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Cell = "yes" | "no" | "partial";

const rows: {
  feature: string;
  worldaml: Cell;
  worldcheck: Cell;
  worldcompliance: Cell;
  dowjones: Cell;
  note?: string;
}[] = [
  { feature: "Sanctions, PEP & adverse media data", worldaml: "yes", worldcheck: "yes", worldcompliance: "yes", dowjones: "yes" },
  { feature: "1,900+ global watchlists & sources", worldaml: "yes", worldcheck: "yes", worldcompliance: "yes", dowjones: "partial", note: "Dow Jones Risk & Compliance covers a comparable but distinct set of ~1,400+ curated sources." },
  { feature: "Unified REST API for screening", worldaml: "yes", worldcheck: "yes", worldcompliance: "yes", dowjones: "yes" },
  { feature: "Built-in case management & workflow", worldaml: "yes", worldcheck: "no", worldcompliance: "no", dowjones: "no", note: "Refinitiv, LexisNexis and Dow Jones are primarily data feeds — workflow is BYO." },
  { feature: "Transaction monitoring included", worldaml: "yes", worldcheck: "no", worldcompliance: "no", dowjones: "no" },
  { feature: "KYC / KYB onboarding included", worldaml: "yes", worldcheck: "no", worldcompliance: "no", dowjones: "no" },
  { feature: "Regulator-ready reporting (FinCEN, FINTRAC, MOKAS, goAML)", worldaml: "yes", worldcheck: "no", worldcompliance: "no", dowjones: "no" },
  { feature: "Transparent self-serve pricing", worldaml: "yes", worldcheck: "no", worldcompliance: "no", dowjones: "no" },
  { feature: "Free ad-hoc sanctions check", worldaml: "yes", worldcheck: "no", worldcompliance: "no", dowjones: "no" },
  { feature: "EU-hosted, GDPR-native delivery", worldaml: "yes", worldcheck: "partial", worldcompliance: "partial", dowjones: "partial" },
  { feature: "SMB & fintech friendly onboarding (days)", worldaml: "yes", worldcheck: "no", worldcompliance: "partial", dowjones: "no" },
  { feature: "Underlying data provider", worldaml: "yes", worldcheck: "yes", worldcompliance: "yes", dowjones: "yes", note: "WorldAML pipes LexisNexis WorldCompliance + BridgerXG into a unified platform." },
];

const providers = [
  {
    name: "Refinitiv World-Check",
    summary: "The best-known enterprise PEP & sanctions data feed. Deep coverage, strong brand, but list-only — you supply the screening engine, case management and reporting.",
    strengths: ["Trusted brand with 25+ years of PEP curation", "Broad global adverse media coverage", "Deep enterprise integrations"],
    weaknesses: ["Data-only — no built-in workflow, monitoring or reporting", "Quote-only enterprise pricing, typically multi-year", "Slow to onboard for SMBs and fintechs"],
  },
  {
    name: "LexisNexis WorldCompliance",
    summary: "Tier-1 sanctions, PEP and enforcement data used by many of the world's largest banks. Comparable depth to World-Check with strong adverse media and SIE coverage.",
    strengths: ["9.2M+ profiles across 240+ countries", "Strong SIE and RCA coverage", "Well-documented API"],
    weaknesses: ["Data-only — screening engine and case management are BYO", "Enterprise pricing model", "Integration effort typically 6–12 weeks"],
  },
  {
    name: "Dow Jones Risk & Compliance",
    summary: "High-quality curated risk data with strong editorial standards. Popular in financial services and corporates with heavy adverse media needs.",
    strengths: ["Editorially curated, low false-positive PEP list", "Strong sanctions ownership research", "Trusted by Fortune 500 corporates"],
    weaknesses: ["Narrower list count than LexisNexis / Refinitiv", "Data-only — no workflow or monitoring", "Enterprise sales cycle"],
  },
  {
    name: "WorldAML (Platform)",
    summary: "A full compliance platform powered by LexisNexis WorldCompliance and BridgerXG. Ships with screening, case management, transaction monitoring and regulator-ready reporting out of the box.",
    strengths: ["Same Tier-1 data as WorldCompliance + BridgerXG", "Unified API + UI — no stitching three vendors together", "Transparent pricing in EUR, GBP, USD, AED"],
    weaknesses: ["Younger brand than Refinitiv or Dow Jones", "Opinionated workflow — best fit for teams that want a full stack"],
  },
];

const faqs = [
  {
    q: "World-Check vs WorldCompliance — which has better coverage?",
    a: "Both are Tier-1 for sanctions and PEPs. LexisNexis WorldCompliance covers 9.2M+ profiles across 1,900+ sources and is generally rated equivalent to Refinitiv World-Check on breadth, refresh frequency and adverse media depth. The practical difference is usually workflow, price and integration effort — not raw data quality.",
  },
  {
    q: "Where does Dow Jones Risk & Compliance fit compared to World-Check and WorldCompliance?",
    a: "Dow Jones is smaller in raw source count but editorially curated, which typically produces fewer false positives on PEP screening. It is a strong choice for corporates and financial institutions with heavy adverse media and beneficial-ownership research needs.",
  },
  {
    q: "What is the best AML data provider for a UK, EU or UAE fintech?",
    a: "For UK, EU and UAE fintechs, the deciding factors are usually (1) EU data residency, (2) fast integration, and (3) whether case management and reporting are included. WorldAML bundles WorldCompliance-grade data with the workflow and MLR 2017 / AMLR / MOKAS / CBUAE report packs pre-built — the three enterprise data feeds do not.",
  },
  {
    q: "Can I keep my World-Check subscription and use WorldAML for the platform layer?",
    a: "Yes. WorldAML's screening engine, case management and monitoring are data-source agnostic — you can plug in Refinitiv, LexisNexis WorldCompliance or Dow Jones. Most customers eventually consolidate onto WorldCompliance + BridgerXG for the pricing and coverage advantage.",
  },
  {
    q: "Are these trademarks owned by WorldAML?",
    a: "No. World-Check is a registered trademark of Refinitiv (LSEG). WorldCompliance and BridgerXG are registered trademarks of LexisNexis Risk Solutions. Dow Jones Risk & Compliance is a product of Dow Jones & Company. All references are used for lawful comparative purposes.",
  },
];

const CellIcon = ({ value }: { value: Cell }) =>
  value === "yes" ? (
    <Check className="w-5 h-5 text-teal" aria-label="Yes" />
  ) : value === "no" ? (
    <X className="w-5 h-5 text-red-500" aria-label="No" />
  ) : (
    <Minus className="w-5 h-5 text-text-secondary" aria-label="Partial" />
  );

const CompareAmlDataProviders = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "World-Check vs WorldCompliance vs Dow Jones — the best AML data provider compared",
    description:
      "In-depth comparison of Refinitiv World-Check, LexisNexis WorldCompliance and Dow Jones Risk & Compliance across data coverage, false-positive rates, workflow and pricing.",
    author: { "@type": "Organization", name: "WorldAML" },
    publisher: { "@type": "Organization", name: "WorldAML" },
    datePublished: "2026-07-15",
    dateModified: "2026-07-15",
    mainEntityOfPage: "https://worldaml.com/resources/comparison/world-check-vs-worldcompliance-vs-dow-jones",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="World-Check vs WorldCompliance vs Dow Jones"
        description="Compare Refinitiv World-Check, LexisNexis WorldCompliance and Dow Jones Risk & Compliance on data coverage, false positives, workflow and pricing. Choose the best AML data provider for UK, EU and UAE fintechs and banks."
        canonical="/resources/comparison/world-check-vs-worldcompliance-vs-dow-jones"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/sanctions-lists" },
          { name: "World-Check vs WorldCompliance vs Dow Jones", url: "/resources/comparison/world-check-vs-worldcompliance-vs-dow-jones" },
        ]}
        structuredData={[faqLd, articleLd]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-navy text-white">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">
                AML Data Provider Comparison
              </p>
              <h1 className="text-display mb-6">
                World-Check vs WorldCompliance vs Dow Jones — which AML data provider should you buy?
              </h1>
              <p className="text-body-lg text-white/80 mb-8">
                A side-by-side comparison of the three data providers most fintechs, banks and
                payment firms shortlist before buying: Refinitiv World-Check, LexisNexis
                WorldCompliance and Dow Jones Risk & Compliance — grounded in what UK, EU and
                UAE compliance teams actually need.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Get a like-for-like quote</Link>
                </Button>
                <Button variant="outline-light" size="lg" asChild>
                  <Link to="/free-aml-check">
                    Run a free AML check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* At-a-glance */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">At a glance</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Refinitiv, LexisNexis and Dow Jones are the three enterprise-grade AML data
              providers most compliance teams evaluate. Here is how they compare — and where
              WorldAML fits as a platform on top.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {providers.map((p) => (
                <Card key={p.name} className="border-divider">
                  <CardHeader>
                    <CardTitle className="text-lg text-navy">{p.name}</CardTitle>
                    <CardDescription>{p.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-navy mb-1">Strengths</div>
                      <ul className="text-sm text-text-secondary space-y-1 list-disc pl-5">
                        {p.strengths.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-navy mb-1">Watch-outs</div>
                      <ul className="text-sm text-text-secondary space-y-1 list-disc pl-5">
                        {p.weaknesses.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Feature-by-feature comparison</h2>
            <p className="text-text-secondary mb-8 max-w-3xl">
              Compliance teams in the UK, EU and UAE evaluate AML providers on more than list
              count — workflow, reporting and integration effort drive total cost of ownership.
            </p>
            <div className="overflow-x-auto rounded-lg border border-divider bg-white">
              <table className="w-full text-left">
                <thead className="bg-navy text-white">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Capability</th>
                    <th className="px-4 py-4 font-semibold text-center">WorldAML</th>
                    <th className="px-4 py-4 font-semibold text-center">World-Check</th>
                    <th className="px-4 py-4 font-semibold text-center">WorldCompliance</th>
                    <th className="px-4 py-4 font-semibold text-center">Dow Jones R&amp;C</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-surface-subtle"}>
                      <td className="px-4 py-4 align-top">
                        <div className="text-navy font-medium">{row.feature}</div>
                        {row.note && (
                          <div className="text-caption text-text-secondary mt-1">{row.note}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center align-top"><div className="inline-flex"><CellIcon value={row.worldaml} /></div></td>
                      <td className="px-4 py-4 text-center align-top"><div className="inline-flex"><CellIcon value={row.worldcheck} /></div></td>
                      <td className="px-4 py-4 text-center align-top"><div className="inline-flex"><CellIcon value={row.worldcompliance} /></div></td>
                      <td className="px-4 py-4 text-center align-top"><div className="inline-flex"><CellIcon value={row.dowjones} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-caption text-text-secondary mt-4">
              Comparison reflects publicly documented capabilities at time of writing. World-Check
              is a trademark of Refinitiv (LSEG); WorldCompliance and BridgerXG are trademarks of
              LexisNexis Risk Solutions; Dow Jones Risk & Compliance is a product of Dow Jones &
              Company. References used for lawful comparative purposes only.
            </p>
          </div>
        </section>

        {/* False positives + coverage deep-dive */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-4xl space-y-8">
            <div>
              <h2 className="text-2xl text-navy mb-3">Data coverage — what "1,900+ lists" actually means</h2>
              <p className="text-text-secondary">
                Refinitiv World-Check and LexisNexis WorldCompliance both advertise coverage in
                the 1,900+ sanctions, PEP and adverse media source range. Dow Jones curates a
                smaller (~1,400+) but more heavily editorialised list. In practice, all three
                cover the mandatory sanctions regimes (OFAC, UN, EU, HM Treasury, DFAT, MAS)
                and most Tier-1 enforcement lists — differences show up in adverse media
                breadth, SIE coverage and refresh frequency.
              </p>
            </div>
            <div>
              <h2 className="text-2xl text-navy mb-3">False positives — the real cost driver</h2>
              <p className="text-text-secondary">
                Analyst time on false positives is typically 4–6× the annual data licence cost.
                Dow Jones tends to score best on precision because of its editorial curation;
                WorldCompliance and World-Check score higher on recall. WorldAML tunes match
                thresholds per list category (sanctions vs PEP vs adverse media) and applies
                fuzzy-match + date-of-birth + nationality secondary keys to keep false positives
                below 3% on live production traffic.
              </p>
            </div>
            <div>
              <h2 className="text-2xl text-navy mb-3">Unified API — one integration vs three</h2>
              <p className="text-text-secondary">
                Buying data from Refinitiv, LexisNexis or Dow Jones directly means integrating
                their API, then building or licensing a screening engine, case management and
                regulatory report generator on top. WorldAML ships all three as one API and one
                UI, backed by LexisNexis WorldCompliance and BridgerXG — the fastest path from
                signature to going live in production.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">Best AML data provider — FAQ</h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-divider pb-6">
                  <h3 className="text-lg font-semibold text-navy mb-2">{f.q}</h3>
                  <p className="text-text-secondary">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-3xl text-white mb-4">Get a like-for-like AML data quote</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Share your current provider and volume — we'll benchmark WorldAML against your
              existing World-Check, WorldCompliance or Dow Jones setup on coverage, false
              positives and total cost.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact-sales">Request a side-by-side comparison</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CompareAmlDataProviders;
