import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoIcon } from "@/components/Logo";
import lexisNexisLogo from "@/assets/lexisnexis-risk-solutions-logo.png";

// Abstract Network Globe visual component
const NetworkGlobeVisual = () => (
  <svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <style>
      {`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; r: 5; }
          50% { opacity: 0.7; r: 8; }
        }
        @keyframes pulse-ring {
          0% { opacity: 0.4; r: 8; }
          100% { opacity: 0; r: 24; }
        }
        @keyframes connection-flow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes node-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .center-node { animation: pulse-glow 3s ease-in-out infinite; }
        .pulse-ring { animation: pulse-ring 3s ease-out infinite; }
        .primary-connection { animation: connection-flow 4s ease-in-out infinite; }
        .secondary-connection { animation: connection-flow 4s ease-in-out infinite 0.5s; }
        .tertiary-connection { animation: connection-flow 4s ease-in-out infinite 1s; }
        .secondary-node { animation: node-pulse 4s ease-in-out infinite 0.3s; }
        .tertiary-node { animation: node-pulse 4s ease-in-out infinite 0.6s; }
      `}
    </style>
    
    {/* Outer globe circle */}
    <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" className="text-navy/20" />
    <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="0.5" className="text-navy/10" />
    
    {/* Center pulse ring */}
    <circle cx="200" cy="200" r="8" className="fill-accent/20 pulse-ring" />
    
    {/* Network nodes - distributed globally */}
    {/* Core nodes */}
    <circle cx="200" cy="80" r="4" className="fill-navy" />
    <circle cx="200" cy="320" r="4" className="fill-navy" />
    <circle cx="80" cy="200" r="4" className="fill-navy" />
    <circle cx="320" cy="200" r="4" className="fill-navy" />
    
    {/* Center node with glow */}
    <circle cx="200" cy="200" r="5" className="fill-accent center-node" />
    
    {/* Secondary nodes */}
    <circle cx="130" cy="120" r="3.5" className="fill-navy secondary-node" />
    <circle cx="270" cy="120" r="3.5" className="fill-navy secondary-node" />
    <circle cx="130" cy="280" r="3.5" className="fill-navy secondary-node" />
    <circle cx="270" cy="280" r="3.5" className="fill-navy secondary-node" />
    
    {/* Tertiary nodes */}
    <circle cx="160" cy="160" r="2.5" className="fill-navy/70 tertiary-node" />
    <circle cx="240" cy="160" r="2.5" className="fill-navy/70 tertiary-node" />
    <circle cx="160" cy="240" r="2.5" className="fill-navy/70 tertiary-node" />
    <circle cx="240" cy="240" r="2.5" className="fill-navy/70 tertiary-node" />
    
    {/* Outer edge nodes */}
    <circle cx="110" cy="170" r="2" className="fill-navy/50" />
    <circle cx="290" cy="170" r="2" className="fill-navy/50" />
    <circle cx="110" cy="230" r="2" className="fill-navy/50" />
    <circle cx="290" cy="230" r="2" className="fill-navy/50" />
    <circle cx="170" cy="100" r="2" className="fill-navy/50" />
    <circle cx="230" cy="100" r="2" className="fill-navy/50" />
    <circle cx="170" cy="300" r="2" className="fill-navy/50" />
    <circle cx="230" cy="300" r="2" className="fill-navy/50" />
    
    {/* Primary connections to center */}
    <line x1="200" y1="80" x2="200" y2="200" stroke="currentColor" strokeWidth="0.8" className="text-navy/30 primary-connection" />
    <line x1="200" y1="200" x2="200" y2="320" stroke="currentColor" strokeWidth="0.8" className="text-navy/30 primary-connection" />
    <line x1="80" y1="200" x2="200" y2="200" stroke="currentColor" strokeWidth="0.8" className="text-navy/30 primary-connection" />
    <line x1="200" y1="200" x2="320" y2="200" stroke="currentColor" strokeWidth="0.8" className="text-navy/30 primary-connection" />
    
    {/* Diagonal connections to center */}
    <line x1="130" y1="120" x2="200" y2="200" stroke="currentColor" strokeWidth="0.6" className="text-navy/25 secondary-connection" />
    <line x1="270" y1="120" x2="200" y2="200" stroke="currentColor" strokeWidth="0.6" className="text-navy/25 secondary-connection" />
    <line x1="130" y1="280" x2="200" y2="200" stroke="currentColor" strokeWidth="0.6" className="text-navy/25 secondary-connection" />
    <line x1="270" y1="280" x2="200" y2="200" stroke="currentColor" strokeWidth="0.6" className="text-navy/25 secondary-connection" />
    
    {/* Secondary connections */}
    <line x1="160" y1="160" x2="200" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-navy/20 tertiary-connection" />
    <line x1="240" y1="160" x2="200" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-navy/20 tertiary-connection" />
    <line x1="160" y1="240" x2="200" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-navy/20 tertiary-connection" />
    <line x1="240" y1="240" x2="200" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-navy/20 tertiary-connection" />
    
    {/* Outer ring connections */}
    <line x1="200" y1="80" x2="270" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-navy/20" />
    <line x1="200" y1="80" x2="130" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-navy/20" />
    <line x1="320" y1="200" x2="270" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-navy/20" />
    <line x1="320" y1="200" x2="270" y2="280" stroke="currentColor" strokeWidth="0.5" className="text-navy/20" />
    <line x1="200" y1="320" x2="270" y2="280" stroke="currentColor" strokeWidth="0.5" className="text-navy/20" />
    <line x1="200" y1="320" x2="130" y2="280" stroke="currentColor" strokeWidth="0.5" className="text-navy/20" />
    <line x1="80" y1="200" x2="130" y2="280" stroke="currentColor" strokeWidth="0.5" className="text-navy/20" />
    <line x1="80" y1="200" x2="130" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-navy/20" />
    
    {/* Cross connections for density */}
    <line x1="130" y1="120" x2="270" y2="120" stroke="currentColor" strokeWidth="0.3" className="text-navy/15" />
    <line x1="130" y1="280" x2="270" y2="280" stroke="currentColor" strokeWidth="0.3" className="text-navy/15" />
    <line x1="130" y1="120" x2="130" y2="280" stroke="currentColor" strokeWidth="0.3" className="text-navy/15" />
    <line x1="270" y1="120" x2="270" y2="280" stroke="currentColor" strokeWidth="0.3" className="text-navy/15" />
    
    {/* Tertiary to secondary connections */}
    <line x1="160" y1="160" x2="130" y2="120" stroke="currentColor" strokeWidth="0.3" className="text-navy/15" />
    <line x1="240" y1="160" x2="270" y2="120" stroke="currentColor" strokeWidth="0.3" className="text-navy/15" />
    <line x1="160" y1="240" x2="130" y2="280" stroke="currentColor" strokeWidth="0.3" className="text-navy/15" />
    <line x1="240" y1="240" x2="270" y2="280" stroke="currentColor" strokeWidth="0.3" className="text-navy/15" />
    
    {/* Edge node connections */}
    <line x1="110" y1="170" x2="130" y2="120" stroke="currentColor" strokeWidth="0.25" className="text-navy/10" />
    <line x1="110" y1="230" x2="130" y2="280" stroke="currentColor" strokeWidth="0.25" className="text-navy/10" />
    <line x1="290" y1="170" x2="270" y2="120" stroke="currentColor" strokeWidth="0.25" className="text-navy/10" />
    <line x1="290" y1="230" x2="270" y2="280" stroke="currentColor" strokeWidth="0.25" className="text-navy/10" />
    <line x1="170" y1="100" x2="200" y2="80" stroke="currentColor" strokeWidth="0.25" className="text-navy/10" />
    <line x1="230" y1="100" x2="200" y2="80" stroke="currentColor" strokeWidth="0.25" className="text-navy/10" />
    <line x1="170" y1="300" x2="200" y2="320" stroke="currentColor" strokeWidth="0.25" className="text-navy/10" />
    <line x1="230" y1="300" x2="200" y2="320" stroke="currentColor" strokeWidth="0.25" className="text-navy/10" />
  </svg>
);

