import { Link } from "react-router-dom";
import { ArrowRight, Code, FileJson, Zap, Lock, Globe, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-200ms response times for real-time screening without blocking your user flows.",
  },
  {
    icon: Lock,
    title: "Secure by Design",
    description: "SOC 2 Type II certified with end-to-end encryption and GDPR compliance.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "200+ jurisdictions covered with sanctions, PEPs, and adverse media data.",
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "Enterprise-grade reliability with SLA guarantees for mission-critical compliance.",
  },
];

const codeExample = `// Screen a customer against all databases
const response = await worldaml.screening.check({
  name: "John Smith",
  dateOfBirth: "1985-03-15",
  nationality: "US",
  databases: ["sanctions", "pep", "adverseMedia"]
});

// Response includes match details and risk score
console.log(response.matches);
console.log(response.riskScore);`;

const APIPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-caption font-medium text-teal bg-teal/10 rounded-full">
                  <Code className="w-3.5 h-3.5" />
                  Full Platform Access via API
                </div>
                <h1 className="text-display text-navy mb-6">
                  WorldAML API
                </h1>
                <p className="text-body-lg text-text-secondary mb-8">
                  The WorldAML API exposes all platform capabilities, allowing teams to embed 
                  KYC/KYB onboarding, AML screening, ongoing monitoring and risk decisioning 
                  directly into their systems.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link to="/get-started">
                      Get API Keys
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/documentation">
                      <FileJson className="mr-2 h-4 w-4" />
                      API Reference
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Code example */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-navy/5 to-teal/5 rounded-2xl blur-xl" />
                <div className="relative bg-navy rounded-xl p-6 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <pre className="text-body-sm text-slate-light overflow-x-auto">
                    <code>{codeExample}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="text-center mb-16">
              <h2 className="text-headline text-navy mb-4">Built for Developers</h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
                Clean, consistent API design exposing the full platform lifecycle. 
                Comprehensive documentation, SDKs for popular languages, and sandbox 
                environments for testing.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-lg border border-divider bg-card"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-body font-semibold text-navy mb-2">{feature.title}</h3>
                  <p className="text-body-sm text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Endpoints preview */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-headline text-navy mb-4 text-center">Core Endpoints</h2>
              <p className="text-body-lg text-text-secondary mb-12 text-center">
                Full platform lifecycle accessible via RESTful endpoints.
              </p>

              <div className="space-y-4">
                {[
                  { method: "POST", path: "/v1/onboarding/kyc", desc: "KYC customer onboarding" },
                  { method: "POST", path: "/v1/onboarding/kyb", desc: "KYB business onboarding" },
                  { method: "POST", path: "/v1/screening/check", desc: "Run AML screening check" },
                  { method: "POST", path: "/v1/monitoring/subscribe", desc: "Add to ongoing monitoring" },
                  { method: "POST", path: "/v1/risk/assess", desc: "Risk assessment & decisioning" },
                ].map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className="flex items-center gap-4 p-4 rounded-lg border border-divider bg-card"
                  >
                    <span
                      className={`px-2 py-1 text-caption font-mono font-semibold rounded ${
                        endpoint.method === "POST"
                          ? "bg-teal/10 text-teal"
                          : "bg-navy/10 text-navy"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-body-sm font-mono text-navy flex-1">
                      {endpoint.path}
                    </code>
                    <span className="text-body-sm text-text-secondary hidden sm:block">
                      {endpoint.desc}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button variant="outline" asChild>
                  <Link to="/documentation">
                    View Full API Reference
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default APIPage;
