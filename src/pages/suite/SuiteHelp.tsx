import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileText, AlertTriangle, Shield, Scale, Flag, Download,
  ChevronDown, ChevronRight, Search, BookOpen, MapPin, Gavel,
} from "lucide-react";

interface HelpSection {
  id: string;
  icon: React.ElementType;
  title: string;
  items: { q: string; a: string }[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: "sar-overview",
    icon: FileText,
    title: "SAR / STR Filing — Overview",
    items: [
      {
        q: "What is a SAR vs. an STR?",
        a: "A **Suspicious Activity Report (SAR)** is the US filing required by FinCEN under the Bank Secrecy Act (BSA). A **Suspicious Transaction Report (STR)** is the Canadian equivalent filed with FINTRAC under the Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA). Both serve the same purpose: notifying regulators of potentially suspicious financial activity.",
      },
      {
        q: "What report types does the Suite support?",
        a: "The Suite supports three FINTRAC report types and one FinCEN report type:\n\n• **FinCEN SAR** — US Suspicious Activity Report\n• **FINTRAC STR** — Suspicious Transaction Report (within 3 business days)\n• **FINTRAC LCTR** — Large Cash Transaction Report (≥ CAD 10,000, within 15 calendar days)\n• **FINTRAC EFTR** — Electronic Funds Transfer Report (≥ CAD 10,000, within 15 calendar days)",
      },
      {
        q: "What are the filing deadlines?",
        a: "• **FinCEN SAR**: Within 30 calendar days of initial detection; may extend to 60 days if no suspect is identified.\n• **FINTRAC STR**: Within 3 business days of the determination that reasonable grounds to suspect exist.\n• **FINTRAC LCTR / EFTR**: Within 15 calendar days of the transaction.",
      },
    ],
  },
  {
    id: "case-workflow",
    icon: Gavel,
    title: "Case Workflow & Filing Process",
    items: [
      {
        q: "How does the case lifecycle work?",
        a: "Cases follow a 5-stage lifecycle:\n\n1. **Open** — A case is created, optionally linked to an alert.\n2. **Investigating** — The compliance officer reviews evidence and adds investigation notes.\n3. **SAR Filed** (FinCEN) — The case is marked as having a US SAR filed.\n4. **STR Filed** (FINTRAC) — The case is marked as having a Canadian STR filed.\n5. **Closed** — Investigation is complete; resolution is recorded.\n\nYou can move between stages using the action buttons in the case detail view.",
      },
      {
        q: "How do I file a SAR (FinCEN)?",
        a: "1. Open a case and move it to **Investigating** status.\n2. Add investigation notes documenting the grounds for suspicion.\n3. Click **File SAR (FinCEN)** to change the status to SAR Filed.\n4. Click **SAR PDF** to download a formatted SAR document with all case details, customer info, and investigation notes.\n5. Submit the generated PDF to FinCEN via their BSA E-Filing system.",
      },
      {
        q: "How do I file a STR (FINTRAC)?",
        a: "1. Open a case and move it to **Investigating** status.\n2. Add investigation notes with grounds for suspicion per PCMLTFA s.7.\n3. Click **File STR (FINTRAC)** to change the status.\n4. Click **FINTRAC Report** to open the report type selector.\n5. Choose between **STR**, **LCTR**, or **EFTR** depending on the report type.\n6. Click **Export [type] PDF** to download the FINTRAC-formatted report.\n7. Submit via FINTRAC's F2R (FINTRAC to Reporting) system.",
      },
      {
        q: "What is included in the FINTRAC PDF?",
        a: "The FINTRAC report PDF includes six parts:\n\n• **Part A** — Report Identification (reference, entity, CAMLO, deadlines)\n• **Part B** — Subject Information (individual/entity details, risk classification)\n• **Part C** — Transaction Details (table of linked transactions with amounts, currencies, counterparties)\n• **Part D** — Grounds for Suspicion (checklist of FINTRAC indicators)\n• **Part E** — Investigation Narrative (all case notes)\n• **Part F** — CAMLO Declaration (PCMLTFA s.7 compliance declaration with signature lines)",
      },
      {
        q: "Can I export both SAR and STR for the same case?",
        a: "Yes. If a case involves both US and Canadian obligations, you can file both. The case status will reflect the most recent filing action, but you can export either PDF at any time once the case has been filed or closed.",
      },
    ],
  },
  {
    id: "alert-rules",
    icon: Scale,
    title: "Alert Rules Configuration",
    items: [
      {
        q: "How do alert rules work?",
        a: "Alert rules define conditions that trigger monitoring alerts when transactions are evaluated. Each rule has:\n\n• **Name** — A descriptive identifier (e.g., \"[TALKA-LCTR] Large Cash ≥ CAD 10,000\")\n• **Conditions** — One or more field/operator/value criteria (AND logic)\n• **Severity** — low, medium, high, or critical\n• **Active/Inactive** toggle\n\nWhen the transaction monitoring engine evaluates transactions, it checks each active rule against every pending transaction.",
      },
      {
        q: "What fields can I use in conditions?",
        a: "Supported fields include:\n\n• **Transaction Amount** — Numeric value of the transaction\n• **Transaction Direction** — Inbound or Outbound\n• **Counterparty Country** — ISO country code of the counterparty\n• **Currency** — Transaction currency code\n• **Customer Risk Score** — Derived from customer risk level (low=1, medium=2, high=3, critical=4)\n• **Customer Country/Nationality** — Customer's country of residence",
      },
      {
        q: "What operators are available?",
        a: "• **IS** — Exact string match (also supports FATF grey/black list check)\n• **>**, **>=**, **<**, **<=** — Numeric comparisons\n• **BETWEEN** — Range check (e.g., \"5000 50000\")\n• **==** / **=** — Equality\n• **IN** / **CONTAINS** — Substring match",
      },
      {
        q: "What happens when a rule triggers?",
        a: "When all conditions in a rule match a transaction:\n\n1. The transaction's monitoring_status changes from **pending** to **flagged**.\n2. The transaction's risk_flag is set to **true**.\n3. A new **alert** is created with the rule name, severity, and transaction details.\n4. If the rule name contains \"Hard Stop\" or severity is critical, the alert is marked as a hard stop.\n5. An audit log entry is created documenting the evaluation.",
      },
    ],
  },
  {
    id: "regulatory-mapping",
    icon: MapPin,
    title: "Regulatory Mapping — FinCEN, FINTRAC & FCA",
    items: [
      {
        q: "What is the regulatory mapping feature?",
        a: "The regulatory mapping panels (accessible from the Alert Rules page) show how your active alert rules map to specific regulatory obligations in three jurisdictions:\n\n• 🇺🇸 **FinCEN** (US) — Bank Secrecy Act, 31 CFR 1020\n• 🇨🇦 **FINTRAC** (Canada) — PCMLTFA, PCMLTFR\n• 🇬🇧 **FCA** (UK) — POCA 2002, MLR 2017\n\nEach panel shows a coverage score, identifies gaps, and suggests rules to adopt.",
      },
      {
        q: "How is coverage calculated?",
        a: "Coverage is calculated as: **(requirements with at least one matching rule) ÷ (total requirements) × 100%**.\n\nA requirement is considered \"covered\" if at least one active rule's name matches any of the requirement's pattern strings. For example, a rule named \"[TALKA-LCTR] Large Cash\" matches the LCTR requirement because \"TALKA-LCTR\" is in its pattern list.",
      },
      {
        q: "What are suggested rules?",
        a: "Each regulatory requirement includes pre-configured rule templates that you can adopt with one click. These rules are mapped to specific regulations:\n\n• **TALKA-** prefix — Rules extracted from the FINTRAC configuration template\n• **FINCEN-** prefix — FinCEN BSA compliance rules\n• **FCA-** prefix — UK FCA/POCA compliance rules\n\nClicking \"Adopt Rule\" creates the rule with pre-set conditions, severity, and the correct name prefix for regulatory tracking.",
      },
      {
        q: "What FINTRAC requirements are tracked?",
        a: "The FINTRAC panel tracks 10 requirements:\n\n1. **LCTR** — Large Cash Transaction Report (PCMLTFR s.12)\n2. **STR** — Suspicious Transaction Report (PCMLTFA s.7)\n3. **EFTR** — Electronic Funds Transfer Report (PCMLTFR s.12)\n4. **TPR** — Terrorist Property Report\n5. **VCTR** — Virtual Currency Transaction Report\n6. **Anti-Structuring** — Structuring detection (PCMLTFR s.12)\n7. **KYC/CDD** — Know Your Customer / Client Due Diligence\n8. **Sanctions** — Canadian autonomous sanctions screening\n9. **Compliance Programme** — PCMLTFR Part 1 programme requirements\n10. **Casino CDR** — Casino Disbursement Report",
      },
      {
        q: "What FinCEN requirements are tracked?",
        a: "The FinCEN panel tracks key BSA/AML requirements including:\n\n• **SAR Filing** — 31 CFR 1020.320\n• **CTR Filing** — Cash transactions ≥ $10,000\n• **CDD/EDD** — Customer and Enhanced Due Diligence\n• **Beneficial Ownership** — 31 CFR 1010.230\n• **Structuring Detection** — 31 USC 5324\n• **PEP Screening** — Politically Exposed Persons\n• **OFAC Sanctions** — SDN list screening",
      },
      {
        q: "What FCA (UK) requirements are tracked?",
        a: "The FCA panel tracks 12 UK requirements:\n\n• **SAR (UK)** — Suspicious Activity Reports (POCA 2002 s.330–332)\n• **CDD** — Customer Due Diligence (MLR 2017 reg.28)\n• **EDD** — Enhanced Due Diligence (MLR 2017 reg.33)\n• **PEP Screening** — Politically Exposed Persons (MLR 2017 reg.35)\n• **Sanctions / OFSI** — UK autonomous sanctions screening\n• **Consent SAR (DAML)** — Defence Against Money Laundering requests\n• **Tipping Off** — Prevention monitoring (POCA 2002 s.333)\n• **Record Keeping** — 5-year retention (MLR 2017 reg.40)\n• And more covering reliance, training, and risk assessment obligations.",
      },
    ],
  },
];

