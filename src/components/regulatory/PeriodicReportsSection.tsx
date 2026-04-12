import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generatePeriodicReportPDF, PeriodicReportPDFData } from "@/services/periodicReportExport";
import {
  FileText, Plus, Download, CheckCircle2, Clock, Send,
  ChevronDown, ChevronUp, Pencil, Trash2, Eye, Sparkles, Loader2,
  AlertTriangle, CircleAlert, Info, CheckSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface PeriodicObligation {
  title: string;
  deadline: string;
  description: string;
  month?: number;
  day?: number;
  frequencyMonths?: number;
}

interface Props {
  regulator: string;
  regulatorFullName: string;
  periodicObligations: PeriodicObligation[];
}

interface PeriodicReport {
  id: string;
  report_type: string;
  report_title: string;
  regulator: string;
  period_year: number;
  filing_status: string;
  content: Record<string, any>;
  notes: string | null;
  filed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DbStats {
  totalCustomers: number;
  highRiskCustomers: number;
  totalScreenings: number;
  matchScreenings: number;
  totalAlerts: number;
  resolvedAlerts: number;
  totalTransactions: number;
  flaggedTransactions: number;
  totalCases: number;
  totalSTRs: number;
}

/* ─── Regulator-specific content templates ─── */
const REGULATOR_CONTENT_TEMPLATES: Record<string, Record<string, Record<string, string>>> = {
  // ICPAC
  icpac: {
    IAR: {
      complianceOfficer: "",
      officerQualifications: "",
      policiesLastUpdated: "",
      trainingConducted: "",
      trainingDates: "",
      independentAudit: "",
      auditFindings: "",
      riskAssessmentSummary: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      actionsTaken: "",
      recommendations: "",
      icpacSubmissionMethod: "",
      clientCategorisation: "",
    },
    AML_QUESTIONNAIRE: {
      complianceOfficer: "",
      amlPoliciesAdopted: "",
      cddProcedures: "",
      ongoingMonitoring: "",
      staffTrainingDetails: "",
      internalReportingProcedures: "",
      recordKeepingPractices: "",
      riskAssessmentMethodology: "",
      highRiskClientMeasures: "",
      sanctionsScreeningProcess: "",
    },
  },
  // CySEC
  cysec: {
    ACR: {
      complianceOfficer: "",
      officerQualifications: "",
      policiesLastUpdated: "",
      trainingConducted: "",
      trainingDates: "",
      independentAudit: "",
      auditFindings: "",
      riskAssessmentSummary: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      actionsTaken: "",
      recommendations: "",
      camloDetails: "",
      cysecNotifications: "",
    },
    IAR: {
      complianceOfficer: "",
      officerQualifications: "",
      auditScope: "",
      auditMethodology: "",
      auditFindings: "",
      complianceDeficiencies: "",
      remediationPlan: "",
      riskAssessmentSummary: "",
      keyRisksIdentified: "",
      recommendations: "",
    },
  },
  // FinCEN
  fincen: {
    BSA_REVIEW: {
      complianceOfficer: "",
      officerQualifications: "",
      policiesLastUpdated: "",
      trainingConducted: "",
      trainingDates: "",
      independentAudit: "",
      auditFindings: "",
      riskAssessmentSummary: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      actionsTaken: "",
      recommendations: "",
      bsaFilingsSummary: "",
      ctrsFiledCount: "",
      sarFiledCount: "",
    },
  },
  // FINTRAC
  fintrac: {
    EFFECTIVENESS_REVIEW: {
      complianceOfficer: "",
      officerQualifications: "",
      reviewScope: "",
      reviewMethodology: "",
      policiesEffectiveness: "",
      trainingEffectiveness: "",
      riskAssessmentEffectiveness: "",
      recordKeepingEffectiveness: "",
      reportingEffectiveness: "",
      deficienciesIdentified: "",
      remediationPlan: "",
      recommendations: "",
    },
  },
  // FCA
  fca: {
    REP_CRIM: {
      complianceOfficer: "",
      officerQualifications: "",
      policiesLastUpdated: "",
      trainingConducted: "",
      trainingDates: "",
      independentAudit: "",
      auditFindings: "",
      riskAssessmentSummary: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      sarsFiled: "",
      damlRequests: "",
      actionsTaken: "",
      recommendations: "",
    },
    RISK_ASSESSMENT: {
      complianceOfficer: "",
      riskAssessmentSummary: "",
      customerRiskProfile: "",
      geographicRisks: "",
      productServiceRisks: "",
      deliveryChannelRisks: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      residualRiskRating: "",
      actionsTaken: "",
      recommendations: "",
    },
  },
  // DFSA
  dfsa: {
    MLRO_REPORT: {
      complianceOfficer: "",
      officerQualifications: "",
      policiesLastUpdated: "",
      trainingConducted: "",
      trainingDates: "",
      independentAudit: "",
      auditFindings: "",
      riskAssessmentSummary: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      actionsTaken: "",
      recommendations: "",
      goAMLFilings: "",
      sanctionsScreeningSummary: "",
      seniorManagementBriefing: "",
    },
    AML_AUDIT: {
      auditFirm: "",
      auditScope: "",
      auditMethodology: "",
      auditFindings: "",
      complianceGaps: "",
      remediationTimeline: "",
      riskAssessmentSummary: "",
      recommendations: "",
    },
    BRA_UPDATE: {
      riskAssessmentSummary: "",
      customerRiskProfile: "",
      geographicRisks: "",
      productServiceRisks: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      residualRiskRating: "",
      changesFromPriorYear: "",
      recommendations: "",
    },
  },
  // CBUAE
  cbuae: {
    CO_REPORT: {
      complianceOfficer: "",
      officerQualifications: "",
      policiesLastUpdated: "",
      trainingConducted: "",
      trainingDates: "",
      independentAudit: "",
      auditFindings: "",
      riskAssessmentSummary: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      actionsTaken: "",
      recommendations: "",
      goAMLFilings: "",
      sanctionsScreeningSummary: "",
      boardReportDate: "",
    },
    AML_AUDIT: {
      auditFirm: "",
      auditScope: "",
      auditMethodology: "",
      auditFindings: "",
      complianceGaps: "",
      remediationTimeline: "",
      riskAssessmentSummary: "",
      recommendations: "",
    },
    RISK_ASSESSMENT: {
      riskAssessmentSummary: "",
      customerRiskProfile: "",
      geographicRisks: "",
      productServiceRisks: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      residualRiskRating: "",
      recommendations: "",
    },
  },
  // CBC
  cbc: {
    AML_COMPLIANCE: {
      complianceOfficer: "",
      officerQualifications: "",
      policiesLastUpdated: "",
      trainingConducted: "",
      trainingDates: "",
      independentAudit: "",
      auditFindings: "",
      riskAssessmentSummary: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      actionsTaken: "",
      recommendations: "",
      mokasFilings: "",
      sanctionsScreeningSummary: "",
    },
    IAR: {
      auditScope: "",
      auditMethodology: "",
      auditFindings: "",
      complianceDeficiencies: "",
      remediationPlan: "",
      riskAssessmentSummary: "",
      recommendations: "",
    },
  },
  // Bank of Greece
  bog: {
    AML_COMPLIANCE: {
      complianceOfficer: "",
      officerQualifications: "",
      policiesLastUpdated: "",
      trainingConducted: "",
      trainingDates: "",
      independentAudit: "",
      auditFindings: "",
      riskAssessmentSummary: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      actionsTaken: "",
      recommendations: "",
      hellenicFIUFilings: "",
      emiLicenseCompliance: "",
      paymentServicesCompliance: "",
    },
    IAR: {
      auditScope: "",
      auditMethodology: "",
      auditFindings: "",
      complianceDeficiencies: "",
      remediationPlan: "",
      riskAssessmentSummary: "",
      recommendations: "",
    },
    RISK_ASSESSMENT: {
      riskAssessmentSummary: "",
      customerRiskProfile: "",
      geographicRisks: "",
      productServiceRisks: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      residualRiskRating: "",
      recommendations: "",
    },
  },
  // EU AMLD
  amld: {
    RISK_ASSESSMENT: {
      riskAssessmentSummary: "",
      customerRiskProfile: "",
      geographicRisks: "",
      productServiceRisks: "",
      keyRisksIdentified: "",
      mitigatingControls: "",
      residualRiskRating: "",
      recommendations: "",
    },
  },
};

/* ─── Default content template when no regulator-specific one exists ─── */
const DEFAULT_CONTENT_TEMPLATE: Record<string, string> = {
  complianceOfficer: "",
  officerQualifications: "",
  policiesLastUpdated: "",
  trainingConducted: "",
  trainingDates: "",
  independentAudit: "",
  auditFindings: "",
  riskAssessmentSummary: "",
  keyRisksIdentified: "",
  mitigatingControls: "",
  actionsTaken: "",
  recommendations: "",
};

const REPORT_TYPE_MAP: Record<string, string> = {
  "Annual Compliance Report (ACR)": "ACR",
  "Internal Audit Report": "IAR",
  "Internal Assessment Report (IAR)": "IAR",
  "AML Compliance Questionnaire": "AML_QUESTIONNAIRE",
  "BSA/AML Compliance Program Review": "BSA_REVIEW",
  "Two-Year Effectiveness Review": "EFFECTIVENESS_REVIEW",
  "Annual Financial Crime Report (REP-CRIM)": "REP_CRIM",
  "AML/CTF Risk Assessment": "RISK_ASSESSMENT",
  "Risk Assessment Review": "RISK_ASSESSMENT",
  "Risk Assessment Update": "RISK_ASSESSMENT",
  "Annual MLRO Report to Senior Management": "MLRO_REPORT",
  "Independent AML/CFT Audit": "AML_AUDIT",
  "Business Risk Assessment Update": "BRA_UPDATE",
  "Annual Compliance Officer Report": "CO_REPORT",
  "Annual AML/CFT Compliance Report": "AML_COMPLIANCE",
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; badgeClass: string }> = {
  draft: { label: "Draft", icon: Pencil, badgeClass: "bg-muted text-muted-foreground" },
  completed: { label: "Completed", icon: CheckCircle2, badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  filed: { label: "Filed", icon: Send, badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
};

function getContentTemplate(regulator: string, reportType: string): Record<string, string> {
  const regulatorTemplates = REGULATOR_CONTENT_TEMPLATES[regulator];
  if (regulatorTemplates && regulatorTemplates[reportType]) {
    return { ...regulatorTemplates[reportType] };
  }
  return { ...DEFAULT_CONTENT_TEMPLATE };
}

export default function PeriodicReportsSection({ regulator, regulatorFullName, periodicObligations }: Props) {
  const { user } = useAuth();
  const [reports, setReports] = useState<PeriodicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<DbStats | null>(null);
  const [profile, setProfile] = useState<{ company_name?: string; full_name?: string } | null>(null);

  const currentYear = new Date().getFullYear();

  const fetchReports = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("periodic_reports")
      .select("*")
      .eq("user_id", user.id)
      .eq("regulator", regulator)
      .order("period_year", { ascending: false });
    setReports((data as any[] || []) as PeriodicReport[]);
    setLoading(false);
  }, [user, regulator]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const [customers, screenings, alerts, transactions, cases, strs, prof] = await Promise.all([
      supabase.from("suite_customers").select("id, risk_level", { count: "exact" }).eq("user_id", user.id),
      supabase.from("suite_screenings").select("id, match_count", { count: "exact" }).eq("user_id", user.id),
      supabase.from("suite_alerts").select("id, status", { count: "exact" }).eq("user_id", user.id),
      supabase.from("suite_transactions").select("id, risk_flag", { count: "exact" }).eq("user_id", user.id),
      supabase.from("suite_cases").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("str_reports").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("profiles").select("company_name, full_name").eq("user_id", user.id).single(),
    ]);

    setProfile(prof.data);
    setStats({
      totalCustomers: customers.count || 0,
      highRiskCustomers: (customers.data || []).filter((c: any) => c.risk_level === "high").length,
      totalScreenings: screenings.count || 0,
      matchScreenings: (screenings.data || []).filter((s: any) => s.match_count > 0).length,
      totalAlerts: alerts.count || 0,
      resolvedAlerts: (alerts.data || []).filter((a: any) => a.status === "resolved").length,
      totalTransactions: transactions.count || 0,
      flaggedTransactions: (transactions.data || []).filter((t: any) => t.risk_flag).length,
      totalCases: cases.count || 0,
      totalSTRs: strs.count || 0,
    });
  }, [user]);

  useEffect(() => { fetchReports(); fetchStats(); }, [fetchReports, fetchStats]);

  const actionableObligations = periodicObligations.filter(o => o.frequencyMonths || (o.month !== undefined));

  const handleStartReport = async (obligation: PeriodicObligation) => {
    if (!user) return;
    const reportType = REPORT_TYPE_MAP[obligation.title] || obligation.title.replace(/\s+/g, "_").toUpperCase();

    const existing = reports.find(r => r.report_type === reportType && r.period_year === currentYear);
    if (existing) {
      setExpandedId(existing.id);
      setEditingId(existing.id);
      toast.info("Report already exists for this year. Opening for editing.");
      return;
    }

    const contentTemplate = getContentTemplate(regulator, reportType);
    // Pre-fill compliance officer from profile
    if (contentTemplate.complianceOfficer !== undefined) {
      contentTemplate.complianceOfficer = profile?.full_name || "";
    }

    const { data, error } = await supabase
      .from("periodic_reports")
      .insert({
        user_id: user.id,
        report_type: reportType,
        report_title: obligation.title,
        regulator,
        period_year: currentYear,
        content: contentTemplate,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create report: " + error.message);
      return;
    }
    toast.success("Report draft created with regulator-specific template");
    await fetchReports();
    setExpandedId((data as any).id);
    setEditingId((data as any).id);
  };

  const handleSave = async (report: PeriodicReport, content: Record<string, any>, notes: string) => {
    const { error } = await supabase
      .from("periodic_reports")
      .update({ content, notes, updated_at: new Date().toISOString() } as any)
      .eq("id", report.id);
    if (error) { toast.error("Save failed"); return; }
    toast.success("Report saved");
    setEditingId(null);
    fetchReports();
  };

  const handleStatusChange = async (report: PeriodicReport, newStatus: string) => {
    const updates: any = { filing_status: newStatus };
    if (newStatus === "completed") updates.completed_at = new Date().toISOString();
    if (newStatus === "filed") updates.filed_at = new Date().toISOString();

    const { error } = await supabase
      .from("periodic_reports")
      .update(updates)
      .eq("id", report.id);
    if (error) { toast.error("Update failed"); return; }
    toast.success(`Report marked as ${newStatus}`);
    fetchReports();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("periodic_reports").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Report deleted");
    fetchReports();
  };

  const handleExportPDF = (report: PeriodicReport) => {
    if (!stats) return;
    const pdfData: PeriodicReportPDFData = {
      reportTitle: report.report_title,
      reportType: report.report_type,
      regulator: regulator.toUpperCase(),
      regulatorFullName,
      periodYear: report.period_year,
      filingStatus: report.filing_status,
      createdAt: format(new Date(report.created_at), "dd MMM yyyy"),
      completedAt: report.completed_at ? format(new Date(report.completed_at), "dd MMM yyyy") : null,
      filedAt: report.filed_at ? format(new Date(report.filed_at), "dd MMM yyyy") : null,
      notes: report.notes,
      content: report.content,
      companyName: profile?.company_name || undefined,
      preparedBy: profile?.full_name || undefined,
      ...stats,
    };
    const doc = generatePeriodicReportPDF(pdfData);
    doc.save(`${report.report_type}_${report.period_year}_${regulator}.pdf`);
    toast.success("PDF exported");
  };

  const handlePreviewPDF = (report: PeriodicReport) => {
    if (!stats) return;
    const pdfData: PeriodicReportPDFData = {
      reportTitle: report.report_title,
      reportType: report.report_type,
      regulator: regulator.toUpperCase(),
      regulatorFullName,
      periodYear: report.period_year,
      filingStatus: report.filing_status,
      createdAt: format(new Date(report.created_at), "dd MMM yyyy"),
      completedAt: report.completed_at ? format(new Date(report.completed_at), "dd MMM yyyy") : null,
      filedAt: report.filed_at ? format(new Date(report.filed_at), "dd MMM yyyy") : null,
      notes: report.notes,
      content: report.content,
      companyName: profile?.company_name || undefined,
      preparedBy: profile?.full_name || undefined,
      ...stats,
    };
    const doc = generatePeriodicReportPDF(pdfData);
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };

  if (loading) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Periodic Reports</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          {reports.length} report{reports.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {stats && (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Auto-populated data (from your database):</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {[
                { label: "Customers", value: stats.totalCustomers, sub: `${stats.highRiskCustomers} high-risk` },
                { label: "Screenings", value: stats.totalScreenings, sub: `${stats.matchScreenings} matches` },
                { label: "Alerts", value: stats.totalAlerts, sub: `${stats.resolvedAlerts} resolved` },
                { label: "Transactions", value: stats.totalTransactions, sub: `${stats.flaggedTransactions} flagged` },
                { label: "STR/SARs Filed", value: stats.totalSTRs, sub: `${stats.totalCases} cases` },
              ].map(s => (
                <div key={s.label} className="space-y-0.5">
                  <div className="text-lg font-bold text-foreground">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground/70">{s.sub}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {actionableObligations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actionableObligations.map(ob => {
            const reportType = REPORT_TYPE_MAP[ob.title] || ob.title.replace(/\s+/g, "_").toUpperCase();
            const existing = reports.find(r => r.report_type === reportType && r.period_year === currentYear);
            return (
              <Card key={ob.title} className="relative">
                <CardContent className="pt-4 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ob.title}</p>
                      <p className="text-xs text-muted-foreground">{ob.deadline}</p>
                    </div>
                    {existing ? (
                      <Badge variant="outline" className={STATUS_CONFIG[existing.filing_status]?.badgeClass || ""}>
                        {STATUS_CONFIG[existing.filing_status]?.label || existing.filing_status}
                      </Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="shrink-0 gap-1 text-xs" onClick={() => handleStartReport(ob)}>
                        <Plus className="w-3 h-3" /> Start {currentYear}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {reports.length > 0 && (
        <div className="space-y-3">
          {reports.map(report => {
            const isExpanded = expandedId === report.id;
            const isEditing = editingId === report.id;
            const statusCfg = STATUS_CONFIG[report.filing_status] || STATUS_CONFIG.draft;
            const StatusIcon = statusCfg.icon;

            return (
              <Card key={report.id}>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : report.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-sm">{report.report_title}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {report.period_year} · Created {format(new Date(report.created_at), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusCfg.badgeClass}>{statusCfg.label}</Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {!isEditing && report.filing_status === "draft" && (
                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setEditingId(report.id)}>
                          <Pencil className="w-3 h-3" /> Edit
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handlePreviewPDF(report)}>
                        <Eye className="w-3 h-3" /> Preview PDF
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleExportPDF(report)}>
                        <Download className="w-3 h-3" /> Export PDF
                      </Button>
                      {report.filing_status === "draft" && (
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-blue-600" onClick={() => handleStatusChange(report, "completed")}>
                          <CheckCircle2 className="w-3 h-3" /> Mark Complete
                        </Button>
                      )}
                      {report.filing_status === "completed" && (
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-emerald-600" onClick={() => handleStatusChange(report, "filed")}>
                          <Send className="w-3 h-3" /> Mark Filed
                        </Button>
                      )}
                      {report.filing_status === "draft" && (
                        <Button size="sm" variant="ghost" className="gap-1 text-xs text-destructive" onClick={() => handleDelete(report.id)}>
                          <Trash2 className="w-3 h-3" /> Delete
                        </Button>
                      )}
                    </div>

                    {isEditing && (
                      <ReportEditForm
                        report={report}
                        regulator={regulator}
                        regulatorFullName={regulatorFullName}
                        onSave={handleSave}
                        onCancel={() => setEditingId(null)}
                        onContentUpdate={(updatedContent) => {
                          setReports(prev => prev.map(r =>
                            r.id === report.id ? { ...r, content: updatedContent } : r
                          ));
                        }}
                      />
                    )}

                    {!isEditing && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {Object.entries(report.content).map(([key, val]) => (
                          <div key={key} className={LONG_FIELDS.includes(key) ? "col-span-full" : ""}>
                            <span className="text-xs text-muted-foreground">{formatFieldLabel(key)}</span>
                            <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{(val as string) || "—"}</p>
                          </div>
                        ))}
                        {report.notes && (
                          <div className="col-span-full">
                            <span className="text-xs text-muted-foreground">Notes</span>
                            <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{report.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!previewUrl} onOpenChange={() => { if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader><DialogTitle>Report Preview</DialogTitle></DialogHeader>
          {previewUrl && <iframe src={previewUrl} className="w-full h-full rounded border" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ─── Constants ─── */
const LONG_FIELDS = [
  "riskAssessmentSummary", "actionsTaken", "recommendations", "auditFindings",
  "complianceDeficiencies", "remediationPlan", "auditScope", "auditMethodology",
  "policiesEffectiveness", "trainingEffectiveness", "riskAssessmentEffectiveness",
  "recordKeepingEffectiveness", "reportingEffectiveness", "deficienciesIdentified",
  "customerRiskProfile", "geographicRisks", "productServiceRisks", "deliveryChannelRisks",
  "highRiskClientMeasures", "complianceGaps", "remediationTimeline", "changesFromPriorYear",
  "cddProcedures", "ongoingMonitoring", "internalReportingProcedures",
  "emiLicenseCompliance", "paymentServicesCompliance",
];

function formatFieldLabel(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
}

/* ─── Edit Form with AI Assist ─── */
function ReportEditForm({ report, regulator, regulatorFullName, onSave, onCancel, onContentUpdate }: {
  report: PeriodicReport;
  regulator: string;
  regulatorFullName: string;
  onSave: (report: PeriodicReport, content: Record<string, any>, notes: string) => void;
  onCancel: () => void;
  onContentUpdate: (content: Record<string, any>) => void;
}) {
  const [content, setContent] = useState<Record<string, any>>(report.content);
  const [notes, setNotes] = useState(report.notes || "");
  const [aiLoading, setAiLoading] = useState(false);

  const updateField = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleAIAssist = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("assist-report", {
        body: {
          regulator,
          reportType: report.report_type,
          reportTitle: report.report_title,
          periodYear: report.period_year,
          currentContent: content,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.content) {
        setContent(data.content);
        onContentUpdate(data.content);
        toast.success("AI has drafted the qualitative sections. Review and edit as needed.");
      }
    } catch (err: any) {
      console.error("AI assist error:", err);
      toast.error(err?.message || "AI assistance failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Edit Report Content</p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
          onClick={handleAIAssist}
          disabled={aiLoading}
        >
          {aiLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI Drafting...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> AI Assist
            </>
          )}
        </Button>
      </div>

      {aiLoading && (
        <div className="flex items-center gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">
            AI is analyzing your database and drafting report sections for <strong>{regulatorFullName}</strong>. 
            Existing content will be preserved...
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(content).map(([key, val]) => (
          <div key={key} className={LONG_FIELDS.includes(key) ? "col-span-full" : ""}>
            <Label className="text-xs">{formatFieldLabel(key)}</Label>
            {LONG_FIELDS.includes(key) ? (
              <Textarea
                value={(val as string) || ""}
                onChange={e => updateField(key, e.target.value)}
                className="mt-1 text-sm"
                rows={3}
              />
            ) : (
              <Input
                value={(val as string) || ""}
                onChange={e => updateField(key, e.target.value)}
                className="mt-1 text-sm"
              />
            )}
          </div>
        ))}
      </div>
      <div>
        <Label className="text-xs">Additional Notes</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 text-sm" rows={2} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(report, content, notes)}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
