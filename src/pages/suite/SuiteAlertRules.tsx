import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Settings2, AlertCircle, Sparkles, Loader2, BarChart3, Shield, Target, TrendingUp, Lightbulb, ChevronRight, X, Scale, CheckCircle2, AlertOctagon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Operator = ">" | ">=" | "<" | "<=" | "==" | "!=" | "IN" | "NOT IN" | "CONTAINS";
type LogicGate = "AND" | "OR";
type RuleAction = "Flag" | "Review" | "Block" | "Alert" | "Escalate";

interface Condition { id: string; field: string; operator: Operator; value: string; }
interface Rule { id: string; name: string; description: string; logic: LogicGate; conditions: Condition[]; action: RuleAction; priority: string; enabled: boolean; }

const FIELDS = ["transaction.amount", "transaction.currency", "transaction.country", "customer.riskScore", "customer.status", "customer.pepStatus", "screening.matchPct", "transaction.type", "account.totalDeposits30d", "alert.count", "customer.nationality", "transaction.frequency"];
const OPERATORS: Operator[] = [">", ">=", "<", "<=", "==", "!=", "IN", "NOT IN", "CONTAINS"];

const priorityStyle: Record<string, string> = { low: "bg-slate-50 text-slate-600 border-slate-200", medium: "bg-amber-50 text-amber-700 border-amber-200", high: "bg-orange-50 text-orange-700 border-orange-200", critical: "bg-red-50 text-red-700 border-red-200" };
const actionStyle: Record<RuleAction, string> = { Flag: "bg-amber-50 text-amber-700", Review: "bg-blue-50 text-blue-700", Block: "bg-red-50 text-red-700", Alert: "bg-purple-50 text-purple-700", Escalate: "bg-orange-50 text-orange-700" };

function uid() { return Math.random().toString(36).slice(2, 9); }

const coverageColor: Record<string, string> = { high: "text-emerald-600", medium: "text-amber-600", low: "text-red-600" };
const fpColor: Record<string, string> = { high: "text-red-600", medium: "text-amber-600", low: "text-emerald-600" };

/* FinCEN / BSA Regulatory Mapping */
interface FinCENRequirement {
  id: string;
  regulation: string;
  citation: string;
  description: string;
  rulePatterns: string[]; // substrings to match against rule names
  suggestedRules?: { name: string; severity: string; rationale: string; conditions: { field: string; operator: string; value: string }[] }[];
}

