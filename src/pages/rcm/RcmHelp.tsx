import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LayoutDashboard, BookOpen, ListChecks, ShieldCheck, ClipboardCheck,
  Bell, FolderArchive, FileBarChart, Languages, History, Settings,
  HelpCircle, Workflow, LifeBuoy, Search,
} from "lucide-react";

type Section = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  summary: string;
  steps: string[];
  tips?: string[];
};

const SECTIONS: Section[] = [
  {
    id: "getting-started",
    icon: Workflow,
    title: "Getting started with RCM",
    summary:
      "Regulatory Compliance Management (RCM) helps you capture every rule that applies to your business, map it to internal controls, assess risk, assign tasks, attach evidence, and produce audit-ready reports.",
    steps: [
      "Open RCM from the WorldAML Suite sidebar or the dashboard quick-link.",
      "Confirm or join your organisation when prompted on the RCM dashboard.",
      "Build out the Library by adding the regulators and frameworks that apply to you.",
      "Break each regulation down into Obligations, then map Controls and run an Assessment.",
      "Use Tasks to assign remediation, attach Evidence, and export Reports for your regulator or board.",
    ],
    tips: [
      "Start with one regulator end-to-end before scaling to the full library — it makes the workflow click.",
      "Everything is scoped to your organisation: only members of your org can see your data.",
    ],
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    summary:
      "The dashboard gives you a real-time overview of compliance posture: total regulations, open obligations, gaps, overdue items, high-risk areas, and an overall score.",
    steps: [
      "Open /rcm to land on the dashboard.",
      "Review the headline KPIs at the top — they refresh from your live obligations.",
      "Use the stacked bar to see the split of compliant / partial / non-compliant items.",
      "Click any KPI tile to drill into the underlying obligations list.",
    ],
    tips: ["The compliance score is weighted by risk level — a single high-risk gap moves the needle more than several low-risk ones."],
  },
  {
    id: "library",
    icon: BookOpen,
    title: "Library",
    summary:
      "The Library is your master catalogue of regulators, laws, directives and internal frameworks that apply to your business.",
    steps: [
      "Go to RCM → Library.",
      "Click ‘Add regulation’ and fill in name, jurisdiction, regulator, effective date and source URL.",
      "Tag each entry with the business lines it applies to (e.g. payments, crypto, gaming).",
      "Use the search and jurisdiction filters to find entries quickly.",
    ],
    tips: ["Keep entries narrow — one law per record. Sub-articles belong in Obligations."],
  },
  {
    id: "obligations",
    icon: ListChecks,
    title: "Obligations",
    summary:
      "Obligations are the concrete requirements derived from a regulation (e.g. ‘File SAR within 15 days’). Each obligation carries a deadline, owner, risk level and compliance status.",
    steps: [
      "Open RCM → Obligations.",
      "Click ‘New obligation’, link it to a regulation from the Library, and write a short, testable requirement.",
      "Set the owner, deadline, risk level (low/medium/high/critical) and current status.",
      "Link the controls that satisfy this obligation so coverage is visible.",
    ],
    tips: [
      "Write obligations as something you can prove — ‘Train staff annually’ is testable, ‘Be compliant with X’ is not.",
      "Status flows: open → partial → compliant. Use ‘non-compliant’ to surface real gaps.",
    ],
  },
  {
    id: "controls",
    icon: ShieldCheck,
    title: "Controls",
    summary:
      "Controls are the policies, procedures or system checks you operate to meet obligations. One control can cover many obligations.",
    steps: [
      "Open RCM → Controls.",
      "Add a control with a clear name, description, owner and testing frequency.",
      "Link it to one or more obligations.",
      "Mark it as preventive, detective or corrective.",
    ],
    tips: ["Avoid one-control-per-obligation sprawl — reuse controls wherever the operating procedure is the same."],
  },
  {
    id: "assessments",
    icon: ClipboardCheck,
    title: "Assessments",
    summary:
      "Assessments are point-in-time reviews of how well your controls are operating against your obligations.",
    steps: [
      "Open RCM → Assessments and click ‘Start assessment’.",
      "Choose scope: a regulator, a framework, or the full library.",
      "Walk through each obligation and rate the control as effective / partial / ineffective; add notes and evidence.",
      "Submit to lock the assessment — results feed the dashboard and reports.",
    ],
    tips: ["Run a light quarterly assessment and a deep annual one — the system stores history so trends show up automatically."],
  },
  {
    id: "tasks",
    icon: Bell,
    title: "Tasks",
    summary:
      "Tasks turn gaps and remediation actions into trackable work with owners, due dates and status.",
    steps: [
      "Tasks can be created manually or auto-generated when an assessment flags a gap.",
      "Open RCM → Tasks, assign an owner and due date, link the related obligation or control.",
      "Owners receive in-app notifications; status moves through todo → in progress → done.",
      "Closed tasks remain searchable as part of the audit trail.",
    ],
  },
  {
    id: "evidence",
    icon: FolderArchive,
    title: "Evidence",
    summary:
      "Evidence is the proof — documents, screenshots, exports, sign-offs — attached to obligations, controls, assessments and tasks.",
    steps: [
      "Open the obligation, control, assessment or task you want to document.",
      "Click ‘Attach evidence’ and upload the file or paste a link.",
      "Add a short description and the date the evidence was produced.",
      "Use RCM → Evidence to browse everything centrally and search by tag.",
    ],
    tips: ["Name files predictably (e.g. 2026-Q1-AML-training-attendance.pdf) — your future self and your auditor will thank you."],
  },
  {
    id: "reports",
    icon: FileBarChart,
    title: "Reports",
    summary:
      "Reports turn the live data into shareable artefacts: regulator filings, board packs, internal audit reports.",
    steps: [
      "Open RCM → Reports.",
      "Pick a template (e.g. Compliance Posture, Gap Register, Assessment Summary).",
      "Choose the period and scope (regulator / framework / business line).",
      "Generate, preview, then export to PDF or download the data as CSV.",
    ],
  },
  {
    id: "translations",
    icon: Languages,
    title: "Translations",
    summary:
      "Translations let you store multilingual versions of regulations and obligations so local teams work in their own language.",
    steps: [
      "Open the regulation or obligation you want to translate.",
      "Go to RCM → Translations and add a new language version.",
      "Use the language switcher in the header to read the workspace in the chosen language.",
    ],
  },
  {
    id: "audit",
    icon: History,
    title: "Audit log",
    summary:
      "The audit log is an immutable timeline of every change made in RCM — who, what, when.",
    steps: [
      "Open RCM → Audit.",
      "Filter by user, entity type or date range.",
      "Click any entry to see the before/after state.",
    ],
    tips: ["The audit log cannot be edited or deleted — it is your defence in a regulator inspection."],
  },
  {
    id: "settings",
    icon: Settings,
    title: "Settings",
    summary:
      "Settings is where you manage your organisation, team members, roles, default risk weighting and integrations.",
    steps: [
      "Open RCM → Settings.",
      "Invite teammates by email and assign roles (admin / editor / viewer).",
      "Adjust risk weights if your model differs from the defaults.",
      "Configure notification preferences for tasks and deadlines.",
    ],
  },
  {
    id: "faq",
    icon: HelpCircle,
    title: "FAQ",
    summary: "Quick answers to the most common questions.",
    steps: [
      "Q: Is my RCM data shared across organisations? A: No — every record is scoped by organisation_id and protected by row-level security.",
      "Q: Can I import regulations in bulk? A: Yes, use the CSV importer in Library (admins only).",
      "Q: How do I get back to the WorldAML Suite? A: Use the ‘Back to Suite’ link at the top of the RCM sidebar.",
      "Q: Who can see the Audit log? A: All organisation members can view; nobody can edit it.",
    ],
  },
];

