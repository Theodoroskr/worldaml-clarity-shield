import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bitcoin, ShieldCheck, Globe2, FileSearch, AlertTriangle, CheckCircle2 } from "lucide-react";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the FATF Travel Rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The FATF Travel Rule extends Recommendation 16 (originally for wire transfers) to Virtual Asset Service Providers (VASPs). It requires originating and beneficiary VASPs to collect, hold and transmit specified originator and beneficiary information for virtual asset transfers above the applicable threshold (USD/EUR 1,000 in most jurisdictions).",
      },
    },
    {
      "@type": "Question",
      name: "Which businesses must comply with the Travel Rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any Virtual Asset Service Provider (VASP) — including centralised exchanges, custodial wallets, brokers, OTC desks and certain DeFi front-ends — falls in scope where local law has transposed FATF R.16. Financial institutions that facilitate virtual asset transfers on behalf of clients are also covered.",
      },
    },
    {
      "@type": "Question",
      name: "What data must be shared under the Travel Rule?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Originator: full name, account/wallet reference, physical address (or national ID / date and place of birth). Beneficiary: full name and account/wallet reference. Data must travel with the transfer or be transmitted through an interoperable messaging channel before or immediately after settlement.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Travel Rule handle self-hosted (unhosted) wallets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FATF guidance requires VASPs to identify counterparty wallets and apply risk-based controls — including wallet-address attribution, proof-of-ownership (e.g. Satoshi test or cryptographic signature) and enhanced due diligence on transfers above local thresholds. The EU Transfer of Funds Regulation (TFR) makes these obligations explicit from 30 December 2024.",
      },
    },
    {
      "@type": "Question",
      name: "What are the main Travel Rule messaging protocols?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The most widely adopted are TRP (Travel Rule Protocol), IVMS 101 (the shared data schema), Sumsub Travel Rule, Notabene, TRUST (US-led network) and Shyft. Interoperability between networks — the 'sunrise problem' — remains one of the biggest operational challenges.",
      },
    },
  ],
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "FATF Travel Rule Compliance Guide for VASPs and Fintechs",
  description: "Technical deep-dive into FATF Recommendation 16 for VASPs — data requirements, thresholds, messaging protocols, self-hosted wallets and multi-jurisdictional obligations.",
  author: { "@type": "Organization", name: "WorldAML" },
  publisher: {
    "@type": "Organization",
    name: "WorldAML",
    logo: { "@type": "ImageObject", url: "https://www.worldaml.com/og-image.png" },
  },
  mainEntityOfPage: "https://www.worldaml.com/resources/fatf-travel-rule-compliance-guide",
};

