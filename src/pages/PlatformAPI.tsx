import { Link } from "react-router-dom";
import { ArrowRight, Code, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LaneBadge } from "@/components/LaneBadge";

const PlatformAPI = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="platform" className="mb-6" />
              <h1 className="text-navy mb-6">WorldAML API</h1>
              <p className="text-body-lg text-text-secondary mb-8">
                The WorldAML API provides programmatic access to screening workflows and 
                approved data sources through a unified integration layer.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <a href="https://worldaml.readme.io" target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    View API Documentation
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/get-started">
                    Request API Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-4xl">
              <h2 className="text-2xl text-navy mb-6">Integration Example</h2>
              <div className="bg-navy rounded-lg p-6 overflow-x-auto">
                <pre className="text-sm text-slate-light font-mono">
{`// Example: Screen an individual via WorldAML API
const response = await fetch('https://api.worldaml.com/v1/screen', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'individual',
    name: 'John Smith',
    dateOfBirth: '1980-01-15',
    nationality: 'GB',
    sources: ['sanctions', 'pep', 'adverse-media']
  })
});

const result = await response.json();
// Returns screening results from configured data sources`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-surface-subtle border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center">
              Data coverage and capabilities depend on the selected data source and jurisdiction.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PlatformAPI;
