import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";
import { 
  productStats,
  keyBenefits,
  enterpriseFeatures,
  screeningCapabilities,
  trustedBy
} from "@/data/bridgerxg";

const BridgerXGNA = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="data-source" className="mb-6" />
              <h1 className="text-navy mb-4">Bridger Insight® XG</h1>
              <p className="text-xl text-teal-dark font-medium mb-6">
                North America Region
              </p>
              
              {/* Attribution Block */}
              <div className="bg-white border border-divider rounded-lg p-4 mb-8">
                <p className="text-body-sm text-text-secondary mb-1">
                  <strong>Powered by</strong> LexisNexis Risk Solutions
                </p>
                <p className="text-body-sm text-text-tertiary">
                  <strong>Delivered and implemented by</strong> Infocredit Group
                </p>
              </div>

              <p className="text-body-lg text-text-secondary mb-6">
                The go-to solution for North American compliance screening that saves money 
                and boosts efficiency. Trusted by {productStats.topUSBanks} US financial 
                institutions with {productStats.customers} customers worldwide.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-divider rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{productStats.topUSBanks}</p>
                  <p className="text-body-sm text-text-tertiary">Top US Banks</p>
                </div>
                <div className="bg-white border border-divider rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{productStats.falsePositiveReduction}</p>
                  <p className="text-body-sm text-text-tertiary">FP Reduction</p>
                </div>
                <div className="bg-white border border-divider rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{productStats.manualReviewReduction}</p>
                  <p className="text-body-sm text-text-tertiary">Review Reduction</p>
                </div>
                <div className="bg-white border border-divider rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{productStats.customers}</p>
                  <p className="text-body-sm text-text-tertiary">Customers</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/get-started">
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to="/data-sources/bridger-xg">
                    View Full Product Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Screening Capabilities */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Screening Capabilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {screeningCapabilities.map((capability) => (
                <Card key={capability.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/5 text-teal mb-3">
                      <capability.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{capability.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{capability.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Key Benefits</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keyBenefits.map((benefit) => (
                <Card key={benefit.title} className="border-divider bg-white">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-3">
                      <benefit.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    {benefit.stat && (
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-navy">{benefit.stat}</span>
                        <span className="text-body-sm text-text-tertiary ml-2">{benefit.statLabel}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Features */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Enterprise Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterpriseFeatures.map((feature) => (
                <Card key={feature.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/5 text-teal mb-3">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h2 className="text-2xl text-navy mb-6">Trusted by Industry Leaders</h2>
              <p className="text-text-secondary mb-6">
                The preferred choice for leading financial institutions, fintechs, 
                and enterprises across North America.
              </p>
              <div className="space-y-3">
                {trustedBy.map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-white border border-divider rounded-lg p-3">
                    <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                    <span className="text-body-sm text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Commercial Terms */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-2xl">
              <h2 className="text-2xl text-navy mb-6">Commercial Terms — North America</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Enterprise Deployment</p>
                    <p className="text-body-sm text-text-secondary">Dedicated implementation with North American support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Quick-Start Installation</p>
                    <p className="text-body-sm text-text-secondary">Up and running in less than a week with plug-and-play functionality</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Flexible Hosting Options</p>
                    <p className="text-body-sm text-text-secondary">Cloud and hosted delivery with US data residency options</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Pricing on Request</p>
                    <p className="text-body-sm text-text-secondary">Custom pricing based on volume and regulatory requirements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regulatory Note */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="bg-white border border-divider rounded-lg p-6 max-w-3xl">
              <h3 className="text-lg text-navy mb-4">Regulatory Considerations</h3>
              <p className="text-body-sm text-text-secondary mb-4">
                Bridger Insight® XG helps North American institutions meet OFAC, FinCEN, and 
                FINTRAC guidance on financial crime prevention, with transparent audit trails 
                and compliance reporting.
              </p>
              <p className="text-body-sm text-text-tertiary">
                Bridger Insight® does not constitute a "consumer report" as defined in the Fair 
                Credit Reporting Act (FCRA) and may not be used as a factor in determining 
                eligibility for credit, insurance, or employment.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-2xl text-white mb-4">Contact Our Sales Team</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Speak with our North American compliance specialists to discuss your requirements 
              and see customized account and payment screening in action.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/get-started">Contact Sales</Link>
            </Button>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-white border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center max-w-4xl mx-auto">
              Bridger Insight® XG is a trademark of LexisNexis Risk Solutions. Performance metrics 
              based on LexisNexis Risk Solutions internal testing and proof of concept studies (2024). 
              Actual results may vary. Due to the nature of public record information, data sources 
              may contain errors and should be independently verified before reliance.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BridgerXGNA;
