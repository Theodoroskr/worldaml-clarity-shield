import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Globe,
  FileCheck,
  AlertTriangle,
  Scale,
  Building2,
  Landmark,
  Users,
  type LucideIcon,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type CountryLandingConfig = {
  countryCode: string; // e.g. NL
  countryName: string; // e.g. Netherlands
  path: string; // e.g. /compliance-software/nl
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroLead: string;
  heroFootnote: string;
  currency: "USD" | "GBP" | "EUR" | "CHF";
  ctaSanctionsLabel: string;
  regulators: { name: string; desc: string }[];
  features: { icon: LucideIcon; title: string; desc: string }[];
  useCases: { title: string; desc: string }[];
  whyPoints: string[];
  faqs: { q: string; a: string }[];
  ctaHeadline: string;
  ctaBody: string;
};

export const iconMap = {
  Globe,
  Shield,
  FileCheck,
  AlertTriangle,
  Scale,
  Building2,
  Landmark,
  Users,
};

interface Props {
  config: CountryLandingConfig;
}

const CountryComplianceLanding = ({ config: c }: Props) => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `WorldAML Compliance Software (${c.countryName})`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: c.metaDescription,
    url: `https://worldaml.com${c.path}`,
    audience: {
      "@type": "Audience",
      audienceType: `Financial institutions and fintechs (${c.countryName})`,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: c.currency,
      price: "0",
      category: "Enterprise SaaS",
      url: "https://worldaml.com/contact-sales",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={c.metaTitle}
        description={c.metaDescription}
        canonical={c.path}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Compliance Software", url: c.path },
          { name: c.countryName, url: c.path },
        ]}
        structuredData={[faqLd, softwareLd]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">
                {c.countryName}
              </p>
              <h1 className="text-headline text-navy mb-6">{c.h1}</h1>
              <p className="text-body-lg text-text-secondary mb-8">{c.heroLead}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Talk to a {c.countryName} specialist</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/free-aml-check">
                    {c.ctaSanctionsLabel} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-6">{c.heroFootnote}</p>
            </div>
          </div>
        </section>

        {/* Regulators */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">
              Aligned to the {c.countryName} regulatory stack
            </h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              One compliance platform covering every {c.countryName} authority a regulated
              financial institution needs to evidence a programme against.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {c.regulators.map((r) => (
                <Card key={r.name} className="border-divider">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-navy">{r.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{r.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">
              Everything a {c.countryName} AML programme needs
            </h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Replace 3–5 point tools with one platform. Purpose-built modules for every pillar of a
              modern {c.countryName} financial-crime programme.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {c.features.map((f) => (
                <Card key={f.title} className="border-divider bg-white">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent mb-3">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg text-navy">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{f.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">
              Compliance software for every {c.countryName} firm type
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {c.useCases.map((u) => (
                <div key={u.title} className="p-6 rounded-lg border border-divider bg-white">
                  <h3 className="text-lg font-semibold text-navy mb-2">{u.title}</h3>
                  <p className="text-text-secondary">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-2xl text-navy mb-6">
              Why {c.countryName} compliance teams pick WorldAML
            </h2>
            <ul className="space-y-4">
              {c.whyPoints.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <span className="text-text-secondary">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">
              {c.countryName} compliance software — FAQ
            </h2>
            <div className="space-y-6">
              {c.faqs.map((f) => (
                <div key={f.q} className="border-b border-divider pb-6">
                  <h3 className="text-lg font-semibold text-navy mb-2 flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    {f.q}
                  </h3>
                  <p className="text-text-secondary pl-7">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-3xl text-white mb-4">{c.ctaHeadline}</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">{c.ctaBody}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/contact-sales">Request a demo</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link to="/free-aml-check">Try a free sanctions check</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CountryComplianceLanding;