export const NewHeroSection = () => {
  return (
    <section className="section-padding bg-surface-subtle relative overflow-hidden">
      {/* Animated Globe Background - Desktop only */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.4] pointer-events-none -mr-20">
        <NetworkGlobeVisual />
      </div>

      <div className="container-enterprise relative z-10">
        {/* Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-navy mb-6 text-balance">
            WorldAML — Financial Crime Screening Infrastructure
          </h1>
          <p className="text-body-lg text-text-secondary mb-6 max-w-3xl mx-auto">
            A unified platform and API layer for orchestrating financial crime screening 
            using approved third-party data sources.
          </p>
          
          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button variant="default" size="lg" asChild>
              <Link to="/contact-sales">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <p className="text-body-sm text-text-tertiary border-t border-divider pt-6 mt-4">
            WorldAML integrates trusted screening technologies, including LexisNexis Risk Solutions, 
            and is delivered and supported by Infocredit Group.
          </p>
        </div>

        {/* Two-Column Product Split */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Lane 1 - WorldAML Platform */}
          <Card className="border-navy/10 hover:border-navy/20 transition-colors">
            <CardHeader>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-4">
                <LogoIcon size="md" />
              </div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full border border-navy/20 bg-navy/5 text-navy">
                  WorldAML Platform
                </span>
              </div>
              <CardTitle className="text-xl text-navy">WorldAML Platform & API</CardTitle>
              <CardDescription className="text-text-secondary">
                Unified UI, APIs, workflows, and governance for managing financial crime screening.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/platform">
                  Request Platform Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Lane 2 - Data Sources */}
          <Card className="border-teal/20 hover:border-teal/30 transition-colors">
            <CardHeader>
              <div className="inline-flex items-center justify-center h-12 mb-4">
                <img src={lexisNexisLogo} alt="LexisNexis Risk Solutions" className="h-10 object-contain" />
              </div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full border border-teal/20 bg-teal/5 text-teal">
                  Data Source: LexisNexis
                </span>
              </div>
              <CardTitle className="text-xl text-navy">LexisNexis Screening Solutions</CardTitle>
              <CardDescription className="text-text-secondary">
                <span className="block mb-1">WorldCompliance®</span>
                <span className="block">Bridger Insight XG®</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/data-sources">
                  View Data Sources
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NewHeroSection;
