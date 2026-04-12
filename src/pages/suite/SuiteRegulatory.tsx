import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import {
  FileText, Clock, Scale, ExternalLink, AlertTriangle,
  CheckCircle2, Calendar, Building2, Shield, Info,
  CalendarClock, Timer, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, addYears, addMonths, isPast, isFuture, setMonth, setDate } from "date-fns";

/* ─── Regulator knowledge base ─── */
interface ReportObligation {
  name: string;
  code: string;
  description: string;
  deadline: string;
  trigger: string;
  frequency: "event" | "periodic";
}

interface RegulatoryProfile {
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
}

const REGULATORY_PROFILES: Record<string, RegulatoryProfile> = {
  fincen: {
    name: "FinCEN",
    fullName: "Financial Crimes Enforcement Network",
    country: "United States",
    primaryLaw: "Bank Secrecy Act (BSA)",
    lawUrl: "https://www.fincen.gov/resources/statutes-regulations",
    fiu: "FinCEN",
    fiuPortal: "https://bsaefiling.fincen.treas.gov",
    reports: [
      { name: "Suspicious Activity Report", code: "SAR", description: "Report suspicious transactions indicative of money laundering, terrorist financing, or other financial crimes.", deadline: "30 days from detection", trigger: "Suspicious activity detected", frequency: "event" },
      { name: "Currency Transaction Report", code: "CTR", description: "Report cash transactions exceeding $10,000 in a single business day.", deadline: "15 days from transaction", trigger: "Cash transaction > $10,000", frequency: "event" },
    ],
    periodicObligations: [
      { title: "BSA/AML Compliance Program Review", deadline: "Annual", description: "Independent review of the AML compliance program effectiveness.", frequencyMonths: 12 },
      { title: "OFAC Sanctions List Update", deadline: "Continuous", description: "Ensure customer screening against current OFAC SDN and sectoral lists." },
    ],
    keyRequirements: [
      "Designate a BSA/AML Compliance Officer",
      "Implement a written AML compliance program",
      "Conduct independent testing (audit) annually",
      "Provide ongoing employee training",
      "Implement Customer Due Diligence (CDD) procedures",
      "Maintain records for 5 years",
    ],
  },
  fintrac: {
    name: "FINTRAC",
    fullName: "Financial Transactions and Reports Analysis Centre of Canada",
    country: "Canada",
    primaryLaw: "Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA)",
    lawUrl: "https://laws-lois.justice.gc.ca/eng/acts/P-24.501/",
    fiu: "FINTRAC",
    fiuPortal: "https://www.fintrac-canafe.gc.ca/reporting-declaration/info/f2r-eng",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report transactions where there are reasonable grounds to suspect ML/TF.", deadline: "30 days from detection", trigger: "Reasonable grounds to suspect ML/TF", frequency: "event" },
      { name: "Large Cash Transaction Report", code: "LCTR", description: "Report receipt of CAD $10,000 or more in cash in a single transaction.", deadline: "15 days from transaction", trigger: "Cash ≥ CAD $10,000", frequency: "event" },
      { name: "Electronic Funds Transfer Report", code: "EFTR", description: "Report electronic funds transfers of CAD $10,000 or more.", deadline: "5 days from transfer", trigger: "EFT ≥ CAD $10,000", frequency: "event" },
      { name: "Terrorist Property Report", code: "TPR", description: "Report property owned or controlled by a listed terrorist entity.", deadline: "Immediately", trigger: "Listed entity property identified", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Two-Year Effectiveness Review", deadline: "Every 2 years", description: "Independent review of compliance program effectiveness.", frequencyMonths: 24 },
      { title: "Risk Assessment Update", deadline: "As needed / ongoing", description: "Update ML/TF risk assessment when business changes occur." },
    ],
    keyRequirements: [
      "Appoint a Compliance Officer",
      "Develop written compliance policies & procedures",
      "Conduct a risk assessment",
      "Implement a training program",
      "Institute an effectiveness review every 2 years",
      "Maintain records for at least 5 years",
    ],
  },
  fca: {
    name: "FCA",
    fullName: "Financial Conduct Authority",
    country: "United Kingdom",
    primaryLaw: "Proceeds of Crime Act 2002 (POCA) & Money Laundering Regulations 2017",
    lawUrl: "https://www.legislation.gov.uk/uksi/2017/692/contents",
    fiu: "NCA (UKFIU)",
    fiuPortal: "https://www.nca.gov.uk/our-work/suspicious-activity-reports/",
    reports: [
      { name: "Suspicious Activity Report", code: "SAR", description: "Report knowledge or suspicion of money laundering or terrorist financing to the NCA.", deadline: "As soon as practicable", trigger: "Knowledge or suspicion of ML/TF", frequency: "event" },
      { name: "Defence Against Money Laundering (DAML)", code: "DAML", description: "Request consent from NCA to proceed with a transaction that is suspected to involve criminal property.", deadline: "Before proceeding with transaction", trigger: "Suspected criminal property — need consent", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Annual Financial Crime Report (REP-CRIM)", deadline: "Annually (30 business days after period end)", description: "Submit the REP-CRIM report to the FCA covering financial crime data.", frequencyMonths: 12 },
      { title: "AML/CTF Risk Assessment", deadline: "Ongoing / Annual review", description: "Firm-wide risk assessment under Reg 18 of the MLR 2017.", frequencyMonths: 12 },
    ],
    keyRequirements: [
      "Appoint a nominated officer (MLRO)",
      "Conduct firm-wide risk assessment (Reg 18)",
      "Apply CDD / EDD measures",
      "Provide staff training on ML/TF risks",
      "Screen against UK sanctions (OFSI HMT list)",
      "Keep records for 5 years after relationship ends",
    ],
  },
  cysec: {
    name: "CySEC",
    fullName: "Cyprus Securities and Exchange Commission",
    country: "Cyprus",
    primaryLaw: "AML Law 188(I)/2007 & CySEC Directive DI144-2007-08",
    lawUrl: "https://www.cysec.gov.cy/en-GB/legislation/aml-cft/",
    fiu: "MOKAS (Unit for Combating Money Laundering)",
    fiuPortal: "https://www.law.gov.cy/law/mokas/mokas.nsf",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report suspicious transactions to MOKAS as required under AML Law 188(I)/2007.", deadline: "As soon as suspicion is formed", trigger: "Suspicion of ML/TF", frequency: "event" },
      { name: "Cash Transaction Report", code: "CTR", description: "Report cash payments of €10,000 or more.", deadline: "Within working days of transaction", trigger: "Cash ≥ €10,000", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Annual Compliance Report (ACR)", deadline: "By 30 April each year", description: "Self-assessment of AML/CFT compliance effectiveness submitted to CySEC.", month: 3, day: 30 },
      { title: "Internal Audit Report", deadline: "Annually", description: "Independent audit of AML policies, procedures, and controls.", frequencyMonths: 12 },
      { title: "CAMLO Appointment Notification", deadline: "Within 15 days of change", description: "Notify CySEC of any change to the appointed CAMLO." },
    ],
    keyRequirements: [
      "Appoint a CAMLO (Compliance Anti-Money Laundering Officer)",
      "Implement written AML policies and procedures",
      "Conduct customer risk assessments",
      "Apply CDD / EDD including PEP screening",
      "Submit Annual Compliance Report to CySEC by 30 April",
      "Maintain records for 5 years",
    ],
  },
  icpac: {
    name: "ICPAC",
    fullName: "Institute of Certified Public Accountants of Cyprus",
    country: "Cyprus",
    primaryLaw: "AML Law 188(I)/2007 (as supervisory authority for accountants/auditors)",
    lawUrl: "https://www.icpac.org.cy/en/aml",
    fiu: "MOKAS",
    fiuPortal: "https://www.law.gov.cy/law/mokas/mokas.nsf",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report suspicious transactions to MOKAS.", deadline: "As soon as suspicion is formed", trigger: "Suspicion of ML/TF", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Internal Assessment Report (IAR)", deadline: "Annually", description: "Annual internal AML risk assessment submitted to ICPAC.", frequencyMonths: 12 },
      { title: "AML Compliance Questionnaire", deadline: "Annually", description: "Mandatory self-assessment questionnaire on AML/CFT compliance.", frequencyMonths: 12 },
      { title: "CDD Records Maintenance", deadline: "Ongoing", description: "Maintain client due diligence files for all financial transactions." },
    ],
    keyRequirements: [
      "Appoint a Compliance Officer for AML",
      "Conduct firm-wide ML/TF risk assessment",
      "Apply CDD to all clients before engagement",
      "File STRs with MOKAS when suspicion arises",
      "Submit Internal Assessment Report to ICPAC annually",
      "Keep records for at least 5 years",
    ],
  },
  amld: {
    name: "EU AMLD",
    fullName: "EU Anti-Money Laundering Directives (6AMLD)",
    country: "European Union",
    primaryLaw: "Directive (EU) 2018/1673 (6AMLD)",
    lawUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32018L1673",
    fiu: "National FIU (varies by member state)",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report suspicious transactions to the relevant national FIU.", deadline: "As soon as practicable (varies by member state)", trigger: "Suspicion of ML/TF", frequency: "event" },
    ],
    periodicObligations: [
      { title: "Risk Assessment Review", deadline: "Ongoing", description: "Member states must conduct national ML/TF risk assessments (Art. 7 of 4AMLD)." },
    ],
    keyRequirements: [
      "Apply CDD measures including beneficial ownership identification",
      "Screen against EU consolidated sanctions list",
      "Implement PEP screening procedures",
      "Report suspicious transactions to national FIU",
      "Maintain records for 5 years",
      "Ensure staff training on AML/CFT obligations",
    ],
  },
  dfsa: {
    name: "DFSA",
    fullName: "Dubai Financial Services Authority",
    country: "UAE (DIFC)",
    primaryLaw: "DFSA AML Module (AML/CTF Rulebook) & Federal Decree Law No. 10 of 2025",
    lawUrl: "https://www.dfsa.ae/what-we-do/aml-ctf-sanctions-compliance/overview-of-dfsa-aml-ctf-sanctions-obligations",
    fiu: "UAE Financial Intelligence Unit (goAML)",
    fiuPortal: "https://www.uaefiu.gov.ae",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report suspicious transactions or activities to the UAE FIU via goAML platform.", deadline: "As soon as suspicion is formed", trigger: "Knowledge or suspicion of ML/TF/PF", frequency: "event" as const },
    ],
    periodicObligations: [
      { title: "Annual MLRO Report to Senior Management", deadline: "Annually", description: "The MLRO must submit an annual report to the firm's senior management on AML/CFT compliance.", frequencyMonths: 12 },
      { title: "Independent AML/CFT Audit", deadline: "Annually", description: "Independent audit or review of the firm's AML/CFT systems and controls.", frequencyMonths: 12 },
      { title: "Business Risk Assessment Update", deadline: "Ongoing / Annual", description: "Maintain and update the firm-wide ML/TF risk assessment.", frequencyMonths: 12 },
    ],
    keyRequirements: [
      "Appoint a Money Laundering Reporting Officer (MLRO)",
      "Implement a written AML/CFT compliance programme",
      "Conduct firm-wide ML/TF risk assessment",
      "Apply CDD/EDD measures including beneficial ownership",
      "Screen against UAE Local Terrorist List and UN sanctions",
      "File STRs via goAML platform",
      "Maintain records for at least 5 years",
      "Provide ongoing AML/CFT staff training",
    ],
  },
  cbuae: {
    name: "CBUAE",
    fullName: "Central Bank of the UAE",
    country: "United Arab Emirates",
    primaryLaw: "Federal Decree Law No. 10 of 2025 on AML/CFT/CPF & Cabinet Resolution No. 134 of 2025",
    lawUrl: "https://rulebook.centralbank.ae/en/rulebook/1626-suspicious-transaction-reporting",
    fiu: "UAE Financial Intelligence Unit (goAML)",
    fiuPortal: "https://www.uaefiu.gov.ae",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report suspicious transactions to the UAE FIU via the goAML platform. Includes attempted transactions.", deadline: "As soon as suspicion is formed", trigger: "Suspicion of ML/TF/PF", frequency: "event" as const },
      { name: "Large Cash Transaction Report", code: "LCTR", description: "Report cash transactions of AED 55,000 or more.", deadline: "Within 30 days of transaction", trigger: "Cash ≥ AED 55,000", frequency: "event" as const },
    ],
    periodicObligations: [
      { title: "Annual Compliance Officer Report", deadline: "Annually", description: "Compliance Officer must report to senior management and Board on AML/CFT programme effectiveness.", frequencyMonths: 12 },
      { title: "Independent AML/CFT Audit", deadline: "Annually", description: "External independent audit of AML/CFT systems, controls, and processes.", frequencyMonths: 12 },
      { title: "Risk Assessment Update", deadline: "Ongoing / Annual", description: "Update institutional ML/TF/PF risk assessment as required.", frequencyMonths: 12 },
    ],
    keyRequirements: [
      "Appoint a Compliance Officer approved by CBUAE",
      "Implement a Board-approved AML/CFT/CPF compliance programme",
      "Conduct institutional risk assessment",
      "Apply CDD/EDD including UBO identification",
      "Screen against UAE Local Terrorist List, UN, and OFAC sanctions",
      "File STRs and LCTRs via goAML",
      "Maintain transaction records for 5 years",
      "Conduct ongoing staff training",
    ],
  },
  cbc: {
    name: "CBC",
    fullName: "Central Bank of Cyprus",
    country: "Cyprus",
    primaryLaw: "Prevention and Suppression of Money Laundering Activities Laws 2007–2021 (AML/CFT Law)",
    lawUrl: "https://www.centralbank.cy/en/licensing-supervision/prevention-and-suppression-of-money-laundering-activities-and-financing-of-terrorism-1",
    fiu: "MOKAS (Unit for Combating Money Laundering)",
    fiuPortal: "https://www.law.gov.cy/law/mokas/mokas.nsf",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report suspicious transactions to MOKAS as required under the AML/CFT Law.", deadline: "As soon as suspicion is formed", trigger: "Suspicion of ML/TF", frequency: "event" as const },
      { name: "Cash Transaction Report", code: "CTR", description: "Report cash payments of €10,000 or more.", deadline: "Within working days of transaction", trigger: "Cash ≥ €10,000", frequency: "event" as const },
    ],
    periodicObligations: [
      { title: "Annual AML/CFT Compliance Report", deadline: "Annually (as specified by CBC)", description: "Submit AML/CFT compliance report to the Central Bank of Cyprus covering programme effectiveness.", frequencyMonths: 12 },
      { title: "Internal Audit Report", deadline: "Annually", description: "Independent internal audit of AML/CFT policies, procedures, and controls.", frequencyMonths: 12 },
      { title: "Risk Assessment Update", deadline: "Ongoing", description: "Maintain and update the firm-wide ML/TF risk assessment." },
    ],
    keyRequirements: [
      "Appoint an AML Compliance Officer (AMLCO)",
      "Implement written AML/CFT policies and procedures",
      "Conduct customer and firm-wide risk assessments",
      "Apply CDD/EDD including PEP and sanctions screening",
      "File STRs with MOKAS",
      "Submit annual AML/CFT compliance report to CBC",
      "Maintain records for 5 years after end of business relationship",
      "Provide ongoing staff training",
    ],
  },
  bog: {
    name: "Bank of Greece",
    fullName: "Bank of Greece (Τράπεζα της Ελλάδος)",
    country: "Greece",
    primaryLaw: "Law 4557/2018 on AML/CFT (transposing 4AMLD/5AMLD) & Bank of Greece Governor's Acts",
    lawUrl: "https://www.bankofgreece.gr/en/main-tasks/supervision/anti-money-laundering",
    fiu: "Hellenic FIU (Authority for Combating Money Laundering — SDOE)",
    fiuPortal: "https://www.hellenic-fiu.gr",
    reports: [
      { name: "Suspicious Transaction Report", code: "STR", description: "Report suspicious transactions to the Hellenic FIU as required under Law 4557/2018.", deadline: "As soon as suspicion is formed", trigger: "Suspicion of ML/TF", frequency: "event" as const },
    ],
    periodicObligations: [
      { title: "Annual AML/CFT Compliance Report", deadline: "Annually", description: "Submit annual compliance report to Bank of Greece covering AML/CFT programme effectiveness for EMIs and payment institutions.", frequencyMonths: 12 },
      { title: "Internal Audit Report", deadline: "Annually", description: "Independent review of AML/CFT systems and controls.", frequencyMonths: 12 },
      { title: "Risk Assessment Update", deadline: "Ongoing / Annual", description: "Update ML/TF risk assessment for the institution and its customer base.", frequencyMonths: 12 },
    ],
    keyRequirements: [
      "Appoint an AML Compliance Officer",
      "Implement written AML/CFT policies and procedures",
      "Conduct institutional and customer risk assessments",
      "Apply CDD/EDD measures including PEP screening",
      "Screen against EU consolidated sanctions list",
      "File STRs with the Hellenic FIU",
      "Submit annual compliance report to Bank of Greece",
      "Maintain records for 5 years",
      "Provide ongoing AML/CFT staff training",
    ],
  },
};