export default function RcmHelp() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter(s =>
      [s.title, s.summary, ...s.steps, ...(s.tips || [])]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2 text-accent">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">RCM Help & Process Guide</h1>
            <p className="text-sm text-muted-foreground">
              Step-by-step guidance for every module in Regulatory Compliance Management.
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help (e.g. evidence, assessment, audit)…"
            className="pl-9"
          />
        </div>
      </header>

      {/* Quick nav */}
      <Card className="p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Jump to
        </p>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.title}
            </a>
          ))}
        </div>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {filtered.map((s) => (
          <Card key={s.id} id={s.id} className="p-5 scroll-mt-20">
            <div className="mb-3 flex items-start gap-3">
              <div className="rounded-md bg-accent/10 p-2 text-accent">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
              </div>
            </div>

            <Accordion type="multiple" defaultValue={[`${s.id}-steps`]}>
              <AccordionItem value={`${s.id}-steps`}>
                <AccordionTrigger className="text-sm">How to use it</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal space-y-1.5 pl-5 text-sm text-foreground/90">
                    {s.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
              {s.tips && s.tips.length > 0 && (
                <AccordionItem value={`${s.id}-tips`}>
                  <AccordionTrigger className="text-sm">Tips & best practice</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
                      {s.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No help topics match “{query}”. Try a different keyword.
          </Card>
        )}
      </div>
    </div>
  );
}