const FINCEN_REQUIREMENTS: FinCENRequirement[] = [
  {
    id: "ctr",
    regulation: "Currency Transaction Report (CTR)",
    citation: "31 CFR § 1010.311",
    description: "Financial institutions must file a CTR for each cash transaction exceeding $10,000, including aggregated daily transactions by the same customer.",
    rulePatterns: ["Large Transaction", "P-TLO", "P-TLI", "P-HSUMI", "P-HSUMO"],
    suggestedRules: [
      { name: "[FINCEN-CTR] Aggregate daily cash ≥ $10,000", severity: "critical", rationale: "FinCEN requires CTR filing when a customer's aggregate cash transactions in a single business day reach $10,000. This rule flags daily aggregates approaching or exceeding the threshold.", conditions: [{ field: "account.totalDeposits30d", operator: ">", value: "10000" }] },
    ],
  },
  {
    id: "structuring",
    regulation: "Anti-Structuring",
    citation: "31 USC § 5324",
    description: "It is illegal to structure (break up) transactions to evade CTR filing requirements. Patterns of transactions just below $10,000 are a key indicator.",
    rulePatterns: ["STRIN", "STROUT"],
  },
  {
    id: "sar",
    regulation: "Suspicious Activity Report (SAR)",
    citation: "31 CFR § 1020.320",
    description: "Institutions must file a SAR for transactions of $5,000+ involving suspected money laundering, BSA violations, or terrorist financing. No tipping off customers.",
    rulePatterns: ["HRCOU", "DORMANT", "NCOU", "RISKWORD", "REFTEXT", "HASUMI", "HASUMO", "HANUMI", "HANUMO", "IN>AVG", "OUT>AVG"],
    suggestedRules: [
      { name: "[FINCEN-SAR] Rapid in-out (pass-through) within 48h", severity: "high", rationale: "Funds deposited and quickly withdrawn may indicate layering. FinCEN SAR guidance highlights rapid movement of funds as a red flag for money laundering.", conditions: [{ field: "transaction.amount", operator: ">", value: "5000" }, { field: "transaction.frequency", operator: ">", value: "2" }] },
      { name: "[FINCEN-SAR] Round-dollar transactions pattern", severity: "medium", rationale: "Recurring round-dollar amounts ($5,000, $9,000) are flagged in FinCEN advisories as structuring or suspicious activity indicators.", conditions: [{ field: "transaction.amount", operator: "==", value: "round_dollar" }] },
    ],
  },
  {
    id: "ofac",
    regulation: "OFAC Sanctions Compliance",
    citation: "31 CFR Part 501",
    description: "All US financial institutions must screen transactions and customers against OFAC's SDN List, Sectoral Sanctions, and country-based sanctions programs.",
    rulePatterns: ["CUSTSCRS", "CUSTSCRH", "CTPYSCRS", "CUSTBIC", "CTPYBIC", "INSTSCRS", "INSTSCRH", "High-Risk Country"],
  },
  {
    id: "cdd",
    regulation: "Customer Due Diligence (CDD) Rule",
    citation: "31 CFR § 1010.230",
    description: "Requires identification and verification of beneficial owners of legal entity customers, ongoing monitoring of customer relationships, and understanding the nature and purpose of accounts.",
    rulePatterns: ["VC", "CDC01-P", "CDC01-E", "MCOC", "OCMC"],
    suggestedRules: [
      { name: "[FINCEN-CDD] Beneficial ownership change detected", severity: "high", rationale: "Under the CDD Rule, institutions must update beneficial ownership information when they become aware of changes. Monitoring ownership changes ensures ongoing compliance.", conditions: [{ field: "customer.status", operator: "==", value: "ownership_changed" }] },
    ],
  },
  {
    id: "pep",
    regulation: "PEP Enhanced Due Diligence",
    citation: "31 CFR § 1010.620",
    description: "Enhanced due diligence for private banking accounts held by senior foreign political figures (PEPs), including scrutiny of sources of funds.",
    rulePatterns: ["CUSTPEP", "CTPYPEP"],
  },
  {
    id: "314a",
    regulation: "Information Sharing (314(a))",
    citation: "31 USC § 5318(g)",
    description: "FinCEN can require financial institutions to search records for accounts or transactions involving persons suspected of terrorism or money laundering.",
    rulePatterns: [],
    suggestedRules: [
      { name: "[FINCEN-314a] Name match on FinCEN 314(a) list", severity: "critical", rationale: "Institutions must respond to FinCEN 314(a) requests within 14 days. Automated screening of customer names against 314(a) subjects ensures timely compliance.", conditions: [{ field: "customer.status", operator: "==", value: "314a_match" }] },
    ],
  },
  {
    id: "funnel",
    regulation: "Funnel Account Detection",
    citation: "FinCEN Advisory FIN-2014-A009",
    description: "Funnel accounts are used to move illicit proceeds across borders, with deposits in one geographic area and rapid withdrawals in another. FinCEN specifically advises monitoring for this pattern.",
    rulePatterns: ["SUMCCI", "SUMCCO", "NUMCCI", "NUMCCO"],
    suggestedRules: [
      { name: "[FINCEN-FNL] Multi-region deposit/withdrawal pattern", severity: "critical", rationale: "FinCEN Advisory FIN-2014-A009 identifies funnel accounts as a high-priority typology. Deposits in one region with rapid withdrawals in another region indicate cross-border laundering.", conditions: [{ field: "transaction.country", operator: "!=", value: "account_country" }, { field: "transaction.amount", operator: ">", value: "3000" }] },
    ],
  },
  {
    id: "ctr-filing",
    regulation: "CTR Filing (Reporting)",
    citation: "31 CFR § 1010.306(a)",
    description: "CTRs must be filed within 15 calendar days of the transaction date. Institutions must maintain records of CTRs for 5 years. Aggregated cash transactions by or on behalf of the same person in a single business day count toward the $10,000 threshold.",
    rulePatterns: ["Large Transaction", "P-TLO", "P-TLI", "FINCEN-CTR"],
    suggestedRules: [
      { name: "[FINCEN-RPT] CTR filing deadline approaching (>$10K cash)", severity: "high", rationale: "FinCEN requires CTR filing within 15 days. This rule flags large cash transactions nearing the filing deadline to prevent late submissions and regulatory penalties.", conditions: [{ field: "transaction.amount", operator: ">", value: "10000" }, { field: "transaction.type", operator: "==", value: "cash" }] },
    ],
  },
  {
    id: "sar-filing",
    regulation: "SAR Filing (Reporting)",
    citation: "31 CFR § 1020.320(b)",
    description: "SARs must be filed within 30 calendar days of initial detection. If no suspect is identified, filing may be delayed up to 60 days. SARs must be retained for 5 years. Continuing suspicious activity requires follow-up SARs every 90 days.",
    rulePatterns: ["HRCOU", "DORMANT", "RISKWORD", "REFTEXT", "FINCEN-SAR"],
    suggestedRules: [
      { name: "[FINCEN-RPT] SAR 90-day follow-up review", severity: "high", rationale: "FinCEN guidance requires institutions to file continuing activity SARs at least every 90 days when suspicious activity persists. This rule triggers a review cycle for previously filed SARs.", conditions: [{ field: "alert.count", operator: ">", value: "0" }] },
      { name: "[FINCEN-RPT] SAR filing deadline monitor (30-day)", severity: "critical", rationale: "Once suspicious activity is detected, institutions have 30 calendar days to file a SAR. This rule monitors open alerts approaching the filing deadline.", conditions: [{ field: "alert.count", operator: ">", value: "0" }] },
    ],
  },
  {
    id: "cmir",
    regulation: "Currency & Monetary Instrument Report (CMIR)",
    citation: "31 CFR § 1010.340",
    description: "Any person physically transporting, mailing, or shipping currency or monetary instruments exceeding $10,000 into or out of the United States must file a CMIR (FinCEN Form 105) at the time of transportation.",
    rulePatterns: [],
    suggestedRules: [
      { name: "[FINCEN-CMIR] Cross-border currency transport >$10K", severity: "critical", rationale: "CMIR filing is required for physical movement of $10,000+ across US borders. This rule flags large cross-border transactions that may involve physical currency transport requiring a CMIR.", conditions: [{ field: "transaction.amount", operator: ">", value: "10000" }, { field: "transaction.country", operator: "!=", value: "US" }] },
    ],
  },
  {
    id: "fbar",
    regulation: "FBAR — Foreign Bank Account Report",
    citation: "31 CFR § 1010.350",
    description: "US persons with a financial interest in or signature authority over foreign financial accounts must file an FBAR (FinCEN Form 114) if the aggregate value exceeds $10,000 at any time during the calendar year. Filed annually by April 15.",
    rulePatterns: [],
    suggestedRules: [
      { name: "[FINCEN-FBAR] Foreign account aggregate >$10K", severity: "high", rationale: "FBAR filing is required when aggregate foreign account balances exceed $10,000. This rule monitors customer transactions involving foreign institutions to identify potential FBAR obligations.", conditions: [{ field: "transaction.country", operator: "!=", value: "US" }, { field: "account.totalDeposits30d", operator: ">", value: "10000" }] },
    ],
  },
  {
    id: "form8300",
    regulation: "Form 8300 — Cash Payments Over $10K",
    citation: "26 USC § 6050I",
    description: "Non-financial trades and businesses that receive more than $10,000 in cash in a single transaction (or related transactions) must file Form 8300 with FinCEN and the IRS within 15 days. Applies to dealers, attorneys, real estate agents, and others.",
    rulePatterns: [],
    suggestedRules: [
      { name: "[FINCEN-8300] Non-bank cash receipt >$10K", severity: "high", rationale: "Form 8300 is required for cash payments exceeding $10,000 received by non-financial businesses. This rule flags large cash receipts that may trigger Form 8300 filing obligations.", conditions: [{ field: "transaction.amount", operator: ">", value: "10000" }, { field: "transaction.type", operator: "==", value: "cash" }] },
    ],
  },
  {
    id: "msl",
    regulation: "Monetary Instrument Log (MIL)",
    citation: "31 CFR § 1010.415",
    description: "Banks must maintain a Monetary Instrument Log recording each purchase of cashier's checks, drafts, or money orders between $3,000 and $10,000. This log must include customer identification and be retained for 5 years.",
    rulePatterns: [],
    suggestedRules: [
      { name: "[FINCEN-MIL] Monetary instrument purchase $3K–$10K", severity: "medium", rationale: "Banks must log purchases of monetary instruments between $3,000 and $10,000. This rule flags transactions in the MIL range to ensure proper record-keeping and detect potential structuring.", conditions: [{ field: "transaction.amount", operator: ">", value: "3000" }, { field: "transaction.amount", operator: "<", value: "10000" }] },
    ],
  },
];

