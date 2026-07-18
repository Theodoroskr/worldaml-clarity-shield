import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Users,
  AlertCircle,
  Building2,
  Landmark,
  Search,
  ClipboardCheck,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * US AML / KYC / Transaction Monitoring Compliance Guide
 * Path: /resources/us-aml-kyc-compliance-guide
 *
 * Buyer-intent educational page. Complements /compliance-software/us
 * (product-led) and captures informational queries:
 *  - "what is bsa/aml compliance"
 *  - "kyc requirements us banks"
 *  - "how to build an aml program"
 *  - "sar filing requirements"
 *  - "transaction monitoring requirements"
 *  - "fincen cdd rule"
 *  - "ofac screening requirements"
 *  - "corporate transparency act"
 */

type QA = { q: string; a: string };

const overviewCards = [
  {
    icon: Landmark,
    title: "The BSA is the foundation",
    body: "The Bank Secrecy Act (31 U.S.C. §5311+) requires US financial institutions to help detect and prevent money laundering — CTRs, SARs, recordkeeping, and a written AML program.",
  },
  {
    icon: ShieldCheck,
    title: "FinCEN sets the rules",
    body: "FinCEN administers the BSA and issues rules (CDD Final Rule, CTA/BOI reporting, investment adviser AML rule) and guidance for all covered institutions.",
  },
  {
    icon: Search,
    title: "OFAC governs sanctions",
    body: "Treasury's OFAC administers economic sanctions. US persons must block or reject transactions involving SDNs and 50-Percent-Rule-owned entities — strict liability applies.",
  },
  {
    icon: ClipboardCheck,
    title: "FFIEC exam manual is the yardstick",
    body: "Federal banking regulators (OCC, FRB, FDIC, NCUA) use the FFIEC BSA/AML Examination Manual to test your program. It's the de facto US compliance blueprint.",
  },
];

const pillars = [
  {
    n: "1",
    title: "Enterprise-wide risk assessment",
    body: "Document customers, products, services, geographies, and delivery channels; assign inherent risk; identify controls; calculate residual risk. Refresh annually or on material change.",
  },
  {
    n: "2",
    title: "Internal controls (policies, procedures, systems)",
    body: "Written AML/OFAC program, CIP, CDD/EDD, transaction monitoring rules, sanctions filtering, SAR/CTR workflow, and record retention (5 years minimum).",
  },
  {
    n: "3",
    title: "Designated BSA officer",
    body: "A qualified individual with authority, resources, and direct board access. NYDFS Part 504 additionally requires a Senior Officer to annually certify the monitoring/filtering program.",
  },
  {
    n: "4",
    title: "Ongoing training",
    body: "Role-based training for front-line staff, operations, and the board. Cadence and content should reflect the institution's risk profile.",
  },
  {
    n: "5",
    title: "Independent testing",
    body: "Annual (or 12-18 month) independent test by qualified internal audit or external firm, covering all program elements including model validation of the monitoring system.",
  },
  {
    n: "6",
    title: "CDD & beneficial ownership",
    body: "The FinCEN CDD Final Rule requires identification and verification of beneficial owners (25%+ equity + one control person) at account opening, plus ongoing monitoring.",
  },
];

const kycRequirements = [
  {
    title: "CIP — Customer Identification Program",
    body: "USA PATRIOT Act §326 and 31 CFR §1020.220. Collect name, DOB, address, and ID number (SSN/EIN/passport) before opening an account. Verify identity documentary or non-documentary within a reasonable time.",
  },
  {
    title: "CDD — Customer Due Diligence",
    body: "Understand the nature and purpose of the relationship, develop a customer risk profile, and conduct ongoing monitoring. Beneficial owners must be identified for legal entity customers.",
  },
  {
    title: "EDD — Enhanced Due Diligence",
    body: "Applied to high-risk customers: foreign PEPs, correspondent accounts (§312), private banking (§312), high-risk jurisdictions, cash-intensive businesses, and crypto-asset firms.",
  },
  {
    title: "BOI — Beneficial Ownership Information",
    body: "Under the Corporate Transparency Act (CTA), reporting companies file BOI directly to FinCEN. Financial institutions may access FinCEN's BOI database with customer consent under the Access Rule.",
  },
  {
    title: "Sanctions screening at onboarding",
    body: "OFAC lists (SDN, non-SDN consolidated, sectoral), including 50 Percent Rule ownership analysis. Also screen ultimate beneficial owners, authorized signers, and related parties.",
  },
];

