import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is WorldAML?",
    answer: "WorldAML is an API-first compliance platform enabling KYC and KYB onboarding, AML screening, ongoing monitoring and risk assessment. The platform provides access to global PEP, sanctions and adverse media data, allowing regulated organisations to meet their compliance obligations through a single, integrated solution."
  },
  {
    question: "Is WorldAML a platform or an API?",
    answer: "WorldAML is both a full compliance platform and an API-first solution. All platform capabilities — including KYC/KYB onboarding, AML screening, ongoing monitoring and risk assessment — are accessible via RESTful API. This architecture allows organisations to either use WorldAML as a standalone platform or embed compliance capabilities directly into their existing systems."
  },
  {
    question: "What is an Application Programming Interface (API)?",
    answer: "An Application Programming Interface (API) is a set of protocols and tools that allows different software systems to communicate with each other. The WorldAML API enables organisations to integrate onboarding, screening, monitoring and risk decisioning directly into their own applications, workflows and customer journeys — without manual intervention or separate systems."
  },
  {
    question: "What is Anti-Money Laundering (AML)?",
    answer: "Anti-Money Laundering (AML) refers to the laws, regulations and procedures designed to prevent criminals from disguising illegally obtained funds as legitimate income. WorldAML supports AML compliance through real-time screening against sanctions and PEP databases, ongoing monitoring for changes in customer risk profiles, and risk-based decisioning tools aligned with regulatory frameworks including FATF, EBA and FinCEN guidelines."
  },
  {
    question: "What is Know-Your-Customer (KYC)?",
    answer: "Know-Your-Customer (KYC) is the process of verifying the identity of individual customers before and during a business relationship. WorldAML supports KYC through identity verification, document validation, screening against global watchlists, and ongoing monitoring — enabling organisations to establish and maintain compliant customer relationships."
  },
  {
    question: "What is Know-Your-Business (KYB)?",
    answer: "Know-Your-Business (KYB) is the process of verifying the identity and legitimacy of corporate entities. WorldAML supports KYB onboarding through company verification, Ultimate Beneficial Owner (UBO) identification, corporate registry checks, and ongoing monitoring of business customers and their associated persons."
  },
  {
    question: "What is Customer Due Diligence (CDD)?",
    answer: "Customer Due Diligence (CDD) is the ongoing process of assessing and monitoring customer risk throughout the business relationship. WorldAML enables risk-based CDD by combining initial screening with continuous monitoring, allowing organisations to apply enhanced due diligence where required and maintain compliant customer lifecycles."
  },
  {
    question: "What is a Politically Exposed Person (PEP)?",
    answer: "A Politically Exposed Person (PEP) is an individual who holds or has held a prominent public function, such as a government official, senior executive of a state-owned enterprise, or high-ranking military officer. PEPs and their close associates present elevated money laundering risk. WorldAML provides global PEP screening and ongoing monitoring to help organisations identify and manage PEP relationships in accordance with regulatory requirements."
  },
  {
    question: "What is Identity Verification and Document Validation?",
    answer: "Identity verification confirms that an individual is who they claim to be, while document validation ensures that identity documents are authentic and unaltered. In the context of KYC onboarding, these processes help establish customer identity, assess risk, and meet regulatory obligations for customer identification programmes."
  },
  {
    question: "What is a Sanctions List?",
    answer: "A sanctions list is a register of individuals, entities and countries subject to restrictive measures imposed by governments or international bodies. Sanctions screening is a core AML requirement — regulated organisations must check customers and transactions against sanctions lists to avoid facilitating prohibited activities. WorldAML provides real-time screening against global sanctions databases including OFAC, EU, UN and other international lists."
  },
  {
    question: "What is Counter-Terrorism Financing (CTF)?",
    answer: "Counter-Terrorism Financing (CTF) refers to measures designed to prevent the funding of terrorist activities. CTF obligations are closely linked to AML requirements, and regulated organisations must implement controls to detect and report suspicious activities that may relate to terrorism financing. WorldAML supports CTF compliance through screening, monitoring and risk assessment capabilities."
  },
  {
    question: "Does WorldAML support adverse media monitoring?",
    answer: "Yes. WorldAML supports adverse media screening and ongoing monitoring as part of its AML and risk assessment framework. The platform continuously monitors curated global media sources, including structured news feeds, and applies entity matching and risk classification to detect emerging financial crime and reputational risks in a risk-based manner."
  },
  {
    question: "Does WorldAML support ongoing AML monitoring?",
    answer: "Yes. WorldAML provides continuous monitoring of customer portfolios against sanctions, PEP and adverse media databases. When a customer's status changes — such as being added to a sanctions list or identified as a PEP — organisations are alerted automatically, enabling timely review and action in accordance with regulatory expectations."
  },
  {
    question: "Which industries use WorldAML?",
    answer: "WorldAML serves regulated organisations across the financial services spectrum, including banks and electronic money institutions (EMIs), fintechs, payment service providers, crypto and digital asset businesses (VASPs), gaming and gambling operators, and legal and fiduciary service providers. The platform's API-first architecture supports organisations of all sizes and compliance maturity levels."
  },
  {
    question: "Is WorldAML suitable for enterprise and high-volume use?",
    answer: "Yes. WorldAML is designed for enterprise-grade performance, supporting high-volume screening, real-time API responses, and scalable infrastructure. The platform serves organisations ranging from early-stage fintechs to established financial institutions processing millions of checks annually, with SLA options tailored to enterprise requirements."
  },
];

// Generate JSON-LD structured data for FAQPage
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="FAQ"
        description="Frequently asked questions about AML screening, KYC, KYB, sanctions lists, PEPs, and how the WorldAML compliance platform works."
        canonical="/faq"
        structuredData={faqStructuredData}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "FAQ", url: "/faq" },
        ]}
      />
      
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h1 className="text-display text-navy mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-body-lg text-text-secondary">
                We have created this FAQ to help clients and partners understand key AML, 
                KYC and compliance concepts, as well as how the WorldAML platform works.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="pb-16 md:pb-24 bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-divider rounded-lg px-6 data-[state=open]:bg-surface-subtle"
                  >
                    <AccordionTrigger className="text-left text-body font-semibold text-navy hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-body text-text-secondary pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-headline text-navy mb-4">
                Have More Questions?
              </h2>
              <p className="text-body-lg text-text-secondary mb-8">
                Our team is ready to help you understand how WorldAML can support 
                your compliance requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/support">View Support Options</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
