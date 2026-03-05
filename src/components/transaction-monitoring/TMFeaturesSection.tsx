import { Shield, BellRing, Network, Zap, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Rule-Based Screening",
    description:
      "Configure threshold rules, geographic restrictions, and counterparty filters. Apply jurisdiction-specific rule sets aligned with local AML regulations.",
  },
  {
    icon: BellRing,
    title: "Threshold Alerts",
    description:
      "Automatically flag transactions exceeding CTR (Currency Transaction Report) thresholds. Configurable per currency, account type, and customer risk tier.",
  },
  {
    icon: Network,
    title: "Typology Detection",
    description:
      "Detect known money laundering typologies: structuring, layering, smurfing, trade-based ML, and real estate placement — mapped to FATF guidance.",
  },
  {
    icon: Zap,
    title: "Batch & Real-Time",
    description:
      "Screen transactions in real time via API or run scheduled batch jobs for end-of-day settlement reviews. Latency under 300ms for inline payment screening.",
  },
  {
    icon: FileText,
    title: "SAR Workflow",
    description:
      "Integrated Suspicious Activity Report workflow with draft, review, and submission stages. Full audit trail for regulatory inspections and exam readiness.",
  },
  {
    icon: TrendingUp,
    title: "Case Escalation",
    description:
      "Automatically escalate high-risk alerts to senior compliance officers. Configurable escalation ladders with SLA tracking and response deadlines.",
  },
];

const TMFeaturesSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-navy mb-4">Built for Compliance Teams at Scale</h2>
          <p className="text-body text-text-secondary">
            Every feature is designed to reduce false positives, accelerate case resolution, 
            and satisfy examiner requirements.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-divider bg-background">
              <CardHeader className="pb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 text-teal mb-4">
                  <feature.icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg text-navy">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-text-secondary">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TMFeaturesSection;
