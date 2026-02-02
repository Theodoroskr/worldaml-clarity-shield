import { 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  ScanFace, 
  UserCheck, 
  Users, 
  ClipboardList, 
  Webhook 
} from "lucide-react";

const capabilities = [
  { icon: CreditCard, text: "Passport, ID card & driver's license verification" },
  { icon: FileText, text: "OCR & structured data extraction" },
  { icon: ShieldCheck, text: "Document authenticity & tampering checks" },
  { icon: ScanFace, text: "Biometric liveness detection" },
  { icon: UserCheck, text: "Face match (document vs selfie)" },
  { icon: Users, text: "Duplicate & impersonation signals" },
  { icon: ClipboardList, text: "Verification report & audit trail" },
  { icon: Webhook, text: "Webhooks & event callbacks" },
];

const WorldIDCapabilitiesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-4">Key capabilities</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Enterprise-grade identity verification features.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {capabilities.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-4 md:p-6 rounded-lg border border-divider hover:border-teal/30 transition-colors bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-teal" />
              </div>
              <p className="text-sm text-navy font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorldIDCapabilitiesSection;
