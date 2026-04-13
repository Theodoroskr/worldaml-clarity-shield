import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Landmark, Search, RefreshCw, FileText, AlertTriangle, CheckCircle2,
  Clock, ChevronLeft, ChevronRight, Users, BarChart3, Shield, Scale,
  Globe, ExternalLink, ChevronDown, ChevronUp, BookOpen, Gavel,
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

/* ─── Full Regulator Knowledge Base ─── */
interface ReportObligation {
  name: string;
  code: string;
  description: string;
  deadline: string;
  trigger: string;
  frequency: "event" | "periodic";
}

interface RegulatoryProfile {
  id: string;
  name: string;
  fullName: string;
  country: string;
  primaryLaw: string;
  lawUrl?: string;
  fiu: string;
  fiuPortal?: string;
  reports: ReportObligation[];
  periodicObligations: { title: string; deadline: string; description: string; month?: number; day?: number; frequencyMonths?: number }[];
  keyRequirements: string[];
  baselineRuleCount: number;
  highRiskCountries: string[];
}

const ALL_REGULATORS: RegulatoryProfile[] = [
  {
    id: "fincen", name: "FinCEN", fullName: "Financial Crimes Enforcement Network", country: "United States",
    primaryLaw: "Bank Secrecy Act (BSA)", lawUrl: "https://www.fincen.gov/resources/statutes-regulations",
    fiu: "FinCEN", fiuPortal: "https://bsaefiling.fincen.treas.gov",
    reports: [
      { name: "Suspicious Activity Report", code: "SAR", description: "Report suspicious transactions ≥ $5,000 involving potential ML/TF.", deadline: "30 days from detection", trigger: "Suspicious activity detected", frequency: "event" },
      { name: "Currency Transaction Report", code: "CTR", description: "Cash transactions exceeding $10,000 in a single business day.", deadline: "15 days from transaction", trigger: "Cash > $10,000", frequency: "event" },
    ],
    periodicObligations: [
      { title: "BSA/AML Compliance Program Review", deadline: "Annual", description: "Independent review of AML compliance program.", frequencyMonths: 12 },
      { title: "OFAC Sanctions List Update", deadline: "Continuous", description: "Customer screening against OFAC SDN and sectoral lists." },
    ],
    keyRequirements: ["Designate BSA/AML Compliance Officer", "Written AML compliance program", "Annual independent testing", "Ongoing employee training", "CDD procedures", "5-year record retention"],
    baselineRuleCount: 5, highRiskCountries: ["IR", "KP", "SY", "CU", "VE", "MM", "AF"],
  },
  {
    id: "fintrac", name: "FINTRAC", fullName: "Financial Transactions and Reports Analysis Centre of Canada", country: "Canada",
    primaryLaw: "PCMLTFA", lawUrl: "https://laws-lois.justice.gc.ca/eng/acts/P-24.501/",
    fiu: "FINTRAC", fiuPortal: "https://www.fintrac-canafe.gc.ca/reporting-declaration/info/f2r-eng",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report when reasonable grounds to suspect ML/TF.", deadline: "30 days from detection", trigger: "Reasonable grounds to suspect", frequency: "event" },
      { name: "Large Cash Transaction Report", code: "LCTR", description: "Cash ≥ CAD $10,000.", deadline: "15 days", trigger: "Cash ≥ CAD $10,000", frequency: "event" },
      { name: "Electronic Funds Transfer Report", code: "EFTR", description: "International EFTs ≥ CAD $10,000.", deadline: "5 days", trigger: "EFT ≥ CAD $10,000", frequency: "event" },
      { name: "Terrorist Property Report", code: "TPR", description: "Property of listed terrorist entity.", deadline: "Immediately", trigger: "Listed entity identified", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Two-Year Effectiveness Review", deadline: "Every 2 years", description: "Independent compliance program review.", frequencyMonths: 24 },
      { title: "Risk Assessment Update", deadline: "Ongoing", description: "Update ML/TF risk assessment." },
    ],
    keyRequirements: ["Appoint Compliance Officer", "Written policies & procedures", "Risk assessment", "Training program", "Bi-annual effectiveness review", "5-year record retention"],
    baselineRuleCount: 6, highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE"],
  },
  {
    id: "fca", name: "FCA", fullName: "Financial Conduct Authority", country: "United Kingdom",
    primaryLaw: "POCA 2002 & MLR 2017", lawUrl: "https://www.legislation.gov.uk/uksi/2017/692/contents",
    fiu: "NCA (UKFIU)", fiuPortal: "https://www.nca.gov.uk/our-work/suspicious-activity-reports/",
    reports: [
      { name: "Suspicious Activity Report", code: "SAR", description: "Report ML/TF suspicion to NCA.", deadline: "As soon as practicable", trigger: "Knowledge/suspicion of ML/TF", frequency: "event" },
      { name: "Defence Against Money Laundering", code: "DAML", description: "Request consent from NCA for suspected criminal property.", deadline: "Before proceeding", trigger: "Suspected criminal property", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Annual Financial Crime Report (REP-CRIM)", deadline: "30 business days after period end", description: "Financial crime data submission to FCA.", frequencyMonths: 12 },
      { title: "AML/CTF Risk Assessment", deadline: "Annual", description: "Firm-wide risk assessment (Reg 18 MLR 2017).", frequencyMonths: 12 },
    ],
    keyRequirements: ["Appoint MLRO", "Firm-wide risk assessment (Reg 18)", "CDD / EDD measures", "Staff training on ML/TF", "UK sanctions screening (OFSI HMT)", "5-year record retention"],
    baselineRuleCount: 5, highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE"],
  },
  {
    id: "cysec", name: "CySEC", fullName: "Cyprus Securities and Exchange Commission", country: "Cyprus",
    primaryLaw: "AML Law 188(I)/2007 & CySEC Directive DI144-2007-08", lawUrl: "https://www.cysec.gov.cy/en-GB/legislation/aml-cft/",
    fiu: "MOKAS", fiuPortal: "https://www.law.gov.cy/law/mokas/mokas.nsf",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report to MOKAS under AML Law.", deadline: "As soon as formed", trigger: "Suspicion of ML/TF", frequency: "event" },
      { name: "Cash Transaction Report", code: "CTR", description: "Cash ≥ €10,000.", deadline: "Within working days", trigger: "Cash ≥ €10,000", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Annual Compliance Report (ACR)", deadline: "By 30 April", description: "AML/CFT compliance self-assessment to CySEC.", month: 3, day: 30 },
      { title: "Internal Audit Report", deadline: "Annually", description: "Independent audit of AML policies.", frequencyMonths: 12 },
      { title: "CAMLO Appointment Notification", deadline: "Within 15 days of change", description: "Notify CySEC of CAMLO changes." },
    ],
    keyRequirements: ["Appoint CAMLO", "Written AML policies", "Customer risk assessments", "CDD/EDD + PEP screening", "ACR by 30 April", "5-year record retention"],
    baselineRuleCount: 5, highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "RU", "TR"],
  },
  {
    id: "icpac", name: "ICPAC", fullName: "Institute of Certified Public Accountants of Cyprus", country: "Cyprus",
    primaryLaw: "AML Law 188(I)/2007 / ICPAC AML Directive", lawUrl: "https://www.icpac.org.cy/en/aml",
    fiu: "MOKAS", fiuPortal: "https://www.law.gov.cy/law/mokas/mokas.nsf",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report to MOKAS via ICPAC.", deadline: "As soon as formed", trigger: "Suspicion of ML/TF", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Internal Assessment Report (IAR)", deadline: "Annually", description: "Annual AML risk assessment to ICPAC.", frequencyMonths: 12 },
      { title: "AML Compliance Questionnaire", deadline: "Annually", description: "Self-assessment questionnaire.", frequencyMonths: 12 },
    ],
    keyRequirements: ["Appoint AML Compliance Officer", "Firm-wide risk assessment", "CDD for all clients", "STRs to MOKAS", "Annual IAR to ICPAC", "5-year record retention"],
    baselineRuleCount: 4, highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "RU"],
  },
  {
    id: "eu_amld", name: "EU AMLD", fullName: "EU Anti-Money Laundering Directives (6AMLD)", country: "European Union",
    primaryLaw: "Directive (EU) 2018/1673 (6AMLD)", lawUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32018L1673",
    fiu: "National FIU (varies by member state)",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report to national FIU.", deadline: "As soon as practicable", trigger: "Suspicion of ML/TF", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Risk Assessment Review", deadline: "Ongoing", description: "National ML/TF risk assessments (Art. 7 of 4AMLD)." },
    ],
    keyRequirements: ["CDD with beneficial ownership", "EU sanctions screening", "PEP screening", "Report to national FIU", "5-year record retention", "Staff training"],
    baselineRuleCount: 4, highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE"],
  },
  {
    id: "cba_cyprus", name: "CBA Cyprus", fullName: "Cyprus Bar Association — AML for Lawyers", country: "Cyprus",
    primaryLaw: "AML Law / Bar Association AML Directive",
    fiu: "MOKAS",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report to MOKAS via Cyprus Bar Association.", deadline: "As soon as formed", trigger: "Suspicion of ML/TF", frequency: "event" },
    ],
    periodicObligations: [
      { title: "CDD Records Maintenance", deadline: "Ongoing", description: "Maintain CDD records for all financial transactions." },
    ],
    keyRequirements: ["CDD for client matters", "Report to MOKAS", "PEP screening", "Trust/company formation oversight", "5-year record retention"],
    baselineRuleCount: 4, highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "RU"],
  },
  {
    id: "dfsa", name: "DFSA", fullName: "Dubai Financial Services Authority", country: "UAE (DIFC)",
    primaryLaw: "DFSA AML Module & Federal Decree Law No. 10 of 2025", lawUrl: "https://www.dfsa.ae/what-we-do/aml-ctf-sanctions-compliance/overview-of-dfsa-aml-ctf-sanctions-obligations",
    fiu: "UAE FIU (goAML)", fiuPortal: "https://www.uaefiu.gov.ae",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report via goAML.", deadline: "As soon as formed", trigger: "Knowledge/suspicion of ML/TF/PF", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Annual MLRO Report", deadline: "Annually", description: "MLRO report to senior management.", frequencyMonths: 12 },
      { title: "Independent AML/CFT Audit", deadline: "Annually", description: "Independent audit of AML systems.", frequencyMonths: 12 },
      { title: "Risk Assessment Update", deadline: "Annual", description: "Firm-wide ML/TF risk assessment.", frequencyMonths: 12 },
    ],
    keyRequirements: ["Appoint MLRO", "Written AML/CFT programme", "Risk assessment", "CDD/EDD", "UAE + UN sanctions screening", "STRs via goAML", "5-year retention", "Staff training"],
    baselineRuleCount: 0, highRiskCountries: ["IR", "KP", "SY", "AF", "YE"],
  },
  {
    id: "cbuae", name: "CBUAE", fullName: "Central Bank of the UAE", country: "United Arab Emirates",
    primaryLaw: "Federal Decree Law No. 10 of 2025", lawUrl: "https://rulebook.centralbank.ae/en/rulebook/1626-suspicious-transaction-reporting",
    fiu: "UAE FIU (goAML)", fiuPortal: "https://www.uaefiu.gov.ae",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report via goAML. Includes attempted transactions.", deadline: "As soon as formed", trigger: "Suspicion of ML/TF/PF", frequency: "event" },
      { name: "Large Cash Transaction Report", code: "LCTR", description: "Cash ≥ AED 55,000.", deadline: "30 days", trigger: "Cash ≥ AED 55,000", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Annual Compliance Officer Report", deadline: "Annually", description: "Report to senior management and Board.", frequencyMonths: 12 },
      { title: "Independent AML/CFT Audit", deadline: "Annually", description: "External audit of AML systems.", frequencyMonths: 12 },
      { title: "Risk Assessment Update", deadline: "Annual", description: "Institutional ML/TF/PF risk assessment.", frequencyMonths: 12 },
    ],
    keyRequirements: ["CBUAE-approved Compliance Officer", "Board-approved AML programme", "Institutional risk assessment", "CDD/EDD + UBO", "UAE + UN + OFAC screening", "STRs + LCTRs via goAML", "5-year retention", "Staff training"],
    baselineRuleCount: 0, highRiskCountries: ["IR", "KP", "SY", "AF", "YE"],
  },
  {
    id: "cbc", name: "CBC", fullName: "Central Bank of Cyprus", country: "Cyprus",
    primaryLaw: "AML/CFT Law 2007–2021", lawUrl: "https://www.centralbank.cy/en/licensing-supervision/prevention-and-suppression-of-money-laundering-activities-and-financing-of-terrorism-1",
    fiu: "MOKAS", fiuPortal: "https://www.law.gov.cy/law/mokas/mokas.nsf",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report to MOKAS under AML/CFT Law.", deadline: "As soon as formed", trigger: "Suspicion of ML/TF", frequency: "event" },
      { name: "Cash Transaction Report", code: "CTR", description: "Cash ≥ €10,000.", deadline: "Within working days", trigger: "Cash ≥ €10,000", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Annual AML/CFT Compliance Report", deadline: "Annually", description: "Programme effectiveness report to CBC.", frequencyMonths: 12 },
      { title: "Internal Audit Report", deadline: "Annually", description: "Independent audit of AML policies.", frequencyMonths: 12 },
    ],
    keyRequirements: ["Appoint AMLCO", "Written AML/CFT policies", "Customer + firm risk assessments", "CDD/EDD + PEP + sanctions screening", "STRs to MOKAS", "Annual report to CBC", "5-year retention", "Staff training"],
    baselineRuleCount: 0, highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "RU"],
  },
  {
    id: "bog", name: "Bank of Greece", fullName: "Bank of Greece (Τράπεζα της Ελλάδος)", country: "Greece",
    primaryLaw: "Law 4557/2018 (4AMLD/5AMLD transposition)", lawUrl: "https://www.bankofgreece.gr/en/main-tasks/supervision/anti-money-laundering",
    fiu: "Hellenic FIU (SDOE)", fiuPortal: "https://www.hellenic-fiu.gr",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report to Hellenic FIU under Law 4557/2018.", deadline: "As soon as formed", trigger: "Suspicion of ML/TF", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Annual AML/CFT Compliance Report", deadline: "Annually", description: "Compliance report to Bank of Greece.", frequencyMonths: 12 },
      { title: "Internal Audit Report", deadline: "Annually", description: "Independent review of AML systems.", frequencyMonths: 12 },
    ],
    keyRequirements: ["Appoint AML Compliance Officer", "Written AML/CFT policies", "Institutional + customer risk assessments", "CDD/EDD + PEP screening", "EU sanctions screening", "STRs to Hellenic FIU", "Annual report to BoG", "5-year retention", "Staff training"],
    baselineRuleCount: 0, highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE"],
  },
];

