import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { marketPages } from "@/data/marketPages";

const MarketPage = () => {
  const { market } = useParams<{ market: string }>();
  const data = market ? marketPages[market] : undefined;

  if (!data) return <Navigate to="/markets/uk" replace />;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.seo.title,
    description: data.seo.description,
    url: `https://www.worldaml.com${data.seo.canonical}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.worldaml.com/" },
        { "@type": "ListItem", position: 2, name: "Markets", item: "https://www.worldaml.com/markets/uk" },
        { "@type": "ListItem", position: 3, name: data.regionLabel, item: `https://www.worldaml.com${data.seo.canonical}` },
      ],
    },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: data.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={data.seo.title}
        description={data.seo.description}
        canonical={data.seo.canonical}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Markets", url: "/markets/uk" },
          { name: data.regionLabel, url: data.seo.canonical },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 mb-6">
                <span className="text-lg">{data.flag}</span>
                <span className="text-caption font-semibold text-teal uppercase tracking-wider">{data.regionLabel}</span>
              </div>
              <h1 className="text-display text-primary-foreground mb-6">{data.hero.headline}</h1>
              <p className="text-body-lg text-slate-light mb-8">{data.hero.subheadline}</p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="accent" asChild>
                  <Link to={data.hero.primaryCta.href}>
                    {data.hero.primaryCta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline-light" asChild>
                  <Link to={data.hero.secondaryCta.href}>{data.hero.secondaryCta.label}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Challenges */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-2xl mb-12">
              <h2 className="text-headline text-navy mb-4">{data.challenges.title}</h2>
              <p className="text-body text-text-secondary">{data.challenges.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {data.challenges.items.map((item) => (
                <div key={item.title} className="p-6 rounded-xl border border-divider bg-card">
                  <h3 className="text-title text-navy mb-2">{item.title}</h3>
                  <p className="text-body-sm text-text-secondary">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regulatory table */}
        <section className="section-padding bg-secondary/30">
          <div className="container-enterprise">
            <div className="max-w-2xl mb-12">
              <h2 className="text-headline text-navy mb-4">{data.regulations.title}</h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-divider">
              <table className="w-full text-left">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Regulation</th>
                    <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Requirement</th>
                    <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">WorldAML Module</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {data.regulations.rows.map((row) => (
                    <tr key={row.regulation} className="bg-card hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 text-body-sm font-mono font-semibold text-teal">{row.regulation}</td>
                      <td className="px-6 py-4 text-body-sm text-navy">{row.requirement}</td>
                      <td className="px-6 py-4 text-body-sm text-text-secondary">{row.module}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Platform modules */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-2xl mb-12">
              <h2 className="text-headline text-navy mb-4">Platform Capabilities</h2>
              <p className="text-body text-text-secondary">
                Everything you need to meet AML obligations across the full customer lifecycle in {data.regionLabel}.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.modules.map((m) => (
                <div key={m.title} className="p-6 rounded-xl border border-divider bg-card">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-4">
                    <m.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-title text-navy mb-2">{m.title}</h3>
                  <p className="text-body-sm text-text-secondary">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="section-padding bg-secondary/30">
          <div className="container-enterprise">
            <div className="max-w-2xl mb-12">
              <h2 className="text-headline text-navy mb-4">Who It's For in {data.regionLabel}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.industries.map((ind) => (
                <div key={ind.title} className="p-6 rounded-xl border border-divider bg-card">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-4">
                    <ind.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-title text-navy mb-2">{ind.title}</h3>
                  <p className="text-body-sm text-text-secondary">{ind.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-headline text-navy mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {data.faqs.map((faq) => (
                <div key={faq.question} className="p-6 rounded-xl border border-divider">
                  <h3 className="text-title text-navy mb-3">{faq.question}</h3>
                  <p className="text-body text-text-secondary">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise max-w-3xl text-center">
            <h2 className="text-headline text-primary-foreground mb-4">{data.cta.headline}</h2>
            <p className="text-body-lg text-slate-light mb-8">{data.cta.description}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="accent" asChild>
                <Link to="/contact-sales">
                  Book a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline-light" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
            <p className="text-body-sm text-slate-muted mt-6">
              WorldAML integrates trusted screening technologies, including LexisNexis Risk Solutions, and is delivered and supported by Infocredit Group.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MarketPage;
