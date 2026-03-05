import { SearchCheck, Users, Newspaper, List, Bell, Database } from "lucide-react";

const features = [
  {
    icon: SearchCheck,
    title: "Sanctions Screening",
    description: "Screen against OFAC SDN, UN Consolidated, EU Restrictive Measures, OFSI, and 50+ national watchlists. Updated in real time with every list publication.",
  },
  {
    icon: Users,
    title: "PEP Detection",
    description: "Identify Politically Exposed Persons — domestic, foreign, and international — across all seniority tiers, including former PEPs and family members.",
  },
  {
    icon: Newspaper,
    title: "Adverse Media Screening",
    description: "Detect negative news linked to financial crime, fraud, corruption, and regulatory breaches across 10,000+ global media sources in multiple languages.",
  },
  {
    icon: List,
    title: "Relatives & Close Associates",
    description: "Extend screening beyond the primary subject to RCAs of PEPs and sanctioned individuals — reducing exposure to proxies and nominees.",
  },
  {
    icon: Database,
    title: "Batch & Real-Time Screening",
    description: "Screen individual records in real time via API or process large portfolio batches overnight. Both modes feed into the same case management and alert workflow.",
  },
  {
    icon: Bell,
    title: "Ongoing Monitoring & Alerts",
    description: "Continuously monitor your customer portfolio against updated sanctions and PEP data. Push alerts to compliance teams when a previously clear customer triggers a match.",
  },
];

const AMLFeaturesSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-navy mb-4">Comprehensive Screening Across All Risk Categories</h2>
          <p className="text-body text-text-secondary">
            From sanctions to adverse media — every risk category covered, from onboarding through the full customer lifecycle.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div key={feat.title} className="bg-background border border-divider rounded-xl p-6">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-navy/5 text-navy mb-5">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-navy font-semibold text-lg mb-2">{feat.title}</h3>
              <p className="text-body-sm text-text-secondary">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AMLFeaturesSection;
