import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Globe,
  Zap,
  Filter,
  Layers,
  Database,
  AlertTriangle,
  Radar,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Sanctions Screening Software — head-term landing page.
 *
 * Intent cluster:
 *  - sanctions screening software (US 590/mo, CPC ~$54 — highest-CPC term in the set)
 *  - ofac screening software / ofac compliance software
 *  - sanctions compliance software
 *  - watchlist screening software
 *  - real-time sanctions screening
 *  - payment screening software (SWIFT / wire / ACH)
 *  - pep and sanctions screening
 *  - 50 percent rule screening
 */

const lists = [
  {
    name: "OFAC (US Treasury)",
    detail: "SDN, all consolidated non-SDN lists (SSI, FSE, NS-PLC, PLC, MBS), sectoral sanctions, plus 50 Percent Rule ownership analysis.",
  },
  {
    name: "OFSI (UK HM Treasury)",
    detail: "UK Sanctions List (consolidated) and regime-specific lists — Russia, Belarus, Iran, DPRK, Syria — with 50%/control tests.",
  },
  {
    name: "EU Consolidated Financial Sanctions",
    detail: "EU consolidated list, CFSP regimes and national add-ons across member states.",
  },
  {
    name: "UN Security Council",
    detail: "UN 1267/1988/1718 and successor regimes, refreshed on publication.",
  },
  {
    name: "Global regional & national",
    detail: "Canada (SEMA/JVCFOA), Australia (DFAT), Switzerland (SECO), Japan (METI), Singapore (MAS), and 40+ additional national regimes.",
  },
  {
    name: "PEPs, RCAs & adverse media",
    detail: "Optional PEP, relatives & close associates and adverse-media data — 9.2M+ profiles across 40+ languages — layered on the same screening engine.",
  },
];

const features = [
  {
    icon: Zap,
    title: "Real-time payment screening",
    desc: "Sub-100ms screening for SWIFT MT/MX, SEPA, Faster Payments, ACH, wires and card authorisations — inline with your payments rails.",
  },
  {
    icon: Filter,
    title: "Fuzzy matching that actually tunes",
    desc: "Jaro-Winkler, phonetic, transliteration and script-aware matching (Cyrillic, Arabic, Chinese) with per-list threshold tuning and evidence of every tuning decision.",
  },
  {
    icon: Layers,
    title: "50% Rule & ownership networks",
    desc: "Automatic ownership aggregation to the OFAC/OFSI 50% threshold — screens ultimate beneficial owners, subsidiaries and control chains, not just the named entity.",
  },
  {
    icon: Database,
    title: "Live list feeds, minutes not days",
    desc: "OFAC, OFSI, EU, UN and national lists refreshed within minutes of publication. Delta reports show exactly what changed and which customers newly match.",
  },
  {
    icon: Globe,
    title: "1,900+ global watchlists",
    desc: "One screening call covers sanctions, PEPs, RCAs, law enforcement, regulatory and adverse-media lists — no separate vendors, no separate contracts.",
  },
  {
    icon: Radar,
    title: "Batch rescreening & delta alerts",
    desc: "Daily rescreening of the full customer base against the day's list changes — you only investigate the deltas, not every existing customer, every night.",
  },
  {
    icon: Shield,
    title: "Case management & audit trail",
    desc: "Four-eyes review, escalation, disposition codes, immutable audit trail and evidence packs formatted for NYDFS Part 504, FCA s.166 and FFIEC exams.",
  },
  {
    icon: AlertTriangle,
    title: "Model validation evidence pack",
    desc: "Above/below-the-line testing, sample validation, coverage analysis and tuning history — the artefacts examiners and independent testers actually ask for.",
  },
];

