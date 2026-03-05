import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const sources = [
  {
    name: "WorldCompliance®",
    href: "/data-sources/worldcompliance",
    coverage: "2.5M+ profiles",
    categories: "50+ risk categories",
    description: "LexisNexis Risk Solutions' global database covering sanctions, PEPs, adverse media, RCAs, SIEs, SIPs, and law enforcement data across 240+ countries. Continuously updated.",
    metrics: ["240+ countries", "50+ risk categories", "2.5M+ profiles", "Daily updates"],
  },
  {
    name: "Bridger Insight XG®",
    href: "/data-sources/bridger-xg",
    coverage: "Global watchlists",
    categories: "Sanctions & PEP",
    description: "LexisNexis' purpose-built compliance screening engine with advanced matching algorithms. Optimised for high-volume screening environments with configurable match sensitivity.",
    metrics: ["Advanced fuzzy matching", "OFAC / UN / EU lists", "High-volume optimised", "Real-time updates"],
  },
];

const AMLDataSourcesSection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Data Sources</p>
          <h2 className="text-white mb-4">Powered by LexisNexis Risk Solutions Data</h2>
          <p className="text-white/70 text-body">
            WorldAML does not own or generate screening data. Results are produced by two world-leading
            third-party data sources — integrated and presented through the WorldAML platform.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {sources.map((src) => (
            <div key={src.name} className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h3 className="text-white text-2xl font-bold mb-2">{src.name}</h3>
              <p className="text-white/60 text-body-sm mb-5">{src.description}</p>
              <ul className="space-y-2 mb-6">
                {src.metrics.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-teal text-body-sm font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
              <Button variant="outline-light" size="sm" asChild>
                <Link to={src.href}>
                  Learn more <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AMLDataSourcesSection;