export default function SuiteHelp() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["sar-overview"]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleItem = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const filteredSections = search.trim()
    ? HELP_SECTIONS.map(s => ({
        ...s,
        items: s.items.filter(
          i =>
            i.q.toLowerCase().includes(search.toLowerCase()) ||
            i.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : HELP_SECTIONS;

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Help — SAR/STR Filing & Regulatory Mapping
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            FinCEN SAR · FINTRAC STR/LCTR/EFTR · Alert Rules · Regulatory Coverage
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search help topics…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-4 gap-3">
        {HELP_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setExpandedSections([s.id]);
              document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
          >
            <s.icon className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {filteredSections.map(section => {
          const isOpen = expandedSections.includes(section.id);
          return (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <section.icon className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-bold text-foreground flex-1 text-left">{section.title}</span>
                <span className="text-[10px] text-muted-foreground mr-2">{section.items.length} topics</span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {section.items.map((item, idx) => {
                    const key = `${section.id}-${idx}`;
                    const itemOpen = expandedItems.includes(key);
                    return (
                      <div key={key}>
                        <button
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors"
                        >
                          {itemOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-sm text-foreground font-medium text-left flex-1">{item.q}</span>
                        </button>
                        {itemOpen && (
                          <div className="px-5 pb-4 pl-11 animate-fade-in">
                            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                              {item.a.split(/(\*\*[^*]+\*\*)/).map((part, pi) => {
                                if (part.startsWith("**") && part.endsWith("**")) {
                                  return (
                                    <span key={pi} className="font-semibold text-foreground">
                                      {part.slice(2, -2)}
                                    </span>
                                  );
                                }
                                return <span key={pi}>{part}</span>;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredSections.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No help topics match "{search}". Try different keywords.
        </div>
      )}
    </div>
  );
}
