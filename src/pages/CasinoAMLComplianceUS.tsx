import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Dice5,
  Shield,
  FileCheck,
  AlertTriangle,
  Scale,
  Landmark,
  Users,
  Coins,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CasinoDemoRequestForm from "@/components/forms/CasinoDemoRequestForm";


/**
 * US casino & gaming AML landing page.
 *
 * Intent cluster:
 *  - casino aml compliance software
 *  - title 31 compliance software
 *  - casino sar / ctrc filing software
 *  - gaming aml software (sports betting, igaming, tribal casinos)
 *  - ofac screening for casinos
 */

const regulators = [
  {
    name: "Title 31 & 31 CFR Chapter X (Part 1021)",
    desc: "Casinos and card clubs with over $1M in annual gaming revenue are financial institutions under the Bank Secrecy Act — required to maintain a written, risk-based AML compliance program, file CTRCs and SARCs, and keep MTL records.",
  },
  {
    name: "FinCEN",
    desc: "Administers casino SAR (FinCEN Form 111) and CTRC (Form 112) filing, the CDD Final Rule, 314(a)/(b) information sharing and casino-specific advisories on minimal-gaming, structuring and marker abuse.",
  },
  {
    name: "IRS Small Business/Self-Employed (Title 31 exams)",
    desc: "The IRS SB/SE examines casinos for BSA compliance. Its Title 31 exam workpapers focus on risk assessment, MTL accuracy, aggregation, independent testing and training evidence.",
  },
  {
    name: "Nevada Regulation 6A & state gaming boards",
    desc: "Nevada GCB Reg 6A, New Jersey DGE, Michigan MGCB, Pennsylvania PGCB and other state regulators impose gaming-specific AML, patron identification and reporting obligations on top of federal rules.",
  },
  {
    name: "Tribal gaming (IGRA / NIGC)",
    desc: "Class II and Class III tribal operations are subject to Title 31 alongside NIGC minimum internal control standards (MICS) and tribal gaming commission oversight.",
  },
  {
    name: "OFAC",
    desc: "Strict-liability sanctions screening on patrons, junket operators, payment counterparties and affiliates — SDN, consolidated lists and the 50 Percent Rule.",
  },
];

const features = [
  {
    icon: Coins,
    title: "MTL aggregation & CTRC automation",
    desc: "Aggregate cash-in and cash-out across cage, table games, slots, sportsbook and online wallets over each gaming day, with automatic $10,000 CTRC triggers and $3,000 MTL recordkeeping.",
  },
  {
    icon: FileCheck,
    title: "SARC filing with narrative builder",
    desc: "Structured FinCEN Form 111 output with casino-specific suspicious activity categories, 30/60-day deadline tracking, continuing-activity reviews and evidence packaging.",
  },
  {
    icon: Shield,
    title: "Patron KYC & source of funds",
    desc: "Identity verification, ID document capture, source-of-funds and source-of-wealth declarations for high-rollers, credit/marker patrons and junket participants.",
  },
  {
    icon: AlertTriangle,
    title: "Gaming-specific monitoring rules",
    desc: "Detection for structuring, minimal gaming with large cash-out, chip walking and chip dumping, marker abuse, third-party funding, bonus abuse and rapid deposit-withdrawal cycling.",
  },
  {
    icon: Scale,
    title: "PEP, adverse media & OFAC screening",
    desc: "Screen patrons, junket operators, VIP hosts' counterparties and vendors against 1,900+ lists including OFAC SDN, PEPs, RCAs and negative news in 40+ languages.",
  },
  {
    icon: Users,
    title: "Responsible gaming & self-exclusion links",
    desc: "Cross-reference state self-exclusion and voluntary exclusion registers alongside AML risk so compliance and RG teams work from one patron file.",
  },
  {
    icon: Landmark,
    title: "Multi-property & multi-state rollups",
    desc: "Property-level controls with corporate rollup reporting for operators running land-based, tribal, sportsbook and iGaming licences across several states.",
  },
  {
    icon: Dice5,
    title: "Independent-testing evidence pack",
    desc: "Immutable audit trail, rule-tuning history, training records and risk assessments formatted for IRS Title 31 exams and annual independent testing.",
  },
];

const useCases = [
  {
    title: "Land-based casinos & resorts",
    desc: "Cage, table and slot activity aggregated into one gaming-day view with automatic CTRC generation and MTL evidence for IRS Title 31 examiners.",
  },
  {
    title: "Tribal gaming operations",
    desc: "Title 31 program plus NIGC MICS alignment, with tribal gaming commission reporting and per-property segregation of duties.",
  },
  {
    title: "Sportsbooks & mobile betting",
    desc: "Account-based KYC, geolocation-aware risk, deposit/withdrawal monitoring and structuring detection across state-licensed apps.",
  },
  {
    title: "iGaming & online casino",
    desc: "Payment-method risk, bonus-abuse and chip-dumping detection, affiliate risk review and player source-of-funds thresholds.",
  },
  {
    title: "Card clubs & racinos",
    desc: "Lean, examiner-ready BSA programs sized for smaller operators that still exceed the $1M gaming revenue threshold.",
  },
  {
    title: "Junket & VIP programs",
    desc: "Enhanced due diligence on junket operators and their agents, with ownership-network screening and continuous monitoring.",
  },
];

const faqs = [
  {
    q: "Which US casinos are subject to Bank Secrecy Act AML rules?",
    a: "Under 31 CFR Part 1021, a casino or card club licensed in the United States with more than $1,000,000 in gross annual gaming revenue is a financial institution under the BSA. That includes commercial casinos, card clubs, racinos and tribal gaming operations, and — where they hold accounts and take deposits — their sportsbook and iGaming arms.",
  },
  {
    q: "What is a CTRC and when must it be filed?",
    a: "A Currency Transaction Report by Casinos (FinCEN Form 112) must be filed when cash-in or cash-out transactions by or on behalf of the same patron exceed $10,000 in a single gaming day. Cash-in and cash-out are aggregated separately. WorldAML performs the aggregation automatically across cage, pit, slots and digital wallets and produces the filing output.",
  },
  {
    q: "How does casino SAR (SARC) filing work?",
    a: "Casinos file FinCEN Form 111 for suspicious activity involving $5,000 or more where the casino knows, suspects or has reason to suspect illicit activity, structuring or no apparent lawful purpose. The filing deadline is 30 days from initial detection (60 days if no suspect is identified). WorldAML tracks detection dates, deadlines, continuing-activity reviews and narrative quality.",
  },
  {
    q: "Does WorldAML support the multiple transaction log (MTL)?",
    a: "Yes. Cash transactions of $3,000 or more are captured in a structured MTL with patron identification, location, employee and shift details — the record IRS Title 31 examiners test first, and the base data for CTRC aggregation.",
  },
  {
    q: "Can it detect minimal gaming and chip walking?",
    a: "Yes. Our gaming rule pack includes minimal gaming with large cash-out, chip walking and chip dumping, marker abuse, structuring across gaming days, third-party funding and rapid deposit-to-withdrawal cycling — all tunable per property with backtesting before you go live.",
  },
  {
    q: "Does it work for tribal casinos under NIGC oversight?",
    a: "Yes. Tribal operations run the same Title 31 program with additional MICS-aligned controls, tribal gaming commission reporting and property-level segregation of duties.",
  },
  {
    q: "Do you screen patrons against OFAC?",
    a: "Yes — real-time and batch screening against the OFAC SDN and consolidated lists, sectoral sanctions and the 50 Percent Rule, alongside PEP, RCA and adverse-media data, with a per-patron false-positive memory so cleared matches don't re-alert.",
  },
  {
    q: "How quickly can a casino go live?",
    a: "Most operators are live in weeks: import patron and transaction history, provision the FATF- and Title 31-aligned rule pack, tune with backtesting against your own data, then run parallel to your existing controls before cutover.",
  },
];

