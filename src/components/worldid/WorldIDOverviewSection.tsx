import { Card, CardContent } from "@/components/ui/card";
import { Link2, Code2, Settings2 } from "lucide-react";

const overviewCards = [
  {
    icon: Link2,
    title: "Hosted verification flow",
    text: "Redirect users to a secure WorldID session with your branding and configuration.",
  },
  {
    icon: Code2,
    title: "API & SDK integration",
    text: "Create verification sessions, retrieve results, and automate decisions via API.",
  },
  {
    icon: Settings2,
    title: "Configurable verification levels",
    text: "Enable or disable liveness, document types, and additional checks per use case.",
  },
];

const WorldIDOverviewSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-4">Product overview</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Flexible identity verification designed for compliance teams and developers alike.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {overviewCards.map((card, index) => (
            <Card key={index} className="border-divider hover:border-teal/30 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-navy/5 flex items-center justify-center mb-4">
                  <card.icon className="w-6 h-6 text-teal" />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">{card.title}</h3>
                <p className="text-text-secondary text-sm">{card.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorldIDOverviewSection;