const useCases = [
  {
    title: "Onboarding screening",
    desc: "Screen every new customer, beneficial owner, authorised signer and related party against sanctions, PEP and adverse-media lists at account opening.",
  },
  {
    title: "Payment & transaction screening",
    desc: "Inline screening of every wire, SWIFT message, SEPA transfer, Faster Payment and card authorisation — block, hold or release with a full audit trail.",
  },
  {
    title: "Trade & counterparty screening",
    desc: "Trade-finance parties, shipping counterparties, dual-use goods and vessel screening — with 50% Rule ownership resolution.",
  },
  {
    title: "Continuous customer rescreening",
    desc: "Daily rescreening of the full customer base against the day's list deltas — investigate only what changed.",
  },
  {
    title: "Employee & third-party screening",
    desc: "Screen employees, vendors, agents and introducers — a growing expectation in FCA and OFAC guidance for financial-crime governance.",
  },
  {
    title: "Marketplace, gig & platform KYC",
    desc: "Real-time sanctions screening embedded in seller, host, driver, creator or merchant onboarding flows via one API.",
  },
];

const differentiators = [
  {
    title: "No false-positive tax",
    desc: "Tunable per-list thresholds, secondary identifiers (DOB, nationality, ID number) and machine-learning disposition suggestions cut false positives by up to 70% versus legacy screening engines — with every decision auditable.",
  },
  {
    title: "One API, every list",
    desc: "A single REST endpoint returns matches across sanctions, PEPs, RCAs, adverse media and ownership networks. No juggling three vendors or reconciling three schemas.",
  },
  {
    title: "Regulator-grade evidence, by default",
    desc: "Every screen, every alert, every disposition is captured with the exact list version, threshold, matcher, and reviewer — the record you want to hand an examiner or independent tester without extra work.",
  },
  {
    title: "Deploy in weeks, not quarters",
    desc: "Sandbox in a day, production in weeks. Compare that to the 6–12 month rollouts legacy sanctions vendors still quote.",
  },
];

const faqs = [
  {
    q: "What is sanctions screening software?",
    a: "Sanctions screening software matches customers, counterparties and payment parties against government sanctions lists (OFAC, OFSI, EU, UN and national regimes) plus, usually, PEP and adverse-media data. It runs at onboarding, on every payment in real time, and continuously against the existing customer base — with case management, tuning and audit trail to evidence a defensible programme.",
  },
  {
    q: "Which sanctions lists does WorldAML screen against?",
    a: "OFAC (SDN and all consolidated non-SDN lists), OFSI UK Sanctions List and regime lists, EU consolidated financial sanctions, UN Security Council regimes, plus Canada, Australia, Switzerland, Japan, Singapore and 40+ additional national regimes. All refreshed within minutes of publication and delivered with a delta feed.",
  },
  {
    q: "Does it handle the OFAC 50 Percent Rule and OFSI ownership tests?",
    a: "Yes. The engine aggregates ownership stakes across intermediaries to the 50% threshold and evaluates the UK's separate 'control' test, so a screen against a named entity also flags the entities it owns or controls. Ownership evidence is captured with every alert.",
  },
  {
    q: "Can it screen real-time payments (SWIFT, SEPA, Faster Payments, wires)?",
    a: "Yes. Real-time payment screening runs at sub-100ms latency inline with SWIFT MT/MX, SEPA (SCT/SCT Inst), Faster Payments, ACH, card authorisations and card payouts — with block/hold/release workflows and OFAC/OFSI-compliant reporting for blocked and rejected transactions.",
  },
  {
    q: "How does it reduce false positives?",
    a: "Three layers: (1) matching-algorithm tuning per list (Jaro-Winkler thresholds, phonetic, script-aware transliteration), (2) secondary-identifier filtering (DOB, nationality, ID number, country), and (3) ML-assisted disposition suggestions trained on your own historical decisions. Every tuning choice is recorded for independent testers and examiners.",
  },
  {
    q: "How is screening evidenced for regulators?",
    a: "Every screen records the list version, threshold, matcher configuration, alert details, disposition, reviewer and timestamp. Evidence packs align to NYDFS 23 NYCRR Part 504 annual certifications, FCA s.166 skilled-person reviews, FFIEC BSA/AML Exam Manual expectations and typical independent-testing scopes.",
  },
  {
    q: "Do you offer batch rescreening of the existing customer base?",
    a: "Yes. Daily rescreening runs against the day's list deltas — you only investigate customers whose match status has changed, not the entire base, every night. Full rescreens can also be scheduled on demand.",
  },
  {
    q: "Is it available via API?",
    a: "Yes — one REST API for onboarding, payment, batch and rescreening use cases, with SDKs and webhook callbacks. Full API documentation at platform.worldaml.com/api.",
  },
  {
    q: "How is it priced?",
    a: "Usage-based on screening calls and monitored customers, with volume tiers for banks, EMIs, MSBs, fintechs and marketplaces. Talk to sales for a tailored quote — most customers replace two or three sanctions and PEP vendors with a single WorldAML contract.",
  },
];

