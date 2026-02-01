import { Link } from "react-router-dom";
import { ArrowRight, Shield, Users, Globe, Award } from "lucide-react";
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
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h1 className="text-display text-navy mb-6">
                About WorldAML
              </h1>
              <p className="text-body-lg text-text-secondary mb-6">
                We're on a mission to make AML compliance accessible, efficient, and reliable 
                for regulated businesses of all sizes. Our platform helps companies meet their 
                compliance obligations while focusing on what they do best.
              </p>
              <p className="text-body text-text-secondary">
                Founded by compliance and technology professionals who understood the challenges 
                of building robust AML programs, WorldAML combines deep regulatory expertise with 
                modern engineering to deliver enterprise-grade compliance infrastructure.
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
                  <h2 className="text-subheadline text-navy mb-3">Part of InfoCredit Group</h2>
                  <p className="text-body text-text-secondary">
                    WorldAML is a product of InfoCredit Group Ltd, a leading provider of business intelligence 
                    and compliance solutions. With decades of experience in credit risk management and regulatory 
                    compliance, InfoCredit Group brings deep expertise in data quality, regulatory frameworks, 
                    and enterprise-grade infrastructure to the WorldAML platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-headline text-primary-foreground mb-6">Our Mission</h2>
              <p className="text-body-lg text-slate-light">
                "To provide the compliance infrastructure that enables regulated businesses 
                to operate with confidence, protecting the financial system from abuse while 
                enabling legitimate commerce to thrive."
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="text-center mb-16">
              <h2 className="text-headline text-navy mb-4">Our Values</h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
                These principles guide everything we do, from product development to customer relationships.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <h2 className="text-headline text-navy mb-4">Certified Management Systems</h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
                Our commitment to quality, security, and business continuity is backed by internationally 
                recognized certifications.
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

        {/* Stats */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Customers Worldwide" },
                { value: "200+", label: "Jurisdictions Covered" },
                { value: "50M+", label: "Screenings Monthly" },
                { value: "24/7", label: "Global Support" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-display text-navy mb-2">{stat.value}</div>
                  <div className="text-body text-text-secondary">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-headline text-navy mb-4">Join Our Team</h2>
              <p className="text-body-lg text-text-secondary mb-8">
                We're always looking for talented people who share our passion for 
                building great products and serving our customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/careers">
                    View Open Positions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Contact Us</Link>
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
