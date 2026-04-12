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

  const eventReports = profile.reports.filter((r) => r.frequency === "event");
  const periodicObs = profile.periodicObligations;

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

      {/* Event-driven reports */}
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
