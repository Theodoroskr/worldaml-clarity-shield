import jsPDF from "jspdf";

export interface SARCustomer {
  name: string;
  type: string;
  email?: string | null;
  country?: string | null;
  company_name?: string | null;
  risk_level?: string;
}

export interface SARCase {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  alert_id?: string | null;
}

export interface SARNote {
  id: string;
  content: string;
  created_at: string;
}

export interface SARExportOptions {
  caseItem: SARCase;
  notes: SARNote[];
  customer: SARCustomer | null;
  submittedBy: string;
  reportingEntity: string;
  reportingEntityRef?: string;
}

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

function field(doc: jsPDF, label: string, value: string, y: number, halfWidth = false): number {
  const w = halfWidth ? CONTENT_W / 2 - 2 : CONTENT_W;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text(label.toUpperCase(), MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(value || "—", w);
  doc.text(lines, MARGIN, y + 4);
  doc.setDrawColor(210, 210, 210);
  doc.line(MARGIN, y + 4 + lines.length * LINE_H, MARGIN + w, y + 4 + lines.length * LINE_H);
  return y + 4 + lines.length * LINE_H + 5;
}

function checkPage(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

export async function exportSAR(opts: SARExportOptions): Promise<void> {
  const { caseItem, notes, customer, submittedBy, reportingEntity, reportingEntityRef } = opts;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // Cover banner
  doc.setFillColor(15, 40, 80);
  doc.rect(0, 0, PAGE_W, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SUSPICIOUS ACTIVITY REPORT", MARGIN, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("CONFIDENTIAL — NOT FOR DISTRIBUTION", MARGIN, 21);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, PAGE_W - MARGIN, 21, { align: "right" });

  // FATF disclaimer
  doc.setFillColor(240, 243, 250);
  doc.rect(0, 30, PAGE_W, 10, "F");
  doc.setTextColor(60, 60, 100);
  doc.setFontSize(7);
  doc.text(
    "This report is prepared in accordance with applicable AML/CFT obligations. Disclosure to the subject of this report may constitute tipping-off.",
    MARGIN, 36
  );

  doc.setTextColor(0, 0, 0);
  let y = 48;

  // Section 1: Report Details
  y = header(doc, "1. Report Details", y);
  y = field(doc, "Reference Number", reportingEntityRef ?? `SAR-${caseItem.id.slice(0, 8).toUpperCase()}`, y);
  y = field(doc, "Reporting Entity", reportingEntity, y);
  y = field(doc, "Reporting Officer", submittedBy, y);
  y = field(doc, "Report Date", dateStr, y);
  y = field(doc, "Case ID", caseItem.id, y);
  y = field(doc, "Case Status", caseItem.status.replace(/_/g, " ").toUpperCase(), y);
  y = field(doc, "Priority", caseItem.priority.toUpperCase(), y);
  y += 4;

  // Section 2: Subject Details
  y = checkPage(doc, y, 50);
  y = header(doc, "2. Subject of Report", y);
  if (customer) {
    y = field(doc, "Full Name", customer.name, y);
    y = field(doc, "Entity Type", customer.type === "business" ? "Legal Entity" : "Individual", y);
    if (customer.company_name) y = field(doc, "Company Name", customer.company_name, y);
    if (customer.email) y = field(doc, "Email Address", customer.email, y);
    if (customer.country) y = field(doc, "Country / Nationality", customer.country, y);
    y = field(doc, "Risk Classification", (customer.risk_level ?? "unknown").toUpperCase(), y);
  } else {
    y = field(doc, "Subject", "Not linked to a customer record", y);
  }
  y += 4;

  // Section 3: Case Summary
  y = checkPage(doc, y, 40);
  y = header(doc, "3. Case Summary", y);
  y = field(doc, "Case Title", caseItem.title, y);
  y = field(doc, "Case Opened", new Date(caseItem.created_at).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric"
  }), y);
  y += 4;

  // Section 4: Investigation Notes
  y = checkPage(doc, y, 30);
  y = header(doc, "4. Investigation Notes & Grounds for Suspicion", y);
  if (notes.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 120, 120);
    doc.text("No investigation notes recorded.", MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 8;
  } else {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      y = checkPage(doc, y, 20);
      const noteDate = new Date(note.created_at).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`Note ${i + 1} — ${noteDate}`, MARGIN, y);
      y += 4;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(note.content, CONTENT_W);
      y = checkPage(doc, y, lines.length * LINE_H + 6);
      doc.text(lines, MARGIN, y);
      y += lines.length * LINE_H + 6;
      doc.setDrawColor(220, 220, 220);
      doc.line(MARGIN, y - 3, MARGIN + CONTENT_W, y - 3);
    }
  }
  y += 4;

  // Section 5: Declaration
  y = checkPage(doc, y, 50);
  y = header(doc, "5. Reporting Officer Declaration", y);
  doc.setFontSize(9);
  const declaration = [
    "I, the undersigned, being the nominated reporting officer or a duly authorised delegate, hereby declare that:",
    "",
    "1. The information contained in this report is true and accurate to the best of my knowledge and belief.",
    "2. This report is submitted pursuant to applicable anti-money laundering and counter-terrorist financing legislation.",
    "3. The information has been compiled following an internal investigation conducted in good faith.",
    "4. I am aware that making a false or misleading report is a criminal offence.",
  ].join("\n");
  const declLines = doc.splitTextToSize(declaration, CONTENT_W);
  doc.text(declLines, MARGIN, y);
  y += declLines.length * LINE_H + 10;

  y = checkPage(doc, y, 30);
  doc.setDrawColor(0, 0, 0);
  doc.line(MARGIN, y + 20, MARGIN + 70, y + 20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Signature of Reporting Officer", MARGIN, y + 24);
  doc.line(MARGIN + 90, y + 20, MARGIN + 160, y + 20);
  doc.text("Date", MARGIN + 90, y + 24);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(15, 40, 80);
    doc.rect(0, 290, PAGE_W, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(
      `CONFIDENTIAL — ${reportingEntity} — SAR ${reportingEntityRef ?? caseItem.id.slice(0, 8).toUpperCase()} — Page ${p} of ${pageCount}`,
      PAGE_W / 2, 294.5, { align: "center" }
    );
  }

  const fileName = `SAR_${(reportingEntityRef ?? caseItem.id.slice(0, 8)).toUpperCase()}_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
