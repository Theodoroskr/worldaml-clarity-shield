import { Link } from "react-router-dom";
import { ArrowRight, FileText, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

const codeExample = `// Screen an individual for AML risk
const response = await fetch('https://api.worldaml.com/v1/screen/individual', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "John Smith",
    dateOfBirth: "1985-03-15",
    nationality: "GB"
  })
});

const { riskScore, matches, monitoring } = await response.json();`;

export const APIHeroSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-caption font-medium text-teal bg-teal/10 rounded-full">
              <Code className="w-3.5 h-3.5" />
              API-First Infrastructure
            </div>
            <h1 className="text-display text-navy mb-6">
              Enterprise AML Screening & Monitoring, Delivered via API
            </h1>
            <p className="text-body-lg text-text-secondary mb-8">
              Embed real-time AML screening, ongoing monitoring and risk assessment for 
              individuals and companies into your onboarding and compliance workflows.
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
                  View Documentation
                </a>
              </Button>
            </div>
          </div>

          {/* Code example */}
          <div className="relative">
            <div className="absolute -inset-4 bg-navy/5 rounded-2xl" />
            <div className="relative bg-navy rounded-xl p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
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

export default APIHeroSection;
