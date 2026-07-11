import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  FileSearch,
  Gavel,
  Users,
  Building2,
  Sparkles,
  MessageSquarePlus,
} from "lucide-react";
import AdvisoryConsultationDialog from "@/components/advisory/AdvisoryConsultationDialog";


const services = [
  {
    icon: ShieldCheck,
    title: "Enterprise-Wide Risk Assessment",
    description:
      "Assistance for the development or review of your EWRA — specifically AML-FWRA and Sanctions FWRA — mapped to your business model, geographies, products, delivery channels, and customer segments.",
  },
  {
    icon: FileText,
    title: "Policies & Procedures",
    description:
      "Drafting and updating AML and Sanctions manuals, internal controls, and operating procedures aligned to your regulator's directives and current legislation.",
  },
  {
    icon: ClipboardCheck,
    title: "AMLCO Reports",
    description:
      "Drafting or updating the AML and Sanctions Annual Compliance Officer's Report, including findings, remediation actions, KRIs, and board-ready recommendations.",
  },
  {
    icon: FileSearch,
    title: "AML Questionnaires from Regulators",
    description:
      "Hands-on assistance with the completion of AML questionnaires and information requests issued by regulators, ensuring accurate, consistent, and defensible responses.",
  },
  {
    icon: Gavel,
    title: "AML Internal Audit",
    description:
      "Independent AML internal audit of your company — testing the design and operating effectiveness of your AML/CFT and Sanctions framework against regulatory expectations.",
  },
  {
    icon: Building2,
    title: "Monitoring Visits — Inspection Preparation",
    description:
      "Preparation of all relevant documentation, evidence, and staff briefings ahead of regulator monitoring visits, on-site inspections, and thematic reviews.",
  },
  {
    icon: Users,
    title: "MLRO & VMLRO Support",
    description:
      "MLRO advisory for client reviews, transaction monitoring, Source of Funds and Source of Wealth, and all AML policies based on regulator directives and legislation. Includes outsourced VMLRO (Virtual MLRO) services.",
  },
];

const Advisory = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultService, setDefaultService] = useState<string | undefined>();

  const openWith = (svc?: string) => {
    setDefaultService(svc);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">

      <SEO
        title="WorldAML Advisory — MLRO & AML Compliance Consulting"
        description="Advisory services from WorldAML MLROs: EWRA, AML & Sanctions policies, AMLCO reports, regulator questionnaires, internal audit, inspection preparation, and VMLRO support."
        canonical="/advisory"
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/60 via-primary/30 to-accent/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.25),transparent_60%)]" />
          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-light/40 bg-teal-light/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-light">
                <Sparkles className="h-3.5 w-3.5" />
                WorldAML Advisory
              </div>
              <h1 className="mt-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                Regulator-ready AML advisory, delivered by practicing MLROs.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                From risk assessments and policy drafting to inspection preparation and
                outsourced MLRO cover — our advisory team builds, reviews, and defends
                your AML and Sanctions framework across every jurisdiction you operate in.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-accent text-accent-foreground shadow-lg hover:bg-accent/90">
                  <Link to="/contact-sales">
                    Request a Consultation Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/templates">Browse Policy Templates</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Advisory Services</h2>
            <p className="mt-4 text-muted-foreground">
              Engagements are scoped to your regulator, product mix, and internal maturity —
              from one-off deliverables to ongoing MLRO cover.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.title}
                  className="border-border/60 bg-card/60 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl"
                >
                  <CardHeader>
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-teal-light/40 bg-teal-light/10 text-teal-light">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {s.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How we work */}
        <section className="border-y border-border/50 bg-muted/20">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold md:text-4xl">How we work</h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Scoping call",
                    body: "Free 30-minute discovery to understand your entity, regulator, product lines, and current gaps.",
                  },
                  {
                    step: "02",
                    title: "Fixed-fee proposal",
                    body: "Written engagement letter with deliverables, timeline, and a fixed fee — no open-ended retainers.",
                  },
                  {
                    step: "03",
                    title: "Delivery & sign-off",
                    body: "Documents drafted, reviewed with your board or MLRO, and iterated until ready for regulator submission.",
                  },
                ].map((s) => (
                  <div key={s.step} className="rounded-lg border border-border/60 bg-card/60 p-6">
                    <div className="text-sm font-semibold text-teal-light">{s.step}</div>
                    <div className="mt-2 text-lg font-semibold">{s.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="relative overflow-hidden rounded-2xl border border-teal-light/30 bg-gradient-to-br from-primary/50 via-primary/30 to-accent/30 p-8 shadow-2xl md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.25),transparent_60%)]" />
            <div className="relative max-w-3xl">
              <h2 className="text-3xl font-bold md:text-4xl">
                Need help turning frameworks into board-approved policies?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Request a consultation quote and our MLROs will tailor the engagement to
                your business, jurisdiction, and regulator — ready for sign-off.
              </p>
              <Button asChild size="lg" className="mt-6 bg-accent text-accent-foreground shadow-lg hover:bg-accent/90">
                <Link to="/contact-sales">
                  Request a Consultation Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Advisory;
