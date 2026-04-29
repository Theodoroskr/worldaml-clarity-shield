const frameworks = [
  {
    acronym: "CRS",
    fullName: "Common Reporting Standard",
    authority: "OECD / 100+ jurisdictions",
    who: "Financial institutions holding accounts for non-resident individuals and entities",
    what: "Annual automatic exchange of financial account information between tax authorities worldwide. Reportable accounts include balances, interest, dividends, and sale proceeds.",
    color: "bg-teal/10 text-teal border-teal/20",
  },
  {
    acronym: "FATCA",
    fullName: "Foreign Account Tax Compliance Act",
    authority: "US IRS / FFIs globally",
    who: "Foreign Financial Institutions (FFIs) holding accounts for US persons",
    what: "Requires FFIs to identify and report US account holders to the IRS (or local tax authority under Model 1/2 IGAs). Non-compliance triggers 30% withholding on US-source income.",
    color: "bg-navy/10 text-navy border-navy/20",
  },
  {
    acronym: "FINTRAC",
    fullName: "Financial Transactions & Reports Analysis Centre",
    authority: "Canada",
    who: "Reporting entities: banks, MSBs, securities dealers, life insurers, casinos, and more",
    what: "Mandates filing of Suspicious Transaction Reports (STR) — no monetary threshold, triggered by reasonable grounds to suspect and submitted as soon as practicable via the FINTRAC Web Reporting System (FWR) or FINTRAC API. Tipping off the client is prohibited. Threshold-based reports (LCTR, EFTR, LVCTR, CDR) are also filed under the PCMLTFA.",
    color: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
];

const RRWhatIsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">What Is It</p>
          <h2 className="text-navy mb-4">Three Regimes. One Platform.</h2>
          <p className="text-body text-text-secondary">
            CRS, FATCA, and FINTRAC each impose distinct data collection, classification, and filing
            obligations. WorldAML unifies them under a single reporting workflow.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {frameworks.map((fw) => (
            <div key={fw.acronym} className={`rounded-xl border p-8 ${fw.color}`}>
              <div className="mb-6">
                <span className="text-4xl font-black tracking-tight">{fw.acronym}</span>
                <p className="text-body-sm font-semibold mt-1">{fw.fullName}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-white/60 text-caption font-medium">
                  {fw.authority}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-caption font-bold uppercase tracking-wider mb-1 opacity-70">Who is obligated</p>
                  <p className="text-body-sm">{fw.who}</p>
                </div>
                <div>
                  <p className="text-caption font-bold uppercase tracking-wider mb-1 opacity-70">What must be reported</p>
                  <p className="text-body-sm">{fw.what}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RRWhatIsSection;
