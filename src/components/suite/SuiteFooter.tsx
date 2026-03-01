import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Search,
  FileText,
  ShieldCheck,
  ClipboardList,
  Database,
  Lock,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Product map ───────────────────────────────────────────────────────────────

const suiteProducts = [
  {
    id: "worldkycsearch",
    name: "WorldKYC Search",
    domain: "worldkycsearch.com",
    icon: <Search className="w-4 h-4" />,
    color: "hsl(222 47% 40%)",
    bestFor: [
      "Compliance analysts doing manual checks",
      "Single-entity PEP & sanctions lookups",
      "Quick pre-onboarding screening",
      "Audit trail without an engineering team",
    ],
  },
  {
    id: "worldaml",
    name: "WorldAML API",
    domain: "worldaml.com",
    icon: <Zap className="w-4 h-4" />,
    color: "hsl(184 40% 40%)",
    bestFor: [
      "Developers embedding AML into products",
      "High-volume automated batch screening",
      "Real-time onboarding risk decisioning",
      "Webhook-driven monitoring pipelines",
    ],
  },
  {
    id: "duediligenceworld",
    name: "Due Diligence World",
    domain: "duediligenceworld.com",
    icon: <FileText className="w-4 h-4" />,
    color: "hsl(260 40% 45%)",
    bestFor: [
      "High-risk or complex entity screening",
      "Correspondent banking EDD reports",
      "Regulatory-grade documentation packages",
      "Board-level or legal review requests",
    ],
  },
];

const trustItems = [
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    label: "GDPR-ready",
    detail: "Data residency controls & DPA available",
  },
  {
    icon: <ClipboardList className="w-4 h-4" />,
    label: "Full audit logs",
    detail: "Tamper-evident, exportable per entity",
  },
  {
    icon: <Database className="w-4 h-4" />,
    label: "Data provenance",
    detail: "Every record traced to source & timestamp",
  },
  {
    icon: <Lock className="w-4 h-4" />,
    label: "ISO 27001 certified",
    detail: "Annual third-party security audit",
  },
];

// ─── Quiz ──────────────────────────────────────────────────────────────────────

type QuizStep = "role" | "volume" | "depth" | "result";

interface QuizState {
  role: string;
  volume: string;
  depth: string;
}

function getRecommendation(state: Partial<QuizState>): (typeof suiteProducts)[0] {
  if (state.depth === "edd") return suiteProducts[2];
  if (state.volume === "high" || state.role === "developer") return suiteProducts[1];
  return suiteProducts[0];
}

function QuizModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<QuizStep>("role");
  const [answers, setAnswers] = useState<Partial<QuizState>>({});

  const pick = (key: keyof QuizState, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (key === "role") setStep("volume");
    else if (key === "volume") setStep("depth");
    else if (key === "depth") setStep("result");
  };

  const recommendation = getRecommendation(answers);

  const OptionBtn = ({
    label,
    sub,
    onClick,
  }: {
    label: string;
    sub?: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 rounded-xl border border-[hsl(215_20%_90%)] hover:border-[hsl(184_40%_40%)] hover:bg-[hsl(184_40%_40%)]/5 transition-colors group"
    >
      <p className="text-[13px] font-semibold text-[hsl(222_47%_11%)] group-hover:text-[hsl(184_40%_40%)]">
        {label}
      </p>
      {sub && <p className="text-[12px] text-[hsl(215_20%_50%)] mt-0.5">{sub}</p>}
    </button>
  );

  return (
    <div className="space-y-4">
      {step === "role" && (
        <>
          <p className="text-[13px] text-[hsl(215_20%_45%)] mb-4">
            What best describes your role?
          </p>
          <div className="space-y-2">
            <OptionBtn label="Compliance analyst / officer" sub="I review cases and document decisions" onClick={() => pick("role", "compliance")} />
            <OptionBtn label="Developer / engineer" sub="I build products or integrate systems" onClick={() => pick("role", "developer")} />
            <OptionBtn label="Legal / risk counsel" sub="I need documentation for regulatory files" onClick={() => pick("role", "legal")} />
          </div>
        </>
      )}

      {step === "volume" && (
        <>
          <p className="text-[13px] text-[hsl(215_20%_45%)] mb-4">
            How many screenings do you expect per month?
          </p>
          <div className="space-y-2">
            <OptionBtn label="Under 500" sub="Ad-hoc or small team usage" onClick={() => pick("volume", "low")} />
            <OptionBtn label="500 – 10,000" sub="Regular pipeline or mid-size team" onClick={() => pick("volume", "mid")} />
            <OptionBtn label="10,000+" sub="High-volume batch or API-driven" onClick={() => pick("volume", "high")} />
          </div>
        </>
      )}

      {step === "depth" && (
        <>
          <p className="text-[13px] text-[hsl(215_20%_45%)] mb-4">
            What level of detail do you need?
          </p>
          <div className="space-y-2">
            <OptionBtn label="Pass/fail with evidence" sub="Structured result with source citation" onClick={() => pick("depth", "standard")} />
            <OptionBtn label="Analyst-written EDD report" sub="Full background, narrative, regulatory note" onClick={() => pick("depth", "edd")} />
            <OptionBtn label="Just the risk score" sub="Integrate into my own decisioning" onClick={() => pick("depth", "score")} />
          </div>
        </>
      )}

      {step === "result" && (
        <div className="space-y-4">
          <div
            className="rounded-xl p-5 border"
            style={{
              borderColor: recommendation.color.replace("hsl(", "hsl(").replace(")", " / 0.25)"),
              background: recommendation.color.replace("hsl(", "hsl(").replace(")", " / 0.04)"),
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                style={{ background: recommendation.color }}
              >
                {recommendation.icon}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[hsl(222_47%_11%)]">
                  We recommend
                </p>
                <p className="text-[15px] font-bold text-[hsl(222_47%_11%)]">
                  {recommendation.name}
                </p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {recommendation.bestFor.slice(0, 3).map((b) => (
                <li key={b} className="flex items-start gap-2 text-[12px] text-[hsl(215_20%_40%)]">
                  <span className="mt-1 w-1 h-1 rounded-full bg-[hsl(184_40%_40%)] flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Button size="sm" className="w-full text-[13px] gap-1.5" asChild>
              <a href={`https://${recommendation.domain}`} target="_blank" rel="noopener noreferrer">
                Go to {recommendation.name} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
          <button
            onClick={() => { setStep("role"); setAnswers({}); }}
            className="w-full text-center text-[12px] text-[hsl(215_20%_50%)] hover:text-[hsl(222_47%_11%)] transition-colors"
          >
            ← Start over
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Footer Component ─────────────────────────────────────────────────────────

export const SuiteFooter = () => {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-[hsl(215_20%_90%)] bg-[hsl(215_20%_98%)]">
        {/* ── Product map ── */}
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(215_20%_50%)]">
              WorldAML Suite
            </p>
            <p className="text-[13px] text-[hsl(215_20%_45%)] mt-1">
              Three products. One platform. One login.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {suiteProducts.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[hsl(215_20%_90%)] bg-white p-5 space-y-4"
              >
                {/* Product header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: p.color }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[hsl(222_47%_11%)]">{p.name}</p>
                    <p className="text-[11px] font-mono text-[hsl(215_20%_55%)]">{p.domain}</p>
                  </div>
                </div>

                {/* Best for */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(215_20%_55%)] mb-2">
                    Best for
                  </p>
                  <ul className="space-y-1.5">
                    {p.bestFor.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-[12px] text-[hsl(215_20%_40%)] leading-relaxed"
                      >
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: p.color }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`https://${p.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] font-medium transition-colors"
                  style={{ color: p.color }}
                >
                  Go to {p.name.split(" ").pop()} <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>

          {/* ── Trust row ── */}
          <div className="border-t border-[hsl(215_20%_90%)] pt-8 mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(215_20%_50%)] mb-5">
              Built for regulated environments
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustItems.map((t) => (
                <div key={t.label} className="flex items-start gap-3">
                  <div className="mt-0.5 text-[hsl(184_40%_40%)] flex-shrink-0">{t.icon}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-[hsl(222_47%_11%)]">{t.label}</p>
                    <p className="text-[12px] text-[hsl(215_20%_50%)] leading-relaxed mt-0.5">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA row ── */}
          <div className="border-t border-[hsl(215_20%_90%)] pt-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-[hsl(222_47%_11%)]">
                  Not sure which product you need?
                </p>
                <p className="text-[13px] text-[hsl(215_20%_45%)] mt-0.5">
                  Answer 3 quick questions and we'll point you to the right fit.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuizOpen(true)}
                className="text-[13px] gap-2 flex-shrink-0 border-[hsl(222_47%_11%)] text-[hsl(222_47%_11%)] hover:bg-[hsl(222_47%_11%)] hover:text-white"
              >
                Find my product
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Legal bar ── */}
        <div className="border-t border-[hsl(215_20%_90%)] bg-[hsl(215_20%_96%)]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-[11px] text-[hsl(215_20%_55%)]">
              © {new Date().getFullYear()} WorldAML. Operated by Infocredit Group Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-5 flex-wrap justify-center">
              {[
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
                { href: "/cookies", label: "Cookies" },
                { href: "/contact-sales", label: "Contact" },
              ].map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-[11px] text-[hsl(215_20%_55%)] hover:text-[hsl(222_47%_11%)] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Product finder quiz modal ── */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(215_20%_92%)]">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-[15px] font-semibold text-[hsl(222_47%_11%)]">
                  Find your product
                </DialogTitle>
                <p className="text-[12px] text-[hsl(215_20%_50%)] mt-1">
                  3 questions · takes 30 seconds
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-5">
            <QuizModal onClose={() => setQuizOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuiteFooter;
