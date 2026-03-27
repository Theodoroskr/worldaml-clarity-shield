import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const codeExample = `// Real-time sanctions screening
const response = await fetch(
  'https://api.worldaml.com/v1/sanctions/screen',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "Acme Trading LLC",
      type: "entity",
      lists: ["OFAC_SDN", "EU_CONSOLIDATED", "UN_SC"],
      fuzzy_threshold: 85
    })
  }
);`;

export const SanctionsApiHeroSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-caption font-medium text-teal bg-teal/10 rounded-full">
              API Product
            </div>
            <h1 className="text-display text-navy mb-4">
              Sanctions Screening API
            </h1>
            <p className="text-body-lg text-teal font-medium mb-6">
              Real-Time Global List Coverage
            </p>
            <p className="text-body-lg text-text-secondary mb-8">
              Screen individuals and entities against 200+ global sanctions and watchlists 
              in real time. Configurable fuzzy matching, batch processing, and ongoing 
              monitoring — all through a single API integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/get-started">
                  Request API Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/sanctions-check">
                  Try Free Sanctions Check
                </Link>
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
                <span className="ml-2 text-caption text-slate-light/60">POST /v1/sanctions/screen</span>
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

export default SanctionsApiHeroSection;
