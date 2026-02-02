import { User, Building2, Shield, UserCheck, AlertTriangle, RefreshCw, Calendar, Bell } from "lucide-react";

const coreCapabilities = [
  {
    icon: User,
    title: "Individual Screening",
    description: "Screen individuals against sanctions lists, PEP databases, and adverse media sources.",
  },
  {
    icon: Building2,
    title: "Company Screening",
    description: "Screen corporate entities and identify related parties and beneficial owners.",
  },
  {
    icon: Shield,
    title: "Sanctions Checks",
    description: "Check against global sanctions lists from regulatory bodies and authorities.",
  },
  {
    icon: UserCheck,
    title: "PEPs & RCAs",
    description: "Identify Politically Exposed Persons and their Relatives and Close Associates.",
  },
  {
    icon: AlertTriangle,
    title: "Adverse Media",
    description: "Screen for negative and adverse media coverage from global sources.",
  },
  {
    icon: RefreshCw,
    title: "Ongoing Monitoring",
    description: "Continuous monitoring with change detection and automated alerts.",
  },
  {
    icon: Calendar,
    title: "Periodic Re-screening",
    description: "Scheduled re-screening based on risk tier and regulatory requirements.",
  },
  {
    icon: Bell,
    title: "Event-based Triggers",
    description: "Re-screen based on transaction events, risk changes, or manual triggers.",
  },
];

export const WhatIsAPISection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Core Capabilities
          </div>
          <h2 className="text-headline text-navy mb-4">Screening & Monitoring Capabilities</h2>
          <p className="text-body-lg text-text-secondary">
            WorldAML API delivers programmatic access to AML screening and monitoring 
            capabilities through a unified integration layer. All screening results 
            are produced by approved third-party data sources.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreCapabilities.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-lg border border-divider bg-card"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{item.title}</h3>
              <p className="text-body-sm text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsAPISection;
