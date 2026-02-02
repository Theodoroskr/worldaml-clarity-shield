import { Globe, Clock, Smartphone } from "lucide-react";

const stats = [
  { icon: Globe, value: "190+", label: "Countries supported" },
  { icon: Clock, value: "<60s", label: "Average verification time" },
  { icon: Smartphone, value: "Mobile-first", label: "UX, desktop supported" },
];

const WorldIDCoverageSection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-white mb-4">Global coverage. Fast decisions.</h2>
          <p className="text-slate-light max-w-2xl mx-auto">
            WorldID is designed to handle edge cases gracefully, with fallback paths and optional manual review for higher-risk or inconclusive sessions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-teal" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <p className="text-slate-light">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorldIDCoverageSection;
