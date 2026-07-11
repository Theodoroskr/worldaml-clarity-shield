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
  CardDescription,
} from "@/components/ui/card";
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
  CheckCircle2,
} from "lucide-react";
import AdvisoryConsultationDialog from "@/components/advisory/AdvisoryConsultationDialog";

type Service = {
  slug: string;
  shortLabel: string;
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  overview: string;
  scope: string[];
  deliverables: string[];
  idealFor: string[];
};

const services: Service[] = [
  {
    slug: "ewra",
    shortLabel: "EWRA",
    icon: ShieldCheck,
    title: "Enterprise-Wide Risk Assessment",
    description:
      "Assistance for the development or review of your EWRA — specifically AML-FWRA and Sanctions FWRA — mapped to your business model, geographies, products, delivery channels, and customer segments.",
    overview:
      "Your Enterprise-Wide Risk Assessment is the single most-scrutinised document in any regulator inspection. We build or independently review your AML-FWRA and Sanctions FWRA using a defensible methodology, mapped to the FATF risk factors and your regulator's own guidance.",
    scope: [
      "Inherent risk scoring across customers, products, geographies, and delivery channels",
      "Sanctions exposure assessment (jurisdictional, sectoral, counterparty)",
      "Control effectiveness testing and residual risk calculation",
      "Risk appetite calibration and board-level reporting pack",
    ],
    deliverables: [
      "EWRA methodology document",
      "Populated AML-FWRA and Sanctions FWRA models",
      "Executive summary and board presentation",
    ],
    idealFor: [
      "Newly licensed entities preparing a first EWRA",
      "Regulated firms with an EWRA older than 12 months",
      "Groups needing consolidated + entity-level assessments",
    ],
  },
  {
    slug: "policies",
    shortLabel: "Policies & Procedures",
    icon: FileText,
    title: "Policies & Procedures",
    description:
      "Drafting and updating AML and Sanctions manuals, internal controls, and operating procedures aligned to your regulator's directives and current legislation.",
    overview:
      "We draft and update AML/CFT and Sanctions manuals that are actually usable by your first line — not shelf-ware. Every policy is tied back to the specific regulator directive or statutory clause it satisfies, so gaps are easy to defend and audit.",
    scope: [
      "AML/CFT policy, Sanctions policy, and PEP policy",
      "CDD, EDD, and SDD procedures with risk-based triggers",
      "Transaction monitoring, screening, and SAR/STR procedures",
      "Record-keeping, training, and internal reporting workflows",
    ],
    deliverables: [
      "Full policy suite in Word (edit-ready)",
      "Regulator cross-reference matrix",
      "Change-log summarising updates for the board",
    ],
    idealFor: [
      "Firms undergoing licensing or re-authorisation",
      "Entities expanding into new jurisdictions",
      "Post-inspection remediation programmes",
    ],
  },
  {
    slug: "amlco-reports",
    shortLabel: "AMLCO Reports",
    icon: ClipboardCheck,
    title: "AMLCO Reports",
    description:
      "Drafting or updating the AML and Sanctions Annual Compliance Officer's Report, including findings, remediation actions, KRIs, and board-ready recommendations.",
    overview:
      "The Annual Compliance Officer's Report is the MLRO's formal statement to the board and, indirectly, to the regulator. We prepare a defensible AMLCO Report that reflects real activity, KRIs, incidents, and remediation — not templated boilerplate.",
    scope: [
      "Annual AML and Sanctions activity summary",
      "KRI dashboard: alerts, SARs/STRs, screening hits, EDD cases",
      "Training completion, breaches, and remediation status",
      "Recommendations, budget requests, and forward plan",
    ],
    deliverables: [
      "AMLCO Report ready for MLRO signature",
      "Board-ready presentation deck",
      "Regulator submission version (where required)",
    ],
    idealFor: [
      "MLROs approaching their annual reporting deadline",
      "Firms with a new MLRO taking over the report",
      "Entities needing a defensible KRI baseline",
    ],
  },
  {
    slug: "regulator-questionnaires",
    shortLabel: "Regulator Questionnaires",
    icon: FileSearch,
    title: "AML Questionnaires from Regulators",
    description:
      "Hands-on assistance with the completion of AML questionnaires and information requests issued by regulators, ensuring accurate, consistent, and defensible responses.",
    overview:
      "Regulator questionnaires — annual returns, thematic reviews, ad-hoc information requests — carry real enforcement risk when answered inconsistently. We complete them alongside your MLRO, cross-checking every answer against your EWRA, policies, and operational data.",
    scope: [
      "Reading and interpretation of the regulator's request",
      "Data gathering from onboarding, monitoring, and screening systems",
      "Answer drafting, cross-referencing, and internal review",
      "Evidence pack preparation and submission support",
    ],
    deliverables: [
      "Completed questionnaire in the regulator's required format",
      "Supporting evidence pack and index",
      "Internal Q&A log for future consistency",
    ],
    idealFor: [
      "Annual AML/CFT returns (e.g. MFSA, CySEC, FCA, DFSA)",
      "Thematic reviews and Section 15A / Dear CEO letters",
      "Ad-hoc regulator information requests",
    ],
  },
  {
    slug: "internal-audit",
    shortLabel: "Internal Audit",
    icon: Gavel,
    title: "AML Internal Audit",
    description:
      "Independent AML internal audit of your company — testing the design and operating effectiveness of your AML/CFT and Sanctions framework against regulatory expectations.",
    overview:
      "An independent AML internal audit is a licence condition for most regulated firms. We deliver a third-line review that tests both design and operating effectiveness of your AML/CFT and Sanctions framework, using regulator-aligned testing programmes and risk-weighted sampling.",
    scope: [
      "Governance, risk assessment, and policy design testing",
      "Sample-based testing of CDD/EDD files and monitoring alerts",
      "Sanctions screening and payment filtering walk-throughs",
      "MI, training, and record-keeping effectiveness",
    ],
    deliverables: [
      "Formal Internal Audit report with risk-rated findings",
      "Management action plan with owners and deadlines",
      "Board and Audit Committee presentation",
    ],
    idealFor: [
      "Firms without an in-house internal audit function",
      "Entities needing an independent second opinion",
      "Groups rotating audit providers to preserve independence",
    ],
  },
  {
    slug: "monitoring-visits",
    shortLabel: "Inspection Prep",
    icon: Building2,
    title: "Monitoring Visits — Inspection Preparation",
    description:
      "Preparation of all relevant documentation, evidence, and staff briefings ahead of regulator monitoring visits, on-site inspections, and thematic reviews.",
    overview:
      "When the regulator confirms an on-site visit, you typically have 2–6 weeks. We run a structured preparation programme so your MLRO, first line, and senior management arrive on the day with a coherent story and a complete evidence pack.",
    scope: [
      "Gap analysis against the regulator's likely inspection scope",
      "Documentation pack assembly (EWRA, policies, MI, board minutes)",
      "Mock interviews with MLRO, SMF/PMLCO, and first-line staff",
      "On-the-day support and post-inspection response handling",
    ],
    deliverables: [
      "Inspection readiness assessment report",
      "Fully indexed evidence pack",
      "Interview briefing notes for each participant",
    ],
    idealFor: [
      "Firms with a confirmed inspection date",
      "Entities preparing for a first regulator visit",
      "Post-inspection remediation and follow-up responses",
    ],
  },
  {
    slug: "mlro-support",
    shortLabel: "MLRO / VMLRO",
    icon: Users,
    title: "MLRO & VMLRO Support",
    description:
      "MLRO advisory for client reviews, transaction monitoring, Source of Funds and Source of Wealth, and all AML policies based on regulator directives and legislation. Includes outsourced VMLRO (Virtual MLRO) services.",
    overview:
      "Ongoing MLRO advisory and outsourced Virtual MLRO (VMLRO) cover for firms that need senior compliance judgement without a full-time hire. We integrate with your team on client reviews, complex EDD, transaction monitoring escalations, and SoF/SoW decisions.",
    scope: [
      "High-risk client reviews and EDD sign-off",
      "Transaction monitoring escalations and case decisions",
      "Source of Funds and Source of Wealth assessment",
      "Ongoing policy interpretation and regulator liaison",
    ],
    deliverables: [
      "Named MLRO or VMLRO with regulator-recognised credentials",
      "Documented decision logs for every escalated case",
      "Monthly MI pack and quarterly board update",
    ],
    idealFor: [
      "Small and mid-sized regulated firms",
      "Entities between MLRO hires (interim cover)",
      "Groups needing an independent second-opinion MLRO",
    ],
  },
];

