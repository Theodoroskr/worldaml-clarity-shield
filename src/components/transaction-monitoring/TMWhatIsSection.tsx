import { CheckCircle } from "lucide-react";

const triggers = [
  "Transactions above reporting thresholds (e.g. USD/EUR 10,000)",
  "Structuring or layering patterns (smurfing detection)",
  "Rapid fund movements between accounts or jurisdictions",
  "Transactions involving sanctioned counterparties or high-risk geographies",
  "Unusual velocity — frequency or volume deviating from customer profile",
  "Round-number or just-below-threshold amounts",
];

const TMWhatIsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">What Is Transaction Monitoring?</p>
            <h2 className="text-navy mb-6">The Foundation of AML Compliance</h2>
            <p className="text-body text-text-secondary mb-4">
              Transaction monitoring is the ongoing process of reviewing customer transactions —
              deposits, withdrawals, transfers, and payments — to identify patterns consistent 
              with money laundering, terrorist financing, or other financial crime.
            </p>
            <p className="text-body text-text-secondary mb-4">
              <strong className="text-navy">FATF Recommendation 20</strong> requires financial 
              institutions to report suspicious transactions to their national Financial Intelligence 
              Unit (FIU). Effective transaction monitoring is the primary mechanism for generating 
              Suspicious Activity Reports (SARs) and Suspicious Transaction Reports (STRs).
            </p>
            <p className="text-body text-text-secondary">
              Without an automated system, compliance teams face alert fatigue from manual reviews, 
              missed patterns, and audit failures. WorldAML's transaction monitoring module 
              eliminates this by applying rule-based logic and typology detection at scale.
            </p>
          </div>
          <div className="bg-surface-subtle border border-divider rounded-xl p-8">
            <h3 className="text-navy text-xl mb-6">What Triggers a Transaction Alert?</h3>
            <ul className="space-y-4">
              {triggers.map((trigger) => (
                <li key={trigger} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-teal mt-0.5 shrink-0" />
                  <span className="text-body-sm text-text-secondary">{trigger}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TMWhatIsSection;
