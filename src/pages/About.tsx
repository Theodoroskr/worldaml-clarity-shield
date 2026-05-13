import { Link } from "react-router-dom";
import { ArrowRight, Shield, Users, Globe, Award, CheckCircle2, Building2, MapPin } from "lucide-react";
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
    description: "We handle sensitive compliance data with the highest standards of security and privacy. Every system, process, and employee interaction is designed to protect the integrity of regulated data.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "We succeed when our customers succeed. Their compliance challenges are our priority, and we continuously iterate on our products based on frontline feedback from compliance officers and risk analysts.",
  },
  {
    icon: Globe,
    title: "Global Perspective",
    description: "We understand compliance is complex and varies by jurisdiction. We build for the world, supporting regulatory frameworks from the EU's Anti-Money Laundering Directives to FinCEN requirements in the United States.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We pursue excellence in everything we do, from API design and documentation to customer support response times. Our commitment to quality is validated by independent ISO certification audits.",
  },
];

const certifications = [
  {
    badge: iso9001Badge,
    standard: "ISO 9001:2015",
    name: "Quality Management System",
    description: "Demonstrates our commitment to consistent, high-quality products and services that meet customer and regulatory requirements. This certification covers our entire compliance platform development and customer delivery processes.",
    alt: "ISO 9001:2015 Quality Management System Certification",
  },
  {
    badge: iso27001Badge,
    standard: "ISO 27001:2022",
    name: "Information Security Management System",
    description: "Validates that we systematically manage information security risks across people, processes, and technology. Critical for handling sensitive screening data from sanctions lists, PEP databases, and adverse media sources.",
    alt: "ISO 27001:2022 Information Security Management System Certification",
  },
  {
    badge: iso22301Badge,
    standard: "ISO 22301:2019",
    name: "Business Continuity Management System",
    description: "Ensures our platform and services remain available even during disruptions. For compliance-critical operations, downtime is not acceptable — this certification validates our resilience planning and disaster recovery capabilities.",
    alt: "ISO 22301:2019 Business Continuity Management System Certification",
  },
];

const milestones = [
  { year: "2009", event: "Infocredit Group established as a business intelligence provider in the Eastern Mediterranean" },
  { year: "2015", event: "Appointed as an authorised regional partner of LexisNexis Risk Solutions" },
  { year: "2019", event: "Expanded coverage to the UK, Ireland, and broader European markets" },
  { year: "2021", event: "Launched the WorldAML compliance platform with unified API access" },
  { year: "2023", event: "Achieved triple ISO certification (9001, 27001, 22301)" },
  { year: "2024", event: "Expanded into North America and launched WorldID identity verification" },
  { year: "2025", event: "Serving 500+ regulated organisations across 30+ jurisdictions" },
];