const monitoringRequirements = [
  {
    title: "Suspicious activity monitoring",
    body: "Detection systems (rule-based, behavioral, or AI-augmented) must be commensurate with your risk profile. Scenarios should map to red flags in FinCEN advisories and FFIEC guidance.",
  },
  {
    title: "SAR filing",
    body: "File within 30 calendar days of initial detection (extendable to 60 if a suspect is unidentified). $5,000+ threshold for depository institutions; $2,000+ for MSBs. Confidentiality is mandatory — no tipping-off.",
  },
  {
    title: "CTR filing",
    body: "File within 15 calendar days of any single-day cash transaction over $10,000 by/on behalf of one person. Structuring detection (avoiding CTR thresholds) is itself a red flag.",
  },
  {
    title: "OFAC filtering",
    body: "Real-time sanctions filtering on transactions (wires, ACH, cards), plus daily/periodic rescreening of the customer base. Blocked transactions reported to OFAC within 10 business days.",
  },
  {
    title: "Model validation & rule tuning",
    body: "NYDFS Part 504 explicitly requires evidence of tuning, sample testing, above/below-the-line analysis, and issue remediation for both monitoring and OFAC filtering models.",
  },
  {
    title: "314(a) & 314(b) information sharing",
    body: "Respond to FinCEN §314(a) law-enforcement requests within 14 days; voluntary §314(b) information sharing with other financial institutions requires FinCEN registration.",
  },
];

const faqs: QA[] = [
  {
    q: "What is BSA/AML compliance and who does it apply to?",
    a: "BSA/AML compliance means meeting the Bank Secrecy Act and related regulations to detect and prevent money laundering. It applies to a broad set of 'financial institutions' defined by FinCEN: banks, credit unions, MSBs, broker-dealers, mutual funds, futures commissions merchants, insurance companies, casinos, and — starting 2026 — SEC-registered investment advisers and ERAs.",
  },
  {
    q: "What are the five pillars of an AML program?",
    a: "The five pillars codified in 31 CFR §1020.210 (banks) and equivalents are: (1) written policies, procedures, and internal controls; (2) a designated BSA compliance officer; (3) ongoing training; (4) independent testing; and (5) risk-based customer due diligence (added by the CDD Final Rule in 2018). Some regulators effectively require a sixth: an enterprise risk assessment.",
  },
  {
    q: "What are the KYC / CIP requirements for opening an account?",
    a: "At minimum, collect name, date of birth, physical address, and an identifying number (SSN, EIN, passport). Verify identity via documentary methods (government ID) or non-documentary methods (public data, credit files, identity verification vendors) within a reasonable time. For legal-entity customers, additionally collect and verify beneficial owners (25%+ equity holders and one control person).",
  },
  {
    q: "When must I file a SAR?",
    a: "File a SAR within 30 calendar days of initial detection of facts that may constitute a basis for filing. Depository-institution threshold is $5,000 (or any amount if an insider is suspected); MSB threshold is $2,000. If no suspect is identified within 30 days, filing may be delayed up to 60 days total. SAR contents and the fact of filing are strictly confidential — do not tip off the subject.",
  },
  {
    q: "When must I file a CTR?",
    a: "File a CTR within 15 calendar days of any cash transaction, or aggregated same-day cash transactions, over $10,000 by or on behalf of the same person. Structuring — breaking transactions to avoid the threshold — is a separate criminal offense and a monitoring red flag.",
  },
  {
    q: "What must my transaction monitoring system do?",
    a: "It must be reasonably designed to detect suspicious activity given your risk profile. Practically, that means: coverage of relevant typologies (structuring, layering, sanctions evasion, human trafficking, elder fraud, etc.), tunable thresholds, documented rule logic, alert workflow with investigator notes, and — for NYDFS Part 504 firms — annual model validation and Senior Officer certification.",
  },
  {
    q: "What does OFAC compliance require?",
    a: "US persons and US-touching transactions must not deal with SDNs, blocked entities, or entities 50%-or-more owned by blocked persons. This requires real-time screening at onboarding, real-time filtering of wires/ACH/cards, daily rescreening of the customer base against updated lists, blocking of matched funds, and 10-business-day reporting to OFAC for blocked or rejected transactions.",
  },
  {
    q: "What is the FinCEN CDD Final Rule?",
    a: "Effective May 2018, the rule (31 CFR §1010.230) requires covered institutions to identify and verify beneficial owners of legal-entity customers at account opening, understand the nature and purpose of relationships, and conduct ongoing risk-based monitoring. FinCEN's Access Rule (2024) begins layering CTA BOI data on top of this.",
  },
  {
    q: "How does the Corporate Transparency Act (CTA) affect my program?",
    a: "The CTA requires most US and foreign-registered entities to file Beneficial Ownership Information (BOI) directly with FinCEN. Reporting companies are the primary filer, but financial institutions can access FinCEN's BOI database (with customer consent) to support CDD. It does not replace your CDD Rule obligations — it augments them.",
  },
  {
    q: "Do investment advisers need an AML program?",
    a: "Yes — under FinCEN's final rule adopted August 2024, SEC-registered investment advisers and exempt reporting advisers become 'financial institutions' under the BSA with compliance dates in 2026. They must adopt full AML/CFT programs, file SARs and CTRs, and comply with the Recordkeeping and Travel Rules.",
  },
  {
    q: "What is NYDFS Part 504 and does it apply to me?",
    a: "23 NYCRR Part 504 applies to NYDFS-regulated banks and non-bank financial institutions. It mandates reasonably designed transaction-monitoring and OFAC-filtering programs, plus annual certification by a Senior Officer (or the board). Failure to certify — or false certification — carries individual liability.",
  },
  {
    q: "How much does non-compliance cost?",
    a: "US AML/OFAC fines routinely exceed nine figures. Recent settlements include multi-hundred-million and multi-billion-dollar penalties for BSA program failures, sanctions violations, and monitoring deficiencies. Individual liability (BSA officer removal, personal fines, criminal referral) is a growing enforcement theme.",
  },
  {
    q: "What should I look for in AML/KYC compliance software?",
    a: "For a US buyer: (1) OFAC coverage including the 50 Percent Rule; (2) FinCEN CDD Rule workflows including beneficial ownership; (3) SAR/CTR e-filing outputs; (4) rule tuning, model validation, and Part 504-ready evidence packs; (5) FFIEC-aligned exam artifacts; (6) SOC 2 Type II and US data residency; (7) a fast implementation path (weeks, not quarters).",
  },
];

