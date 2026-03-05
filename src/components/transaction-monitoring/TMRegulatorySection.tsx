const frameworks = [
  {
    acronym: "FATF",
    name: "Financial Action Task Force",
    relevance: "Recommendation 20",
    description:
      "Requires financial institutions to monitor customer transactions and report suspicious activity to the national FIU. The global standard adopted by 200+ jurisdictions.",
  },
  {
    acronym: "EU AMLD6",
    name: "6th Anti-Money Laundering Directive",
    relevance: "EU / EEA",
    description:
      "Extends criminal liability for money laundering to legal persons. Mandates enhanced due diligence and transaction monitoring for obliged entities across the European Union.",
  },
  {
    acronym: "FinCEN / BSA",
    name: "Bank Secrecy Act",
    relevance: "United States",
    description:
      "Requires US financial institutions to file SARs for transactions involving USD 5,000+ where ML is suspected. FinCEN's AML program rules require automated monitoring systems.",
  },
  {
    acronym: "FCA",
    name: "Financial Conduct Authority",
    relevance: "United Kingdom",
    description:
      "The FCA's SYSC 6.3 rules require firms to maintain adequate AML systems and controls, including transaction monitoring proportionate to risk.",
  },
  {
    acronym: "CySEC",
    name: "Cyprus Securities and Exchange Commission",
    relevance: "Cyprus / EU",
    description:
      "Obliged entities in Cyprus must maintain transaction monitoring as part of their AML/CFT program, aligned with EU AMLD transposition into Cypriot law.",
  },
  {
    acronym: "VARA / CBUAE",
    name: "UAE Regulators",
    relevance: "Middle East",
    description:
      "The UAE's VARA (virtual assets) and CBUAE (banking) require transaction monitoring for virtual asset service providers and licensed financial institutions operating in the UAE.",
  },
];

const TMRegulatorySection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Regulatory Drivers</p>
          <h2 className="text-navy mb-4">Built for Global Compliance Obligations</h2>
          <p className="text-body text-text-secondary">
            Transaction monitoring is a regulatory requirement, not optional. These are the key 
            frameworks that mandate automated screening systems.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map((fw) => (
            <div key={fw.acronym} className="bg-background border border-divider rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 bg-navy/5 rounded-lg px-3 py-2">
                  <span className="text-navy font-bold text-body-sm font-mono">{fw.acronym}</span>
                </div>
                <div>
                  <p className="text-navy font-semibold text-body-sm">{fw.name}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-teal/10 text-teal text-caption font-medium">
                    {fw.relevance}
                  </span>
                </div>
              </div>
              <p className="text-body-sm text-text-secondary">{fw.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TMRegulatorySection;
