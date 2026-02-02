import { Link } from "react-router-dom";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/Logo";

const keyCapabilities = [
  "KYC & KYB Customer Onboarding",
  "Sanctions, PEP & Adverse Media Screening",
  "Continuous Transaction Monitoring",
  "Risk Assessment & Scoring",
  "Case Management & Audit Trail",
];

export const SuiteHeroSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <LogoIcon size="md" className="text-navy" />
              <p className="text-caption font-medium text-navy">
                WorldAML Platform
              </p>
            </div>
            <h1 className="text-display text-navy mb-6">
              WorldAML Suite: Complete AML Compliance Platform
            </h1>
            <p className="text-body-lg text-text-secondary mb-6">
              WorldAML Suite is an end-to-end Anti-Money Laundering (AML) compliance platform 
              designed for regulated financial institutions, fintechs, and payment providers. 
              Manage your entire compliance lifecycle from a single, unified dashboard.
            </p>
            <p className="text-body text-text-secondary mb-8">
              From KYC and KYB onboarding to sanctions screening, ongoing monitoring, and 
              risk assessment—WorldAML Suite streamlines compliance operations while ensuring 
              regulatory adherence across multiple jurisdictions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button size="lg" asChild>
                <Link to="/get-started">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/get-started?demo=true">
                  <Play className="mr-2 h-4 w-4" />
                  Request Demo
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-surface-subtle rounded-xl p-8 border border-divider">
            <h3 className="text-lg font-semibold text-navy mb-6">
              Complete Compliance Lifecycle Management
            </h3>
            <ul className="space-y-4">
              {keyCapabilities.map((capability) => (
                <li key={capability} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{capability}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-divider">
              <p className="text-sm text-text-tertiary">
                Powered by LexisNexis Risk Solutions data sources including WorldCompliance® 
                and Bridger Insight XG® for comprehensive global coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuiteHeroSection;
