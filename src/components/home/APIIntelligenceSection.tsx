const apiResponse = `{
  "entity_type": "Company",
  "risk_level": "Medium",
  "matches": {
    "sanctions": false,
    "pep": false,
    "adverse_media": 2
  },
  "monitoring_status": "Active"
}`;

export const APIIntelligenceSection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-white mb-8">
            AML Intelligence, Delivered Programmatically
          </h2>
          
          <div className="bg-[#0a0f1a] rounded-lg p-6 text-left overflow-x-auto">
            <pre className="text-sm md:text-base font-mono text-slate-light whitespace-pre">
              {apiResponse}
            </pre>
          </div>
          
          <p className="text-body text-slate-light mt-6">
            WorldAML provides real-time screening and continuous monitoring via a single API.
          </p>
        </div>
      </div>
    </section>
  );
};

export default APIIntelligenceSection;