const SanctionsScreeningSoftware = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WorldAML Sanctions Screening Software",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Real-time sanctions screening software for OFAC, OFSI, EU, UN and 40+ national regimes — with 50% Rule ownership resolution, payment screening, PEP and adverse-media data in one API.",
    url: "https://worldaml.com/sanctions-screening-software",
    audience: {
      "@type": "Audience",
      audienceType: "Financial institutions, fintechs, marketplaces and payment providers",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "0",
      category: "Enterprise SaaS",
      url: "https://worldaml.com/contact-sales",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Sanctions Screening Software — OFAC & OFSI"
        description="Real-time sanctions screening software for OFAC, OFSI, EU, UN and 40+ national regimes. 50% Rule ownership resolution, sub-100ms payment screening, PEP and adverse-media data in one API."
        canonical="/sanctions-screening-software"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Sanctions Screening Software", url: "/sanctions-screening-software" },
        ]}
        structuredData={[faqLd, softwareLd]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">
                Sanctions Screening
              </p>
              <h1 className="text-headline text-navy mb-6">
                Sanctions screening software — OFAC, OFSI, EU and UN in one API
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                Real-time screening for onboarding and payments, daily rescreening of the customer
                base, and 50% Rule ownership resolution across 1,900+ global watchlists — with the
                tuning history and audit trail examiners actually ask for.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Talk to a screening specialist</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/free-aml-check">
                    Try a free sanctions check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-6">
                Used in production by banks, EMIs, MSBs, payment institutions, cryptoasset firms and
                marketplaces.
              </p>
            </div>
          </div>
        </section>

        {/* Lists */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Every list, one screening call</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              One API covers global sanctions regimes, PEPs, RCAs and adverse media — no separate
              vendors, no reconciled schemas.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((l) => (
                <Card key={l.name} className="border-divider">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-navy">{l.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{l.detail}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">
              Everything a modern sanctions programme needs
            </h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Purpose-built for real-time payment rails, ownership complexity and the tuning
              evidence examiners expect.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <Card key={f.title} className="border-divider bg-white">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent mb-3">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg text-navy">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{f.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">
              Where sanctions screening software gets used
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((u) => (
                <div key={u.title} className="p-6 rounded-lg border border-divider bg-white">
                  <h3 className="text-lg font-semibold text-navy mb-2">{u.title}</h3>
                  <p className="text-text-secondary">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-5xl">
            <h2 className="text-2xl text-navy mb-6">Why teams switch to WorldAML</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {differentiators.map((d) => (
                <div key={d.title} className="p-6 rounded-lg border border-divider bg-white">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-navy mb-2">{d.title}</h3>
                      <p className="text-text-secondary">{d.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">Sanctions screening software — FAQ</h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-divider pb-6">
                  <h3 className="text-lg font-semibold text-navy mb-2 flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    {f.q}
                  </h3>
                  <p className="text-text-secondary pl-7">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-3xl text-white mb-4">
              Screen every customer and every payment — in one API
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              See how WorldAML replaces two or three sanctions and PEP vendors with a single
              contract — and gives your examiners the evidence they expect.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/contact-sales">Request a demo</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link to="/free-aml-check">Try a free sanctions check</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SanctionsScreeningSoftware;
