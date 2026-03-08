import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LaneBadge from "@/components/LaneBadge";
import WorldIDHeroSection from "@/components/worldid/WorldIDHeroSection";
import WorldIDOverviewSection from "@/components/worldid/WorldIDOverviewSection";
import WorldIDHowItWorksSection from "@/components/worldid/WorldIDHowItWorksSection";
import WorldIDCapabilitiesSection from "@/components/worldid/WorldIDCapabilitiesSection";
import WorldIDCoverageSection from "@/components/worldid/WorldIDCoverageSection";
import WorldIDIntegrationsSection from "@/components/worldid/WorldIDIntegrationsSection";
import WorldIDPricingSection from "@/components/worldid/WorldIDPricingSection";
import WorldIDBundleSection from "@/components/worldid/WorldIDBundleSection";
import WorldIDTrustSection from "@/components/worldid/WorldIDTrustSection";
import WorldIDFAQSection from "@/components/worldid/WorldIDFAQSection";
import WorldIDCTASection from "@/components/worldid/WorldIDCTASection";
import WorldIDStickyCTA from "@/components/worldid/WorldIDStickyCTA";

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldID — Digital Identity Verification",
  applicationCategory: "FinancialApplication",
  description:
    "Digital identity verification with document authentication, biometric liveness detection, and face matching. Verify customers in seconds via API or platform UI. eIDAS-aligned and FATF-compliant.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/products/worldid",
  offers: {
    "@type": "Offer",
    category: "SaaS",
    url: "https://www.worldaml.com/products/worldid#pricing",
  },
  provider: {
    "@type": "Organization",
    name: "WorldAML",
    url: "https://www.worldaml.com",
  },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is digital identity verification?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Digital identity verification (IDV) is the automated process of confirming that a person is who they claim to be using digital means — typically by capturing a government-issued identity document and a real-time biometric selfie. The system extracts and validates data from the document (via OCR), authenticates its physical security features, and compares the face on the document against the live selfie to confirm the person is present. IDV replaces manual document review, enabling remote onboarding at scale.",
      },
    },
    {
      "@type": "Question",
      name: "What is a liveness check in KYC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A liveness check — also called a liveness detection or anti-spoofing check — is a biometric test that verifies a submitted selfie or video is of a real, live person and not a photograph, mask, or deepfake. Passive liveness uses AI analysis of a single selfie frame to detect spoofing artefacts. Active liveness requires the user to perform gestures (blinking, head turns). Liveness detection is required under eIDAS Level of Assurance 'Substantial' and 'High' frameworks and is a key component of FATF-compliant remote KYC.",
      },
    },
    {
      "@type": "Question",
      name: "What documents can be verified with WorldID?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WorldID supports verification of passports, national identity cards, driving licences, and residence permits across 190+ countries. Document authentication includes MRZ (Machine Readable Zone) parsing, NFC chip reading for e-passports, security feature validation (holograms, UV patterns), and OCR extraction of all biographical data fields. Unsupported or damaged documents are routed to a manual review queue.",
      },
    },
    {
      "@type": "Question",
      name: "What is eIDAS and how does it apply to identity verification?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "eIDAS (Electronic Identification, Authentication and Trust Services) is the EU regulation governing electronic identity and trust services. It defines three Levels of Assurance (LoA) for electronic identity: Low, Substantial, and High. For regulated financial institutions, remote KYC must meet at least LoA Substantial — which requires document verification combined with liveness detection. eIDAS 2.0, the revised regulation introducing the EU Digital Identity Wallet, is expected to reshape digital onboarding across the EU from 2026 onwards.",
      },
    },
    {
      "@type": "Question",
      name: "How does biometric face matching work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Biometric face matching compares the portrait extracted from an identity document against a real-time selfie image captured during the verification session. AI-powered facial recognition algorithms generate numerical embeddings of both faces and calculate a similarity score. If the score exceeds a configured threshold, the match is confirmed. Face matching is used to ensure the person presenting the document is the legitimate holder, preventing identity fraud during remote onboarding.",
      },
    },
    {
      "@type": "Question",
      name: "Is digital identity verification compliant with AML regulations?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Digital identity verification is accepted as a valid CDD mechanism under FATF Recommendation 10, EU Anti-Money Laundering Directives (5AMLD/6AMLD), the UK Money Laundering Regulations 2017, and FinCEN's Customer Identification Program (CIP) rules — provided the solution meets defined standards for document authenticity, biometric matching, and liveness detection. Regulators in most jurisdictions now explicitly recognise remote digital KYC as equivalent to in-person verification when supported by a compliant IDV solution.",
      },
    },
    {
      "@type": "Question",
      name: "What happens when an identity verification session fails or is inconclusive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When an automated verification session cannot reach a confident pass or fail decision — for example, due to low-quality images, a damaged document, or an inconclusive liveness result — WorldID routes the session to a MANUAL_CHECK status. Human review agents can then inspect the session data, document images, and biometric frames to make a final decision. This fallback path ensures that genuine customers with imperfect captures are not automatically rejected, while maintaining the integrity of the verification process.",
      },
    },
    {
      "@type": "Question",
      name: "How is WorldID integrated into existing onboarding workflows?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WorldID is available via a RESTful API and a no-code hosted verification flow. API integration allows developers to embed the verification journey directly into a native app or web onboarding flow, with results returned as structured JSON including match scores, extracted data, and a final decision (PASS / FAIL / MANUAL_CHECK). The hosted flow requires no development: a verification link is generated and sent to the customer, who completes the process on their own device. Both modes produce a full audit trail of the session.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const WorldID = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="WorldID | Digital Identity Verification & Liveness Detection | WorldAML"
        description="Digital identity verification with document authentication, biometric liveness detection, and face matching. eIDAS-aligned, FATF-compliant. Verify customers in seconds via API or platform."
        canonical="/products/worldid"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: "WorldID", url: "/products/worldid" },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-grow relative">
        <LaneBadge lane="platform" />
        <WorldIDHeroSection />
        <WorldIDOverviewSection />
        <WorldIDHowItWorksSection />
        <WorldIDCapabilitiesSection />
        <WorldIDCoverageSection />
        <WorldIDIntegrationsSection />
        <WorldIDPricingSection />
        <WorldIDBundleSection />
        <WorldIDTrustSection />
        <WorldIDFAQSection />
        <WorldIDCTASection />
        <WorldIDStickyCTA />
      </main>
      <Footer />
    </div>
  );
};

export default WorldID;
