import { Link } from "react-router-dom";
import { ArrowRight, Code, FileJson, Zap, Lock, Globe, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Real-Time Screening",
    description: "Screen individuals and companies against sanctions, PEPs, and warnings in milliseconds.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Comprehensive sanctions lists, PEP databases, and adverse media sources worldwide.",
  },
  {
    icon: Lock,
    title: "Secure by Design",
    description: "Enterprise-grade security with encrypted data transfer and GDPR compliance.",
  },
  {
    icon: Clock,
    title: "AML Data Delivery",
    description: "Bulk data access and delivery for integration into your own systems and workflows.",
  },
];

const codeExample = `// Screen an individual against all databases
const response = await fetch('https://api.worldaml.com/v1/screen', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({
    name: "John Smith",
    dateOfBirth: "1985-03-15",
    databases: ["sanctions", "pep", "warnings"]
  })
});

// Response includes match details
const data = await response.json();
console.log(data.matches);`;

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
                  REST API
                </div>
                <h1 className="text-display text-navy mb-6">
                  WorldAML API
                </h1>
                <p className="text-body-lg text-text-secondary mb-8">
                  The WorldAML API is a REST interface for AML screening of individuals and 
                  companies. Access sanctions, PEPs, warnings and adverse media data — plus 
                  AML Data Delivery for bulk data access and integration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link to="/get-started">
                      Get API Keys
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="https://worldaml.readme.io/reference/introduction" target="_blank" rel="noopener noreferrer">
                      <FileJson className="mr-2 h-4 w-4" />
                      API Reference
                    </a>
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
                Screen individuals and companies against global AML databases.
              </p>

              <div className="space-y-4">
                {[
                  { method: "POST", path: "/v1/screen/individual", desc: "Screen an individual" },
                  { method: "POST", path: "/v1/screen/company", desc: "Screen a company" },
                  { method: "GET", path: "/v1/sanctions", desc: "Query sanctions lists" },
                  { method: "GET", path: "/v1/pep", desc: "Query PEP databases" },
                  { method: "GET", path: "/v1/warnings", desc: "Query warnings & adverse media" },
                  { method: "GET", path: "/v1/data-delivery", desc: "AML Data Delivery bulk access" },
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
