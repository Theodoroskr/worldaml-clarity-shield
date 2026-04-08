import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TMHeroSection from "@/components/transaction-monitoring/TMHeroSection";
import TMWhatIsSection from "@/components/transaction-monitoring/TMWhatIsSection";
import TMFeaturesSection from "@/components/transaction-monitoring/TMFeaturesSection";
import TMHowItWorksSection from "@/components/transaction-monitoring/TMHowItWorksSection";
import TMRegulatorySection from "@/components/transaction-monitoring/TMRegulatorySection";
import TMUseCasesSection from "@/components/transaction-monitoring/TMUseCasesSection";
import TMCTASection from "@/components/transaction-monitoring/TMCTASection";

const softwareData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WorldAML Transaction Monitoring",
  applicationCategory: "FinancialApplication",
  description:
    "Real-time AML transaction monitoring software for banks, VASPs, and payment processors. Configurable rule engine, typology detection, SAR workflow, and regulatory reporting aligned with FATF Recommendation 20.",
  operatingSystem: "Web",
  url: "https://www.worldaml.com/platform/transaction-monitoring",
  offers: { "@type": "Offer", category: "SaaS", url: "https://www.worldaml.com/pricing" },
  provider: { "@type": "Organization", name: "WorldAML", url: "https://www.worldaml.com" },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AML transaction monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AML transaction monitoring is the automated process of analysing customer transactions in real time or near-real time to detect patterns that may indicate money laundering, terrorist financing, or other financial crime. It uses scenario-based rules and behavioural analytics to generate alerts for analyst review, helping firms meet their obligations under FATF Recommendation 20.",
      },
    },
    {
      "@type": "Question",
      name: "What transactions should be monitored for AML purposes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All customer transactions should be subject to AML monitoring, with the depth of monitoring calibrated to risk. Key transaction types include cash deposits and withdrawals, wire transfers (especially cross-border), high-value payments, rapid movement of funds through accounts, unusual volumes relative to customer profile, and transactions involving high-risk jurisdictions.",
      },
    },
    {
      "@type": "Question",
      name: "What are transaction monitoring red flags?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Common transaction monitoring red flags include: structuring (multiple transactions just below reporting thresholds), rapid fund movement with no business purpose, transactions inconsistent with the customer's known profile, frequent transfers to or from high-risk jurisdictions, use of multiple accounts to aggregate funds, and sudden changes in transaction patterns following a compliance enquiry.",
      },
    },
    {
      "@type": "Question",
      name: "How do you reduce false positives in transaction monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reducing false positives requires risk-tiered thresholds (stricter for high-risk customers, broader for low-risk), regular tuning of monitoring rules based on alert-to-SAR conversion rates, building accurate customer behaviour baselines, and using typology-based rather than purely threshold-based rules. Regular review cycles — at least annually — are required to ensure rules remain fit for purpose.",
      },
    },
    {
      "@type": "Question",
      name: "What is a Suspicious Activity Report (SAR)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Suspicious Activity Report (SAR) is a formal report filed by a regulated firm with its national financial intelligence unit (FIU) — such as the NCA in the UK or FinCEN in the US — when it knows, suspects, or has reasonable grounds to suspect that a customer is engaged in money laundering or terrorist financing. Filing a SAR is a legal obligation; failing to file when suspicion exists is a criminal offence in most jurisdictions.",
      },
    },
    {
      "@type": "Question",
      name: "What regulations require transaction monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Transaction monitoring is required by FATF Recommendation 20, the EU Anti-Money Laundering Directives, the UK Proceeds of Crime Act 2002 and Money Laundering Regulations 2017, and the US Bank Secrecy Act (BSA). For crypto exchanges and VASPs, FATF Recommendation 15 and MiCA Regulation also impose transaction monitoring obligations.",
      },
    },
    {
      "@type": "Question",
      name: "Can transaction monitoring be automated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — and at scale it must be. Manual transaction monitoring is impractical for any institution processing more than a few hundred transactions per day. Automated transaction monitoring platforms apply rules and behavioural models across millions of transactions in real time, generating prioritised alerts for analyst review. The system must be regularly reviewed, tested, and tuned to remain effective.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between rules-based and AI-based transaction monitoring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rules-based monitoring applies fixed scenario rules (e.g. 'flag any cash deposit over $9,500 within 3 days'). AI-based monitoring uses machine learning to detect anomalies relative to each customer's behavioural baseline, potentially identifying novel laundering patterns not covered by existing rules. Most mature compliance programmes use a hybrid approach — rules for regulatory minimum coverage and AI for behavioural anomaly detection.",
      },
    },
  ],
};

const structuredData = [softwareData, faqData];

const PlatformTransactionMonitoring = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Transaction Monitoring Software | AML Platform"
        description="Real-time AML transaction monitoring for banks, VASPs, and payment processors. Detect suspicious activity and automate SAR filing."
        canonical="/platform/transaction-monitoring"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Platform", url: "/platform" },
          { name: "Transaction Monitoring", url: "/platform/transaction-monitoring" },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">
        <TMHeroSection />
        <TMWhatIsSection />
        <TMFeaturesSection />
        <TMHowItWorksSection />
        <TMRegulatorySection />
        <TMUseCasesSection />
        <TMCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default PlatformTransactionMonitoring;
