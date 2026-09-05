import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ScanFace,
  FileCheck,
  Shield,
  Globe,
  Fingerprint,
  Server,
  Users,
  Lock,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Landing page targeting "identity verification service" (~1,900/mo US, highest CPC $12.58 —
 * buyers, not researchers).
 *
 * Intent cluster covered on this page:
 *  - identity verification service / digital identity verification
 *  - id document verification / biometric verification / liveness detection
 *  - identity verification API & white-label verification
 *  - fraud prevention + compliance-grade audit trail
 */

const features = [
  {
    icon: FileCheck,
    title: "Document authenticity checks",
    desc: "3,500+ passports, ID cards and driving licences from 190+ countries, verified against security features, MRZ, holograms and NFC chip data.",
  },
  {
    icon: ScanFace,
    title: "Biometric face match",
    desc: "The selfie is matched to the document portrait with anti-spoofing analysis, confirming the presenter is the genuine document holder.",
  },
  {
    icon: Shield,
    title: "Certified liveness detection",
    desc: "Presentation-attack detection blocks photos, screens, masks and deepfake injection — certified and on by default, not a paid add-on.",
  },
  {
    icon: Fingerprint,
    title: "Data & address corroboration",
    desc: "Proof-of-address documents and registry data corroborate declared details, adding a second independent evidence layer.",
  },
  {
    icon: Server,
    title: "White-label & API-first",
    desc: "Hosted verification pages in your brand, or a REST API and SDKs for full control of the capture experience inside your product.",
  },
  {
    icon: Globe,
    title: "Global coverage",
    desc: "One identity verification service for 190+ countries and territories with localised capture UX — no regional vendor patchwork.",
  },
  {
    icon: Lock,
    title: "Privacy & data residency",
    desc: "GDPR-aligned processing with EU data-residency options, configurable retention and deletion, and SOC 2 Type II controls.",
  },
  {
    icon: Users,
    title: "Human review for edge cases",
    desc: "Referrals route to a trained manual-review queue with full evidence attached, keeping genuine customers in your funnel.",
  },
];

const steps = [
  {
    title: "Send a link or embed the flow",
    desc: "Trigger verification from your onboarding journey, a hosted link, or your own UI via the API — no app download for the customer.",
  },
  {
    title: "Customer verifies in under a minute",
    desc: "Guided document capture with real-time quality feedback, a short selfie video for face match and liveness, and any supporting documents.",
  },
  {
    title: "Receive a defensible decision",
    desc: "Pass / refer / fail with risk signals, evidence images and an audit trail delivered by webhook and visible in the dashboard.",
  },
];

const useCases = [
  {
    title: "Financial services",
    desc: "CIP/CDD-compliant identity verification for account opening, lending and payments — with audit evidence built for supervisors.",
  },
  {
    title: "Crypto & Web3",
    desc: "Verify exchange users, wallet holders and fiat-ramp customers while meeting Travel Rule and licensing obligations.",
  },
  {
    title: "Marketplaces & sharing economy",
    desc: "Verify sellers, hosts, drivers and renters to build marketplace trust and reduce fraud without hurting activation.",
  },
  {
    title: "iGaming & age-restricted services",
    desc: "Age and identity verification that satisfies licence conditions while keeping genuine players in the funnel.",
  },
  {
    title: "Telecoms & utilities",
    desc: "SIM-swap and contract fraud prevention with identity verification at signup and high-risk account changes.",
  },
  {
    title: "Healthcare & insurance",
    desc: "Patient and claimant identity verification that protects against identity fraud in claims and onboarding.",
  },
];

