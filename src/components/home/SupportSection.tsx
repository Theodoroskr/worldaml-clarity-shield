import { Link } from "react-router-dom";
import { FileText, MessageCircle, Users, Clock } from "lucide-react";

const supportOptions = [
  {
    icon: FileText,
    title: "Documentation",
    description: "Comprehensive API docs, integration guides, and code examples.",
    link: "/documentation",
    linkText: "Browse Docs",
  },
  {
    icon: MessageCircle,
    title: "Technical Support",
    description: "Expert assistance from our compliance and engineering teams.",
    link: "/support",
    linkText: "Contact Support",
  },
  {
    icon: Users,
    title: "Dedicated Success Manager",
    description: "Personalized guidance for Compliance and Enterprise customers.",
    link: "/enterprise",
    linkText: "Learn More",
  },
  {
    icon: Clock,
    title: "99.9% SLA",
    description: "Enterprise-grade uptime with guaranteed response times.",
    link: "/sla",
    linkText: "View SLA",
  },
];

export const SupportSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-headline text-navy mb-4">
            Support That Scales With You
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            From self-service documentation to dedicated account management, 
            we provide the support your team needs to succeed.
          </p>
        </div>

        {/* Support options grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportOptions.map((option) => (
            <div
              key={option.title}
              className="p-6 rounded-lg border border-divider bg-card hover:border-slate-muted transition-colors"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-secondary text-navy mb-4">
                <option.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{option.title}</h3>
              <p className="text-body-sm text-text-secondary mb-4">{option.description}</p>
              <Link
                to={option.link}
                className="text-body-sm font-medium text-teal hover:text-teal-light transition-colors"
              >
                {option.linkText} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