const CasinoAMLComplianceUS = () => {
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
    name: "WorldAML Casino AML Compliance Software (US)",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Title 31 casino AML compliance software for US casinos, tribal gaming, sportsbooks and iGaming — MTL, CTRC, SARC, OFAC screening and gaming-specific transaction monitoring.",
    url: "https://worldaml.com/compliance-software/us/casinos",
    audience: { "@type": "Audience", audienceType: "Casinos, card clubs, tribal gaming, sportsbooks and iGaming operators (United States)" },
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
        title="Casino AML Compliance Software (Title 31, US)"
        description="Title 31 casino AML software for US casinos, tribal gaming, sportsbooks and iGaming — MTL, CTRC and SARC filing, OFAC screening and gaming-specific transaction monitoring."
        canonical="/compliance-software/us/casinos"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Compliance Software", url: "/compliance-software/us" },
          { name: "US Casinos & Gaming", url: "/compliance-software/us/casinos" },
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
                United States · Casinos &amp; Gaming
              </p>
              <h1 className="text-headline text-navy mb-6">
                Casino AML compliance software built for Title 31
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML gives US casinos, card clubs, tribal gaming operations, sportsbooks and
                iGaming brands one platform for their BSA program — multiple transaction logs, CTRC
                and SARC filing, OFAC and PEP screening, and gaming-specific monitoring that stands
                up to an IRS Title 31 examination.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <a href="#request-demo">Talk to a gaming compliance specialist</a>
                </Button>

                <Button variant="outline" size="lg" asChild>
                  <Link to="/free-aml-check">
                    Run a free OFAC patron check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-6">
                Built for operators licensed in Nevada, New Jersey, Michigan, Pennsylvania and every
                other regulated US gaming market — plus tribal operations under IGRA.
              </p>
            </div>
          </div>
        </section>

        {/* Regulators */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Aligned to the US gaming regulatory stack</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Federal BSA obligations, IRS examination expectations, state gaming board rules and
              tribal oversight — evidenced from one system of record.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regulators.map((r) => (
                <Card key={r.name} className="border-divider">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-navy">{r.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{r.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Everything a casino BSA program needs</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Purpose-built modules for the cage, the pit, the sportsbook and the app — with the
              audit trail examiners ask for.
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
            <h2 className="text-2xl text-navy mb-8">Built for every US gaming licence type</h2>
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

        {/* Exam readiness */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-2xl text-navy mb-6">What an IRS Title 31 examiner will ask for</h2>
            <ul className="space-y-4">
              {[
                "A written, risk-based AML compliance program approved by senior management, with a designated compliance officer.",
                "A documented risk assessment covering patron types, products, payment channels and geographies.",
                "Accurate multiple transaction logs and a demonstrable CTRC aggregation methodology per gaming day.",
                "SARC decisioning records — including the cases you reviewed and chose not to file, with rationale.",
                "Independent testing results with issue tracking and evidence of remediation.",
                "Training records by role, for cage, pit, surveillance, marketing and hosts.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <span className="text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-text-secondary mt-6">
              WorldAML produces every one of these artifacts as a dated, immutable export — so exam
              preparation stops being a three-week fire drill.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">Casino AML compliance — FAQ</h2>
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

        {/* Demo request form */}
        <section id="request-demo" className="section-padding bg-surface-subtle scroll-mt-24">
          <div className="container-enterprise grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl text-navy mb-4">
                Book a walkthrough with a gaming compliance specialist
              </h2>
              <p className="text-text-secondary mb-6">
                We&apos;ll show WorldAML configured for your properties, licence types and patron
                mix — multiple transaction logs, CTRC and SARC filing, OFAC and PEP screening, and
                the audit trail an IRS Title 31 examiner expects.
              </p>
              <ul className="space-y-3 text-text-secondary">
                {[
                  "30-minute session tailored to your jurisdictions",
                  "Title 31 exam-readiness checklist review",
                  "USD pricing and rollout timeline",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <CasinoDemoRequestForm />
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-3xl text-white mb-4">Ready for your next Title 31 exam?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get a walkthrough of WorldAML configured for your properties, licence types and
              patron mix — priced in USD.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="accent" size="lg" asChild>
                <a href="#request-demo">Request a demo</a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link to="/industries/gaming">Explore gaming compliance</Link>
              </Button>
            </div>
          </div>
        </section>

        <RelatedGuidesSection
          currentPath="/compliance-software/us/casinos"
          intro="Related US regulator context, screening tooling and gaming compliance resources."
          links={[
            GUIDE_LINKS.usGuide,
            GUIDE_LINKS.sanctionsSoftware,
            GUIDE_LINKS.whatIsSanctions,
            GUIDE_LINKS.sanctionsLists,
            GUIDE_LINKS.amlChecklist,
            GUIDE_LINKS.compareProviders,
            GUIDE_LINKS.csUS,
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default CasinoAMLComplianceUS;
