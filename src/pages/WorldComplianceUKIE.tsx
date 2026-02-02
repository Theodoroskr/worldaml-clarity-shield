import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";
import { databaseStats, riskCategories, searchFeatures } from "@/data/worldcompliance";

const WorldComplianceUKIE = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="data-source" className="mb-6" />
              <h1 className="text-navy mb-4">WorldCompliance® Online Search Tool</h1>
              <p className="text-xl text-teal-dark font-medium mb-6">
                UK & Ireland Region
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
                WorldCompliance® supports professional and regulated UK and Ireland users with 
                comprehensive sanctions, PEP, and adverse media screening through the industry-leading 
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
                  <p className="text-2xl font-bold text-navy">GBP / EUR</p>
                  <p className="text-body-sm text-text-tertiary">Pricing</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/get-started">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Buy WorldCompliance Online
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link to="/data-sources/worldcompliance">
                    View Full Product Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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
              <h2 className="text-2xl text-navy mb-6">Commercial Terms — UK & Ireland</h2>
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
                    <p className="font-medium text-navy">GBP / EUR Pricing</p>
                    <p className="text-body-sm text-text-secondary">Regional pricing in British Pounds and Euro</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-navy">Enhanced Verification Required</p>
                    <p className="text-body-sm text-text-secondary">
                      Access subject to verification and contractual approval in line with 
                      FCA and CBI regulatory requirements
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
                Services provided in the UK and Ireland are subject to applicable regulatory 
                requirements, including FCA and CBI guidance on financial crime prevention.
              </p>
              <p className="text-body-sm text-text-tertiary">
                WorldCompliance® helps organizations conform to UK Money Laundering Regulations, 
                the Proceeds of Crime Act, and related regulatory frameworks.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-2xl text-white mb-4">Get Started Today</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Subscribe to WorldCompliance® Online Search Tool. Enhanced verification 
              and contractual approval required for UK and Ireland customers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/get-started">Buy WorldCompliance Online</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-white border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center max-w-3xl mx-auto">
              Access subject to verification and contractual approval in line with applicable 
              regulatory requirements. WorldCompliance® is a trademark of LexisNexis Risk Solutions.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorldComplianceUKIE;
