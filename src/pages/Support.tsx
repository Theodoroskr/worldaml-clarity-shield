import { Link } from "react-router-dom";
import { ArrowRight, FileText, MessageCircle, Phone, Mail, Clock, BookOpen, Shield, Zap, Users, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const supportChannels = [
  {
    icon: FileText,
    title: "Documentation",
    description: "Comprehensive guides, API references, and integration examples to get you started quickly. Our documentation covers every endpoint, webhook, and SDK method with working code samples in multiple languages.",
    action: "Browse Documentation",
    link: "/documentation",
  },
  {
    icon: MessageCircle,
    title: "Help Center",
    description: "Searchable knowledge base with answers to common questions and troubleshooting guides. Covers onboarding, screening configuration, risk scoring, reporting, and account management topics.",
    action: "Visit Help Center",
    link: "/help",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get in touch with our support team for technical questions and account assistance. All email enquiries are triaged and routed to the appropriate specialist within one business day.",
    action: "support@worldaml.com",
    link: "mailto:support@worldaml.com",
  },
  {
    icon: Phone,
    title: "Priority Support",
    description: "Dedicated phone support for Compliance and Enterprise customers with guaranteed response times. Includes direct access to senior engineers and compliance specialists for critical issues.",
    action: "View Support Plans",
    link: "/pricing",
  },
];

const supportTiers = [
  {
    name: "Standard",
    description: "Included with all plans",
    features: [
      "Email support with 24-hour response time",
      "Access to full documentation and knowledge base",
      "Community forum participation",
      "Monthly platform release notes",
    ],
  },
  {
    name: "Priority",
    description: "Included with Compliance plans",
    features: [
      "Everything in Standard",
      "4-hour response time for critical issues",
      "Phone support during business hours",
      "Dedicated onboarding specialist",
      "Quarterly business reviews",
    ],
  },
  {
    name: "Enterprise",
    description: "Custom SLA for Enterprise plans",
    features: [
      "Everything in Priority",
      "1-hour response time for critical issues",
      "24/7 phone and email support",
      "Dedicated account manager",
      "Custom integration assistance",
      "Annual compliance architecture review",
    ],
  },
];

const faqs = [
  {
    question: "How quickly can I get started with WorldAML?",
    answer: "Most organisations are live within 48 hours. Our onboarding team provides sandbox access immediately upon account creation, and production credentials are issued after a brief compliance review. API integration typically takes 2-5 days depending on complexity.",
  },
  {
    question: "What happens if the platform experiences downtime?",
    answer: "WorldAML maintains a 99.9% uptime SLA for Enterprise customers. In the rare event of an incident, our status page provides real-time updates, and affected customers receive proactive notifications. Enterprise SLAs include service credits for any downtime exceeding the guaranteed threshold.",
  },
  {
    question: "Can I migrate from another screening provider?",
    answer: "Yes. Our onboarding team has extensive experience migrating organisations from competing platforms. We provide data migration support, parallel-running assistance, and configuration mapping to ensure a smooth transition with no compliance gaps.",
  },
  {
    question: "Do you provide training for compliance teams?",
    answer: "Absolutely. All plans include access to the WorldAML Academy, which offers self-paced compliance training courses with CPD-accredited certificates. Priority and Enterprise customers also receive live training sessions tailored to their specific workflows and regulatory requirements.",
  },
];

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Support"
        description="WorldAML support and resources. Documentation, email and phone support, dedicated account management, and 99.9% uptime SLA for compliance teams worldwide."
        canonical="/support"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Support", url: "/support" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-display text-navy mb-6">
                Support & Resources
              </h1>
              <p className="text-body-lg text-text-secondary mb-4">
                Get the help you need to implement and operate WorldAML successfully. 
                From self-service documentation to dedicated account management, our 
                support infrastructure is built for compliance-critical operations.
              </p>
              <p className="text-body text-text-secondary">
                Whether you are integrating our API for the first time, configuring risk 
                scoring rules, or troubleshooting a screening workflow, our team of compliance 
                and engineering specialists is here to help you succeed.
              </p>
            </div>
          </div>
        </section>

        {/* Support channels */}
        <section className="pb-16 md:pb-24 bg-background">
          <div className="container-enterprise">
            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {supportChannels.map((channel) => (
                <div
                  key={channel.title}
                  className="p-6 rounded-xl border border-divider bg-card hover:border-slate-muted transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-5">
                    <channel.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-title text-navy mb-2">{channel.title}</h3>
                  <p className="text-body-sm text-text-secondary mb-4">{channel.description}</p>
                  <Link
                    to={channel.link}
                    className="inline-flex items-center text-body-sm font-medium text-teal hover:text-teal-light transition-colors"
                  >
                    {channel.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support Tiers */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-headline text-navy mb-4">Support Tiers</h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
                Every WorldAML plan includes support. Choose the level that matches your 
                organisation's operational requirements and compliance obligations.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {supportTiers.map((tier) => (
                <div key={tier.name} className="p-6 rounded-xl border border-divider bg-card">
                  <h3 className="text-lg font-semibold text-navy mb-1">{tier.name}</h3>
                  <p className="text-body-sm text-text-tertiary mb-5">{tier.description}</p>
                  <ul className="space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                        <span className="text-body-sm text-text-secondary">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLA section */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-teal bg-teal/10 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    Enterprise SLA
                  </div>
                  <h2 className="text-headline text-navy mb-4">
                    99.9% Uptime Guarantee
                  </h2>
                  <p className="text-body text-text-secondary mb-4">
                    Enterprise customers receive guaranteed response times and uptime commitments 
                    backed by service credits. Our compliance infrastructure is designed for 
                    mission-critical applications where screening downtime can result in 
                    regulatory penalties and operational risk.
                  </p>
                  <p className="text-body text-text-secondary mb-6">
                    The WorldAML platform is deployed across redundant cloud infrastructure 
                    with automated failover, continuous monitoring, and proactive incident 
                    management. Our engineering team conducts regular disaster recovery 
                    exercises to validate our business continuity procedures.
                  </p>
                  <Button asChild>
                    <Link to="/contact-sales">
                      Discuss SLA Options
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "API Uptime", value: "99.9%" },
                    { label: "Critical Issue Response", value: "< 1 hour" },
                    { label: "Standard Issue Response", value: "< 4 hours" },
                    { label: "Data Processing", value: "Real-time" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 rounded-lg bg-card border border-divider"
                    >
                      <span className="text-body text-text-secondary">{item.label}</span>
                      <span className="text-body font-semibold text-navy">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Questions */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-headline text-navy mb-8 text-center">Common Questions</h2>
              <div className="space-y-6">
                {faqs.map((faq) => (
                  <div key={faq.question} className="p-5 rounded-lg border border-divider bg-card">
                    <h3 className="text-body font-semibold text-navy mb-2">{faq.question}</h3>
                    <p className="text-body-sm text-text-secondary">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-headline text-navy mb-4">Additional Resources</h2>
              <p className="text-body-lg text-text-secondary">
                Stay informed with the latest compliance insights, platform updates, 
                and industry best practices from the WorldAML team.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: BookOpen,
                  title: "Blog",
                  description: "Compliance insights, product updates, regulatory analysis, and industry news covering AML, KYC, sanctions, and financial crime topics.",
                  link: "/blog",
                },
                {
                  icon: FileText,
                  title: "Academy",
                  description: "Self-paced compliance training courses with CPD-accredited certificates. Build expertise in AML screening, risk assessment, and regulatory reporting.",
                  link: "/academy",
                },
                {
                  icon: MessageCircle,
                  title: "FAQ",
                  description: "Answers to frequently asked questions about AML screening, KYC, KYB, sanctions lists, and how the WorldAML platform works.",
                  link: "/faq",
                },
              ].map((resource) => (
                <Link
                  key={resource.title}
                  to={resource.link}
                  className="group p-6 rounded-lg border border-divider bg-card hover:border-slate-muted transition-colors text-center"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-secondary text-navy mb-4 group-hover:bg-navy group-hover:text-primary-foreground transition-colors">
                    <resource.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-body font-semibold text-navy mb-2">{resource.title}</h3>
                  <p className="text-body-sm text-text-secondary">{resource.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Support;