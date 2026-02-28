import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Building2, 
  UserCheck, 
  Newspaper, 
  ShieldOff, 
  Gavel, 
  FileCheck,
  Globe
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";
import lexisNexisLogo from "@/assets/lexisnexis-risk-solutions-logo.png";

const dataCategories = [
  {
    icon: Building2,
    title: "State-Owned Enterprises (SOEs)",
    description: "Proprietary data on government-linked and state-controlled entities, including ownership structures and senior management.",
    sources: [
      "State-Owned Enterprise registers",
      "Government ownership disclosures",
      "Sovereign wealth fund-linked entities",
      "Public sector corporate filings",
      "Public procurement and tender blacklists",
    ],
    whyItMatters: "Identifies elevated political and corruption risk in corporate structures and counterparties.",
  },
  {
    icon: UserCheck,
    title: "Politically Exposed Persons (PEPs)",
    description: "Comprehensive global coverage of politically exposed persons and related parties.",
    sources: [
      "Domestic PEPs",
      "Foreign PEPs",
      "International Organisation PEPs",
      "Family members and close associates (RCAs)",
    ],
    categories: [
      "Heads of State and Government",
      "Ministers and Members of Parliament",
      "Senior Judiciary",
      "Central Bank Governors",
      "Senior Military Officials",
    ],
    whyItMatters: "Supports enhanced due diligence and regulatory expectations for politically exposed relationships.",
  },
  {
    icon: Newspaper,
    title: "Adverse Media",
    description: "Global negative news and reputational risk coverage derived from over 30,000 news and media sources worldwide.",
    sources: [
      "Money laundering",
      "Terrorist financing",
      "Corruption and bribery",
      "Fraud and financial crime",
      "Organised crime",
      "Human trafficking",
    ],
    whyItMatters: "Provides early risk indicators beyond formal sanctions or enforcement actions.",
  },
  {
    icon: ShieldOff,
    title: "Sanctions Lists",
    description: "Comprehensive global sanctions coverage from major international and national authorities.",
    sources: [
      "OFAC SDN and Non-SDN Lists",
      "EU Consolidated Sanctions List",
      "UN Security Council Sanctions",
      "UK HMT / OFSI Sanctions List",
      "Canada (SEMA)",
      "Australia (DFAT)",
      "Switzerland (SECO)",
      "Japan (MOFA / METI)",
      "Singapore (MAS)",
    ],
    coverage: [
      "Individuals and entities",
      "Vessels and aircraft",
      "Ownership and control links",
    ],
    whyItMatters: "Supports compliance with international sanctions regimes and regulatory obligations.",
  },
  {
    icon: Gavel,
    title: "Enforcement Actions",
    description: "Information from over 1,700 regulatory and law-enforcement authorities worldwide.",
    sources: [
      "SEC",
      "DOJ",
      "FBI",
      "FinCEN",
      "FINRA",
      "FDA",
      "HHS",
      "UK FCA",
      "Serious Fraud Office (SFO)",
    ],
    coverage: [
      "Civil and criminal enforcement actions",
      "Regulatory penalties and fines",
      "Public investigations where available",
    ],
    whyItMatters: "Identifies regulatory and legal risk linked to individuals and entities.",
  },
  {
    icon: FileCheck,
    title: "Registrations & Watchlists",
    description: "Specialised compliance and risk registers built from official government and regulatory sources.",
    sources: [
      "Disqualified directors registers",
      "Insolvency and bankruptcy lists",
      "Financial services warning lists",
      "Fraud and scam alerts",
      "Licensing revocations",
      "Professional disbarment lists",
      "Regulatory warning notices",
    ],
    whyItMatters: "Highlights operational, financial, and conduct-related risk indicators.",
  },
];