export default function SuiteRegulatory() {
  const { user } = useAuth();
  const [regulator, setRegulator] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("regulator")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setRegulator(data?.regulator ?? null);
        setIsLoading(false);
      });
  }, [user]);

  const profile = regulator ? REGULATORY_PROFILES[regulator.toLowerCase()] : null;
  const eventReports = profile?.reports.filter((r) => r.frequency === "event") ?? [];
  const periodicObs = profile?.periodicObligations ?? [];

  /* ─── Compliance Calendar logic ─── */
  const calendarItems = useMemo(() => {
    if (!profile) return [];
    const now = new Date();
    const currentYear = now.getFullYear();

    interface CalendarItem {
      title: string;
      type: "periodic" | "event-triggered";
      nextDue: Date | null;
      daysUntil: number | null;
      deadline: string;
      description: string;
      status: "overdue" | "urgent" | "upcoming" | "on-track" | "continuous";
    }

    const items: CalendarItem[] = [];

    // Periodic obligations with fixed dates
    for (const ob of periodicObs) {
      if (ob.month !== undefined && ob.day !== undefined) {
        // Fixed annual date (e.g., ACR by 30 April → month=3, day=30)
        let nextDue = new Date(currentYear, ob.month, ob.day);
        if (isPast(nextDue)) {
          nextDue = new Date(currentYear + 1, ob.month, ob.day);
        }
        const days = differenceInDays(nextDue, now);
        items.push({
          title: ob.title,
          type: "periodic",
          nextDue,
          daysUntil: days,
          deadline: ob.deadline,
          description: ob.description,
          status: days < 0 ? "overdue" : days <= 30 ? "urgent" : days <= 90 ? "upcoming" : "on-track",
        });
      } else if (ob.frequencyMonths) {
        // Rolling frequency — assume next due is start of next period from now
        const monthsAhead = ob.frequencyMonths;
        // Approximate: next due = first day of the month that is `frequencyMonths` from Jan 1 of current year
        let nextDue = new Date(currentYear, monthsAhead - 1, 1);
        while (isPast(nextDue)) {
          nextDue = addMonths(nextDue, ob.frequencyMonths);
        }
        const days = differenceInDays(nextDue, now);
        items.push({
          title: ob.title,
          type: "periodic",
          nextDue,
          daysUntil: days,
          deadline: ob.deadline,
          description: ob.description,
          status: days <= 30 ? "urgent" : days <= 90 ? "upcoming" : "on-track",
        });
      } else {
        // Continuous / ongoing
        items.push({
          title: ob.title,
          type: "periodic",
          nextDue: null,
          daysUntil: null,
          deadline: ob.deadline,
          description: ob.description,
          status: "continuous",
        });
      }
    }

    // Transaction-triggered reports — show as standing obligations
    for (const r of eventReports) {
      items.push({
        title: `${r.name} (${r.code})`,
        type: "event-triggered",
        nextDue: null,
        daysUntil: null,
        deadline: r.deadline,
        description: r.trigger,
        status: "continuous",
      });
    }

    // Sort: overdue first, then by days until due, then continuous at end
    const statusOrder: Record<string, number> = { overdue: 0, urgent: 1, upcoming: 2, "on-track": 3, continuous: 4 };
    items.sort((a, b) => {
      const oa = statusOrder[a.status] ?? 5;
      const ob2 = statusOrder[b.status] ?? 5;
      if (oa !== ob2) return oa - ob2;
      if (a.daysUntil !== null && b.daysUntil !== null) return a.daysUntil - b.daysUntil;
      return 0;
    });

    return items;
  }, [periodicObs, eventReports]);

  const statusConfig: Record<string, { label: string; badgeClass: string }> = {
    overdue: { label: "Overdue", badgeClass: "bg-destructive/10 text-destructive border-destructive/20" },
    urgent: { label: "Due Soon", badgeClass: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    upcoming: { label: "Upcoming", badgeClass: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    "on-track": { label: "On Track", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    continuous: { label: "Ongoing", badgeClass: "bg-muted text-muted-foreground border-border" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (!regulator || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center space-y-4">
        <SEO title="Regulatory Hub" description="View your regulatory obligations." noindex />
        <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center">
          <Building2 className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">No Regulator Selected</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          To see your regulatory obligations, reporting requirements, and filing deadlines, please set your regulator in{" "}
          <a href="/suite/settings" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Settings
          </a>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-8">
      <SEO title={`Regulatory Hub — ${profile.name}`} description={`Regulatory obligations for ${profile.fullName}`} noindex />

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Regulatory Hub</h1>
            <p className="text-sm text-muted-foreground">
              Obligations for <span className="font-semibold text-foreground">{profile.fullName}</span> — {profile.country}
            </p>
          </div>
        </div>
      </div>

      {/* Regulator info card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Primary Legislation</span>
              <p className="font-medium text-foreground mt-0.5">
                {profile.lawUrl ? (
                  <a href={profile.lawUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    {profile.primaryLaw} <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  profile.primaryLaw
                )}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">FIU / Filing Authority</span>
              <p className="font-medium text-foreground mt-0.5">{profile.fiu}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Filing Portal</span>
              <p className="font-medium text-foreground mt-0.5">
                {profile.fiuPortal ? (
                  <a href={profile.fiuPortal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    Open portal <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">Varies by member state</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Compliance Calendar ─── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Compliance Calendar</h2>
        </div>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="divide-y divide-border">
              {calendarItems.map((item, i) => {
                const cfg = statusConfig[item.status];
                return (
                  <div key={i} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                    {/* Status indicator */}
                    <div className="pt-0.5 shrink-0">
                      {item.status === "overdue" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                      ) : item.status === "urgent" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      ) : item.status === "upcoming" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      ) : item.status === "on-track" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.badgeClass}`}>
                          {cfg.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.type === "periodic" ? "Periodic" : "Event-triggered"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>

                    {/* Deadline / countdown */}
                    <div className="text-right shrink-0 space-y-0.5">
                      {item.nextDue ? (
                        <>
                          <div className="text-sm font-medium text-foreground">
                            {format(item.nextDue, "d MMM yyyy")}
                          </div>
                          <div className={`text-xs ${item.daysUntil !== null && item.daysUntil <= 30 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                            {item.daysUntil !== null && item.daysUntil >= 0
                              ? `${item.daysUntil} days left`
                              : item.daysUntil !== null
                              ? `${Math.abs(item.daysUntil)} days overdue`
                              : ""}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">{item.deadline}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <h2 className="text-lg font-semibold text-foreground">Transaction-Triggered Reports</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventReports.map((r) => (
            <Card key={r.code}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{r.name}</CardTitle>
                  <Badge variant="outline" className="text-xs font-mono">{r.code}</Badge>
                </div>
                <CardDescription className="text-xs">{r.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-muted-foreground">Deadline: </span>
                    <span className="font-medium text-foreground">{r.deadline}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-muted-foreground">Trigger: </span>
                    <span className="font-medium text-foreground">{r.trigger}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Periodic obligations */}
      {periodicObs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <h2 className="text-lg font-semibold text-foreground">Periodic Obligations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {periodicObs.map((o) => (
              <Card key={o.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{o.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <span className="text-muted-foreground">Deadline: </span>
                      <span className="font-medium text-foreground">{o.deadline}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{o.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Key requirements checklist */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h2 className="text-lg font-semibold text-foreground">Key Compliance Requirements</h2>
        </div>
        <Card>
          <CardContent className="pt-5 pb-4">
            <ul className="space-y-2.5">
              {profile.keyRequirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
