const stats = [
  {
    value: "200+",
    label: "Jurisdictions Covered",
    description: "Global sanctions and watchlist coverage",
  },
  {
    value: "50M+",
    label: "Profiles Monitored",
    description: "PEPs, sanctions, and adverse media",
  },
  {
    value: "99.9%",
    label: "API Uptime",
    description: "Enterprise-grade reliability",
  },
  {
    value: "<200ms",
    label: "Average Response",
    description: "Real-time screening results",
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
