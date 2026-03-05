const KYCWhatIsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">What Is It</p>
            <h2 className="text-navy mb-6">KYC vs KYB — Same Obligation, Different Subject</h2>
            <p className="text-body text-text-secondary mb-4">
              <strong className="text-navy">Know Your Customer (KYC)</strong> refers to the due diligence
              process applied to <em>individuals</em> — verifying identity, assessing risk, and screening
              against sanctions, PEP, and adverse media sources before and during a relationship.
            </p>
            <p className="text-body text-text-secondary mb-4">
              <strong className="text-navy">Know Your Business (KYB)</strong> extends the same obligations
              to <em>legal entities</em> — verifying company registration, ownership structures, ultimate
              beneficial owners (UBOs), and screening the entity and its principals.
            </p>
            <p className="text-body text-text-secondary">
              FATF Recommendation 10 requires financial institutions to apply Customer Due Diligence (CDD)
              measures for both. EU AMLD and national transpositions mandate Enhanced Due Diligence (EDD)
              for higher-risk customers. WorldAML handles both in a unified workflow.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "KYC", subtitle: "Individual", points: ["Identity verification", "Document validation (ID, passport)", "Sanctions & PEP screening", "Adverse media check", "Ongoing monitoring"] },
              { label: "KYB", subtitle: "Business Entity", points: ["Company registry lookup", "Director & officer screening", "UBO identification & mapping", "Beneficial ownership threshold (25%+)", "Group structure analysis"] },
            ].map((col) => (
              <div key={col.label} className="bg-surface-subtle border border-divider rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-black text-navy">{col.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal/10 text-teal text-caption font-medium">{col.subtitle}</span>
                </div>
                <ul className="space-y-2">
                  {col.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-body-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0 mt-1.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYCWhatIsSection;
