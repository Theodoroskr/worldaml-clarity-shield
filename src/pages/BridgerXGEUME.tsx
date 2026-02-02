import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";
import { 
  productStats,
  keyBenefits,
  performanceMetrics,
  enterpriseFeatures,
  screeningCapabilities
} from "@/data/bridgerxg";

const BridgerXGEUME = () => {
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
                EU & Middle East Region
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
                Save money and time with tailored account and payment screening. Bridger 
                Insight® XG automates compliance screening with real-time insights into global 
                sanctions, PEPs, and high-risk entities, integrated with {productStats.profiles} risk profiles.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-divider rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{productStats.profiles}</p>
                  <p className="text-body-sm text-text-tertiary">Risk Profiles</p>
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
                  <p className="text-2xl font-bold text-navy">&lt;1 week</p>
                  <p className="text-body-sm text-text-tertiary">Quick Start</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/get-started">
                    Request Demo
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
              {keyBenefits.slice(0, 3).map((benefit) => (
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

        {/* Commercial Terms */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-2xl">
              <h2 className="text-2xl text-navy mb-6">Commercial Terms — EU & Middle East</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Enterprise Deployment</p>
                    <p className="text-body-sm text-text-secondary">Dedicated implementation with regional support</p>
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
                    <p className="text-body-sm text-text-secondary">Cloud and hosted delivery to meet specific requirements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Pricing on Request</p>
                    <p className="text-body-sm text-text-secondary">Custom pricing based on volume and configuration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-2xl text-white mb-4">Request a Demo</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Take an in-depth demo with our compliance specialists to see customized 
              account and payment screening in action.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/get-started">Request Demo</Link>
            </Button>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-white border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center max-w-3xl mx-auto">
              Bridger Insight® XG is a trademark of LexisNexis Risk Solutions. Available on an 
              enterprise basis with dedicated implementation. Performance metrics based on internal 
              testing and may vary by deployment.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BridgerXGEUME;
