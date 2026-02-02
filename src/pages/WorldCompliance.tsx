import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";
import TrustedByLogos from "@/components/TrustedByLogos";
import lexisNexisLogo from "@/assets/lexisnexis-risk-solutions-logo.png";
import { 
  databaseStats, 
  riskCategories, 
  benefits, 
  searchFeatures,
  complianceStandards 
} from "@/data/worldcompliance";

const WorldCompliance = () => {

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
                One-stop Sanctions, PEPs and Adverse Media Solution
              </p>
              
              {/* Attribution Block */}
              <div className="bg-white border border-divider rounded-lg p-4 mb-8">
                <img src={lexisNexisLogo} alt="LexisNexis Risk Solutions" className="h-8 object-contain mb-3" />
                <p className="text-body-sm text-text-tertiary">
                  <strong>Delivered and supported by</strong> Infocredit Group
                </p>
              </div>

              <p className="text-body-lg text-text-secondary mb-6">
                WorldCompliance® Online Search Tool enables compliance professionals to manually 
                screen prospective clients and perform enhanced due diligence through the 
                industry-leading WorldCompliance™ database.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-divider rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{databaseStats.profiles}</p>
                  <p className="text-body-sm text-text-tertiary">Detailed Profiles</p>
                </div>
                <div className="bg-white border border-divider rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{databaseStats.riskCategories}</p>
                  <p className="text-body-sm text-text-tertiary">Risk Categories</p>
                </div>
                <div className="bg-white border border-divider rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-navy">{databaseStats.regulatoryLaws}</p>
                  <p className="text-body-sm text-text-tertiary">AML/CTF Laws Covered</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Button asChild variant="accent">
                  <Link to="/data-sources/worldcompliance/demo">
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

        {/* Risk Categories */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mb-8">
              <h2 className="text-2xl text-navy mb-4">Screening Coverage</h2>
              <p className="text-text-secondary">
                The database helps detect individuals, organizations, and vessels linked to 
                more than {databaseStats.riskCategories} risk categories.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {riskCategories.map((category) => (
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

        {/* Benefits */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mb-8">
              <h2 className="text-2xl text-navy mb-4">Benefits</h2>
              <p className="text-text-secondary">
                WorldCompliance® Online Search Tool helps compliance teams work more 
                efficiently while meeting regulatory obligations.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="border-divider bg-white">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-3">
                      <benefit.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Search Features */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mb-8">
              <h2 className="text-2xl text-navy mb-4">Search Technology</h2>
              <p className="text-text-secondary">
                Advanced search capabilities ensure comprehensive coverage and accurate results.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchFeatures.map((feature) => (
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

        {/* Compliance Standards */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h2 className="text-2xl text-navy mb-4">Regulatory Compliance</h2>
              <p className="text-text-secondary mb-6">
                WorldCompliance® helps organizations conform to major anti-terrorism and 
                anti-money laundering regulatory frameworks.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {complianceStandards.map((standard) => (
                  <div key={standard} className="flex items-center gap-3 bg-white border border-divider rounded-lg p-3">
                    <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                    <span className="text-body-sm text-text-secondary">{standard}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <TrustedByLogos 
          description="Trusted by leading financial institutions, fintechs, and compliance teams worldwide using LexisNexis solutions."
        />

        {/* Disclaimer */}
        <section className="py-8 bg-surface-subtle border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center max-w-3xl mx-auto">
              WorldCompliance® is a trademark of LexisNexis Risk Solutions. Pricing and 
              commercial terms may vary by region. Access activation is subject to 
              verification and contractual approval.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorldCompliance;
