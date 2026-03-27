export interface KnowledgeEntry {
  keywords: string[];
  question: string;
  answer: string;
  link?: string;
}

export const chatbotKnowledge: KnowledgeEntry[] = [
  {
    keywords: ["demo", "demonstration", "show", "walkthrough", "trial"],
    question: "How can I request a demo?",
    answer: "We'd love to show you WorldAML in action! You can request a personalised demo with one of our compliance specialists.",
    link: "/contact-sales",
  },
  {
    keywords: ["pricing", "cost", "price", "how much", "plans", "subscription"],
    question: "What are your pricing plans?",
    answer: "We offer flexible pricing tailored to your screening volume and compliance needs. Visit our pricing page for details.",
    link: "/pricing",
  },
  {
    keywords: ["free", "trial", "try", "test", "start"],
    question: "Is there a free trial?",
    answer: "Yes! You can get started with a free trial to explore our platform and run your first compliance checks.",
    link: "/get-started",
  },
  {
    keywords: ["aml", "screening", "check", "sanctions", "free check"],
    question: "Can I run a free AML check?",
    answer: "Absolutely — try our free AML sanctions check tool to screen individuals and entities against global watchlists instantly.",
    link: "/free-aml-check",
  },
  {
    keywords: ["suite", "platform", "product", "solution", "overview"],
    question: "What is the WorldAML Suite?",
    answer: "The WorldAML Suite is our all-in-one compliance platform covering AML screening, KYC/KYB onboarding, transaction monitoring, risk assessment, and regulatory reporting — all in a single dashboard.",
    link: "/suite",
  },
  {
    keywords: ["api", "integration", "developer", "connect", "endpoint"],
    question: "Do you offer an API?",
    answer: "Yes — our RESTful API lets you integrate real-time AML screening, KYC verification, and risk scoring directly into your applications.",
    link: "/platform/api",
  },
  {
    keywords: ["worldcompliance", "data", "database", "source"],
    question: "What is WorldCompliance?",
    answer: "WorldCompliance is our proprietary global risk intelligence database covering sanctions lists, PEPs, adverse media, and enforcement actions across 200+ jurisdictions.",
    link: "/products/worldcompliance",
  },
  {
    keywords: ["worldid", "identity", "verification", "id", "document"],
    question: "What is WorldID?",
    answer: "WorldID is our identity verification solution offering document checks, biometric matching, and liveness detection for seamless KYC onboarding.",
    link: "/products/worldid",
  },
  {
    keywords: ["kyc", "kyb", "onboarding", "know your customer", "know your business"],
    question: "What KYC/KYB solutions do you offer?",
    answer: "We provide end-to-end KYC and KYB onboarding with identity verification, document checks, UBO identification, and risk-based due diligence workflows.",
    link: "/platform/kyc-kyb",
  },
  {
    keywords: ["transaction", "monitoring", "suspicious", "alert"],
    question: "Do you offer transaction monitoring?",
    answer: "Yes — our transaction monitoring module detects suspicious activity in real-time using configurable rule engines and behavioural analytics.",
    link: "/platform/transaction-monitoring",
  },
  {
    keywords: ["risk", "assessment", "scoring", "evaluate"],
    question: "How does risk assessment work?",
    answer: "Our risk assessment engine assigns dynamic risk scores based on customer profiles, geography, transaction patterns, and screening results.",
    link: "/platform/risk-assessment",
  },
  {
    keywords: ["data coverage", "countries", "jurisdictions", "global"],
    question: "What is your global data coverage?",
    answer: "We cover 200+ countries and territories with sanctions lists, PEP databases, adverse media, and regulatory watchlists from official and proprietary sources.",
    link: "/resources/data-coverage",
  },
  {
    keywords: ["partner", "referral", "affiliate", "reseller"],
    question: "Do you have a partner program?",
    answer: "Yes! Our partner program offers referral commissions, co-branded materials, and dedicated support. Apply to become a partner today.",
    link: "/partners",
  },
  {
    keywords: ["support", "help", "contact", "issue", "problem"],
    question: "How can I get support?",
    answer: "Our support team is here to help. Reach out via our support page for technical assistance, account queries, or general enquiries.",
    link: "/support",
  },
  {
    keywords: ["security", "compliance", "gdpr", "soc", "iso", "encryption"],
    question: "How secure is your platform?",
    answer: "Security is at our core — we're SOC 2 certified, GDPR compliant, and use bank-grade encryption to protect your data at rest and in transit.",
    link: "/platform/security",
  },
  {
    keywords: ["regulatory", "reporting", "sar", "str", "filing"],
    question: "Do you support regulatory reporting?",
    answer: "Yes — our regulatory reporting module helps you generate and file SARs/STRs with the correct format for your jurisdiction.",
    link: "/platform/regulatory-reporting",
  },
];

export const fallbackResponse = {
  answer: "I'm not sure I understood that. Here are some things I can help with:\n\n• Product information\n• Pricing & plans\n• Requesting a demo\n• Free AML check\n• Technical support\n\nOr you can speak to our team directly.",
  link: "/contact-sales",
};

export function findBestMatch(input: string): { answer: string; link?: string } {
  const normalised = input.toLowerCase();
  let bestScore = 0;
  let bestEntry: KnowledgeEntry | null = null;

  for (const entry of chatbotKnowledge) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (normalised.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && bestScore > 0) {
    return { answer: bestEntry.answer, link: bestEntry.link };
  }

  return fallbackResponse;
}