/* ─── Periodic Reports types ─── */
interface PeriodicReport {
  id: string;
  user_id: string;
  report_type: string;
  report_title: string;
  regulator: string;
  period_year: number;
  filing_status: string;
  filed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  user_email?: string;
  user_name?: string;
}

const PAGE_SIZE = 25;

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  draft: { label: "Draft", variant: "secondary", icon: Clock },
  completed: { label: "Completed", variant: "outline", icon: CheckCircle2 },
  filed: { label: "Filed", variant: "default", icon: FileText },
};

export default function AdminRegulatoryHub() {
  const [tab, setTab] = useState("directory");

  // Directory state
  const [expandedReg, setExpandedReg] = useState<string | null>(null);
  const [directorySearch, setDirectorySearch] = useState("");
  const [orgRegCounts, setOrgRegCounts] = useState<Record<string, number>>({});
  const [ruleRegCounts, setRuleRegCounts] = useState<Record<string, number>>({});

  // Periodic reports state
  const [reports, setReports] = useState<PeriodicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regulatorFilter, setRegulatorFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [regulators, setRegulators] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, completed: 0, filed: 0, overdue: 0, uniqueUsers: 0 });

  // Fetch org regulator distribution + alert rule counts
  useEffect(() => {
    const fetchDirectoryStats = async () => {
      const [orgRes, ruleRes] = await Promise.all([
        supabase.from("suite_organizations").select("regulator"),
        supabase.from("suite_alert_rules").select("source_regulator"),
      ]);
      const orgCounts: Record<string, number> = {};
      (orgRes.data || []).forEach((o: any) => {
        if (o.regulator) {
          const key = o.regulator.toLowerCase();
          orgCounts[key] = (orgCounts[key] || 0) + 1;
        }
      });
      setOrgRegCounts(orgCounts);

      const ruleCounts: Record<string, number> = {};
      (ruleRes.data || []).forEach((r: any) => {
        if (r.source_regulator) {
          const key = r.source_regulator.toLowerCase();
          ruleCounts[key] = (ruleCounts[key] || 0) + 1;
        }
      });
      setRuleRegCounts(ruleCounts);
    };
    fetchDirectoryStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase.from("periodic_reports").select("filing_status, user_id, updated_at");
    if (!data) return;
    const uniqueUsers = new Set(data.map((r) => r.user_id)).size;
    const now = new Date();
    const overdue = data.filter((r) => {
      if (r.filing_status === "filed") return false;
      return differenceInDays(now, parseISO(r.updated_at)) > 30;
    }).length;
    setStats({
      total: data.length,
      draft: data.filter((r) => r.filing_status === "draft").length,
      completed: data.filter((r) => r.filing_status === "completed").length,
      filed: data.filter((r) => r.filing_status === "filed").length,
      overdue,
      uniqueUsers,
    });
  };

  const fetchFilterOptions = async () => {
    const [{ data: regData }, { data: yearData }] = await Promise.all([
      supabase.from("periodic_reports").select("regulator").limit(500),
      supabase.from("periodic_reports").select("period_year").limit(500),
    ]);
    setRegulators([...new Set((regData ?? []).map((r) => r.regulator))].sort());
    setYears([...new Set((yearData ?? []).map((r) => r.period_year))].sort((a, b) => b - a));
  };

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase.from("periodic_reports").select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (statusFilter !== "all") query = query.eq("filing_status", statusFilter);
    if (regulatorFilter !== "all") query = query.eq("regulator", regulatorFilter);
    if (yearFilter !== "all") query = query.eq("period_year", parseInt(yearFilter));
    const { data, count } = await query;
    const rows = (data ?? []) as PeriodicReport[];
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    if (userIds.length) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, email, full_name").in("user_id", userIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      rows.forEach((r) => {
        const profile = profileMap.get(r.user_id);
        r.user_email = profile?.email ?? r.user_id;
        r.user_name = profile?.full_name ?? "";
      });
    }
    setReports(rows);
    setTotal(count ?? 0);
    setLoading(false);
  };

  useEffect(() => { fetchFilterOptions(); fetchStats(); }, []);
  useEffect(() => { fetchReports(); }, [page, statusFilter, regulatorFilter, yearFilter]);

  const filtered = search
    ? reports.filter((r) =>
        (r.user_email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.user_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        r.report_title.toLowerCase().includes(search.toLowerCase()) ||
        r.regulator.toLowerCase().includes(search.toLowerCase()) ||
        r.report_type.toLowerCase().includes(search.toLowerCase())
      )
    : reports;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const isOverdue = (r: PeriodicReport) => {
    if (r.filing_status === "filed") return false;
    return differenceInDays(new Date(), parseISO(r.updated_at)) > 30;
  };

  // Directory filtering
  const filteredRegulators = directorySearch
    ? ALL_REGULATORS.filter((r) =>
        r.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
        r.fullName.toLowerCase().includes(directorySearch.toLowerCase()) ||
        r.country.toLowerCase().includes(directorySearch.toLowerCase())
      )
    : ALL_REGULATORS;

  const toggleExpand = (id: string) => setExpandedReg(expandedReg === id ? null : id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Regulatory Hub</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setPage(0); fetchReports(); fetchStats(); }}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="directory"><Globe className="w-4 h-4 mr-1" /> Regulator Directory</TabsTrigger>
          <TabsTrigger value="reports"><FileText className="w-4 h-4 mr-1" /> Periodic Reports</TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: Regulator Directory ─── */}
        <TabsContent value="directory" className="space-y-6 mt-4">
          {/* Directory Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <Globe className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold text-foreground">{ALL_REGULATORS.length}</p>
              <p className="text-xs text-muted-foreground">Regulators Built-in</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <Shield className="w-5 h-5 text-green-500" />
              <p className="text-2xl font-bold text-foreground">{ALL_REGULATORS.reduce((a, r) => a + r.baselineRuleCount, 0)}</p>
              <p className="text-xs text-muted-foreground">Baseline Rules</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <Users className="w-5 h-5 text-blue-500" />
              <p className="text-2xl font-bold text-foreground">{Object.values(orgRegCounts).reduce((a, b) => a + b, 0)}</p>
              <p className="text-xs text-muted-foreground">Organisations Assigned</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <BarChart3 className="w-5 h-5 text-yellow-500" />
              <p className="text-2xl font-bold text-foreground">{Object.values(ruleRegCounts).reduce((a, b) => a + b, 0)}</p>
              <p className="text-xs text-muted-foreground">Active Alert Rules (tagged)</p>
            </CardContent></Card>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search regulators…" value={directorySearch} onChange={(e) => setDirectorySearch(e.target.value)} className="pl-8" />
          </div>

          {/* Regulator Cards */}
          <div className="space-y-3">
            {filteredRegulators.map((reg) => {
              const isExpanded = expandedReg === reg.id;
              const orgCount = orgRegCounts[reg.id] || orgRegCounts[reg.name.toLowerCase()] || 0;
              const ruleCount = ruleRegCounts[reg.id] || ruleRegCounts[reg.name.toLowerCase()] || 0;

              return (
                <Card key={reg.id} className="overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpand(reg.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 bg-primary/10 rounded-lg px-3 py-2">
                        <span className="text-primary font-bold text-sm font-mono">{reg.name}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{reg.fullName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{reg.country}</Badge>
                          <span className="text-xs text-muted-foreground">{reg.reports.length} report types</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{reg.baselineRuleCount} baseline rules</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {orgCount > 0 && (
                        <Badge variant="secondary" className="text-xs"><Users className="w-3 h-3 mr-1" />{orgCount} orgs</Badge>
                      )}
                      {ruleCount > 0 && (
                        <Badge variant="secondary" className="text-xs"><Shield className="w-3 h-3 mr-1" />{ruleCount} rules</Badge>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t p-4 space-y-5 bg-muted/10">
                      {/* Legislation */}
                      <div className="flex items-start gap-3">
                        <Gavel className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Primary Legislation</p>
                          <p className="text-sm text-muted-foreground">{reg.primaryLaw}</p>
                          {reg.lawUrl && (
                            <a href={reg.lawUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                              View legislation <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* FIU */}
                      <div className="flex items-start gap-3">
                        <Scale className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">FIU: {reg.fiu}</p>
                          {reg.fiuPortal && (
                            <a href={reg.fiuPortal} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                              FIU Portal <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Reporting Obligations */}
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Reporting Obligations
                        </p>
                        <div className="grid md:grid-cols-2 gap-2">
                          {reg.reports.map((r) => (
                            <div key={r.code} className="border rounded-lg p-3 bg-background">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs font-mono">{r.code}</Badge>
                                <span className="text-sm font-medium">{r.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{r.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span><Clock className="w-3 h-3 inline mr-1" />{r.deadline}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Periodic Obligations */}
                      {reg.periodicObligations.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Periodic Obligations
                          </p>
                          <div className="space-y-2">
                            {reg.periodicObligations.map((ob, i) => (
                              <div key={i} className="border rounded-lg p-3 bg-background">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{ob.title}</span>
                                  <Badge variant="secondary" className="text-xs">{ob.deadline}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{ob.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Requirements */}
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> Key Requirements
                        </p>
                        <ul className="grid md:grid-cols-2 gap-1">
                          {reg.keyRequirements.map((req, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* High-Risk Countries */}
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> High-Risk Jurisdictions
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {reg.highRiskCountries.map((c) => (
                            <Badge key={c} variant="destructive" className="text-xs font-mono">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── TAB 2: Periodic Reports ─── */}
        <TabsContent value="reports" className="space-y-6 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Reports", value: stats.total, icon: FileText, color: "text-foreground" },
              { label: "Active Users", value: stats.uniqueUsers, icon: Users, color: "text-primary" },
              { label: "Drafts", value: stats.draft, icon: Clock, color: "text-yellow-500" },
              { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-blue-500" },
              { label: "Filed", value: stats.filed, icon: BarChart3, color: "text-green-500" },
              { label: "Overdue (30d+)", value: stats.overdue, icon: AlertTriangle, color: "text-destructive" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filters</CardTitle>
              <CardDescription>Review periodic reports across all users and regulators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search user, title, regulator…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="filed">Filed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regulatorFilter} onValueChange={(v) => { setRegulatorFilter(v); setPage(0); }}>
                  <SelectTrigger><SelectValue placeholder="Regulator" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regulators</SelectItem>
                    {regulators.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setPage(0); }}>
                  <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Report</TableHead>
                    <TableHead>Regulator</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Filed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No periodic reports found</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => {
                      const cfg = STATUS_CONFIG[r.filing_status] ?? STATUS_CONFIG.draft;
                      const overdue = isOverdue(r);
                      return (
                        <TableRow key={r.id} className={overdue ? "bg-destructive/5" : ""}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate max-w-[160px]" title={r.user_email}>{r.user_name || r.user_email}</span>
                              {r.user_name && <span className="text-xs text-muted-foreground truncate max-w-[160px]">{r.user_email}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{r.report_title}</span>
                              <span className="text-xs text-muted-foreground">{r.report_type}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{r.regulator}</Badge></TableCell>
                          <TableCell className="text-sm">{r.period_year}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Badge variant={cfg.variant} className="text-xs"><cfg.icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>
                              {overdue && <Badge variant="destructive" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{format(parseISO(r.updated_at), "yyyy-MM-dd HH:mm")}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.filed_at ? format(parseISO(r.filed_at), "yyyy-MM-dd") : "—"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}