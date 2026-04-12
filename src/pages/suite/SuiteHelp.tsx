import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileText, AlertTriangle, Shield, Scale, Flag, Download,
  ChevronDown, ChevronRight, Search, BookOpen, MapPin, Gavel,
  CheckSquare, ClipboardList,
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
  {
    id: "fintrac-checklist",
    icon: ClipboardList,
    title: "FINTRAC STR — Submission Checklist & Required Actions",
    items: [
      {
        q: "What actions must be completed BEFORE submitting an STR to FINTRAC?",
        a: "Per PCMLTFA s.7 and PCMLTFR, you must complete the following actions before filing:\n\n1. **Screen and identify** the suspicious transaction(s) through your monitoring systems or manual review.\n2. **Assess the facts** — Document all factual elements: date, time, location, amount, type, account details, and transaction method.\n3. **Assess the context** — Consider the client's known business, occupation, financial history, expected transactional behaviour, and any contextual factors.\n4. **Link ML/TF indicators** — Identify and document which money laundering or terrorist activity financing indicators apply (see FINTRAC sector-specific indicator guidance).\n5. **Determine reasonable grounds to suspect** — Conclude that a reasonable and trained person would suspect ML/TF based on the combined facts, context, and indicators. This is above 'simple suspicion' (gut feeling) but below 'reasonable grounds to believe' (verified probability).\n6. **Document the rationale** — Write a clear narrative explaining how you reached the threshold, suitable for another trained professional to review.\n7. **Obtain approval from CAMLO** — Your Chief Anti-Money Laundering Officer (or delegate) must review and approve the STR before submission.",
      },
      {
        q: "What information must be included in the STR form?",
        a: "The FINTRAC STR form has 6 mandatory sections:\n\n**1. General Information**\n• Reporting entity name, address, contact details\n• Report reference number\n• Whether this is a correction to a previously submitted report\n• Ministerial Directives applicability\n\n**2. Transaction Information** (for each transaction)\n• Transaction status: completed or attempted\n• Reason not completed (if attempted)\n• Date, time, and location\n• Method of transaction (in-person, online, telephone, mail, etc.)\n• Purpose of the transaction\n• Reporting entity transaction reference number\n\n**3. Starting Action** (for each transaction)\n• Direction: in or out\n• Amount and type of funds, assets, or virtual currency\n• Currency or virtual currency type\n• Source of funds information\n• Virtual currency addresses and account information\n• How funds/VC were obtained\n• **Conductor** — Person or entity who conducted/attempted the transaction\n• **Third Party** — Person or entity on whose behalf the transaction was conducted\n\n**4. Completing Action** (for each transaction)\n• Details of disposition (how funds were used)\n• Amount, currency, or virtual currency type\n• Virtual currency addresses/accounts\n• Other persons or entities involved\n• **Beneficiary** — Person or entity who benefited\n\n**5. Details of Suspicion** (free-form narrative)\n• Whether activity relates to ML, TF, or sanctions evasion\n• Public-private partnership project names (if applicable)\n• Whether subject is a PEP\n• Related report reference numbers\n• **Clear narrative** of facts + context + indicators = grounds for suspicion\n\n**6. Action Taken** (free-form)\n• What action was or will be taken as a result (e.g., account restricted, enhanced monitoring, relationship terminated)",
      },
      {
        q: "What are the key FINTRAC STR filing rules and deadlines?",
        a: "• **Filing deadline**: As soon as practicable after completing your assessment measures. There is no fixed number of days, but FINTRAC expects priority treatment. The greater the delay, the greater the need for explanation.\n• **No monetary threshold**: STR filing is required regardless of transaction amount.\n• **Attempted transactions**: Must be reported if they meet the threshold.\n• **Tipping off prohibition**: You must NOT inform the client or any third party that an STR has been or will be filed, if the intent is to prejudice a criminal investigation (PCMLTFA s.8).\n• **Corrections**: If you need to modify a submitted STR, you must do so within 20 days of the change request.\n• **Retention**: STR records must be retained for a minimum of 5 years from the date of filing (PCMLTFR s.69).\n• **Good faith protection**: No prosecution for filing an STR in good faith.\n• **Terrorist financing**: For suspected TF or national security threats, expedite submission as a best practice.\n• **Submission method**: Electronically via FINTRAC Web Reporting System (FWR) or FINTRAC API. Paper forms only if you lack electronic capability.",
      },
      {
        q: "What concurrent obligations may be triggered alongside an STR?",
        a: "When you file an STR, the following related obligations may also apply:\n\n• **Large Cash Transaction Report (LCTR)** — If the transaction involves ≥ CAD 10,000 cash, you must also file an LCTR within 15 calendar days (PCMLTFR s.12).\n• **Electronic Funds Transfer Report (EFTR)** — If the transaction involves an international EFT of ≥ CAD 10,000, you must also file an EFTR within 15 calendar days.\n• **Large Virtual Currency Transaction Report (LVCTR)** — If the transaction involves ≥ CAD 10,000 in virtual currency.\n• **Terrorist Property Report (TPR)** — If you know the property is owned or controlled by a listed terrorist entity, you must file a TPR as well.\n• **Casino Disbursement Report (CDR)** — For casinos, if a disbursement of ≥ CAD 10,000 is made.\n• **Sanctions screening** — Check whether the subject appears on Canada's Consolidated Canadian Autonomous Sanctions List.\n• **Third-party determination** — Determine and document if the transaction was conducted on behalf of a third party.\n• **Identity verification** — If not already done, verify the identity of the conductor and any third parties using FINTRAC-approved methods.\n• **Record keeping** — Retain all transaction records, identification records, and the STR itself for at least 5 years.\n• **Compliance programme update** — Document the incident in your compliance records and assess whether your risk assessment or policies need updating.",
      },
      {
        q: "What are common STR deficiencies to avoid?",
        a: "FINTRAC identifies these common deficiencies in submitted STRs:\n\n• **Vague or insufficient narrative** — The Details of Suspicion section must clearly articulate facts, context, and indicators. Simply stating 'transaction appeared suspicious' is insufficient.\n• **Missing conductor/beneficiary information** — All known information about the person conducting the transaction must be included. Take reasonable measures to obtain missing details.\n• **Failure to link indicators** — You must explain which specific ML/TF indicators apply and how they relate to the transaction.\n• **Delayed filing** — STRs must be submitted as soon as practicable. Unexplained delays are a compliance deficiency.\n• **Incomplete transaction details** — Each transaction must have at least 1 starting action. Completed transactions must also have a completing action.\n• **Missing related reports** — If the same transaction triggered an LCTR or EFTR, reference those report numbers.\n• **No action taken documented** — The Action Taken section must describe what steps were or will be taken.\n• **Failure to report attempted transactions** — Attempted transactions that meet the threshold must also be reported.\n• **Not reporting all related transactions** — If multiple transactions form a pattern, include all of them in the STR rather than filing separately.",
      },
      {
        q: "What is the complete pre-submission checklist?",
        a: "Use this checklist before submitting each FINTRAC STR:\n\n☐ **1. Identification** — Verified identity of conductor and any third parties using FINTRAC-approved methods.\n☐ **2. Facts documented** — All transaction facts recorded: dates, times, amounts, locations, methods, account numbers.\n☐ **3. Context assessed** — Client profile reviewed: occupation, business, expected behaviour, financial history, risk level.\n☐ **4. Indicators linked** — Specific ML/TF indicators identified and documented against FINTRAC sector guidance.\n☐ **5. Threshold met** — Reasonable grounds to suspect determination documented and approved.\n☐ **6. Narrative written** — Details of Suspicion section completed with clear facts + context + indicators narrative.\n☐ **7. Starting actions complete** — Each transaction has at least 1 starting action with direction (in/out), amount, and conductor info.\n☐ **8. Completing actions complete** — Each completed transaction has at least 1 completing action with disposition and beneficiary.\n☐ **9. Third-party determination** — Determined and documented whether transaction was on behalf of a third party.\n☐ **10. Action taken recorded** — Documented what action was/will be taken (enhanced monitoring, account restriction, etc.).\n☐ **11. Related reports referenced** — Cross-referenced any LCTR, EFTR, LVCTR, TPR, or CDR filed for the same transactions.\n☐ **12. Sanctions check** — Screened subject against Canadian Consolidated Autonomous Sanctions List.\n☐ **13. PEP status** — Checked and indicated whether subject is a politically exposed person.\n☐ **14. CAMLO approval** — Report reviewed and approved by Chief Anti-Money Laundering Officer.\n☐ **15. Tipping-off safeguards** — Confirmed no disclosure to client about the STR filing.\n☐ **16. Records retained** — All supporting documents filed for minimum 5-year retention.\n☐ **17. Submission method confirmed** — Ready to submit via FWR or FINTRAC API (paper only if no electronic capability).\n☐ **18. Compliance programme updated** — Incident documented in compliance records; risk assessment reviewed if needed.",
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
