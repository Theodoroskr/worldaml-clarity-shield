import { Globe, Building2, Landmark, MapPin } from "lucide-react";

const regions = [
  {
    icon: Globe,
    region: "Global",
    description: "FATF, INTERPOL",
    sources: ["Financial Action Task Force", "INTERPOL"],
  },
  {
    icon: Building2,
    region: "Europe",
    description: "EBA, ECB, FCA",
    sources: ["European Banking Authority", "European Central Bank", "FCA"],
  },
  {
    icon: Landmark,
    region: "United States",
    description: "FinCEN, OFAC, DOJ",
    sources: ["FinCEN", "OFAC", "Department of Justice"],
  },
  {
    icon: MapPin,
    region: "GCC",
    description: "DFSA, SAMA, ADGM, CBUAE",
    sources: ["DFSA", "SAMA", "ADGM", "Central Bank of UAE"],
  },
];

export const GlobalCoverageSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-heading-lg md:text-display-sm font-bold text-navy mb-4">
            Global Coverage, Regulator-Aligned
          </h2>
          <p className="text-body-lg text-text-secondary">
            WorldAML monitors regulatory and enforcement publications from leading financial 
            authorities across Europe, the United States and the GCC region. Updates are curated 
            and categorised to support AML monitoring, compliance oversight and risk-based decisioning.
          </p>
        </div>

        {/* Region Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {regions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.region}
                className="bg-card border border-divider rounded-lg p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-body font-semibold text-navy mb-1">
                  {item.region}
                </h3>
                <p className="text-body-sm text-text-secondary">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-caption text-text-tertiary text-center">
          Content is selected from reputable public sources for informational purposes.
        </p>
      </div>
    </section>
  );
};

export default GlobalCoverageSection;
