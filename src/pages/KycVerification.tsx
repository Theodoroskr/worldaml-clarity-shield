import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ScanFace,
  FileCheck,
  Shield,
  Globe,
  Fingerprint,
  Building2,
  Users,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Landing page targeting "kyc verification" (~5,400/mo US, high commercial intent).
 *
 * Intent cluster covered on this page:
 *  - kyc verification / kyc identity verification
 *  - document verification / biometric verification / liveness detection
 *  - kyc verification for banks, fintechs, crypto, payments
 *  - CDD / EDD / ongoing monitoring
 */

const features = [
  {
    icon: ScanFace,
    title: "Biometric KYC verification",
    desc: "Face match and certified liveness detection compare the selfie to the document portrait, blocking photo, video, deepfake and mask presentation attacks.",
  },
  {
    icon: FileCheck,
    title: "Document verification, 3,500+ ID types",
    desc: "Passports, national ID cards and driving licences from 190+ countries — authenticity checks on security features, MRZ, holograms and chip data (NFC).",
  },
  {
    icon: Fingerprint,
    title: "Proof-of-address & data checks",
    desc: "Utility bills, bank statements and registry data corroborate the declared identity for address and date-of-birth verification.",
  },
  {
    icon: Shield,
    title: "Sanctions, PEP & adverse media",
    desc: "Every verified identity is screened against 1,900+ global watchlists at onboarding — sanctions, PEPs, RCAs and adverse media in 40+ languages.",
  },
  {
    icon: Zap,
    title: "Verification in under 60 seconds",
    desc: "Guided capture flow with real-time quality feedback keeps completion rates high while decisions return in seconds, not hours.",
  },
  {
    icon: Globe,
    title: "190+ countries & territories",
    desc: "Global document coverage and multi-language capture UX, so one KYC verification flow serves every market you onboard from.",
  },
  {
    icon: Building2,
    title: "KYB alongside KYC",
    desc: "Verify the business too: registry lookups, UBO discovery and director KYC in the same case — one file for the whole relationship.",
  },
  {
    icon: Users,
    title: "Manual review fallback",
    desc: "Edge cases route to a trained review queue with a full audit trail, so no genuine customer is lost to an automated decline.",
  },
];

const steps = [
  {
    title: "Capture",
    desc: "Customer photographs their ID and takes a short selfie video from any device — no app download required.",
  },
  {
    title: "Verify",
    desc: "Document authenticity, biometric face match, liveness and data corroboration run in parallel, with sanctions and PEP screening applied to the verified identity.",
  },
  {
    title: "Decide",
    desc: "Clear pass / refer / fail outcomes with risk scores, evidence and an immutable audit trail your MLRO can defend to any supervisor.",
  },
];

const useCases = [
  {
    title: "Banks & EMIs",
    desc: "CDD and EDD identity verification aligned to FATF Recommendation 10, with evidence packs your supervisor already recognises.",
  },
  {
    title: "Fintechs & payment institutions",
    desc: "API-first KYC verification embedded in onboarding — verify customers without adding friction to conversion-critical signup flows.",
  },
  {
    title: "Crypto & VASPs",
    desc: "KYC for Travel Rule compliance, wallet onboarding and fiat ramps, with sanctions screening on every verified identity.",
  },
  {
    title: "iGaming & gambling",
    desc: "Age and identity verification for MGA, UKGC and other licence conditions, with PEP and problem-gambler screening signals.",
  },
  {
    title: "Real estate & legal",
    desc: "Buyer, seller and client identity verification with UBO checks for corporate purchasers — audit-ready CDD files.",
  },
  {
    title: "Marketplaces & platforms",
    desc: "Seller and host verification to build trust, meet PSRs/PSD2 obligations and reduce fraud at scale.",
  },
];