const Advisory = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultService, setDefaultService] = useState<string | undefined>();

  const openWith = (svc?: string) => {
    setDefaultService(svc);
    setDialogOpen(true);
  };

  const scrollToService = (slug: string) => {
    const el = document.getElementById(`service-${slug}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
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
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
                  onClick={() => openWith()}
                >
                  Request a Consultation Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky sub-nav */}
        <div className="sticky top-16 z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="container mx-auto px-4">
            <nav
              aria-label="Advisory services"
              className="flex gap-1 overflow-x-auto py-3 text-sm"
            >
              {services.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => scrollToService(s.slug)}
                  className="whitespace-nowrap rounded-full border border-transparent px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:border-teal-light/40 hover:bg-teal-light/10 hover:text-teal-light"
                >
                  {s.shortLabel}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Services overview cards */}
        <section className="container mx-auto px-4 py-16 md:py-20">
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
                  key={s.slug}
                  className="flex flex-col border-border/60 bg-card/60 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl"
                >
                  <CardHeader>
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-teal-light/40 bg-teal-light/10 text-teal-light">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {s.description}
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => scrollToService(s.slug)}
                        className="text-sm font-medium text-teal-light hover:text-teal-light/80"
                      >
                        View details
                        <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                      </button>
                      <span className="text-muted-foreground/40">•</span>
                      <button
                        onClick={() => openWith(s.title)}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                      >
                        Request quote
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Detailed per-service sections */}
        <section className="border-t border-border/50 bg-muted/10">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Service details</h2>
              <p className="mt-3 text-muted-foreground">
                Full scope, deliverables, and typical use-cases for each engagement.
              </p>
            </div>

            <div className="mx-auto max-w-5xl space-y-8">
              {services.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <article
                    key={s.slug}
                    id={`service-${s.slug}`}
                    className="scroll-mt-28 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm md:p-10"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-teal-light/40 bg-teal-light/10 text-teal-light">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-teal-light">
                          {String(idx + 1).padStart(2, "0")} · {s.shortLabel}
                        </div>
                        <h3 className="mt-1 text-2xl font-bold md:text-3xl">
                          {s.title}
                        </h3>
                        <p className="mt-4 text-muted-foreground">{s.overview}</p>

                        <div className="mt-8 grid gap-6 md:grid-cols-3">
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              What's in scope
                            </div>
                            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                              {s.scope.map((item) => (
                                <li key={item} className="flex gap-2">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-light" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              Deliverables
                            </div>
                            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                              {s.deliverables.map((item) => (
                                <li key={item} className="flex gap-2">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-light" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              Ideal for
                            </div>
                            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                              {s.idealFor.map((item) => (
                                <li key={item} className="flex gap-2">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-light" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                          <Button
                            onClick={() => openWith(s.title)}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                          >
                            Request quote for {s.shortLabel}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          {s.slug === "ewra" && (
                            <Button asChild variant="outline">
                              <Link to="/advisory/ewra">
                                Full EWRA page
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {idx < services.length - 1 && (
                            <Button
                              variant="ghost"
                              onClick={() => scrollToService(services[idx + 1].slug)}
                            >
                              Next: {services[idx + 1].shortLabel}
                            </Button>
                          )}
                        </div>

                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
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
                  <div
                    key={s.step}
                    className="rounded-lg border border-border/60 bg-card/60 p-6"
                  >
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
              <Button
                size="lg"
                className="mt-6 bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
                onClick={() => openWith()}
              >
                Request a Consultation Quote
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
          onClick={() => openWith()}
          className="group gap-2 rounded-full bg-accent px-5 py-6 text-accent-foreground shadow-2xl ring-1 ring-accent/40 hover:bg-accent/90"
        >
          <MessageSquarePlus className="h-5 w-5" />
          <span className="hidden sm:inline">Request a Consultation Quote</span>
          <span className="sm:hidden">Consultation Quote</span>
        </Button>
      </div>

      <AdvisoryConsultationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultService={defaultService}
      />

      <Footer />
    </div>
  );
};

export default Advisory;
