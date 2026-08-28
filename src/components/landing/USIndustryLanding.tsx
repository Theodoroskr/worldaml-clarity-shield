import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { type RelatedGuideLink } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import USIndustryDemoRequestForm from "@/components/forms/USIndustryDemoRequestForm";

export interface USIndustryLandingConfig {
  path: string;
  eyebrow: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  heroIntro: string;
  heroFootnote: string;
  breadcrumbName: string;
  softwareName: string;
  audienceType: string;
  regulatorsHeading: string;
  regulatorsIntro: string;
  regulators: { name: string; desc: string }[];
  featuresHeading: string;
  featuresIntro: string;
  features: { icon: LucideIcon; title: string; desc: string }[];
  useCasesHeading: string;
  useCases: { title: string; desc: string }[];
  checklistHeading: string;
  checklist: string[];
  checklistOutro: string;
  faqsHeading: string;
  faqs: { q: string; a: string }[];
  demoHeading: string;
  demoIntro: string;
  demoBullets: string[];
  form: {
    formType: string;
    industry: string;
    segmentLabel: string;
    segmentOptions: string[];
    heading: string;
    intro: string;
    messagePlaceholder: string;
  };
  ctaHeading: string;
  ctaBody: string;
  secondaryCta: { to: string; label: string };
  relatedIntro: string;
  relatedLinks: RelatedGuideLink[];
}

const USIndustryLanding = ({ config }: { config: USIndustryLandingConfig }) => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: config.softwareName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: config.seoDescription,
    url: `https://worldaml.com${config.path}`,
    audience: { "@type": "Audience", audienceType: config.audienceType },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "0",
      category: "Enterprise SaaS",
      url: "https://worldaml.com/contact-sales",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={config.seoTitle}
        description={config.seoDescription}
        canonical={config.path}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Compliance Software", url: "/compliance-software/us" },
          { name: config.breadcrumbName, url: config.path },
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
                {config.eyebrow}
              </p>
              <h1 className="text-headline text-navy mb-6">{config.h1}</h1>
              <p className="text-body-lg text-text-secondary mb-8">{config.heroIntro}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <a href="#request-demo">Request a demo</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/?demo=1">
                    Run a free sanctions check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-6">{config.heroFootnote}</p>
            </div>
          </div>
        </section>

        {/* Regulators */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">{config.regulatorsHeading}</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">{config.regulatorsIntro}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.regulators.map((r) => (
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
            <h2 className="text-2xl text-navy mb-2">{config.featuresHeading}</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">{config.featuresIntro}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.features.map((f) => (
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
            <h2 className="text-2xl text-navy mb-8">{config.useCasesHeading}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.useCases.map((u) => (
                <div key={u.title} className="p-6 rounded-lg border border-divider bg-white">
                  <h3 className="text-lg font-semibold text-navy mb-2">{u.title}</h3>
                  <p className="text-text-secondary">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exam / audit readiness */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-2xl text-navy mb-6">{config.checklistHeading}</h2>
            <ul className="space-y-4">
              {config.checklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <span className="text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-text-secondary mt-6">{config.checklistOutro}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">{config.faqsHeading}</h2>
            <div className="space-y-6">
              {config.faqs.map((f) => (
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

        {/* Demo request form */}
        <section id="request-demo" className="section-padding bg-surface-subtle scroll-mt-24">
          <div className="container-enterprise grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl text-navy mb-4">{config.demoHeading}</h2>
              <p className="text-text-secondary mb-6">{config.demoIntro}</p>
              <ul className="space-y-3 text-text-secondary">
                {config.demoBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <USIndustryDemoRequestForm pagePath={config.path} {...config.form} />
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-3xl text-white mb-4">{config.ctaHeading}</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">{config.ctaBody}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="accent" size="lg" asChild>
                <a href="#request-demo">Request a demo</a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link to={config.secondaryCta.to}>{config.secondaryCta.label}</Link>
              </Button>
            </div>
          </div>
        </section>

        <RelatedGuidesSection
          currentPath={config.path}
          intro={config.relatedIntro}
          links={config.relatedLinks}
        />
      </main>
      <Footer />
    </div>
  );
};

export default USIndustryLanding;