const regions = [
  { name: "Europe & Middle East", cities: "Cyprus, Greece, Malta, UAE, Romania, Netherlands, Germany" },
  { name: "United Kingdom & Ireland", cities: "London, Dublin" },
  { name: "North America", cities: "United States, Canada" },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="About"
        description="WorldAML is a financial crime screening platform by Infocredit Group, a regional partner of LexisNexis Risk Solutions. ISO 27001 certified."
        canonical="/about"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About WorldAML",
          "description": "WorldAML is a financial crime screening platform operated by Infocredit Group, providing unified access to AML screening, KYC/KYB verification, and compliance management tools.",
          "url": "https://www.worldaml.com/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "WorldAML",
            "url": "https://www.worldaml.com",
            "parentOrganization": {
              "@type": "Organization",
              "name": "Infocredit Group",
              "url": "https://www.infocreditgroup.com"
            }
          }
        }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h1 className="text-navy mb-6">About WorldAML</h1>
              <p className="text-body-lg text-text-secondary mb-4">
                WorldAML is a financial crime screening platform operated by Infocredit Group. 
                The platform provides unified access to approved screening technologies and data 
                sources for regulated institutions across multiple jurisdictions.
              </p>
              <p className="text-body text-text-secondary">
                Since its launch, WorldAML has grown to serve over 500 regulated organisations — 
                from early-stage fintechs to established banks and payment institutions — providing 
                them with the tools, data, and governance they need to meet anti-money laundering 
                obligations across Europe, the Middle East, the United Kingdom, Ireland, and North America.
              </p>
            </div>
          </div>
        </section>

        {/* Part of InfoCredit Group */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
                <div className="flex-shrink-0 pt-1">
                  <a 
                    href="https://www.infocreditgroup.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <img 
                      src={infocreditLogo} 
                      alt="InfoCredit Group — parent company of WorldAML" 
                      width={1334}
                      height={315}
                      className="h-12 md:h-16 w-auto"
                    />
                  </a>
                </div>
                <div>
                  <h2 className="text-2xl text-navy mb-3">Operated by Infocredit Group</h2>
                  <p className="text-body text-text-secondary mb-4">
                    Infocredit Group is an authorized regional partner of LexisNexis Risk Solutions. 
                    With decades of experience in business intelligence and regulatory compliance, 
                    Infocredit Group delivers, supports, and onboards customers across the EU, 
                    Middle East, UK, Ireland, and North America.
                  </p>
                  <p className="text-body text-text-secondary mb-4">
                    This partnership means WorldAML customers benefit from both world-class screening 
                    data — including WorldCompliance® and Bridger Insight XG® — and localised support 
                    from teams that understand the regulatory landscape in each jurisdiction they serve.
                  </p>
                  <p className="text-body text-text-secondary">
                    Infocredit Group's deep expertise in credit risk, corporate due diligence, and 
                    financial crime compliance gives WorldAML a unique foundation that pure-play 
                    technology vendors cannot replicate: domain knowledge combined with modern 
                    engineering.
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
                  WorldAML provides two distinct offerings that work together to give regulated 
                  organisations a complete compliance infrastructure:
                </p>
                <div className="pl-6 border-l-2 border-navy/20 space-y-6">
                  <div>
                    <p className="font-semibold text-navy">WorldAML Platform</p>
                    <p className="text-body-sm text-text-secondary mt-1">
                      A technology platform providing unified UI, APIs, workflows, and governance 
                      for managing financial crime screening workflows. The platform includes 
                      KYC and KYB onboarding, AML screening, transaction monitoring, risk 
                      assessment, regulatory reporting, and full audit trail capabilities. 
                      Compliance officers can manage their entire programme from a single 
                      dashboard, while developers can integrate every capability via RESTful APIs.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Data Sources</p>
                    <p className="text-body-sm text-text-secondary mt-1">
                      Access to trusted screening solutions from LexisNexis Risk Solutions, 
                      including WorldCompliance® and Bridger Insight XG®. These data sources 
                      cover sanctions lists from OFAC, EU, UN, and HMT, politically exposed 
                      persons (PEPs) databases, adverse media feeds, and corporate registry 
                      records spanning 240+ countries and territories.
                    </p>
                  </div>
                </div>
                <p className="text-body-sm text-text-tertiary italic">
                  Note: WorldAML does not own or generate sanctions, PEP, or adverse media data. 
                  Screening data is provided by third-party data sources, ensuring independence 
                  and objectivity in compliance decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline / Milestones */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl text-navy mb-4">Our Journey</h2>
              <p className="text-body text-text-secondary mb-8">
                From a regional business intelligence provider to a global compliance platform 
                serving regulated organisations across four continents.
              </p>
              <div className="space-y-4">
                {milestones.map((m) => (
                  <div key={m.year} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 text-body font-bold text-teal w-14">{m.year}</span>
                    <div className="flex-1 pb-4 border-b border-divider last:border-0">
                      <p className="text-body-sm text-text-secondary">{m.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-2xl text-navy mb-4">Our Values</h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                These principles guide every decision we make — from how we design our APIs 
                to how we support customers through complex regulatory challenges.
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
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-2xl text-navy mb-4">Certified Management Systems</h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                Our commitment to quality, security, and business continuity is backed by 
                internationally recognized certifications audited annually by independent bodies.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                  <p className="text-body-sm font-medium text-text-secondary mb-3">{cert.name}</p>
                  <p className="text-caption text-text-tertiary">{cert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regional Presence */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl text-navy mb-4">Global Presence</h2>
                <p className="text-body text-text-secondary max-w-2xl mx-auto">
                  WorldAML serves regulated organisations across multiple regions, with dedicated 
                  onboarding and support teams in each market to ensure compliance alignment 
                  with local regulatory frameworks.
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {regions.map((r) => (
                  <div key={r.name} className="p-5 rounded-lg border border-divider bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-teal" />
                      <h3 className="text-body font-semibold text-navy">{r.name}</h3>
                    </div>
                    <p className="text-body-sm text-text-secondary">{r.cities}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Key Facts */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl text-navy mb-8 text-center">WorldAML at a Glance</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { stat: "500+", label: "Regulated organisations served" },
                  { stat: "30+", label: "Jurisdictions covered" },
                  { stat: "240+", label: "Countries in screening data" },
                  { stat: "3", label: "ISO certifications held" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-5 rounded-lg bg-card border border-divider">
                    <p className="text-3xl font-bold text-teal mb-1">{item.stat}</p>
                    <p className="text-body-sm text-text-secondary">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl text-navy mb-4">Get in Touch</h2>
              <p className="text-body text-text-secondary mb-8">
                Whether you are evaluating compliance platforms for the first time or looking 
                to consolidate your existing screening tools, our team is ready to discuss 
                how WorldAML can support your organisation's regulatory obligations.
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
                <Button variant="outline" asChild>
                  <Link to="/about-us/why-worldaml">
                    Why WorldAML
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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