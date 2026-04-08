import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, CheckCircle2, Search, Shield, Globe } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  sanctionSections,
  allSources,
  type SanctionSource,
  type SanctionTag,
  type SanctionUrl,
} from "@/data/sanctionsLists";

// ─── Tag colour map (inline style approach to avoid purge issues) ─────────────
const tagColorMap: Record<SanctionTag | "All", { bg: string; color: string; border: string }> = {
  All:             { bg: "hsl(var(--secondary))",   color: "hsl(var(--secondary-foreground))", border: "hsl(var(--border))" },
  Sanctions:       { bg: "#fee2e2",                 color: "#b91c1c",                          border: "#fecaca" },
  Terrorism:       { bg: "#ffedd5",                 color: "#c2410c",                          border: "#fed7aa" },
  AML:             { bg: "#ede9fe",                 color: "#6d28d9",                          border: "#ddd6fe" },
  "Export Controls": { bg: "#fef9c3",               color: "#92400e",                          border: "#fde68a" },
  Debarment:       { bg: "#f4f4f5",                 color: "#52525b",                          border: "#e4e4e7" },
  "High Risk":     { bg: "#fef9c3",                 color: "#854d0e",                          border: "#fde68a" },
  Regional:        { bg: "hsl(var(--accent) / 0.12)", color: "hsl(var(--accent))",             border: "hsl(var(--accent) / 0.3)" },
};

