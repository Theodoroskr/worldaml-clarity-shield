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
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <h2 className="text-headline text-white mb-4">
                AML Intelligence, Delivered Programmatically
              </h2>
              <p className="text-body text-slate-light mb-6">
                Integrate real-time screening and continuous monitoring into your 
                existing workflows via a single REST API.
              </p>
              <ul className="space-y-3 text-body-sm text-slate-light">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  RESTful API with JSON responses
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Webhook notifications for monitoring alerts
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Batch processing for bulk screening
                </li>
              </ul>
            </div>
            
            {/* Code block */}
            <div className="bg-[#0a0f1a] rounded-lg p-6 text-left overflow-x-auto">
              <div className="flex items-center gap-2 mb-4 text-caption text-slate-light/60">
                <span>Response</span>
                <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">JSON</span>
              </div>
              <pre className="text-sm md:text-base font-mono text-slate-light whitespace-pre">
                {apiResponse}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default APIIntelligenceSection;