const faqs = [
  {
    q: "What is KYC verification?",
    a: "KYC (Know Your Customer) verification is the process a regulated business uses to confirm a customer is who they claim to be before entering a relationship. It typically combines identity document verification, biometric face match with liveness detection, proof-of-address checks and sanctions/PEP screening. It is a legal requirement under AML frameworks such as FATF Recommendation 10, EU AMLD and national laws like the UK MLR 2017 and US BSA.",
  },
  {
    q: "How does WorldAML verify identity documents?",
    a: "Customers photograph their passport, ID card or driving licence. The platform checks security features, MRZ consistency, holograms and NFC chip data where available, across 3,500+ document types from 190+ countries — then a biometric face match with certified liveness detection confirms the person presenting the document is its genuine holder.",
  },
  {
    q: "Is liveness detection included?",
    a: "Yes. Certified presentation-attack detection blocks photos, videos, masks and deepfake injection attacks, and runs on every verification by default — you cannot accidentally onboard a spoofed identity.",
  },
  {
    q: "How long does a KYC verification take?",
    a: "The guided capture takes most customers under a minute, and automated decisions return in seconds. Cases that need a manual look route to a review queue with the full evidence attached, so referrals are cleared in minutes rather than days.",
  },
  {
    q: "Does KYC verification include sanctions and PEP screening?",
    a: "Yes. Once the identity is verified, it is screened against 1,900+ global sanctions, PEP and adverse-media lists at onboarding — and can stay under ongoing monitoring so list changes re-screen your customer base automatically.",
  },
  {
    q: "Can WorldAML handle business (KYB) verification too?",
    a: "Yes. Corporate customers are verified with registry lookups, beneficial-ownership discovery and director-level KYC in the same case file, so an entire relationship — entity and individuals — is evidenced in one place.",
  },
  {
    q: "Which regulations does KYC verification support?",
    a: "The workflow evidences FATF Recommendation 10 CDD, EU AMLD (including AMLD6), UK MLR 2017, US BSA/CIP requirements and equivalent national regimes, with an immutable audit trail and MLRO-ready evidence pack for every decision.",
  },
  {
    q: "How is KYC verification priced?",
    a: "Pricing is per verification with volume tiers, and screening is bundled rather than charged per list. Start with the self-serve plans or talk to sales for committed-volume pricing — most teams go live in days.",
  },
];

const KycVerification = () => {
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
    name: "WorldAML KYC Verification",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "KYC verification platform combining document verification, biometric face match, liveness detection and sanctions/PEP screening for banks, fintechs and regulated businesses.",
    url: "https://worldaml.com/kyc-verification",
    audience: {
      "@type": "Audience",
      audienceType: "Financial institutions, fintechs and regulated businesses",
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
        title="KYC Verification — Verify Customers in Seconds"
        description="KYC verification with document checks, biometric face match, liveness detection and sanctions screening across 190+ countries. Onboard customers compliantly in under 60 seconds."
        canonical="/kyc-verification"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "KYC Verification", url: "/kyc-verification" },
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
                WorldID · Identity & KYC
              </p>
              <h1 className="text-headline text-navy mb-6">
                KYC verification that onboards real customers in seconds
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML combines document verification, biometric face match, liveness detection
                and sanctions/PEP screening in one KYC verification flow — so banks, fintechs and
                regulated businesses verify customers in 190+ countries without sacrificing
                conversion or compliance.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Talk to a KYC specialist</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/pricing">
                    See plans & pricing <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-6">
                3,500+ document types · 190+ countries · Decisions in under 60 seconds.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">How KYC verification works</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Three steps from first visit to a defensible, audit-ready identity decision.
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
            <h2 className="text-2xl text-navy mb-2">One flow, every KYC control</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Everything a customer due diligence file needs — captured, verified and evidenced in a
              single journey.
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
            <h2 className="text-2xl text-navy mb-8">KYC verification for your industry</h2>
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
            <h2 className="text-2xl text-navy mb-6">Why compliance teams pick WorldAML for KYC</h2>
            <ul className="space-y-4">
              {[
                "Document, biometric, liveness and screening in one flow — no stitching vendors together.",
                "3,500+ document types across 190+ countries, with NFC chip reading where documents support it.",
                "Certified liveness detection blocks spoofing, deepfakes and injection attacks by default.",
                "Every decision carries an immutable audit trail and MLRO-ready evidence pack.",
                "Go live in days with hosted flows or a white-label API — not months of integration work.",
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
            <h2 className="text-2xl text-navy mb-8">KYC verification — FAQ</h2>
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
            <h2 className="text-3xl text-white mb-4">Ready to verify customers in seconds?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get a tailored walkthrough of WorldAML KYC verification for your markets, volumes and
              regulatory obligations.
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
          currentPath="/kyc-verification"
          intro="Related identity verification and AML compliance resources."
          links={[
            GUIDE_LINKS.identityVerificationService,
            GUIDE_LINKS.amlKycCompliance,
            GUIDE_LINKS.amlChecklist,
            GUIDE_LINKS.whatIsSanctions,
            GUIDE_LINKS.sanctionsSoftware,
            GUIDE_LINKS.compareProviders,
            GUIDE_LINKS.usGuide,
            GUIDE_LINKS.fatfTravel,
            GUIDE_LINKS.csUK,
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default KycVerification;
