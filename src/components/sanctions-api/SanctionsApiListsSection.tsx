import { Globe, Shield, Flag } from "lucide-react";

const listCategories = [
  {
    icon: Globe,
    title: "International Bodies",
    lists: ["UN Security Council", "EU Consolidated List", "Interpol Red Notices"],
  },
  {
    icon: Shield,
    title: "United States",
    lists: ["OFAC SDN List", "OFAC Consolidated", "BIS Entity List", "DPL"],
  },
  {
    icon: Flag,
    title: "United Kingdom & Europe",
    lists: ["HMT Sanctions List", "FCA Warning List", "EU Financial Sanctions"],
  },
  {
    icon: Globe,
    title: "Asia-Pacific",
    lists: ["DFAT (Australia)", "MAS (Singapore)", "JAFIC (Japan)", "RBI (India)"],
  },
];

const matchingFeatures = [
  {
    title: "Fuzzy Matching",
    description: "Configurable Levenshtein distance thresholds to catch spelling variations and transliterations.",
  },
  {
    title: "Phonetic Matching",
    description: "Soundex and Metaphone algorithms to match names that sound alike across languages.",
  },
  {
    title: "Alias Resolution",
    description: "Automatically checks known aliases, former names, and alternative spellings from list data.",
  },
  {
    title: "Threshold Control",
    description: "Set match confidence thresholds per list or globally to balance precision vs. recall.",
  },
];

export const SanctionsApiListsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Coverage
          </div>
          <h2 className="text-headline text-navy mb-4">200+ Global Sanctions Lists</h2>
          <p className="text-body-lg text-text-secondary">
            Comprehensive coverage across international bodies, national regulators, 
            and regional watchlists — updated continuously as lists change.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {listCategories.map((cat) => (
            <div key={cat.title} className="p-6 rounded-lg border border-divider bg-card">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                <cat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-3">{cat.title}</h3>
              <ul className="space-y-2">
                {cat.lists.map((list) => (
                  <li key={list} className="text-body-sm text-text-secondary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                    {list}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mb-10">
          <h3 className="text-subheadline text-navy mb-4">Matching & Fuzzy Logic</h3>
          <p className="text-body text-text-secondary mb-8">
            Advanced matching algorithms reduce false positives while ensuring genuine 
            hits are never missed — even with transliterated or misspelled names.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {matchingFeatures.map((f) => (
            <div key={f.title} className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">{f.title}</h3>
              <p className="text-body-sm text-text-secondary">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SanctionsApiListsSection;
