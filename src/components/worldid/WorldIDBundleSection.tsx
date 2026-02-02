import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const bundles = [
  {
    name: "Onboarding Pack",
    includes: "WorldID + Sanctions + PEPs",
  },
  {
    name: "Regulated Pack",
    includes: "WorldID + Sanctions + PEPs + Adverse Media",
  },
  {
    name: "Full Compliance Pack",
    includes: "WorldID + Screening + Ongoing Monitoring",
  },
];

const WorldIDBundleSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-4">End-to-end compliant onboarding</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Combine identity verification with AML screening for a complete compliance workflow.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {bundles.map((bundle, index) => (
            <Card key={index} className="border-divider hover:border-teal/30 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-teal" />
                </div>
                <CardTitle className="text-lg text-navy">{bundle.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-text-secondary mb-4">{bundle.includes}</p>
                <Button variant="outline" className="w-full">
                  Get bundle pricing
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorldIDBundleSection;
