import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LaneBadge } from "@/components/LaneBadge";
import WorldComplianceDemoForm from "@/components/forms/WorldComplianceDemoForm";
import { CheckCircle2 } from "lucide-react";
import lexisNexisLogo from "@/assets/lexisnexis-risk-solutions-logo.png";

const features = [
  "Full platform access for 7 days",
  "Access 9.2+ million detailed risk profiles",
  "Screen against 500+ sanctions and watchlists",
  "PEP coverage across 240+ countries",
  "Real-time adverse media monitoring",
  "Flexible search with name variations",
  "Audit-ready compliance reports",
  "No credit card required",
  "Dedicated onboarding support",
];

const WorldComplianceDemo = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="WorldCompliance® Free Trial — 7 Days Free"
        description="Start your free trial of WorldCompliance® Online. Screen against 9.2M+ risk profiles, 500+ sanctions lists, and PEP data across 240+ countries."
        canonical="/data-sources/worldcompliance/demo"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Data Sources", url: "/data-sources" },
          { name: "WorldCompliance®", url: "/data-sources/worldcompliance" },
          { name: "Demo", url: "/data-sources/worldcompliance/demo" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Info */}
              <div>
                <LaneBadge lane="data-source" className="mb-6" />
                <h1 className="text-navy mb-4">
                  Try WorldCompliance® Free for 7 Days
                </h1>
                <p className="text-xl text-teal-dark font-medium mb-6">
                  Get hands-on access to the industry-leading sanctions and PEP screening platform — no commitment, no credit card.
                </p>
                
                {/* Attribution Block */}
                <div className="bg-white border border-divider rounded-lg p-4 mb-8">
                  <img src={lexisNexisLogo} alt="LexisNexis Risk Solutions" className="h-8 object-contain mb-3" />
                  <p className="text-body-sm text-text-tertiary">
                    <strong>Delivered and supported by</strong> Infocredit Group
                  </p>
                </div>

                <p className="text-body-lg text-text-secondary mb-8">
                  WorldCompliance® Online Search Tool enables compliance professionals to manually 
                  screen prospective clients and perform enhanced due diligence through the 
                  industry-leading WorldCompliance™ database.
                </p>

                {/* Feature List */}
                <div className="space-y-3">
                  <span className="inline-block bg-teal/10 text-teal text-sm font-semibold px-4 py-1.5 rounded-full mb-2">7-Day Free Trial</span>
                  <h3 className="font-semibold text-navy mb-4">What's included in your 7-day trial:</h3>
                  {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="lg:sticky lg:top-8">
                <WorldComplianceDemoForm />
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-surface-subtle border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center max-w-3xl mx-auto">
              WorldCompliance® is a trademark of LexisNexis Risk Solutions. Free trial availability 
              and product features may vary by region. All trials are subject to 
              eligibility assessment. Trial access is activated within 24 hours of approval.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorldComplianceDemo;
