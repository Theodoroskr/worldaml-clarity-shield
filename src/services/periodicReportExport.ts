import jsPDF from "jspdf";

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE_H = 6;

function header(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(15, 40, 80);
  doc.rect(MARGIN, y, CONTENT_W, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), MARGIN + 3, y + 5.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  return y + 12;
}

function field(doc: jsPDF, label: string, value: string, y: number): number {
  if (y > 270) {
    doc.addPage();
    y = MARGIN;
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(label + ":", MARGIN, y);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(value || "N/A", CONTENT_W - 45);
  doc.text(lines, MARGIN + 45, y);
  return y + Math.max(lines.length, 1) * LINE_H;
}

function multiLineField(doc: jsPDF, label: string, value: string, y: number): number {
  if (y > 260) {
    doc.addPage();
    y = MARGIN;
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(label + ":", MARGIN, y);
  y += LINE_H;
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(value || "N/A", CONTENT_W);
  for (const line of lines) {
    if (y > 280) { doc.addPage(); y = MARGIN; }
    doc.text(line, MARGIN, y);
    y += LINE_H - 1;
  }
  return y + 2;
}

export interface PeriodicReportPDFData {
  reportTitle: string;
  reportType: string;
  regulator: string;
  regulatorFullName: string;
  periodYear: number;
  filingStatus: string;
  createdAt: string;
  completedAt?: string | null;
  filedAt?: string | null;
  notes?: string | null;
  content: Record<string, any>;
  companyName?: string;
  preparedBy?: string;
  // Stats from DB
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

export function generatePeriodicReportPDF(data: PeriodicReportPDFData) {
  const doc = new jsPDF("p", "mm", "a4");
  let y = MARGIN;

  // Title block
  doc.setFillColor(15, 40, 80);
  doc.rect(0, 0, PAGE_W, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.reportTitle, MARGIN, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.regulatorFullName} — Period: ${data.periodYear}`, MARGIN, 23);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")} | Status: ${data.filingStatus.toUpperCase()}`, MARGIN, 30);
  doc.setTextColor(0, 0, 0);
  y = 42;

  // Section 1: Entity Information
  y = header(doc, "1. Reporting Entity", y);
  y = field(doc, "Company Name", data.companyName || "N/A", y);
  y = field(doc, "Supervisory Authority", `${data.regulator} (${data.regulatorFullName})`, y);
  y = field(doc, "Reporting Period", `January 1 – December 31, ${data.periodYear}`, y);
  y = field(doc, "Prepared By", data.preparedBy || "N/A", y);
  y = field(doc, "Date Prepared", data.createdAt, y);
  if (data.completedAt) y = field(doc, "Date Completed", data.completedAt, y);
  if (data.filedAt) y = field(doc, "Date Filed", data.filedAt, y);
  y += 4;

  // Section 2: Compliance Programme Summary (from content)
  y = header(doc, "2. AML/CFT Compliance Programme Summary", y);
  y = field(doc, "Compliance Officer", data.content.complianceOfficer || "N/A", y);
  y = field(doc, "Officer Qualifications", data.content.officerQualifications || "N/A", y);
  y = field(doc, "Policies Last Updated", data.content.policiesLastUpdated || "N/A", y);
  y = field(doc, "Training Conducted", data.content.trainingConducted || "N/A", y);
  y = field(doc, "Training Date(s)", data.content.trainingDates || "N/A", y);
  y = field(doc, "Independent Audit", data.content.independentAudit || "N/A", y);
  y = field(doc, "Audit Findings", data.content.auditFindings || "None reported", y);
  y += 4;

  // Section 3: Customer & Risk Statistics (auto-populated)
  y = header(doc, "3. Customer & Risk Statistics", y);
  y = field(doc, "Total Active Customers", String(data.totalCustomers), y);
  y = field(doc, "High-Risk Customers", String(data.highRiskCustomers), y);
  y = field(doc, "Total Screenings", String(data.totalScreenings), y);
  y = field(doc, "Screenings with Matches", String(data.matchScreenings), y);
  y += 4;

  // Section 4: Transaction Monitoring
  if (y > 240) { doc.addPage(); y = MARGIN; }
  y = header(doc, "4. Transaction Monitoring Summary", y);
  y = field(doc, "Total Transactions", String(data.totalTransactions), y);
  y = field(doc, "Flagged Transactions", String(data.flaggedTransactions), y);
  y = field(doc, "Total Alerts Generated", String(data.totalAlerts), y);
  y = field(doc, "Alerts Resolved", String(data.resolvedAlerts), y);
  y += 4;

  // Section 5: Cases & Regulatory Filings
  if (y > 240) { doc.addPage(); y = MARGIN; }
  y = header(doc, "5. Cases & Regulatory Filings", y);
  y = field(doc, "Cases Opened", String(data.totalCases), y);
  y = field(doc, "STR/SAR Reports Filed", String(data.totalSTRs), y);
  y += 4;

  // Section 6: Risk Assessment
  if (y > 240) { doc.addPage(); y = MARGIN; }
  y = header(doc, "6. Risk Assessment", y);
  y = multiLineField(doc, "Risk Assessment Summary", data.content.riskAssessmentSummary || "No summary provided.", y);
  y = field(doc, "Key Risks Identified", data.content.keyRisksIdentified || "None", y);
  y = field(doc, "Mitigating Controls", data.content.mitigatingControls || "N/A", y);
  y += 4;

  // Section 7: Remediation & Recommendations
  if (y > 240) { doc.addPage(); y = MARGIN; }
  y = header(doc, "7. Remediation Actions & Recommendations", y);
  y = multiLineField(doc, "Actions Taken", data.content.actionsTaken || "None reported.", y);
  y = multiLineField(doc, "Recommendations", data.content.recommendations || "None.", y);
  y += 4;

  // Section 8: Additional Notes
  if (data.notes) {
    if (y > 240) { doc.addPage(); y = MARGIN; }
    y = header(doc, "8. Additional Notes", y);
    y = multiLineField(doc, "Notes", data.notes, y);
  }

  // Declaration
  if (y > 240) { doc.addPage(); y = MARGIN; }
  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DECLARATION", MARGIN, y);
  y += LINE_H;
  doc.setFont("helvetica", "normal");
  const decl = `I hereby confirm that the information contained in this report is accurate and complete to the best of my knowledge. This report has been prepared in accordance with the requirements of ${data.regulator} for the period ending December 31, ${data.periodYear}.`;
  const declLines = doc.splitTextToSize(decl, CONTENT_W);
  doc.text(declLines, MARGIN, y);
  y += declLines.length * (LINE_H - 1) + 10;

  // Signature lines
  if (y > 260) { doc.addPage(); y = MARGIN; }
  doc.line(MARGIN, y, MARGIN + 60, y);
  doc.text("Compliance Officer Signature", MARGIN, y + 5);
  doc.line(MARGIN + 80, y, MARGIN + 140, y);
  doc.text("Date", MARGIN + 80, y + 5);

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`CONFIDENTIAL — ${data.reportTitle} — ${data.regulator} — ${data.periodYear}`, MARGIN, 290);
    doc.text(`Page ${i} of ${totalPages}`, PAGE_W - MARGIN - 20, 290);
    doc.setTextColor(0, 0, 0);
  }

  return doc;
}