const FATFTravelRuleGuide = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="FATF Travel Rule Guide for VASPs (2026)"
        description="Technical guide to FATF Recommendation 16 for VASPs: data requirements, thresholds, IVMS 101, self-hosted wallets, EU TFR and multi-jurisdictional obligations."
        canonical="/resources/fatf-travel-rule-compliance-guide"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/glossary" },
          { name: "FATF Travel Rule Compliance Guide", url: "/resources/fatf-travel-rule-compliance-guide" },
        ]}
        structuredData={[faqStructuredData, articleStructuredData]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-b from-primary/5 to-background">
          <div className="container-enterprise max-w-4xl">
            <p className="text-caption uppercase tracking-widest text-primary font-semibold mb-3">
              Virtual Asset Compliance Guide
            </p>
            <h1 className="text-display text-navy mb-4">
              FATF Travel Rule Compliance for VASPs and Fintechs
            </h1>
            <p className="text-body-lg text-text-secondary mb-6">
              A practical, technical reference for compliance officers implementing FATF
              Recommendation 16 across virtual asset transfers — covering data requirements,
              thresholds, messaging protocols, self-hosted wallets and how to align controls
              across EU TFR, FinCEN, MAS and FSA regimes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/contact-sales">Speak to a VASP specialist</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/industries/crypto">Explore crypto AML controls</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What is it */}
        <section className="section-padding">
          <div className="container-enterprise max-w-4xl space-y-6">
            <h2 className="text-headline text-navy">What is the FATF Travel Rule?</h2>
            <p className="text-body text-text-secondary">
              FATF Recommendation 16 — the "Travel Rule" — was originally designed for
              cross-border wire transfers, requiring originator and beneficiary information to
              accompany the payment along the settlement chain. In June 2019 FATF extended the
              rule to Virtual Asset Service Providers (VASPs), and updated guidance in October
              2021 and June 2025 reinforced that virtual asset transfers must carry the same
              accountable data as fiat wires.
            </p>
            <p className="text-body text-text-secondary">
              The rule applies where a VASP sends, receives or intermediates a virtual asset
              transfer above the local threshold (typically USD/EUR 1,000; zero in the EU under
              the Transfer of Funds Regulation from 30 December 2024). Failure to transmit the
              required data — or to screen the counterparty against sanctions lists — exposes
              the VASP to supervisory action, licence loss and de-risking by banking partners.
            </p>
          </div>
        </section>

        {/* Data requirements */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-headline text-navy mb-8">The data that must travel with every transfer</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: FileSearch,
                  title: "Originator information (required)",
                  body: "Full legal name, wallet address or account reference, and one of: physical address, national ID number, customer identification number, or date and place of birth.",
                },
                {
                  icon: FileSearch,
                  title: "Beneficiary information (required)",
                  body: "Full legal name and wallet address or account reference at the receiving VASP. EU TFR requires this even for transfers to self-hosted wallets above EUR 1,000.",
                },
                {
                  icon: ShieldCheck,
                  title: "Sanctions and PEP screening",
                  body: "Both originator and beneficiary must be screened against UN, OFAC, EU, HMT and local watchlists before the transfer settles — with a documented action on any match.",
                },
                {
                  icon: Bitcoin,
                  title: "Wallet attribution and proof-of-ownership",
                  body: "For self-hosted (unhosted) wallets, VASPs must attribute the counterparty (name, ownership) and apply a proof-of-ownership check such as a Satoshi test or cryptographic signature.",
                },
              ].map((r) => (
                <div key={r.title} className="bg-card border border-divider rounded-lg p-6">
                  <r.icon className="w-6 h-6 text-teal mb-3" />
                  <h3 className="text-body-lg font-semibold text-navy mb-2">{r.title}</h3>
                  <p className="text-body-sm text-text-secondary">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core obligations */}
        <section className="section-padding">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-headline text-navy mb-8">Core Travel Rule obligations for VASPs</h2>
            <ol className="space-y-6">
              {[
                {
                  title: "Classify the counterparty VASP or wallet",
                  body: "Before settlement, determine whether the beneficiary address belongs to a licensed VASP, an unlicensed VASP or a self-hosted wallet. Attribution uses on-chain analytics, VASP directories (e.g. GLEIF vLEI, TRUST) and known-address databases.",
                },
                {
                  title: "Collect and validate originator / beneficiary data",
                  body: "Data must be accurate at the point of transmission. Names should be compared against the KYC record of the originator and — where possible — the beneficiary VASP's confirmation of the account holder.",
                },
                {
                  title: "Transmit via an interoperable messaging protocol",
                  body: "Use IVMS 101 as the shared data schema, exchanged over TRP, TRUST, Notabene, Sumsub or Shyft. Persist the message ID with the on-chain transaction hash for audit.",
                },
                {
                  title: "Screen both parties against sanctions and PEP lists",
                  body: "Screen names, wallet addresses and any identifiers against UN, OFAC (including SDN Digital Currency Address entries), EU, HMT and local lists — re-screen after every list update.",
                },
                {
                  title: "Apply risk-based controls to self-hosted wallets",
                  body: "Above the local threshold (EUR 1,000 in the EU, USD 3,000 in the US per the FinCEN NPRM), apply enhanced due diligence: name and address of the wallet owner, source-of-funds evidence and proof-of-ownership.",
                },
                {
                  title: "Retain records for at least 5 years",
                  body: "Retain the message payload, screening evidence, counterparty attribution and any escalations for at least five years — most EU and Asian regulators expect seven.",
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-body-lg font-semibold text-navy mb-1">{step.title}</h3>
                    <p className="text-body-sm text-text-secondary">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Jurisdictional matrix */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-headline text-navy mb-6">Multi-jurisdictional thresholds and rulebooks</h2>
            <p className="text-body text-text-secondary mb-6">
              Every VASP operating across borders must reconcile at least three regimes. The
              thresholds and self-hosted-wallet treatment diverge sharply — the strictest rule
              of the settlement route should drive the operating standard.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "EU Transfer of Funds Regulation (TFR) — EUR 0 threshold for VASP-to-VASP; EUR 1,000 trigger for self-hosted wallet EDD (from 30 Dec 2024).",
                "United States (FinCEN) — USD 3,000 Travel Rule threshold; OFAC SDN Digital Currency Address list screening mandatory.",
                "Singapore (MAS PS-N02) — SGD 1,500 threshold; counterparty VASP must be a regulated DPT service provider.",
                "United Kingdom (MLR 2017 as amended) — GBP 1,000 threshold; risk-based EDD on unhosted wallets required.",
                "Japan (FSA / JVCEA) — full Travel Rule since June 2023, IVMS 101 mandated.",
                "UAE (VARA / SCA) — Travel Rule enforced from 2023 with EOCN sanctions alignment.",
              ].map((item) => (
                <div key={item} className="flex gap-3 bg-card border border-divider rounded-lg p-4">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <p className="text-body-sm text-text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Implementation challenges */}
        <section className="section-padding">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-headline text-navy mb-6">Implementation challenges and data privacy</h2>
            <div className="space-y-4">
              {[
                "The 'sunrise problem' — asymmetric adoption across jurisdictions means many counterparty VASPs are not yet obliged to reciprocate. Document the risk-based decision to proceed, delay or reject.",
                "Protocol fragmentation — TRP, TRUST, Notabene, Sumsub and Shyft do not natively interoperate. Interoperability bridges (e.g. OpenVASP, TRISA) add latency and cost.",
                "GDPR and data-protection conflicts — transmitting personal data to non-EEA VASPs requires a lawful basis (Article 6(1)(c)) and, where applicable, transfer safeguards under Chapter V.",
                "Self-hosted wallet attribution — Satoshi tests fail for smart-contract wallets and multi-sig custody; cryptographic signature workflows must be supported.",
                "Batch and internal transfers — layer-2, exchange netting and internal-book transfers can obscure the true originator; the rule applies to the underlying customer, not the settlement layer.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-body text-text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy text-white">
          <div className="container-enterprise max-w-4xl text-center">
            <Globe2 className="w-12 h-12 text-teal mx-auto mb-4" />
            <h2 className="text-headline mb-4">Travel Rule screening, built into your VASP stack</h2>
            <p className="text-body-lg text-white/80 mb-6 max-w-2xl mx-auto">
              WorldAML provides continuous sanctions and PEP screening against UN, OFAC (including
              SDN Digital Currency Address entries), EU, HMT and 1,900+ global watchlists — with
              WorldID KYC and transaction monitoring designed for VASP counterparty flows.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/contact-sales">
                  Talk to our VASP team <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10">
                <Link to="/resources/glossary">Browse the AML glossary</Link>
              </Button>
            </div>
          </div>
        </section>

        <RelatedGuidesSection
          currentPath="/resources/fatf-travel-rule-guide"
          intro="Related sanctions, screening and country compliance resources."
          links={[
            GUIDE_LINKS.whatIsSanctions,
            GUIDE_LINKS.sanctionsSoftware,
            GUIDE_LINKS.sanctionsLists,
            GUIDE_LINKS.compareProviders,
            GUIDE_LINKS.usGuide,
            GUIDE_LINKS.uaeGuide,
            GUIDE_LINKS.amlChecklist,
            GUIDE_LINKS.platformScreening,
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default FATFTravelRuleGuide;
