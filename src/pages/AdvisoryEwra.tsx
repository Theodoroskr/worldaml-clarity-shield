import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Target,
  FileText,
  CalendarClock,
  Layers,
  Building2,
  Globe2,
  Users,
  Sparkles,
  MessageSquarePlus,
} from "lucide-react";
import AdvisoryConsultationDialog from "@/components/advisory/AdvisoryConsultationDialog";

const scopePillars = [
  {
    icon: Building2,
    title: "AML-FWRA (Financial Crime)",
    body: "Firm-wide assessment of ML/TF and wider financial-crime risk across customers, products, channels, and geographies — aligned to FATF risk factors and your regulator's guidance.",
  },
  {
    icon: Globe2,
    title: "Sanctions FWRA",
    body: "Standalone Sanctions risk assessment covering UN, EU, OFAC, UK OFSI, and local regime exposure — sectoral, jurisdictional, and counterparty risk.",
  },
  {
    icon: Layers,
    title: "Control Environment",
    body: "Design and operating-effectiveness rating of your key controls (onboarding, screening, monitoring, EDD, escalation) with a defensible residual-risk conclusion.",
  },
  {
    icon: Users,
    title: "Governance & Reporting",
    body: "Risk appetite calibration, board-level dashboards, and integration with your EWRA policy, AMLCO Report, and Internal Audit plan.",
  },
];

const inScope = [
  "Inherent risk scoring — customers, products, delivery channels, geographies, counterparties",
  "Sanctions exposure model — jurisdictional, sectoral, ownership, and payment-flow risk",
  "Threat and typology library mapped to your business lines",
  "Control inventory and design-effectiveness assessment",
  "Operating-effectiveness testing sample (targeted, risk-based)",
  "Residual risk calculation and heat-map by risk category",
  "Gap register with prioritised remediation actions and owners",
  "Board-ready executive summary and presentation deck",
];

const outOfScope = [
  "Full third-line internal audit (delivered separately)",
  "Ongoing MLRO / VMLRO cover (separate engagement)",
  "Technology implementation of screening or monitoring tools",
];

const deliverables = [
  {
    title: "EWRA Methodology Document",
    body: "Documented, regulator-defensible methodology explaining scoring, weighting, thresholds, and refresh cadence.",
  },
  {
    title: "Populated AML-FWRA Model",
    body: "Working Excel/Sheets model with inherent risk, control ratings, and residual risk across all risk categories.",
  },
  {
    title: "Populated Sanctions FWRA Model",
    body: "Standalone Sanctions risk model covering jurisdiction, sector, ownership, and payment-flow exposure.",
  },
  {
    title: "EWRA Report",
    body: "Written report with executive summary, methodology, findings, heat-maps, and prioritised recommendations.",
  },
  {
    title: "Board Presentation Pack",
    body: "Slide deck for board or Risk Committee sign-off, plus talking notes for the MLRO.",
  },
  {
    title: "Remediation Roadmap",
    body: "Action register with owners, target dates, and residual-risk impact — feeds directly into your Compliance Plan.",
  },
];

const timeline = [
  {
    week: "Week 1",
    title: "Kick-off & data request",
    body: "Scoping workshop, stakeholder map, and structured data request (customers, products, jurisdictions, incidents, MI).",
  },
  {
    week: "Weeks 2–3",
    title: "Inherent risk modelling",
    body: "Build AML-FWRA and Sanctions FWRA models. Interviews with first line, MLRO, and business heads.",
  },
  {
    week: "Weeks 3–4",
    title: "Control assessment",
    body: "Design-effectiveness review of key controls plus targeted operating-effectiveness sampling.",
  },
  {
    week: "Week 5",
    title: "Draft report & workshop",
    body: "Deliver draft EWRA and residual-risk conclusions. Working session with MLRO and senior management.",
  },
  {
    week: "Week 6",
    title: "Final report & board pack",
    body: "Incorporate feedback, finalise methodology and models, deliver board pack for sign-off.",
  },
];

const engagementOptions = [
  {
    title: "New EWRA build",
    duration: "5–7 weeks",
    body: "Full methodology, AML-FWRA and Sanctions FWRA models, report, and board pack from scratch.",
  },
  {
    title: "Independent EWRA review",
    duration: "3–4 weeks",
    body: "Independent review and challenge of your existing EWRA — methodology, scoring, and defensibility.",
  },
  {
    title: "Annual refresh",
    duration: "2–3 weeks",
    body: "Refresh of an existing EWRA using updated data, incidents, and regulatory changes.",
  },
];