const USAMLKYCComplianceGuide = () => {
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
    headline: "US AML, KYC & Transaction Monitoring Compliance Guide (2026)",
    description:
      "A US financial-institution buyer's guide to AML, KYC/CIP/CDD, sanctions, and transaction monitoring — BSA, FinCEN, OFAC, FFIEC, and NYDFS Part 504.",
    author: { "@type": "Organization", name: "WorldAML" },
    publisher: { "@type": "Organization", name: "WorldAML" },
    datePublished: "2026-07-15",
    dateModified: "2026-07-15",
    mainEntityOfPage: "https://worldaml.com/resources/us-aml-kyc-compliance-guide",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="US AML, KYC & Monitoring Guide (2026)"
        description="A US buyer's guide to BSA/AML, KYC/CIP/CDD, OFAC sanctions and transaction monitoring — five program pillars, SAR/CTR filing rules, CTA beneficial ownership, and NYDFS Part 504."
        canonical="/resources/us-aml-kyc-compliance-guide"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/aml-regulations" },
          { name: "US AML/KYC Compliance Guide", url: "/resources/us-aml-kyc-compliance-guide" },
        ]}
        structuredData={[faqLd, articleLd]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">
              United States · 2026 Buyer's Guide
            </p>
            <h1 className="text-headline text-navy mb-6">
              US AML, KYC & transaction monitoring compliance — the buyer's guide
            </h1>
            <p className="text-body-lg text-text-secondary mb-8">
              Everything a US financial-institution compliance team needs to answer the questions
              that come up when scoping, buying, or replacing an AML/KYC/monitoring platform. Based
              on the BSA, FinCEN rules, OFAC guidance, the FFIEC BSA/AML Examination Manual, and
              NYDFS Part 504.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" asChild>
                <Link to="/compliance-software/us">See how WorldAML covers this</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact-sales">
                  Talk to a US specialist <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-text-secondary mt-6">
              Educational guide — not legal advice. Confirm all obligations with your BSA officer
              and counsel.
            </p>
          </div>
        </section>

        {/* Overview */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Who sets the rules in the US</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Four bodies define almost every AML/KYC/monitoring obligation for a US financial
              institution.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewCards.map((c) => (
                <Card key={c.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent mb-3">
                      <c.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg text-navy">{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{c.body}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Program pillars */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-5xl">
            <h2 className="text-2xl text-navy mb-2">The pillars of a US AML program</h2>
            <p className="text-text-secondary mb-8">
              Any US AML/CFT program you buy or build must evidence these pillars — this is what
              examiners test against.
            </p>
            <div className="space-y-4">
              {pillars.map((p) => (
                <div
                  key={p.n}
                  className="flex gap-4 p-5 rounded-lg border border-divider bg-white"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-semibold">
                    {p.n}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-1">{p.title}</h3>
                    <p className="text-text-secondary">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KYC deep-dive */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-5xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-accent" />
              <h2 className="text-2xl text-navy">KYC / CIP / CDD — what US buyers need</h2>
            </div>
            <p className="text-text-secondary mb-8">
              Onboarding requirements from CIP through beneficial ownership.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {kycRequirements.map((k) => (
                <Card key={k.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-navy flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      {k.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{k.body}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Monitoring deep-dive */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-5xl">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-accent" />
              <h2 className="text-2xl text-navy">Transaction monitoring & reporting</h2>
            </div>
            <p className="text-text-secondary mb-8">
              What US monitoring, sanctions, and reporting obligations look like end-to-end.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {monitoringRequirements.map((m) => (
                <Card key={m.title} className="border-divider bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-navy flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      {m.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{m.body}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Charter-specific */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-5xl">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-6 h-6 text-accent" />
              <h2 className="text-2xl text-navy">Charter-specific quirks buyers ask about</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="p-5 rounded-lg border border-divider bg-white">
                <h3 className="text-lg font-semibold text-navy mb-2">Community & regional banks</h3>
                <p className="text-text-secondary">
                  FFIEC exam manual is the yardstick. Expect scrutiny of risk assessment refresh,
                  CDD onboarding evidence, monitoring rule tuning, and SAR narrative quality.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-divider bg-white">
                <h3 className="text-lg font-semibold text-navy mb-2">Fintechs on sponsor banks</h3>
                <p className="text-text-secondary">
                  Sponsor bank's third-party risk team will demand your written program, monitoring
                  rule inventory, alert-to-SAR ratio, and evidence of independent testing. Build
                  for audit from day one.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-divider bg-white">
                <h3 className="text-lg font-semibold text-navy mb-2">MSBs & payments</h3>
                <p className="text-text-secondary">
                  FinCEN MSB registration, plus state money transmitter licences (MTLs). CTR
                  threshold is the same but aggregation rules differ; SAR threshold drops to
                  $2,000.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-divider bg-white">
                <h3 className="text-lg font-semibold text-navy mb-2">Digital-asset firms (VASPs)</h3>
                <p className="text-text-secondary">
                  MSB-registered, subject to Travel Rule (FinCEN's $3,000 threshold, FATF
                  Recommendation 16 for cross-border), plus blockchain analytics and wallet
                  screening expectations.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-divider bg-white">
                <h3 className="text-lg font-semibold text-navy mb-2">Broker-dealers</h3>
                <p className="text-text-secondary">
                  FINRA Rule 3310 AML program; CIP under §326; SAR-SF filing; independent testing
                  by qualified personnel not involved in the AML function.
                </p>
              </div>
              <div className="p-5 rounded-lg border border-divider bg-white">
                <h3 className="text-lg font-semibold text-navy mb-2">
                  Investment advisers (2026 rule)
                </h3>
                <p className="text-text-secondary">
                  FinCEN's 2024 final rule brings SEC-registered advisers and ERAs into scope from
                  2026. Full AML programs, SAR/CTR, Recordkeeping and Travel Rules apply. Start
                  building now.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-6 h-6 text-accent" />
              <h2 className="text-2xl text-navy">Frequently asked questions</h2>
            </div>
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
              One platform for every pillar of your US program
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              WorldAML consolidates BSA/AML, KYC/CIP/CDD, OFAC sanctions, transaction monitoring,
              and SAR/CTR e-filing — with the audit evidence US examiners expect.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/compliance-software/us">See the US platform</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link to="/contact-sales">Request a demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default USAMLKYCComplianceGuide;
