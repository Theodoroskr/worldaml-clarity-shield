import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";
import TrustedByLogos from "@/components/TrustedByLogos";
import lexisNexisLogo from "@/assets/lexisnexis-risk-solutions-logo.png";
import { 
  productStats, 
  keyBenefits, 
  performanceMetrics,
  enterpriseFeatures,
  screeningCapabilities
} from "@/data/bridgerxg";

const BridgerXG = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Bridger Insight XG®"
        description="Bridger Insight XG® by LexisNexis is an enterprise-grade screening and decisioning engine with advanced matching algorithms and batch processing."
        canonical="/data-sources/bridger-xg"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Data Sources", url: "/data-sources" },
          { name: "Bridger Insight XG®", url: "/data-sources/bridger-xg" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="data-source" className="mb-6" />
              <h1 className="text-navy mb-4">Bridger Insight® XG</h1>
              <p className="text-xl text-teal-dark font-medium mb-6">
                Optimize Compliance Screening
              </p>
              
              {/* Attribution Block */}
              <div className="bg-white border border-divider rounded-lg p-4 mb-8">
                <img src={lexisNexisLogo} alt="LexisNexis Risk Solutions" className="h-8 object-contain mb-3" />
                <p className="text-body-sm text-text-tertiary">
                  <strong>Delivered and implemented by</strong> Infocredit Group
                </p>
              </div>

              <p className="text-body-lg text-text-secondary mb-6">
                Save money and time with tailored account and payment screening. Automate 
                screening with real-time insights into global sanctions, PEPs, and high-risk 
                entities, fully configured to fit your business needs.
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
                  <p className="text-2xl font-bold text-navy">{productStats.topUSBanks}</p>
                  <p className="text-body-sm text-text-tertiary">Top US Banks</p>
                </div>
              <div className="bg-white border border-divider rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{productStats.customers}</p>
                  <p className="text-body-sm text-text-tertiary">Customers</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Button asChild variant="accent">
                  <Link to="/contact-sales">
                    Request Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/contact-sales">
                    Talk to Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Resources Link */}
              <Link 
                to="/data-sources/resources" 
                className="inline-flex items-center gap-2 text-teal hover:text-teal-dark transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-body-sm font-medium">View Resources & Data Coverage</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mb-8">
              <h2 className="text-2xl text-navy mb-4">Key Benefits</h2>
              <p className="text-text-secondary">
                Bridger Insight® XG delivers innovative technologies, global risk intelligence, 
                and proven decision analytics in one solution fully tailored to your requirements.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keyBenefits.map((benefit) => (
                <Card key={benefit.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/5 text-teal mb-3">
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

        {/* Performance Metrics */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mb-8">
              <h2 className="text-2xl text-navy mb-4">Proven Performance</h2>
              <p className="text-text-secondary">
                Improve decision speed with intuitive tools that help identify risks up-front 
                and reduce data delays and duplicates.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric) => (
                <Card key={metric.label} className="border-divider bg-white">
                  <CardContent className="pt-6">
                    <p className="text-3xl font-bold text-navy mb-2">{metric.value}</p>
                    <p className="font-medium text-text-primary mb-1">{metric.label}</p>
                    <p className="text-body-sm text-text-tertiary">{metric.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Screening Capabilities */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Screening Capabilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
              {screeningCapabilities.map((capability) => (
                <Card key={capability.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-3">
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

        {/* Enterprise Features */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mb-8">
              <h2 className="text-2xl text-navy mb-4">Enterprise Features</h2>
              <p className="text-text-secondary">
                Advanced capabilities including intelligent automation, flexible deployment, 
                and comprehensive case management.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterpriseFeatures.map((feature) => (
                <Card key={feature.title} className="border-divider bg-white">
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
        <TrustedByLogos 
          description="The world's leading brands trust Bridger Insight® XG to help simplify AML, ABC, and CFT compliance."
        />

        {/* Disclaimer */}
        <section className="py-8 bg-white border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center max-w-4xl mx-auto">
              Bridger Insight® XG is a trademark of LexisNexis Risk Solutions. Performance 
              metrics based on LexisNexis Risk Solutions internal testing and proof of concept 
              studies. Actual results may vary. Enterprise pricing provided on request.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BridgerXG;