/* FINTRAC (Canada) Regulatory Mapping */
const FINTRAC_REQUIREMENTS: FinCENRequirement[] = [
  {
    id: "lcttr",
    regulation: "Large Cash Transaction Report (LCTR)",
    citation: "PCMLTFA s. 7, PCMLTFR s. 12",
    description: "Reporting entities must submit an LCTR to FINTRAC for every cash transaction of CAD 10,000 or more, whether conducted in a single transaction or in two or more transactions within 24 hours by or on behalf of the same individual.",
    rulePatterns: ["Large Transaction", "P-TLO", "P-TLI", "P-HSUMI", "P-HSUMO"],
    suggestedRules: [
      { name: "[FINTRAC-LCTR] Aggregate 24h cash ≥ CAD 10,000", severity: "critical", rationale: "FINTRAC requires LCTR filing when aggregate cash transactions by the same person reach CAD 10,000 within a 24-hour window. Monitors daily aggregation for timely reporting.", conditions: [{ field: "account.totalDeposits30d", operator: ">", value: "10000" }, { field: "transaction.type", operator: "==", value: "cash" }] },
    ],
  },
  {
    id: "str",
    regulation: "Suspicious Transaction Report (STR)",
    citation: "PCMLTFA s. 7(1)",
    description: "Reporting entities must file an STR with FINTRAC when there are reasonable grounds to suspect that a transaction or attempted transaction is related to money laundering, terrorist financing, or sanctions evasion. There is no minimum dollar threshold — all suspicious activity must be reported.",
    rulePatterns: ["HRCOU", "DORMANT", "NCOU", "RISKWORD", "REFTEXT", "HASUMI", "HASUMO", "HANUMI", "HANUMO", "IN>AVG", "OUT>AVG"],
    suggestedRules: [
      { name: "[FINTRAC-STR] Rapid movement of funds (layering)", severity: "high", rationale: "FINTRAC Guidance identifies rapid in-out patterns as a key ML indicator. Funds deposited and moved quickly through multiple accounts suggest layering.", conditions: [{ field: "transaction.amount", operator: ">", value: "3000" }, { field: "transaction.frequency", operator: ">", value: "3" }] },
    ],
  },
  {
    id: "eftr",
    regulation: "Electronic Funds Transfer Report (EFTR)",
    citation: "PCMLTFR s. 12.1",
    description: "Reporting entities must file an EFTR for international electronic funds transfers of CAD 10,000 or more, whether sent or received. This includes SWIFT transfers, wire transfers, and other electronic payment mechanisms.",
    rulePatterns: ["SUMCCI", "SUMCCO"],
    suggestedRules: [
      { name: "[FINTRAC-EFTR] International EFT ≥ CAD 10,000", severity: "high", rationale: "FINTRAC requires EFTR filing for all international electronic transfers of CAD 10,000+. This rule flags qualifying cross-border electronic transfers for timely reporting.", conditions: [{ field: "transaction.amount", operator: ">", value: "10000" }, { field: "transaction.country", operator: "!=", value: "CA" }] },
    ],
  },
  {
    id: "tpr",
    regulation: "Terrorist Property Report (TPR)",
    citation: "Criminal Code s. 83.1, PCMLTFA s. 7.1",
    description: "Every person in Canada must disclose without delay to the RCMP and CSIS the existence of property owned or controlled by or on behalf of a listed terrorist entity. FINTRAC must also be notified.",
    rulePatterns: ["CUSTSCRS", "CUSTSCRH", "CTPYSCRS", "CUSTBIC", "CTPYBIC", "INSTSCRS", "INSTSCRH", "High-Risk Country"],
  },
  {
    id: "casino-dr",
    regulation: "Casino Disbursement Report (CDR)",
    citation: "PCMLTFR s. 13",
    description: "Casinos must report disbursements of CAD 10,000 or more, including payouts, redemptions of chips/tokens, and advances. Aggregation within 24 hours applies.",
    rulePatterns: [],
    suggestedRules: [
      { name: "[FINTRAC-CDR] Casino disbursement ≥ CAD 10K", severity: "high", rationale: "Canadian casinos must file CDRs for disbursements of CAD 10,000+. This rule flags large casino payouts for compliance reporting.", conditions: [{ field: "transaction.amount", operator: ">", value: "10000" }, { field: "transaction.type", operator: "==", value: "casino_payout" }] },
    ],
  },
  {
    id: "vc-report",
    regulation: "Virtual Currency Transaction Report (VCTR)",
    citation: "PCMLTFR s. 12.2",
    description: "Money services businesses (MSBs) dealing in virtual currency must report virtual currency transactions of CAD 10,000 or more. This includes exchanges, transfers, and receipt of virtual currency.",
    rulePatterns: [],
    suggestedRules: [
      { name: "[FINTRAC-VCTR] Virtual currency transfer ≥ CAD 10K", severity: "high", rationale: "FINTRAC requires VCTR filing for virtual currency transactions of CAD 10,000+. MSBs handling crypto must monitor transaction values for reporting obligations.", conditions: [{ field: "transaction.amount", operator: ">", value: "10000" }, { field: "transaction.currency", operator: "IN", value: "BTC,ETH,USDT,USDC" }] },
    ],
  },
  {
    id: "structuring-ca",
    regulation: "Anti-Structuring (Canada)",
    citation: "PCMLTFA s. 10.1",
    description: "It is an offence to structure or attempt to structure transactions to avoid FINTRAC reporting thresholds. Patterns of transactions just below CAD 10,000 trigger enhanced scrutiny.",
    rulePatterns: ["STRIN", "STROUT"],
  },
  {
    id: "kyc-ca",
    regulation: "Know Your Client (KYC) — Canada",
    citation: "PCMLTFR s. 52–67",
    description: "Reporting entities must verify the identity of clients for prescribed transactions, including any cash transaction ≥ CAD 10,000, opening of accounts, and international EFTs ≥ CAD 1,000. Enhanced measures apply to PEPs, HIO, and high-risk clients.",
    rulePatterns: ["VC", "CDC01-P", "CDC01-E", "CUSTPEP", "CTPYPEP"],
    suggestedRules: [
      { name: "[FINTRAC-KYC] PEP/HIO enhanced monitoring", severity: "high", rationale: "FINTRAC requires enhanced ongoing monitoring for Politically Exposed Persons (PEPs) and Heads of International Organizations (HIO), including family members and close associates.", conditions: [{ field: "customer.pepStatus", operator: "==", value: "true" }] },
    ],
  },
  {
    id: "compliance-program",
    regulation: "Compliance Program Requirements",
    citation: "PCMLTFR s. 71",
    description: "Every reporting entity must implement a compliance program that includes: a compliance officer, written policies and procedures, a risk assessment, an ongoing training program, and an effectiveness review every two years.",
    rulePatterns: [],
    suggestedRules: [
      { name: "[FINTRAC-CP] Biennial effectiveness review due", severity: "medium", rationale: "FINTRAC mandates that compliance programs undergo an independent effectiveness review at least every two years. This rule monitors the review cycle to ensure timely completion.", conditions: [{ field: "alert.count", operator: ">=", value: "0" }] },
    ],
  },
  {
    id: "sanctions-ca",
    regulation: "Canadian Sanctions Screening",
    citation: "SEMA, UNA, Justice for Victims of Corrupt Foreign Officials Act",
    description: "Canadian entities must screen against OSFI's Consolidated Canadian Autonomous Sanctions List, UN sanctions, and listings under the Sergei Magnitsky Act. Dealing with listed persons or entities is prohibited.",
    rulePatterns: ["CUSTSCRS", "CUSTSCRH", "CTPYSCRS", "High-Risk Country"],
  },
];

