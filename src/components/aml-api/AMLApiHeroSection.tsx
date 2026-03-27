import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const codeExample = `// Screen an individual for AML risks
const response = await fetch(
  'https://api.worldaml.com/v1/aml/screen',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "Jane Doe",
      date_of_birth: "1985-03-14",
      country: "US",
      checks: ["sanctions", "peps", "adverse_media"]
    })
  }
);`;

export const AMLApiHeroSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-caption font-medium text-teal bg-teal/10 rounded-full">
              API Product
            </div>
            <h1 className="text-display text-navy mb-4">
              AML Screening API
            </h1>
            <p className="text-body-lg text-teal font-medium mb-6">
              Automate Compliance at Scale
            </p>
            <p className="text-body-lg text-text-secondary mb-8">
              Integrate real-time AML screening directly into your onboarding, 
              payment, and customer lifecycle workflows. A single API call checks 
              sanctions lists, PEP databases, adverse media, and RCA relationships — 
              returning structured, actionable results in milliseconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/get-started">
                  Request API Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a
                  href="https://worldaml.readme.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  API Documentation
                </a>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-navy/5 rounded-2xl" />
            <div className="relative bg-navy rounded-xl p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-caption text-slate-light/60">POST /v1/aml/screen</span>
              </div>
              <pre className="text-body-sm text-slate-light overflow-x-auto">
                <code>{codeExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AMLApiHeroSection;
