import { Link } from "react-router-dom";
import { ArrowRight, FileText, MessageCircle, Phone, Mail, Clock, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const supportChannels = [
  {
    icon: FileText,
    title: "Documentation",
    description: "Comprehensive guides, API references, and integration examples to get you started quickly.",
    action: "Browse Documentation",
    link: "/documentation",
  },
  {
    icon: MessageCircle,
    title: "Help Center",
    description: "Searchable knowledge base with answers to common questions and troubleshooting guides.",
    action: "Visit Help Center",
    link: "/help",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get in touch with our support team for technical questions and account assistance.",
    action: "support@worldaml.com",
    link: "mailto:support@worldaml.com",
  },
  {
    icon: Phone,
    title: "Priority Support",
    description: "Dedicated phone support for Compliance and Enterprise customers with guaranteed response times.",
    action: "View Support Plans",
    link: "/pricing",
  },
];

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-display text-navy mb-6">
                Support & Resources
              </h1>
              <p className="text-body-lg text-text-secondary">
                Get the help you need to implement and operate WorldAML successfully. 
                From self-service documentation to dedicated account management.
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

        {/* SLA section */}
        <section className="section-padding bg-surface-subtle">
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
                  <p className="text-body text-text-secondary mb-6">
                    Enterprise customers receive guaranteed response times and uptime commitments 
                    backed by service credits. Our compliance infrastructure is designed for 
                    mission-critical applications.
                  </p>
                  <Button asChild>
                    <Link to="/sla">
                      View SLA Details
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

        {/* Resources */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-headline text-navy mb-4">Additional Resources</h2>
              <p className="text-body-lg text-text-secondary">
                Stay informed with the latest compliance insights and platform updates.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: BookOpen,
                  title: "Blog",
                  description: "Compliance insights, product updates, and industry news.",
                  link: "/blog",
                },
                {
                  icon: FileText,
                  title: "Changelog",
                  description: "Track new features, improvements, and API changes.",
                  link: "/changelog",
                },
                {
                  icon: MessageCircle,
                  title: "Status Page",
                  description: "Real-time system status and incident updates.",
                  link: "/status",
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