const EwraAdvisory = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const SERVICE = "Enterprise-Wide Risk Assessment";

  const open = () => setDialogOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="EWRA Advisory — AML-FWRA & Sanctions FWRA | WorldAML"
        description="Regulator-ready Enterprise-Wide Risk Assessment: AML-FWRA and Sanctions FWRA methodology, models, report, and board pack — typically delivered in 5–7 weeks."
        canonical="/advisory/ewra"
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/60 via-primary/30 to-accent/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.25),transparent_60%)]" />
          <div className="container relative mx-auto px-4 py-16 md:py-24">
            <Link
              to="/advisory"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Advisory
            </Link>
            <div className="mt-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-light/40 bg-teal-light/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-light">
                <Sparkles className="h-3.5 w-3.5" />
                WorldAML Advisory · EWRA
              </div>
              <h1 className="mt-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                Enterprise-Wide Risk Assessment
              </h1>
              <p className="mt-4 text-lg font-medium text-teal-light md:text-xl">
                AML-FWRA and Sanctions FWRA, built to withstand regulator scrutiny.
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Your EWRA is the single most-scrutinised document in any AML inspection.
                We build or independently review your firm-wide AML and Sanctions risk
                assessment using a defensible methodology aligned to FATF and your
                regulator's own guidance.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
                  onClick={open}
                >
                  Request an EWRA Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/templates">Browse EWRA Templates</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Typical duration", value: "5–7 weeks" },
                  { label: "Coverage", value: "AML + Sanctions" },
                  { label: "Output", value: "Board-ready pack" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-border/60 bg-card/50 px-4 py-3"
                  >
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="mt-1 text-lg font-semibold">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">What the EWRA covers</h2>
            <p className="mt-3 text-muted-foreground">
              Two connected assessments — AML-FWRA and Sanctions FWRA — plus your
              control environment and governance layer.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {scopePillars.map((p) => {
              const Icon = p.icon;
              return (
                <Card
                  key={p.title}
                  className="border-border/60 bg-card/60 transition-all hover:border-accent/50 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-teal-light/40 bg-teal-light/10 text-teal-light">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Scope */}
        <section className="border-y border-border/50 bg-muted/10">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-teal-light" />
                <h2 className="text-3xl font-bold md:text-4xl">Scope of work</h2>
              </div>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Every EWRA engagement is fixed-scope. Below is the standard scope for a
                new build; independent reviews and annual refreshes are tailored.
              </p>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-card/60 p-6">
                  <h3 className="text-lg font-semibold">In scope</h3>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {inScope.map((i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-light" />
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/40 p-6">
                  <h3 className="text-lg font-semibold">Out of scope (separate engagements)</h3>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {outOfScope.map((i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-0.5 text-muted-foreground/50">—</span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deliverables */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-teal-light" />
              <h2 className="text-3xl font-bold md:text-4xl">Deliverables</h2>
            </div>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              You receive a complete, editable pack — nothing black-box. Every artefact
              is yours to update in-house at the next refresh.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {deliverables.map((d) => (
                <div
                  key={d.title}
                  className="rounded-xl border border-border/60 bg-card/60 p-5"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-teal-light" />
                    <div>
                      <div className="font-semibold">{d.title}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{d.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="border-y border-border/50 bg-muted/10">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-3">
                <CalendarClock className="h-6 w-6 text-teal-light" />
                <h2 className="text-3xl font-bold md:text-4xl">Expected timeline</h2>
              </div>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                A new EWRA typically runs 5–7 weeks from kick-off to board sign-off,
                assuming timely data provision from your team.
              </p>

              <ol className="mt-10 relative border-l border-teal-light/30 pl-6 md:pl-8">
                {timeline.map((t) => (
                  <li key={t.week} className="mb-8 last:mb-0">
                    <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full border border-teal-light/60 bg-background">
                      <span className="h-2 w-2 rounded-full bg-teal-light" />
                    </span>
                    <div className="text-xs font-semibold uppercase tracking-wider text-teal-light">
                      {t.week}
                    </div>
                    <div className="mt-1 text-lg font-semibold">{t.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground md:max-w-3xl">
                      {t.body}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {engagementOptions.map((o) => (
                  <div
                    key={o.title}
                    className="rounded-xl border border-border/60 bg-card/60 p-5"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-teal-light">
                      {o.duration}
                    </div>
                    <div className="mt-1 text-lg font-semibold">{o.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{o.body}</p>
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
              <div className="flex items-center gap-2 text-teal-light">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  EWRA engagement
                </span>
              </div>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Ready to build or refresh your EWRA?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Request a consultation quote and our MLROs will scope an AML-FWRA and
                Sanctions FWRA engagement tailored to your regulator, business model,
                and timeline.
              </p>
              <Button
                size="lg"
                className="mt-6 bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
                onClick={open}
              >
                Request an EWRA Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Persistent floating CTA */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <Button
          size="lg"
          onClick={open}
          className="group gap-2 rounded-full bg-accent px-5 py-6 text-accent-foreground shadow-2xl ring-1 ring-accent/40 hover:bg-accent/90"
        >
          <MessageSquarePlus className="h-5 w-5" />
          <span className="hidden sm:inline">Request an EWRA Quote</span>
          <span className="sm:hidden">EWRA Quote</span>
        </Button>
      </div>

      <AdvisoryConsultationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultService={SERVICE}
      />

      <Footer />
    </div>
  );
};

export default EwraAdvisory;
