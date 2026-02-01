import { Globe, Users, Newspaper, Building } from "lucide-react";

const coveragePoints = [
  { icon: Globe, label: "Global sanctions coverage" },
  { icon: Users, label: "Politically Exposed Persons (PEPs)" },
  { icon: Newspaper, label: "Adverse media monitoring" },
  { icon: Building, label: "GCC, EU and US regulatory intelligence" },
];

export const GlobalReachSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-headline text-navy mb-6 text-center">
            Global Coverage, Local Relevance
          </h2>
          
          <p className="text-body-lg text-text-secondary text-center mb-10 max-w-2xl mx-auto">
            WorldAML monitors global sanctions, PEPs and adverse media, incorporating regulatory 
            and enforcement sources across Europe, the United States and the GCC region.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coveragePoints.map((point) => (
              <div
                key={point.label}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center mb-3">
                  <point.icon className="w-5 h-5 text-navy" />
                </div>
                <span className="text-body-sm text-text-secondary">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalReachSection;
