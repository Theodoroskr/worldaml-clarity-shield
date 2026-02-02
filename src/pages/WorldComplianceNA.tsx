import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";
import { Logo } from "@/components/Logo";
import { FreeTrialForm } from "@/components/forms/FreeTrialForm";
import { databaseStats, riskCategories, searchFeatures } from "@/data/worldcompliance";

const WorldComplianceNA = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Content */}
              <div>
                <LaneBadge lane="data-source" className="mb-6" />
                <h1 className="text-navy mb-4">WorldCompliance® Online Search Tool</h1>
                <p className="text-xl text-teal-dark font-medium mb-6">
                  North America Region
                </p>
                
                {/* Attribution Block */}
                <div className="bg-white border border-divider rounded-lg p-4 mb-8">
                  <p className="text-body-sm text-text-secondary mb-1">
                    <strong>Powered by</strong> LexisNexis Risk Solutions
                  </p>
                  <p className="text-body-sm text-text-tertiary">
                    <strong>Delivered and supported by</strong> Infocredit Group
                  </p>
                </div>

                <p className="text-body-lg text-text-secondary mb-6">
                  WorldCompliance® provides North American institutions with comprehensive 
                  sanctions, PEP, and adverse media screening through the industry-leading 
                  database containing {databaseStats.profiles} detailed profiles.
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white border border-divider rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-navy">{databaseStats.profiles}</p>
                    <p className="text-body-sm text-text-tertiary">Profiles</p>
                  </div>
                  <div className="bg-white border border-divider rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-navy">{databaseStats.riskCategories}</p>
                    <p className="text-body-sm text-text-tertiary">Risk Categories</p>
                  </div>
                  <div className="bg-white border border-divider rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-navy">USD</p>
                    <p className="text-body-sm text-text-tertiary">Pricing</p>
                  </div>
                </div>

                <Button variant="outline" asChild>
                  <Link to="/data-sources/worldcompliance">
                    View Full Product Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Right Column - Free Trial Form */}
              <div className="lg:sticky lg:top-24">
                <FreeTrialForm region="na" />
              </div>
            </div>
          </div>
        </section>

        {/* Risk Categories */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Screening Coverage</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {riskCategories.slice(0, 6).map((category) => (
                <Card key={category.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/5 text-teal mb-3">
                      <category.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{category.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Search Technology</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchFeatures.map((feature) => (
                <Card key={feature.title} className="border-divider bg-white">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-3">
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
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-2xl">
              <h2 className="text-2xl text-navy mb-6">Commercial Terms — North America</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Online Purchase Enabled</p>
                    <p className="text-body-sm text-text-secondary">Subscribe directly through our platform</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">USD Pricing</p>
                    <p className="text-body-sm text-text-secondary">Regional pricing in US Dollars</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Eligibility Assessment Required</p>
                    <p className="text-body-sm text-text-secondary">
                      Access subject to suitability assessment and contractual approval
                    </p>
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
                Services provided in North America are subject to applicable regulatory 
                requirements, including OFAC, FinCEN, and FINTRAC guidance on financial 
                crime prevention.
              </p>
              <p className="text-body-sm text-text-tertiary">
                WorldCompliance® helps organizations conform to the USA PATRIOT ACT, Bank 
                Secrecy Act, and related regulatory frameworks in the United States and Canada.
              </p>
            </div>
          </div>
        </section>

        {/* WorldAML Platform CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <Logo size="lg" showTagline className="mb-4 justify-center md:justify-start [&_*]:text-white [&_.text-text-tertiary]:text-white/70" />
                <p className="text-white/80 max-w-xl">
                  Access WorldCompliance® through the WorldAML Platform for unified workflow 
                  management, case handling, and compliance reporting.
                </p>
              </div>
              <Button variant="accent" size="lg" asChild>
                <Link to="/platform">Explore WorldAML Platform</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-white border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center max-w-3xl mx-auto">
              Availability subject to suitability assessment and contractual approval. 
              WorldCompliance® is a trademark of LexisNexis Risk Solutions.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorldComplianceNA;
