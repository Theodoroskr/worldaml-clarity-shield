import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container-enterprise relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 md:py-20 lg:py-24">
          {/* Left content */}
          <div className="max-w-xl">
            <h1 className="text-display text-navy mb-6">
              Global AML Screening Infrastructure
            </h1>
            
            <p className="text-body-lg text-text-secondary mb-10">
              Real-time sanctions, PEP, and adverse media screening for individuals 
              and companies — built for regulated institutions.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button size="lg" asChild>
                <Link to="/get-started">
                  Request Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a 
                  href="https://worldaml.readme.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View API Documentation
                </a>
              </Button>
            </div>
            
            {/* Regulatory alignment */}
            <div className="pt-6 border-t border-divider">
              <p className="text-body-sm text-text-tertiary">
                Designed to support FATF, EBA, FCA and FinCEN-aligned compliance frameworks.
              </p>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative hidden lg:block">
            <div className="w-full max-w-md mx-auto aspect-square">
              <NetworkGlobeVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