export default function SuiteAlertRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [ruleAnalysis, setRuleAnalysis] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showFinCEN, setShowFinCEN] = useState(false);

  const fetchRules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("suite_alert_rules").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    const mapped: Rule[] = (data || []).map(r => ({
      id: r.id,
      name: r.name,
      description: "",
      logic: (Array.isArray(r.conditions) && (r.conditions as any)[0]?.logic) || "AND",
      conditions: Array.isArray(r.conditions) ? (r.conditions as any[]).filter(c => c.field) : [],
      action: (Array.isArray(r.conditions) && (r.conditions as any)[0]?.action) || "Flag",
      priority: r.severity,
      enabled: r.is_active,
    }));
    setRules(mapped);
    if (mapped.length > 0 && !selected) setSelected(mapped[0].id);
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, []);

  const activeRule = rules.find(r => r.id === selected);
  const updateRule = (update: Partial<Rule>) => { setRules(prev => prev.map(r => r.id === selected ? { ...r, ...update } : r)); };
  const addCondition = () => { updateRule({ conditions: [...(activeRule?.conditions ?? []), { id: uid(), field: "transaction.amount", operator: ">", value: "1000" }] }); };
  const removeCondition = (cid: string) => { updateRule({ conditions: activeRule?.conditions.filter(c => c.id !== cid) ?? [] }); };
  const updateCondition = (cid: string, patch: Partial<Condition>) => { updateRule({ conditions: activeRule?.conditions.map(c => c.id === cid ? { ...c, ...patch } : c) ?? [] }); };

  const addRule = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("suite_alert_rules").insert({
      user_id: user.id,
      name: "New Rule",
      conditions: [{ id: uid(), field: "transaction.amount", operator: ">", value: "0", logic: "AND", action: "Flag" }],
      severity: "medium",
      is_active: false,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    fetchRules();
    if (data) setSelected(data.id);
  };

  const saveRule = async () => {
    if (!activeRule) return;
    setSaving(true);
    const conditions = activeRule.conditions.map(c => ({ ...c, logic: activeRule.logic, action: activeRule.action }));
    const { error } = await supabase.from("suite_alert_rules").update({
      name: activeRule.name,
      conditions,
      severity: activeRule.priority,
      is_active: activeRule.enabled,
    }).eq("id", activeRule.id);
    if (error) toast.error(error.message);
    else toast.success("Rule saved");
    setSaving(false);
  };

  const deleteRule = async (id: string) => {
    await supabase.from("suite_alert_rules").delete().eq("id", id);
    if (selected === id) setSelected(null);
    fetchRules();
    toast.success("Rule deleted");
  };

  const toggleRule = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rule = rules.find(r => r.id === id);
    if (!rule) return;
    await supabase.from("suite_alert_rules").update({ is_active: !rule.enabled }).eq("id", id);
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const suggestRules = async () => {
    setAiLoading(true);
    setShowAiPanel(true);
    setShowAnalysis(false);
    setAiResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-rules");
      if (error) throw error;
      setAiResult(data);
    } catch (e: any) {
      toast.error(e.message || "AI analysis failed");
      setShowAiPanel(false);
    } finally {
      setAiLoading(false);
    }
  };

  const adoptRule = async (suggested: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const conditions = (suggested.conditions || []).map((c: any) => ({
      id: uid(),
      field: c.field || "transaction.amount",
      operator: c.operator === "gt" ? ">" : c.operator === "eq" ? "==" : c.operator === "in" ? "IN" : c.operator === "contains" ? "CONTAINS" : ">",
      value: String(c.value),
      logic: "AND",
      action: suggested.severity === "critical" ? "Block" : "Flag",
    }));
    const { error } = await supabase.from("suite_alert_rules").insert({
      user_id: user.id,
      name: suggested.name,
      conditions,
      severity: suggested.severity || "medium",
      is_active: false,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(`Rule "${suggested.name}" added`);
    fetchRules();
  };

  const analyseRule = async (ruleId: string) => {
    setAnalysing(true);
    setShowAnalysis(true);
    setShowAiPanel(false);
    setRuleAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyse-rule", { body: { rule_id: ruleId } });
      if (error) throw error;
      setRuleAnalysis(data);
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
      setShowAnalysis(false);
    } finally {
      setAnalysing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading rules…</div>;

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Left sidebar - rule list */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="px-4 py-3 border-b border-border flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between">
            <div><h2 className="font-semibold text-foreground text-sm">Alert Rules</h2><p className="text-xs text-muted-foreground">{rules.filter(r => r.enabled).length}/{rules.length} active</p></div>
            <button onClick={addRule} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"><Plus className="w-3 h-3" />New</button>
          </div>
          <button onClick={suggestRules} disabled={aiLoading} className="flex items-center justify-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors font-medium w-full">
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {aiLoading ? "Analyzing…" : "AI Suggest Rules"}
          </button>
          <button onClick={() => { setShowFinCEN(!showFinCEN); setShowAiPanel(false); setShowAnalysis(false); }} className={cn("flex items-center justify-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border transition-colors font-medium w-full", showFinCEN ? "border-blue-500 bg-blue-100 text-blue-800" : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100")}>
            <Scale className="w-3.5 h-3.5" />
            FinCEN / BSA Mapping
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {rules.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No rules yet. Click New to create one.</p>}
          {rules.map(r => (
            <button key={r.id} onClick={() => setSelected(r.id)} className={cn("w-full text-left p-3 rounded-xl border transition-colors", selected === r.id ? "bg-primary/5 border-primary/30" : "border-border hover:bg-muted/50")}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-foreground leading-tight">{r.name}</span>
                <button onClick={(e) => toggleRule(r.id, e)} className={cn("w-8 h-4 rounded-full flex items-center shrink-0 transition-colors px-0.5", r.enabled ? "bg-emerald-500 justify-end" : "bg-muted justify-start")}><div className="w-3 h-3 rounded-full bg-white shadow" /></button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", priorityStyle[r.priority])}>{r.priority}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", actionStyle[r.action])}>{r.action}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center - rule editor */}
      {activeRule ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <input value={activeRule.name} onChange={e => updateRule({ name: e.target.value })} className="font-semibold text-foreground text-sm bg-transparent border-0 outline-none focus:bg-muted/50 rounded px-1 py-0.5 w-72" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => analyseRule(activeRule.id)} disabled={analysing} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors font-medium">
                {analysing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BarChart3 className="w-3 h-3" />}
                Analyse Rule
              </button>
              <button onClick={() => deleteRule(activeRule.id)} className="text-xs px-3 py-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3 h-3 inline mr-1" />Delete</button>
              <button onClick={saveRule} disabled={saving} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                {saving ? "Saving…" : "Save Rule"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Priority</label>
                <select value={activeRule.priority} onChange={e => updateRule({ priority: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary">
                  {["low", "medium", "high", "critical"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Action</label>
                <select value={activeRule.action} onChange={e => updateRule({ action: e.target.value as RuleAction })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary">
                  {["Flag", "Review", "Block", "Alert", "Escalate"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Logic Gate</label>
                <select value={activeRule.logic} onChange={e => updateRule({ logic: e.target.value as LogicGate })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary">
                  {["AND", "OR"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="font-semibold text-foreground text-sm">Conditions</h3><p className="text-xs text-muted-foreground mt-0.5">Linked by <span className="font-bold text-primary">{activeRule.logic}</span></p></div>
                <button onClick={addCondition} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed border-primary/50 text-primary hover:bg-primary/5 transition-colors"><Plus className="w-3 h-3" />Add Condition</button>
              </div>
              <div className="space-y-3">
                {activeRule.conditions.map((cond, idx) => (
                  <div key={cond.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 group">
                    {idx > 0 && <span className={cn("text-xs font-bold px-2 py-1 rounded shrink-0", activeRule.logic === "AND" ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700")}>{activeRule.logic}</span>}
                    {idx === 0 && <span className="text-xs font-bold text-muted-foreground shrink-0">IF</span>}
                    <select value={cond.field} onChange={e => updateCondition(cond.id, { field: e.target.value })} className="flex-1 text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-foreground outline-none focus:border-primary font-mono">
                      {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select value={cond.operator} onChange={e => updateCondition(cond.id, { operator: e.target.value as Operator })} className="w-24 text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-foreground outline-none focus:border-primary font-mono">
                      {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                    </select>
                    <input value={cond.value} onChange={e => updateCondition(cond.id, { value: e.target.value })} className="flex-1 text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-foreground outline-none focus:border-primary font-mono" />
                    <button onClick={() => removeCondition(cond.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-3.5 h-3.5 text-muted-foreground" /><h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rule Preview</h4></div>
              <p className="text-xs font-mono text-foreground leading-relaxed">
                IF {activeRule.conditions.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && <span className="text-primary font-bold"> {activeRule.logic} </span>}
                    <span className="text-amber-600">{c.field}</span>
                    <span className="text-muted-foreground"> {c.operator} </span>
                    <span className="text-emerald-600">"{c.value}"</span>
                  </span>
                ))}
                {" "}→ <span className="font-bold text-destructive">{activeRule.action}</span> with priority <span className="font-bold capitalize">{activeRule.priority}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {rules.length === 0 ? "Create your first alert rule" : "Select a rule to edit"}
        </div>
      )}

      {/* Right panel - AI Analysis for individual rule */}
      {showAnalysis && (
        <div className="w-[420px] shrink-0 border-l border-border flex flex-col bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-600" /><h3 className="font-semibold text-foreground text-sm">Rule Analysis</h3></div>
            <button onClick={() => setShowAnalysis(false)} className="p-1 rounded hover:bg-muted transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {analysing && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-xs text-muted-foreground">Analysing rule effectiveness…</p>
                <p className="text-[10px] text-muted-foreground/60">Evaluating against your transaction portfolio</p>
              </div>
            )}
            {ruleAnalysis && (
              <>
                {/* Score header */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-purple-900">{ruleAnalysis.rule_name}</h4>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize", priorityStyle[ruleAnalysis.rule_severity] || priorityStyle.medium)}>{ruleAnalysis.rule_severity}</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-[10px] text-purple-600 uppercase tracking-wider font-semibold mb-1">Effectiveness</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-purple-900">{ruleAnalysis.effectiveness_score}</span>
                        <span className="text-sm text-purple-500">/100</span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Coverage</p>
                        <p className={cn("text-xs font-bold capitalize", coverageColor[ruleAnalysis.risk_coverage] || "text-foreground")}>{ruleAnalysis.risk_coverage}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">FP Risk</p>
                        <p className={cn("text-xs font-bold capitalize", fpColor[ruleAnalysis.false_positive_risk] || "text-foreground")}>{ruleAnalysis.false_positive_risk}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Alerts</p>
                        <p className="text-xs font-bold text-foreground">{ruleAnalysis.alerts_count}</p>
                      </div>
                    </div>
                  </div>
                  {ruleAnalysis.estimated_hit_rate && (
                    <p className="text-[11px] text-purple-600 mt-2 bg-purple-100/50 rounded-lg px-2 py-1">
                      <Target className="w-3 h-3 inline mr-1" />{ruleAnalysis.estimated_hit_rate}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-xl border border-border p-3">
                  <p className="text-xs text-foreground leading-relaxed">{ruleAnalysis.summary}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2"><Shield className="w-3.5 h-3.5 text-emerald-600" /><h4 className="text-xs font-semibold text-foreground">Strengths</h4></div>
                    <ul className="space-y-1.5">
                      {ruleAnalysis.strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
                          <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2"><AlertCircle className="w-3.5 h-3.5 text-red-500" /><h4 className="text-xs font-semibold text-foreground">Weaknesses</h4></div>
                    <ul className="space-y-1.5">
                      {ruleAnalysis.weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
                          <span className="text-red-400 shrink-0 mt-0.5">✗</span>{w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* False positive explanation */}
                {ruleAnalysis.false_positive_explanation && (
                  <div className="border border-border rounded-xl p-3">
                    <h4 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-amber-500" />False Positive Assessment</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{ruleAnalysis.false_positive_explanation}</p>
                  </div>
                )}

                {/* Regulatory alignment */}
                {ruleAnalysis.regulatory_alignment?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-500" />Regulatory Alignment</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {ruleAnalysis.regulatory_alignment.map((r: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">{r}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement suggestions */}
                {ruleAnalysis.improvement_suggestions?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500" />Improvement Suggestions</h4>
                    <div className="space-y-2">
                      {ruleAnalysis.improvement_suggestions.map((s: any, i: number) => (
                        <div key={i} className="border border-border rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">{s.suggestion}</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", priorityStyle[s.priority] || priorityStyle.medium)}>{s.priority}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{s.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complementary rules */}
                {ruleAnalysis.similar_rules_to_consider?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-purple-500" />Complementary Rules</h4>
                    <div className="space-y-1.5">
                      {ruleAnalysis.similar_rules_to_consider.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/30">
                          <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{r.name}</p>
                            <p className="text-[10px] text-muted-foreground">{r.conditions_summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Right panel - AI Suggest rules */}
      {showAiPanel && !showAnalysis && (
        <div className="w-96 shrink-0 border-l border-border flex flex-col bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-600" /><h3 className="font-semibold text-foreground text-sm">AI Analysis</h3></div>
            <button onClick={() => setShowAiPanel(false)} className="p-1 rounded hover:bg-muted transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-xs text-muted-foreground">Analyzing transactions & suggesting rules…</p>
              </div>
            )}
            {aiResult && (
              <>
                {aiResult.summary && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                    <h4 className="text-xs font-semibold text-purple-800 mb-1">Summary</h4>
                    <p className="text-xs text-purple-700 leading-relaxed">{aiResult.summary}</p>
                  </div>
                )}
                {aiResult.flagged_patterns?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2">Flagged Patterns</h4>
                    <div className="space-y-2">
                      {aiResult.flagged_patterns.map((p: any, i: number) => (
                        <div key={i} className="border border-border rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium capitalize", priorityStyle[p.severity] || priorityStyle.medium)}>{p.severity}</span>
                            <span className="text-[10px] text-muted-foreground">{p.affected_count} txns</span>
                          </div>
                          <p className="text-xs text-foreground">{p.pattern}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {aiResult.suggested_rules?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2">Suggested Rules</h4>
                    <div className="space-y-2">
                      {aiResult.suggested_rules.map((r: any, i: number) => (
                        <div key={i} className="border border-border rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground">{r.name}</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", priorityStyle[r.severity] || priorityStyle.medium)}>{r.severity}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{r.rationale}</p>
                          <div className="flex flex-wrap gap-1">
                            {r.conditions?.map((c: any, ci: number) => (
                              <span key={ci} className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{c.field} {c.operator} {String(c.value)}</span>
                            ))}
                          </div>
                          <button onClick={() => adoptRule(r)} className="w-full text-xs py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                            <Plus className="w-3 h-3 inline mr-1" />Adopt Rule
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Right panel - FinCEN / BSA Mapping */}
      {showFinCEN && (
        <div className="w-[460px] shrink-0 border-l border-border flex flex-col bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2"><Scale className="w-4 h-4 text-blue-600" /><h3 className="font-semibold text-foreground text-sm">FinCEN / BSA Regulatory Mapping</h3></div>
            <button onClick={() => setShowFinCEN(false)} className="p-1 rounded hover:bg-muted transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Coverage summary */}
            {(() => {
              const totalReqs = FINCEN_REQUIREMENTS.length;
              const coveredReqs = FINCEN_REQUIREMENTS.filter(req =>
                req.rulePatterns.length > 0 && req.rulePatterns.some(pattern =>
                  rules.some(r => r.name.includes(pattern))
                )
              ).length;
              const coveragePct = Math.round((coveredReqs / totalReqs) * 100);
              const allSuggested = FINCEN_REQUIREMENTS.flatMap(r => r.suggestedRules || []);
              return (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-end gap-4 mb-3">
                    <div>
                      <p className="text-[10px] text-blue-600 uppercase tracking-wider font-semibold mb-1">FinCEN Coverage</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-blue-900">{coveragePct}%</span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Covered</p>
                        <p className="text-xs font-bold text-emerald-600">{coveredReqs}/{totalReqs}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Gaps</p>
                        <p className="text-xs font-bold text-red-600">{totalReqs - coveredReqs}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Suggested</p>
                        <p className="text-xs font-bold text-amber-600">{allSuggested.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${coveragePct}%` }} />
                  </div>
                </div>
              );
            })()}

            {/* Requirement-by-requirement mapping */}
            {FINCEN_REQUIREMENTS.map(req => {
              const matchedRules = rules.filter(r =>
                req.rulePatterns.some(pattern => r.name.includes(pattern))
              );
              const isCovered = matchedRules.length > 0;
              const hasSuggestions = (req.suggestedRules?.length || 0) > 0;

              return (
                <div key={req.id} className={cn("border rounded-xl overflow-hidden", isCovered ? "border-emerald-200" : "border-red-200")}>
                  {/* Header */}
                  <div className={cn("px-4 py-3 flex items-start gap-3", isCovered ? "bg-emerald-50/50" : "bg-red-50/50")}>
                    {isCovered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-foreground">{req.regulation}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-mono font-medium shrink-0">{req.citation}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{req.description}</p>
                    </div>
                  </div>

                  {/* Matched rules */}
                  {matchedRules.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-border bg-card">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Mapped Rules ({matchedRules.length})</p>
                      <div className="space-y-1">
                        {matchedRules.map(r => (
                          <div
                            key={r.id}
                            onClick={() => { setSelected(r.id); setShowFinCEN(false); }}
                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0" />
                              <span className="text-[11px] font-medium text-foreground truncate">{r.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", priorityStyle[r.priority])}>{r.priority}</span>
                              <span className={cn("w-1.5 h-1.5 rounded-full", r.enabled ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No coverage warning */}
                  {!isCovered && req.rulePatterns.length > 0 && (
                    <div className="px-4 py-2 border-t border-border bg-red-50/30">
                      <p className="text-[11px] text-red-600 font-medium">⚠ No matching rules found — potential compliance gap</p>
                    </div>
                  )}
                  {!isCovered && req.rulePatterns.length === 0 && !hasSuggestions && (
                    <div className="px-4 py-2 border-t border-border bg-amber-50/30">
                      <p className="text-[11px] text-amber-600 font-medium">⚠ No automated rules — may require manual process</p>
                    </div>
                  )}

                  {/* Suggested new rules */}
                  {hasSuggestions && (
                    <div className="px-4 py-2.5 border-t border-border bg-amber-50/20">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1.5">💡 Suggested New Rules</p>
                      <div className="space-y-2">
                        {req.suggestedRules!.map((sr, si) => (
                          <div key={si} className="border border-amber-200 rounded-lg p-2.5 bg-card">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-semibold text-foreground">{sr.name}</span>
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", priorityStyle[sr.severity])}>{sr.severity}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{sr.rationale}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {sr.conditions.map((c, ci) => (
                                <span key={ci} className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{c.field} {c.operator} {c.value}</span>
                              ))}
                            </div>
                            <button onClick={() => adoptRule(sr)} className="w-full text-[11px] py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                              <Plus className="w-3 h-3 inline mr-1" />Adopt Rule
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
