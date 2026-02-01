const stats = [
  {
    value: "200+",
    label: "Jurisdictions Covered",
    description: "Global sanctions, watchlists, and PEP sources",
  },
  {
    value: "50M+",
    label: "Profiles in Database",
    description: "PEPs, sanctions, adverse media entities",
  },
  {
    value: "99.9%",
    label: "Platform Uptime",
    description: "Enterprise-grade SLA commitment",
  },
  {
    value: "<200ms",
    label: "Median Response Time",
    description: "Real-time screening via REST API",
  },
];

export const StatsSection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-headline text-primary-foreground mb-4">
            Global Data Coverage
          </h2>
          <p className="text-body-lg text-slate-light max-w-2xl mx-auto">
            Comprehensive, constantly updated databases ensure you never miss a compliance risk.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-display text-primary-foreground mb-2">{stat.value}</div>
              <div className="text-body font-semibold text-slate-light mb-1">{stat.label}</div>
              <div className="text-body-sm text-slate-muted">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
