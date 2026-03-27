const impacts = [
  {
    value: "80%",
    label: "Reduction in Manual Review",
    description: "Free your compliance analysts to focus on genuine risk, not repetitive checks.",
  },
  {
    value: "<30s",
    label: "Screening Turnaround",
    description: "Onboard customers faster with real-time sanctions, PEP, and adverse media decisions.",
  },
  {
    value: "99.9%",
    label: "Uptime SLA",
    description: "Built for mission-critical compliance workflows that cannot afford downtime.",
  },
];

const BusinessImpactSection = () => {
  return (
    <section className="bg-navy-dark border-y border-teal/20">
      <div className="container-enterprise py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-teal/20">
          {impacts.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center px-8 py-6 md:py-4">
              <span className="text-5xl md:text-6xl font-bold text-teal-light tracking-tight leading-none mb-2">
                {item.value}
              </span>
              <span className="text-base font-semibold text-primary-foreground mb-1">
                {item.label}
              </span>
              <span className="text-sm text-slate-light max-w-[200px]">
                {item.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessImpactSection;
