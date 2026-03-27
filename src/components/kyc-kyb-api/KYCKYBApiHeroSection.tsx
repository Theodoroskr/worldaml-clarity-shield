import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const codeExample = `// Verify a company (KYB)
const response = await fetch(
  'https://api.worldaml.com/v1/kyb/verify',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      company_name: "Acme Holdings Ltd",
      registration_number: "12345678",
      jurisdiction: "GB",
      checks: ["registry", "ubo", "sanctions", "adverse_media"]
    })
  }
);`;

export const KYCKYBApiHeroSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-caption font-medium text-teal bg-teal/10 rounded-full">
              API Product
            </div>
            <h1 className="text-display text-navy mb-4">
              KYC & KYB API
            </h1>
            <p className="text-body-lg text-teal font-medium mb-6">
              Programmatic Identity & Business Verification
            </p>
            <p className="text-body-lg text-text-secondary mb-8">
              Automate Know Your Customer and Know Your Business checks through a 
              single API. Verify identities, map corporate structures, identify 
              beneficial owners, and trigger Enhanced Due Diligence — all programmatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/get-started">
                  Request API Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://worldaml.readme.io" target="_blank" rel="noopener noreferrer">
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
                <span className="ml-2 text-caption text-slate-light/60">POST /v1/kyb/verify</span>
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

export default KYCKYBApiHeroSection;