const ResourcesDataCoverage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Resources & Data Coverage"
        description="Explore the data coverage behind LexisNexis screening solutions including sanctions, PEPs, adverse media, enforcement actions, and watchlists."
        canonical="/data-sources/resources"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Data Sources", url: "/data-sources" },
          { name: "Resources & Data Coverage", url: "/data-sources/resources" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="data-source" className="mb-6" />
              <h1 className="text-navy mb-4">Resources & Data Coverage</h1>
              <p className="text-xl text-teal-dark font-medium mb-6">
                Supporting AML Screening and Ongoing Monitoring
              </p>
              
              {/* Attribution Block */}
              <div className="bg-white border border-divider rounded-lg p-4 mb-8">
                <img src={lexisNexisLogo} alt="LexisNexis Risk Solutions" className="h-8 object-contain mb-3" />
                <p className="text-body-sm text-text-tertiary">
                  <strong>Delivered and supported by</strong> Infocredit Group
                </p>
              </div>

              <p className="text-body-lg text-text-secondary mb-8">
                LexisNexis WorldCompliance® and Bridger Insight XG® provide access to structured, 
                continuously updated global risk data to support customer onboarding, ongoing monitoring, 
                and risk-based compliance decision-making for regulated institutions.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
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
            </div>
          </div>
        </section>

        {/* Efficiency Section */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h2 className="text-2xl text-navy mb-4">Increase Screening and Ongoing Monitoring Efficiency</h2>
              <p className="text-text-secondary">
                Comprehensive global data coverage enables consistent onboarding checks, periodic reviews, 
                and continuous monitoring, while reducing manual research and supporting audit and regulatory review. 
                Access to structured, reliable risk intelligence allows compliance teams to focus on decision-making 
                rather than data gathering.
              </p>
            </div>
          </div>
        </section>

        {/* Data Categories */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataCategories.map((category) => (
                <Card key={category.title} className="border-divider bg-white">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/5 text-teal mb-3">
                      <category.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>{category.description}</CardDescription>
                    
                    <div>
                      <p className="text-body-sm font-medium text-navy mb-2">
                        {category.categories ? "Includes:" : "Example sources:"}
                      </p>
                      <ul className="text-body-sm text-text-tertiary space-y-1">
                        {(category.categories || category.sources).slice(0, 5).map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="text-teal mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {category.coverage && (
                      <div>
                        <p className="text-body-sm font-medium text-navy mb-2">Coverage includes:</p>
                        <ul className="text-body-sm text-text-tertiary space-y-1">
                          {category.coverage.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="text-teal mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-3 border-t border-divider">
                      <p className="text-body-sm font-medium text-navy mb-1">Why it matters:</p>
                      <p className="text-body-sm text-text-tertiary">{category.whyItMatters}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Product Usage Section */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">How These Resources Are Used</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              <Card className="border-divider">
                <CardHeader>
                  <CardTitle className="text-xl">WorldCompliance®</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">
                    WorldCompliance® uses these datasets for search-based screening of individuals and companies, 
                    supporting onboarding checks, periodic reviews, and audit-ready reporting. The intuitive 
                    interface allows compliance professionals to perform manual due diligence with comprehensive 
                    global coverage.
                  </p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/data-sources/worldcompliance">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-divider">
                <CardHeader>
                  <CardTitle className="text-xl">Bridger Insight XG®</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">
                    Bridger Insight XG® uses these datasets for high-volume, real-time and batch screening, 
                    advanced matching, risk scoring, and ongoing monitoring in complex compliance environments. 
                    The platform is designed for enterprise-scale operations requiring automated workflows.
                  </p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/data-sources/bridger-xg">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Global Coverage Note */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-teal/5 text-teal flex-shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl text-navy mb-4">Global Coverage</h2>
                  <p className="text-text-secondary">
                    Data coverage spans global, regional, and national sources. Availability and scope may 
                    vary by jurisdiction and regulatory requirements. LexisNexis Risk Solutions continuously 
                    updates and expands coverage to reflect evolving regulatory landscapes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mandatory Clarification */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl bg-surface-subtle border border-divider rounded-lg p-6">
              <p className="text-body-sm text-text-secondary mb-4">
                WorldCompliance® and Bridger Insight XG® are screening solutions powered by LexisNexis Risk Solutions.
              </p>
              <p className="text-body-sm text-text-secondary mb-4">
                Infocredit Group acts as an authorized regional partner, providing commercial delivery and support.
              </p>
              <p className="text-body-sm text-text-tertiary">
                Data availability and scope may vary by jurisdiction.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Attribution */}
        <section className="py-8 bg-surface-subtle border-t border-divider">
          <div className="container-enterprise">
            <div className="text-center">
              <p className="text-body-sm text-text-secondary mb-2">
                <strong>Powered by</strong> LexisNexis Risk Solutions
              </p>
              <p className="text-body-sm text-text-tertiary">
                <strong>Delivered and supported by</strong> Infocredit Group
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ResourcesDataCoverage;