const faqs = [
  {
    q: "What is an identity verification service?",
    a: "An identity verification service confirms that a real person is who they claim to be, typically by checking a government-issued ID for authenticity, matching a selfie to the document portrait with biometric face match, and running liveness detection to block spoofing. Businesses use it to meet KYC/AML obligations, prevent fraud and build trust in digital onboarding.",
  },
  {
    q: "How is WorldAML different from other identity verification services?",
    a: "WorldAML combines identity verification with compliance-grade screening and case management in one platform: every verified identity can be screened against 1,900+ sanctions, PEP and adverse-media lists and kept under ongoing monitoring. You get the fraud controls of an identity verification service plus the audit trail a regulator expects — without integrating two vendors.",
  },
  {
    q: "Which documents and countries are supported?",
    a: "More than 3,500 document types — passports, national ID cards and driving licences — across 190+ countries and territories, with NFC chip reading where the document supports it and localised capture experiences for global customer bases.",
  },
  {
    q: "Does the service include liveness detection?",
    a: "Yes, certified liveness (presentation-attack) detection runs on every verification by default. It blocks photos, video replays, masks and deepfake injection attacks, so a stolen document alone cannot pass verification.",
  },
  {
    q: "Can we integrate identity verification into our own product?",
    a: "Yes. Use hosted verification pages branded as your business, or integrate the REST API and SDKs for a fully custom capture experience. Verification results return by webhook in seconds, and every decision is visible in the dashboard with full evidence.",
  },
  {
    q: "What happens when a verification can't be decided automatically?",
    a: "Borderline cases route to a manual review queue with the document images, biometric results and risk signals attached. Reviewers clear referrals in minutes, and every manual decision is logged in the same immutable audit trail as automated ones.",
  },
  {
    q: "How is personal data handled?",
    a: "Processing is GDPR-aligned with EU data-residency options, configurable retention periods and automated deletion. The platform operates under SOC 2 Type II controls, and data-processing agreements are available for regulated customers.",
  },
  {
    q: "How is the identity verification service priced?",
    a: "Per-verification pricing with volume tiers, no per-list screening surcharges. Self-serve plans get you started immediately; talk to sales for committed-volume pricing and enterprise terms.",
  },
];

const IdentityVerificationService = () => {
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
    name: "WorldAML Identity Verification Service",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Identity verification service with document authentication, biometric face match, certified liveness detection and AML screening — white-label and API-first for digital onboarding.",
    url: "https://worldaml.com/identity-verification-service",
    audience: {
      "@type": "Audience",
      audienceType: "Businesses verifying customer identity online",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: "0",
      category: "SaaS",
      url: "https://worldaml.com/pricing",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Identity Verification Service — Document, Biometric & Liveness"
        description="Identity verification service combining document authentication, biometric face match and certified liveness detection across 190+ countries. White-label, API-first, audit-ready."
        canonical="/identity-verification-service"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Identity Verification Service", url: "/identity-verification-service" },
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
                WorldID · Digital Identity
              </p>
              <h1 className="text-headline text-navy mb-6">
                An identity verification service built for fraud and compliance
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                Verify any customer in 190+ countries with document authentication, biometric face
                match and certified liveness detection — then screen the verified identity against
                1,900+ watchlists, all in one service with an audit trail regulators trust.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Talk to an identity specialist</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/pricing">
                    See plans & pricing <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-6">
                White-label & API-first · Results in seconds · GDPR-aligned with EU data residency.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">How the service works</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              From trigger to a defensible identity decision in three steps.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <Card key={s.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent mb-3 font-semibold">
                      {i + 1}
                    </div>
                    <CardTitle className="text-lg text-navy">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{s.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Everything in one identity verification service</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              The controls fraud teams and compliance teams each expect — delivered by a single
              platform instead of a vendor patchwork.
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
            <h2 className="text-2xl text-navy mb-8">Identity verification for your use case</h2>
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

        {/* Why WorldAML */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-2xl text-navy mb-6">Why teams choose WorldAML</h2>
            <ul className="space-y-4">
              {[
                "Verification plus sanctions/PEP screening in one service — no second vendor to integrate.",
                "Certified liveness detection on every check, blocking deepfakes and injection attacks.",
                "3,500+ document types across 190+ countries with localised capture UX.",
                "Immutable audit trail and evidence packs your compliance team can defend.",
                "Live in days via hosted flows or API — with EU data residency and SOC 2 Type II controls.",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <span className="text-text-secondary">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">Identity verification service — FAQ</h2>
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
            <h2 className="text-3xl text-white mb-4">Verify your next customer with confidence</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get a tailored walkthrough of the WorldAML identity verification service for your
              markets, volumes and integration approach.
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
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </section>
        <RelatedGuidesSection
          currentPath="/identity-verification-service"
          intro="Related identity verification and compliance resources."
          links={[
            GUIDE_LINKS.kycVerification,
            GUIDE_LINKS.amlKycCompliance,
            GUIDE_LINKS.whatIsSanctions,
            GUIDE_LINKS.sanctionsSoftware,
            GUIDE_LINKS.amlChecklist,
            GUIDE_LINKS.compareProviders,
            GUIDE_LINKS.usGuide,
            GUIDE_LINKS.uaeGuide,
            GUIDE_LINKS.fatfTravel,
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default IdentityVerificationService;
