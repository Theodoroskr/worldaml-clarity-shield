import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Scale,
  Calendar,
  Globe,
  Shield,
  AlertTriangle,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { amlRegulations, comparisonMatrix } from "@/data/amlRegulations";

// ─── Expandable Regulation Card ──────────────────────────────────────────────
const RegulationCard = ({ reg }: { reg: (typeof amlRegulations)[0] }) => {
  const [open, setOpen] = useState(false);

  const accentColors: Record<string, string> = {
    "brand-teal": "bg-brand-teal/10 border-brand-teal/30",
    navy: "bg-navy/5 border-navy/20",
    slate: "bg-slate/10 border-slate/20",
    teal: "bg-teal-light/10 border-teal-light/30",
  };
  const badgeColors: Record<string, string> = {
    "brand-teal": "bg-brand-teal/10 text-brand-teal",
    navy: "bg-navy/10 text-navy",
    slate: "bg-slate/10 text-slate",
    teal: "bg-teal-light/10 text-teal-dark",
  };

  return (
    <article
      id={reg.id}
      className="rounded-2xl border border-divider bg-background overflow-hidden scroll-mt-28 hover:shadow-md transition-shadow"
    >
      {/* Card header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 md:p-8 flex items-start gap-4"
        aria-expanded={open}
      >
        {/* Flag */}
        <span className="text-3xl flex-shrink-0 leading-none mt-0.5">
          {reg.jurisdictionFlag}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={cn(
                "text-caption font-semibold px-2 py-0.5 rounded",
                badgeColors[reg.color] ?? "bg-secondary text-navy"
              )}
            >
              {reg.jurisdiction}
            </span>
            <span
              className={cn(
                "text-caption font-medium px-2 py-0.5 rounded border",
                reg.status === "In Force"
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-warning/10 text-warning border-warning/20"
              )}
            >
              {reg.status}
            </span>
          </div>
          <h2 className="text-heading-md font-bold text-navy leading-tight mb-1">
            {reg.shortName}
          </h2>
          <p className="text-body-sm text-text-tertiary">{reg.fullName}</p>
          <p className="text-body-sm text-text-secondary mt-2 line-clamp-2">
            {reg.scope}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "h-5 w-5 text-text-tertiary flex-shrink-0 mt-1 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-divider">
          {/* Scope & Authority */}
          <div className="grid md:grid-cols-3 gap-0 border-b border-divider">
            {[
              { icon: Scale, label: "Authority", value: reg.authority },
              { icon: Calendar, label: "Effective", value: reg.effectiveDate },
              { icon: Globe, label: "Scope", value: reg.scope },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-5 border-b md:border-b-0 md:border-r border-divider last:border-0"
              >
                <Icon className="h-4 w-4 text-brand-teal flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Key Obligations */}
          <div className="p-6 md:p-8">
            <h3 className="text-heading-sm font-bold text-navy mb-4">
              Key Obligations
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {reg.keyObligations.map((ob) => (
                <div
                  key={ob.area}
                  className={cn(
                    "rounded-xl border p-4",
                    accentColors[reg.color] ?? "bg-secondary/50 border-divider"
                  )}
                >
                  <p className="text-body-sm font-semibold text-navy mb-1">
                    {ob.area}
                    {ob.threshold && (
                      <span className="ml-2 text-caption font-normal text-brand-teal">
                        ({ob.threshold})
                      </span>
                    )}
                  </p>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    {ob.requirement}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick-ref row */}
          <div className="grid md:grid-cols-3 gap-0 border-t border-divider">
            {[
              { icon: Shield, label: "UBO Threshold", value: reg.uboThreshold },
              { icon: AlertTriangle, label: "PEP Requirement", value: reg.pepRequirement },
              { icon: Scale, label: "Max Penalty", value: reg.penaltyRegime },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-5 border-b md:border-b-0 md:border-r border-divider last:border-0"
              >
                <Icon className="h-4 w-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <p className="text-body-sm text-text-secondary">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="p-6 md:p-8 border-t border-divider">
            <h3 className="text-heading-sm font-bold text-navy mb-5">
              Regulatory Timeline
            </h3>
            <ol className="relative border-l-2 border-divider pl-6 space-y-4">
              {reg.timeline.map((item) => (
                <li key={item.year} className="relative">
                  <span className="absolute -left-[1.55rem] top-1 h-3 w-3 rounded-full bg-brand-teal border-2 border-background" />
                  <span className="text-caption font-bold text-brand-teal mr-3">
                    {item.year}
                  </span>
                  <span className="text-body-sm text-text-secondary">
                    {item.event}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Links footer */}
          <div className="p-6 md:p-8 border-t border-divider bg-surface-subtle flex flex-wrap items-center gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              {reg.relatedLinks.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="inline-flex items-center gap-1 text-body-sm text-navy font-medium hover:text-brand-teal transition-colors"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  {l.label}
                </Link>
              ))}
            </div>
            <a
              href={reg.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-body-sm text-text-tertiary hover:text-navy transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Official source
            </a>
          </div>
        </div>
      )}
    </article>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AMLRegulations = () => {
  const [activeJurisdiction, setActiveJurisdiction] = useState<string>("all");

  const jurisdictions = [
    { id: "all", label: "All Jurisdictions" },
    { id: "fatf", label: "🌐 Global (FATF)" },
    { id: "eu6amld", label: "🇪🇺 European Union" },
    { id: "uk-mlrs", label: "🇬🇧 United Kingdom" },
    { id: "us-bsa", label: "🇺🇸 United States" },
    { id: "cyprus-aml", label: "🇨🇾 Cyprus" },
    { id: "malta-pmlftr", label: "🇲🇹 Malta" },
    { id: "japan-aml", label: "🇯🇵 Japan" },
    { id: "south-korea-aml", label: "🇰🇷 South Korea" },
    { id: "switzerland-aml", label: "🇨🇭 Switzerland" },
    { id: "luxembourg-aml", label: "🇱🇺 Luxembourg" },
    { id: "cayman-islands-aml", label: "🇰🇾 Cayman Islands" },
    { id: "jersey-aml", label: "🇯🇪 Jersey" },
  ];

  const filtered =
    activeJurisdiction === "all"
      ? amlRegulations
      : amlRegulations.filter((r) => r.id === activeJurisdiction);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AML Regulations by Jurisdiction",
    description:
      "Key anti-money laundering regulations mapped across 12 jurisdictions — FATF, EU, UK, US, Japan, Switzerland, Luxembourg, Cyprus, Malta, South Korea, Cayman Islands, and Jersey.",
    url: "https://www.worldaml.com/resources/aml-regulations",
    itemListElement: amlRegulations.map((reg, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: reg.shortName,
      url: `https://www.worldaml.com/resources/aml-regulations#${reg.id}`,
      description: reg.scope,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="AML Regulations by Jurisdiction — 12 Countries Compared"
        description="Compare AML regulations across 12 jurisdictions — FATF, EU, UK, US, Japan, Switzerland and more. Obligations, penalties, and UBO thresholds."
        canonical="/resources/aml-regulations"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/aml-regulations" },
          { name: "AML Regulations", url: "/resources/aml-regulations" },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-surface-subtle border-b border-divider py-16 md:py-20">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">
                Resources
              </Badge>
              <h1 className="text-display-sm md:text-display font-bold text-navy mb-5">
                AML Regulations by Jurisdiction
              </h1>
              <p className="text-body-lg text-text-secondary mb-4">
                A reference guide to twelve key anti-money laundering and counter-terrorist financing frameworks — covering obligations, beneficial ownership thresholds, sanctions requirements, penalty regimes, and regulatory timelines across 12 jurisdictions.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-body-sm mb-6">
                <Link to="/platform/aml-screening" className="text-brand-teal hover:text-navy font-medium transition-colors inline-flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> AML Screening Platform
                </Link>
                <Link to="/resources/glossary" className="text-brand-teal hover:text-navy font-medium transition-colors inline-flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> Compliance Glossary
                </Link>
                <Link to="/free-aml-check" className="text-brand-teal hover:text-navy font-medium transition-colors inline-flex items-center gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Free Sanctions Check
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {amlRegulations.map((r) => (
                  <a
                    key={r.id}
                    href={`#${r.id}`}
                    className="inline-flex items-center gap-1.5 text-body-sm text-navy font-medium bg-background border border-divider rounded-lg px-3 py-1.5 hover:border-navy/40 hover:shadow-sm transition-all"
                  >
                    <span>{r.jurisdictionFlag}</span>
                    {r.shortName.split(" ").slice(0, 3).join(" ")}
                    <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Jurisdiction filter tabs */}
        <nav className="border-b border-divider bg-background sticky top-16 z-30">
          <div className="container-enterprise py-2.5">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {jurisdictions.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setActiveJurisdiction(j.id)}
                  className={cn(
                    "whitespace-nowrap px-4 py-1.5 rounded-full text-body-sm font-medium transition-colors border flex-shrink-0",
                    activeJurisdiction === j.id
                      ? "bg-navy text-white border-navy"
                      : "text-text-secondary border-divider hover:border-navy/40 hover:text-navy"
                  )}
                >
                  {j.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="container-enterprise py-12 md:py-16 space-y-16">
          {/* Regulation cards */}
          <section>
            <div className="space-y-5">
              {filtered.map((reg) => (
                <RegulationCard key={reg.id} reg={reg} />
              ))}
            </div>
          </section>

          {/* Comparison matrix — only when showing all */}
          {activeJurisdiction === "all" && (
            <section id="comparison">
              <div className="mb-6">
                <h2 className="text-heading-lg font-bold text-navy mb-2">
                  Side-by-Side Comparison
                </h2>
                <p className="text-body text-text-secondary">
                  Key requirements across all twelve frameworks at a glance.
                </p>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-divider">
                <table className="w-full text-body-sm min-w-[1400px]">
                  <thead>
                    <tr className="bg-surface-subtle border-b border-divider">
                      <th className="text-left font-semibold text-navy px-5 py-4 w-44">
                        Requirement
                      </th>
                      {[
                        { label: "🌐 FATF", key: "fatf" },
                        { label: "🇪🇺 EU", key: "eu" },
                        { label: "🇬🇧 UK", key: "uk" },
                        { label: "🇺🇸 US", key: "us" },
                        { label: "🇨🇾 Cyprus", key: "cyprus" },
                        { label: "🇲🇹 Malta", key: "malta" },
                        { label: "🇯🇵 Japan", key: "japan" },
                        { label: "🇰🇷 S. Korea", key: "southKorea" },
                        { label: "🇨🇭 Switzerland", key: "switzerland" },
                        { label: "🇱🇺 Luxembourg", key: "luxembourg" },
                        { label: "🇰🇾 Cayman", key: "cayman" },
                        { label: "🇯🇪 Jersey", key: "jersey" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="text-left font-semibold text-navy px-4 py-4 border-l border-divider"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonMatrix.map((row, ri) => (
                      <tr
                        key={row.aspect}
                        className={cn(
                          "border-b border-divider last:border-0",
                          ri % 2 === 1 && "bg-surface-subtle/40"
                        )}
                      >
                        <td className="px-5 py-4 font-medium text-navy align-top">
                          {row.aspect}
                        </td>
                        {(["fatf", "eu", "uk", "us", "cyprus", "malta", "japan", "southKorea", "switzerland", "luxembourg", "cayman", "jersey"] as const).map(
                          (key) => (
                            <td
                              key={key}
                              className="px-4 py-4 text-text-secondary border-l border-divider align-top leading-relaxed"
                            >
                              {row[key]}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Related Resources */}
          <section>
            <h2 className="text-heading-lg font-bold text-navy mb-6">
              Related Resources
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "AML Screening Platform", description: "Automated screening against global watchlists, PEPs, and sanctions in real time.", href: "/platform/aml-screening" },
                { title: "KYC & KYB Onboarding", description: "Streamlined identity verification and business due diligence workflows.", href: "/platform/kyc-kyb" },
                { title: "Transaction Monitoring", description: "Rule-based and AI-driven monitoring to detect suspicious activity patterns.", href: "/platform/transaction-monitoring" },
                { title: "Compliance Glossary", description: "Definitions for AML, KYC, UBO, PEP, SAR, and 200+ compliance terms.", href: "/resources/glossary" },
                { title: "Free Sanctions Check", description: "Search global sanctions and PEP lists instantly — no account required.", href: "/free-aml-check" },
                { title: "Data Coverage", description: "Explore the breadth of our global data sources across 200+ countries.", href: "/resources/data-coverage" },
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group rounded-xl border border-divider bg-background p-5 hover:border-navy/30 hover:shadow-sm transition-all"
                >
                  <h3 className="text-body font-semibold text-navy mb-1 group-hover:text-brand-teal transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="rounded-2xl border border-divider bg-surface-subtle p-8 md:p-12 text-center">
            <h2 className="text-heading-lg font-bold text-navy mb-3">
              Turn regulatory requirements into automated controls
            </h2>
            <p className="text-body text-text-secondary max-w-xl mx-auto mb-8">
              WorldAML maps each of these regulatory obligations to specific platform capabilities — from CDD and UBO verification to sanctions screening, transaction monitoring, and audit-ready reporting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy text-white font-medium px-6 py-2.5 hover:bg-navy/90 transition-colors"
              >
                Request a Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/platform/suite"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-divider text-navy font-medium px-6 py-2.5 hover:bg-background transition-colors"
              >
                Explore WorldAML Suite
              </Link>
              <Link
                to="/resources/glossary"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-divider text-navy font-medium px-6 py-2.5 hover:bg-background transition-colors"
              >
                Compliance Glossary
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AMLRegulations;
