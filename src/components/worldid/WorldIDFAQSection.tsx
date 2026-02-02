import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What documents does WorldID support?",
    answer: "WorldID supports passports, national ID cards, and driver's licenses from over 190 countries. Document types can be configured per verification flow based on your compliance requirements.",
  },
  {
    question: "How does liveness detection work?",
    answer: "WorldID uses biometric liveness detection to verify that a real, live person is present during verification. This includes anti-spoofing checks to prevent photo or video-based fraud attempts.",
  },
  {
    question: "What verification outcomes are possible?",
    answer: "WorldID returns one of four deterministic outcomes: APPROVED (verified successfully), REJECTED (verification failed), MANUAL_CHECK (requires human review), or IN_PROGRESS (verification ongoing).",
  },
  {
    question: "Can I customize the verification flow?",
    answer: "Yes. You can configure which document types to accept, enable or disable liveness checks, add custom branding, set language preferences, and define redirect URLs after verification.",
  },
  {
    question: "Is WorldID compliant with GDPR?",
    answer: "WorldID is built with a GDPR-ready architecture, including secure data handling, audit logs, evidence retention, and data access endpoints for compliance review and subject access requests.",
  },
  {
    question: "How do I integrate WorldID with my application?",
    answer: "WorldID offers both hosted verification flows (redirect-based) and API/SDK integration options. You can create sessions via API, receive results through webhooks, and retrieve detailed verification reports programmatically.",
  },
];

const WorldIDFAQSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-4">Frequently asked questions</h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white border border-divider rounded-lg px-4"
              >
                <AccordionTrigger className="text-left text-navy font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default WorldIDFAQSection;
