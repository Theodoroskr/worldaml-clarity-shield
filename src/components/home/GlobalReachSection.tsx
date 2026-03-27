import { Globe, Users, Newspaper, Building } from "lucide-react";

const coveragePoints = [
  { icon: Globe, label: "1,900+ global risk lists" },
  { icon: Users, label: "Politically Exposed Persons (PEPs)" },
  { icon: Newspaper, label: "Adverse media monitoring" },
  { icon: Building, label: "GCC, EU, US and UK regulatory intelligence" },
];

export const GlobalReachSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-headline text-navy mb-6 text-center">
            Screen Globally. Comply Locally.
          </h2>
          
          <p className="text-body-lg text-text-secondary text-center mb-10 max-w-2xl mx-auto">
            WorldAML covers 1,900+ risk lists across sanctions, watchlists, PEPs, and adverse 
            media — with deep regulatory intelligence for the UK, EU, US, and GCC. 
            One platform, every jurisdiction.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coveragePoints.map((point) => (
              <div
                key={point.label}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                  <point.icon className="w-5 h-5 text-accent" />
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
