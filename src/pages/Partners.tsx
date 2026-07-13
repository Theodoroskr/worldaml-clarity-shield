import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartnerHeroSection from "@/components/partners/PartnerHeroSection";
import PartnerSocialProofSection from "@/components/partners/PartnerSocialProofSection";
import PartnerBenefitsSection from "@/components/partners/PartnerBenefitsSection";
import PartnerFAQSection from "@/components/partners/PartnerFAQSection";
import PartnerContactSection from "@/components/partners/PartnerContactSection";

const faqStructured = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Who is the WorldAML Partner Program for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Compliance consultancies, MLROs, RegTech resellers, law firms, and technology integrators serving regulated businesses under AML rules.",
      },
    },
    {
      "@type": "Question",
      name: "How does commission work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Recurring commission on referred clients: 5% referral, 10% affiliate, 15% reseller. Payouts are monthly by bank transfer over a €100 threshold.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a cost to join?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The WorldAML Partner Program is free for approved partners with no monthly fees or sales quotas.",
      },
    },
    {
      "@type": "Question",
      name: "How long does approval take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most partner applications are reviewed within 48 business hours.",
      },
    },
  ],
};

const Partners = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Partner Program — Earn Recurring Commission | WorldAML"
      description="Join the WorldAML Partner Program. Refer, resell, or white-label our AML, KYC & KYB platform. Earn 5–15% recurring commission with dedicated support."
      canonical="/partners"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Partner Program", url: "/partners" },
      ]}
      structuredData={[
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "WorldAML Partner Program",
          description:
            "Join the WorldAML Partner Program as a referral, affiliate, or reseller partner. Earn recurring commissions on every client you refer.",
          url: "https://www.worldaml.com/partners",
          mainEntity: {
            "@type": "Offer",
            name: "WorldAML Partner Program",
            description:
              "Earn recurring commissions by referring clients to WorldAML's compliance platform. Three tiers: referral, affiliate, reseller.",
            category: "Partner Program",
          },
        },
        faqStructured,
      ]}
    />
    <Header />
    <main className="flex-1">
      <PartnerHeroSection />
      <PartnerSocialProofSection />
      <PartnerBenefitsSection />
      <PartnerFAQSection />
      <PartnerContactSection />
    </main>
    <Footer />
  </div>
);

export default Partners;
