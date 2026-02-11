import { Link } from "react-router-dom";
import { ArrowRight, Shield, Users, Globe, Award } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import iso9001Badge from "@/assets/iso-9001-badge.png";
import iso27001Badge from "@/assets/iso-27001-badge.png";
import iso22301Badge from "@/assets/iso-22301-badge.png";
import infocreditLogo from "@/assets/infocredit-logo.png";

const values = [
  {
    icon: Shield,
    title: "Trust & Security",
    description: "We handle sensitive compliance data with the highest standards of security and privacy.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "We succeed when our customers succeed. Their compliance challenges are our priority.",
  },
  {
    icon: Globe,
    title: "Global Perspective",
    description: "We understand compliance is complex and varies by jurisdiction. We build for the world.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We pursue excellence in everything we do, from API design to customer support.",
  },
];

const certifications = [
  {
    badge: iso9001Badge,
    standard: "ISO 9001:2015",
    name: "Quality System",
    alt: "ISO 9001:2015 Quality System Certification",
  },
  {
    badge: iso27001Badge,
    standard: "ISO 27001:2022",
    name: "Information Security Management System",
    alt: "ISO 27001:2022 Information Security Management System Certification",
  },
  {
    badge: iso22301Badge,
    standard: "ISO 22301:2019",
    name: "Business Continuity Management System",
    alt: "ISO 22301:2019 Business Continuity Management System Certification",
  },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="About"
        description="WorldAML is a financial crime screening platform operated by Infocredit Group, an authorised regional partner of LexisNexis Risk Solutions."
        canonical="/about"
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h1 className="text-navy mb-6">About WorldAML</h1>
              <p className="text-body-lg text-text-secondary">
                WorldAML is a financial crime screening platform operated by Infocredit Group. 
                The platform provides unified access to approved screening technologies and data 
                sources for regulated institutions across multiple jurisdictions.
              </p>
            </div>
          </div>
        </section>

        {/* Part of InfoCredit Group */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex-shrink-0">
                  <a 
                    href="https://www.infocreditgroup.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <img 
                      src={infocreditLogo} 
                      alt="InfoCredit Group" 
                      className="h-12 md:h-16 w-auto"
                    />
                  </a>
                </div>
                <div>
                  <h2 className="text-2xl text-navy mb-3">Operated by Infocredit Group</h2>
                  <p className="text-body text-text-secondary">
                    Infocredit Group is an authorized regional partner of LexisNexis Risk Solutions. 
                    With decades of experience in business intelligence and regulatory compliance, 
                    Infocredit Group delivers, supports, and onboards customers across the EU, 
                    Middle East, UK, Ireland, and North America.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl text-navy mb-6">What We Do</h2>
              <div className="space-y-6 text-body text-text-secondary">
                <p>
                  WorldAML provides two distinct offerings:
                </p>
                <div className="pl-6 border-l-2 border-navy/20 space-y-4">
                  <div>
                    <p className="font-semibold text-navy">WorldAML Platform</p>
                    <p className="text-body-sm text-text-secondary">
                      A technology platform providing unified UI, APIs, workflows, and governance 
                      for managing financial crime screening workflows.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Data Sources</p>
                    <p className="text-body-sm text-text-secondary">
                      Access to trusted screening solutions from LexisNexis Risk Solutions, 
                      including WorldCompliance® and Bridger Insight XG®.
                    </p>
                  </div>
                </div>
                <p className="text-body-sm text-text-tertiary italic">
                  Note: WorldAML does not own or generate sanctions, PEP, or adverse media data. 
                  Screening data is provided by third-party data sources.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-2xl text-navy mb-4">Our Values</h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                These principles guide how we serve our customers and partners.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="p-6 rounded-lg border border-divider bg-card text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-5">
                    <value.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-body font-semibold text-navy mb-2">{value.title}</h3>
                  <p className="text-body-sm text-text-secondary">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ISO Certifications */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-2xl text-navy mb-4">Certified Management Systems</h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                Our commitment to quality, security, and business continuity is backed by 
                internationally recognized certifications.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {certifications.map((cert) => (
                <div
                  key={cert.standard}
                  className="p-6 rounded-lg border border-divider bg-card text-center"
                >
                  <img 
                    src={cert.badge} 
                    alt={cert.alt}
                    className="h-16 md:h-20 w-auto mx-auto mb-4"
                  />
                  <h3 className="text-body font-semibold text-navy mb-1">{cert.standard}</h3>
                  <p className="text-body-sm text-text-secondary">{cert.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl text-navy mb-4">Get in Touch</h2>
              <p className="text-body text-text-secondary mb-8">
                Contact us to learn more about our platform and data source offerings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/contact-sales">
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/support">Support</Link>
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

export default About;