function tagStyle(tag: SanctionTag | "All") {
  const c = tagColorMap[tag];
  return { backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` };
}

const filterTabs: (SanctionTag | "All")[] = [
  "All",
  "Sanctions",
  "Terrorism",
  "AML",
  "Debarment",
  "High Risk",
  "Regional",
];

// ─── JSON-LD structured data ─────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Global Sanctions Lists & AML Data Sources",
  description:
    "WorldAML aggregates authoritative sanctions, enforcement, and compliance lists from regulators and international organizations worldwide.",
  numberOfItems: allSources.length,
  itemListElement: allSources.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.name,
    url: Array.isArray(s.officialUrl) ? s.officialUrl[0].url : s.officialUrl,
  })),
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the OFAC SDN list?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The OFAC Specially Designated Nationals (SDN) List is maintained by the U.S. Treasury's Office of Foreign Assets Control. It names individuals, companies, vessels, and organisations that U.S. persons and financial institutions are prohibited from transacting with. The list covers terrorism, narcotics trafficking, weapons proliferation, and geopolitical sanctions programmes including Russia, Iran, North Korea, and Cuba.",
      },
    },
    {
      "@type": "Question",
      name: "What is the UN Security Council Consolidated Sanctions List?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The UN Security Council Consolidated Sanctions List contains individuals and entities subject to UN sanctions measures related to terrorism, proliferation, and international peace and security threats. It is legally binding on all UN member states and forms the global baseline for sanctions compliance — most national sanctions programmes are built on top of UN designations.",
      },
    },
    {
      "@type": "Question",
      name: "What is the EU Consolidated Financial Sanctions List?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The EU Consolidated Financial Sanctions List includes all persons, entities, and organisations subject to financial restrictive measures adopted by the European Union. It consolidates all EU sanctions programmes into a single list and is legally binding on all EU member states and EU-regulated institutions.",
      },
    },
    {
      "@type": "Question",
      name: "What is the UK OFSI sanctions list?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The UK Office of Financial Sanctions Implementation (OFSI) maintains the UK Sanctions List, which includes individuals and entities subject to financial sanctions under UK legislation. Since Brexit, the UK maintains its own autonomous sanctions list, which largely mirrors EU and UN designations but may diverge. UK-regulated firms must screen against the OFSI list independently of the EU Consolidated List.",
      },
    },
    {
      "@type": "Question",
      name: "Which sanctions lists are mandatory for banks to screen against?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The mandatory lists depend on your jurisdiction. At minimum: all financial institutions must screen against the UN Security Council Consolidated List. US-nexus institutions must also screen OFAC SDN and consolidated lists. EU-regulated firms must screen the EU Consolidated List. UK firms must screen the OFSI UK Sanctions List. GCC institutions are required to screen their national lists (CBUAE, SAMA, QFCRA) plus UN and OFAC. Most compliance programmes screen all major lists simultaneously.",
      },
    },
    {
      "@type": "Question",
      name: "What is the FATF grey list?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The FATF 'grey list' — formally called 'Jurisdictions under Increased Monitoring' — identifies countries with strategic deficiencies in their AML/CFT frameworks that have committed to address them. Financial institutions are expected to apply Enhanced Due Diligence (EDD) to transactions and relationships involving grey-listed jurisdictions. The FATF also maintains a 'black list' (High-Risk Jurisdictions Subject to a Call for Action) for countries with severe deficiencies.",
      },
    },
    {
      "@type": "Question",
      name: "How often are sanctions lists updated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Major sanctions lists are updated frequently and without prior notice. OFAC can add SDN designations same-day. The EU Consolidated List is updated via Official Journal publications, often weekly or more frequently. The UN list is updated by Security Council resolutions. Firms must implement ongoing monitoring that re-screens customers whenever lists are updated — relying on periodic batch re-screening alone is insufficient.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between sanctions screening and AML screening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sanctions screening checks whether a customer, counterparty, or transaction involves a designated individual or entity on a government watchlist — it is a binary compliance obligation. AML screening is broader and includes sanctions, PEP screening, adverse media checks, and transaction monitoring to detect suspicious activity that may indicate money laundering or terrorist financing, even if no formal designation exists.",
      },
    },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function renderLinks(officialUrl: SanctionUrl) {
  if (typeof officialUrl === "string") {
    return (
      <a
        href={officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent hover:text-accent/80 transition-colors"
      >
        Official Source
        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
      </a>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {officialUrl.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          {link.label}
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
        </a>
      ))}
    </div>
  );
}

// ─── Source Card ─────────────────────────────────────────────────────────────
function SourceCard({ source }: { source: SanctionSource }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200 h-full">
      {/* Top row: tag + jurisdiction */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={tagStyle(source.tag)}
        >
          {source.tag}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border">
          <Globe className="w-3 h-3" />
          {source.jurisdiction}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-body font-semibold text-navy leading-snug">
        {source.name}
      </h3>

      {/* Description */}
      <p className="text-body-sm text-muted-foreground leading-relaxed flex-1">
        {source.description}
      </p>

      {/* Footer */}
      <div className="border-t border-border pt-3 flex items-center justify-between gap-3 flex-wrap">
        {source.usedByWorldAML ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Used by WorldAML
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Reference source</span>
        )}
        {renderLinks(source.officialUrl)}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const SanctionsLists = () => {
  const [activeFilter, setActiveFilter] = useState<SanctionTag | "All">("All");

  // Filtered sections
  const filteredSections = useMemo(() => {
    if (activeFilter === "All") return sanctionSections;
    return sanctionSections
      .map((section) => ({
        ...section,
        sources: section.sources.filter((s) => s.tag === activeFilter),
      }))
      .filter((section) => section.sources.length > 0);
  }, [activeFilter]);

  const totalCount = useMemo(
    () => filteredSections.reduce((acc, s) => acc + s.sources.length, 0),
    [filteredSections]
  );

  return (
    <>
      <SEO
        title="Global Sanctions Lists & AML Data Sources | WorldAML"
        description="Reference of OFAC, EU, UN, OFSI, FATF and 30+ official sanctions lists and AML data sources used in compliance screening worldwide."
        canonical="/resources/sanctions-lists"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/sanctions-lists" },
          { name: "Sanctions Lists", url: "/resources/sanctions-lists" },
        ]}
        structuredData={[jsonLd, faqLd]}
      />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-surface-subtle to-background border-b border-divider">
        <div className="container-enterprise py-16 md:py-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-navy transition-colors">Home</Link>
            <span>/</span>
            <Link to="/resources/best-practices" className="hover:text-navy transition-colors">Resources</Link>
            <span>/</span>
            <span className="text-navy font-medium">Sanctions Lists</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-caption font-semibold px-3 py-1.5 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              Compliance Reference Hub
            </div>

            <h1 className="text-h1 font-bold text-navy mb-5">
              Global Sanctions Lists &amp; AML Data Sources
            </h1>

            <p className="text-body-lg text-text-secondary mb-8 max-w-2xl leading-relaxed">
              WorldAML aggregates authoritative sanctions, enforcement, and compliance lists
              from regulators and international organizations worldwide to support AML
              screening, sanctions monitoring, and due diligence.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" asChild>
                <Link to="/sanctions-check">
                  <Search className="w-4 h-4 mr-2" />
                  Run a Sanctions Check
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/data-sources/worldcompliance">Explore Data Sources</Link>
              </Button>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-divider">
              {[
                { label: "Official sources", value: `${allSources.length}+` },
                { label: "Jurisdictions covered", value: "35+" },
                { label: "Categories", value: "7" },
                { label: "Updated", value: "Continuously" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-h3 font-bold text-navy">{stat.value}</div>
                  <div className="text-body-sm text-text-tertiary">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-divider">
        <div className="container-enterprise py-3 flex items-center gap-2 flex-wrap">
          {filterTabs.map((tab) => {
            const count =
              tab === "All"
                ? allSources.length
                : allSources.filter((s) => s.tag === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-body-sm font-medium transition-all",
                  activeFilter === tab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-text-secondary hover:bg-secondary/80 hover:text-navy"
                )}
              >
                {tab}
                <span className="text-xs opacity-70">({count})</span>
              </button>
            );
          })}
          <span className="ml-auto text-body-sm text-text-tertiary hidden sm:block">
            Showing <strong className="text-navy">{totalCount}</strong> sources
          </span>
        </div>
      </div>

      {/* ── Sections ────────────────────────────────────────────────────────── */}
      <div className="container-enterprise py-12 md:py-16 space-y-16">
        {filteredSections.map((section) => (
          <section key={section.id} id={section.id}>
            {/* Section header */}
            <div className="mb-8">
              <h2 className="text-h2 font-bold text-navy mb-2">{section.title}</h2>
              <p className="text-body text-text-secondary max-w-2xl">
                {section.description}
              </p>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.sources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── Jurisdiction Comparison Table ────────────────────────────────── */}
      <section className="bg-surface-subtle border-y border-divider">
        <div className="container-enterprise py-12 md:py-16">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-caption font-semibold px-3 py-1.5 rounded-full mb-4">
              <Globe className="w-4 h-4" />
              Jurisdiction Reference
            </div>
            <h2 className="text-h2 font-bold text-navy mb-2">
              Mandatory Screening Lists by Jurisdiction
            </h2>
            <p className="text-body text-text-secondary max-w-2xl">
              Which sanctions lists are legally required for regulated financial institutions in each major jurisdiction. Always verify with local counsel — this is a reference guide only.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left px-5 py-3.5 font-semibold min-w-[160px]">Jurisdiction</th>
                  <th className="text-center px-4 py-3.5 font-semibold">UN SC</th>
                  <th className="text-center px-4 py-3.5 font-semibold">OFAC SDN</th>
                  <th className="text-center px-4 py-3.5 font-semibold">EU List</th>
                  <th className="text-center px-4 py-3.5 font-semibold">OFSI (UK)</th>
                  <th className="text-center px-4 py-3.5 font-semibold">National List</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Primary Regulator</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { j: "United States", un: true,  ofac: true,  eu: false, ofsi: false, nat: true,  reg: "OFAC / FinCEN" },
                  { j: "European Union", un: true,  ofac: false, eu: true,  ofsi: false, nat: false, reg: "National competent authorities" },
                  { j: "United Kingdom", un: true,  ofac: false, eu: false, ofsi: true,  nat: true,  reg: "OFSI / FCA" },
                  { j: "UAE (Mainland)", un: true,  ofac: true,  eu: false, ofsi: false, nat: true,  reg: "CBUAE" },
                  { j: "UAE — DIFC",     un: true,  ofac: true,  eu: false, ofsi: false, nat: true,  reg: "DFSA" },
                  { j: "UAE — ADGM",     un: true,  ofac: true,  eu: false, ofsi: false, nat: true,  reg: "FSRA" },
                  { j: "Saudi Arabia",   un: true,  ofac: true,  eu: false, ofsi: false, nat: true,  reg: "SAMA" },
                  { j: "Qatar (QFC)",    un: true,  ofac: true,  eu: false, ofsi: false, nat: true,  reg: "QFCRA" },
                  { j: "Bahrain",        un: true,  ofac: true,  eu: false, ofsi: false, nat: true,  reg: "CBB" },
                  { j: "Singapore",      un: true,  ofac: false, eu: false, ofsi: false, nat: true,  reg: "MAS" },
                  { j: "Hong Kong",      un: true,  ofac: false, eu: false, ofsi: false, nat: true,  reg: "HKMA / SFC" },
                  { j: "Australia",      un: true,  ofac: false, eu: false, ofsi: false, nat: true,  reg: "AUSTRAC / DFAT" },
                  { j: "Canada",         un: true,  ofac: false, eu: false, ofsi: false, nat: true,  reg: "OSFI / FINTRAC" },
                  { j: "Cyprus",         un: true,  ofac: false, eu: true,  ofsi: false, nat: false, reg: "CBC / CySEC" },
                  { j: "Malta",          un: true,  ofac: false, eu: true,  ofsi: false, nat: false, reg: "MFSA / SMB" },
                ].map((row, i) => (
                  <tr key={row.j} className={i % 2 === 0 ? "bg-background" : "bg-surface-subtle"}>
                    <td className="px-5 py-3 font-medium text-navy">{row.j}</td>
                    {[row.un, row.ofac, row.eu, row.ofsi, row.nat].map((v, ci) => (
                      <td key={ci} className="px-4 py-3 text-center">
                        {v
                          ? <span className="inline-flex justify-center"><CheckCircle2 className="w-4 h-4 text-accent" /></span>
                          : <span className="text-muted-foreground text-xs">—</span>
                        }
                      </td>
                    ))}
                    <td className="px-5 py-3 text-text-secondary">{row.reg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-tertiary mt-3">
            ✓ = mandatory screening requirement &nbsp;|&nbsp; — = not a direct legal obligation in that jurisdiction (recommended where marked). This table is for reference only — consult local counsel for definitive obligations.
          </p>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-surface-subtle border-t border-divider">
        <div className="container-enterprise py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-caption font-semibold px-3 py-1.5 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            Powered by WorldAML
          </div>
          <h2 className="text-h2 font-bold text-navy mb-4">
            Screen Against All These Lists in One API Call
          </h2>
          <p className="text-body-lg text-text-secondary mb-8 max-w-xl mx-auto">
            WorldAML aggregates OFAC, UN, EU, OFSI, and 30+ other official sanctions lists
            into a single real-time screening API. No manual updates, no missed designations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/sanctions-check">
                <Search className="w-4 h-4 mr-2" />
                Run a Free Sanctions Check
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/platform/api">View API Docs</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default SanctionsLists;
