import { MonitorCheck } from "lucide-react";

export const DemoHeroSection = () => {
  return (
    <section className="section-padding bg-surface-subtle border-b border-divider">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
            <MonitorCheck className="h-4 w-4" />
            <span className="text-body-sm font-medium">Platform Preview</span>
          </div>
          
          <h1 className="text-display mb-6">
            See the Platform in Action
          </h1>
          
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            Explore how WorldAML delivers real-time screening results, match confidence scoring, 
            and full audit trails — designed for compliance officers and regulated institutions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DemoHeroSection;
