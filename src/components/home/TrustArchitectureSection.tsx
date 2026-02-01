import { Check } from "lucide-react";

const trustPoints = [
  "Risk-based approach aligned with FATF principles",
  "Ongoing monitoring by default, not optional",
  "Audit-ready outputs designed for regulated environments",
  "Enterprise-grade data governance and traceability",
];

export const TrustArchitectureSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-headline text-navy mb-8 text-center">
            Built for Regulated Environments
          </h2>
          <ul className="space-y-4">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-navy/5 flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-navy" />
                </div>
                <span className="text-body text-text-secondary">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TrustArchitectureSection;
