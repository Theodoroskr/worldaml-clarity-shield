import { Shield, Key, FileCheck, Database, Eye } from "lucide-react";

const trustItems = [
  { icon: Shield, text: "GDPR-ready architecture" },
  { icon: Key, text: "Secure session tokens" },
  { icon: FileCheck, text: "Signed API responses" },
  { icon: Database, text: "Audit logs and evidence retention" },
  { icon: Eye, text: "Data access endpoints for compliance review" },
];

const WorldIDTrustSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-4">Trust, security & compliance</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Built with regulatory requirements in mind.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto mb-8">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 bg-secondary px-4 py-3 rounded-lg"
            >
              <item.icon className="w-5 h-5 text-teal shrink-0" />
              <span className="text-sm text-navy font-medium">{item.text}</span>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-text-tertiary">
            Powered by Identomat (white-label)
          </p>
        </div>
      </div>
    </section>
  );
};

export default WorldIDTrustSection;
