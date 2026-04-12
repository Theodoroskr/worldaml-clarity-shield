import jsPDF from "jspdf";

/* ── FinCEN CTR Manual Fields ── */
export interface CTRManualFields {
  // Part I — Person(s) Involved
  conductorName: string;
  conductorDOB: string;
  conductorSSN: string;
  conductorIDType: string;
  conductorIDNumber: string;
  conductorIDState: string;
  conductorAddress: string;
  conductorCity: string;
  conductorState: string;
  conductorZip: string;
  conductorOccupation: string;
  conductorEmployer: string;
  conductorPhone: string;
  multiplePersons: boolean;

  // Part II — Amount & Type of Transaction
  cashInAmount: string;
  cashOutAmount: string;
  totalAmount: string;
  foreignCurrencyType: string;
  foreignCurrencyAmount: string;
  cashInBreakdown: string; // e.g. "deposits, payments, currency exchange"
  cashOutBreakdown: string;

  // Part III — Financial Institution
  fiName: string;
  fiEIN: string;
  fiAddress: string;
  fiBranchAddress: string;
  fiRSSD: string;

  // Part IV — Contact / Filing Info
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  filingType: "initial" | "amendment";
  priorDCN: string;
}

export const DEFAULT_CTR_FIELDS: CTRManualFields = {
  conductorName: "",
  conductorDOB: "",
  conductorSSN: "",
  conductorIDType: "",
  conductorIDNumber: "",
  conductorIDState: "",
  conductorAddress: "",
  conductorCity: "",
  conductorState: "",
  conductorZip: "",
  conductorOccupation: "",
  conductorEmployer: "",
  conductorPhone: "",
  multiplePersons: false,
  cashInAmount: "",
  cashOutAmount: "",
  totalAmount: "",
  foreignCurrencyType: "",
  foreignCurrencyAmount: "",
  cashInBreakdown: "",
  cashOutBreakdown: "",
  fiName: "",
  fiEIN: "",
  fiAddress: "",
  fiBranchAddress: "",
  fiRSSD: "",
  contactName: "",
  contactTitle: "",
  contactPhone: "",
  filingType: "initial",
  priorDCN: "",
};

export interface CTRExportOptions {
  caseItem: { id: string; title: string; status: string; priority: string; created_at: string; customer_id?: string | null };
  customer: any;
  transactions: any[];
  submittedBy: string;
  reportingEntity: string;
  manualFields: CTRManualFields;
}

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE_H = 5.5;

function sectionHeader(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(0, 51, 102);
  doc.rect(MARGIN, y, CONTENT_W, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), MARGIN + 3, y + 5);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  return y + 10;
}

function fieldPair(doc: jsPDF, label: string, value: string, x: number, y: number, w: number): number {
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8.5);
  const lines = doc.splitTextToSize(value || "—", w - 4);
  doc.text(lines, x, y + 3.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(x, y + 3.5 + lines.length * LINE_H, x + w, y + 3.5 + lines.length * LINE_H);
  return y + 3.5 + lines.length * LINE_H + 4;
}

function checkPage(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 280) { doc.addPage(); return 20; }
  return y;
}

export function exportCTR(opts: CTRExportOptions): { blobUrl: string; fileName: string } {
  const { caseItem, customer, transactions, submittedBy, reportingEntity, manualFields: mf } = opts;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const halfW = CONTENT_W / 2 - 2;

  // ── Banner ──
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, PAGE_W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CURRENCY TRANSACTION REPORT (CTR)", MARGIN, 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("FinCEN Form 112 · 31 CFR §1010.311 · Bank Secrecy Act", MARGIN, 18);
  doc.text(`Generated: ${dateStr}`, PAGE_W - MARGIN, 18, { align: "right" });
  doc.setFontSize(7);
  doc.text("CONFIDENTIAL — FOR FinCEN USE ONLY — NOT FOR PUBLIC DISCLOSURE", MARGIN, 24);

  // Threshold banner
  doc.setFillColor(255, 243, 224);
  doc.rect(0, 28, PAGE_W, 8, "F");
  doc.setTextColor(120, 60, 0);
  doc.setFontSize(7);
  doc.text("Mandatory filing for cash transactions exceeding $10,000 (31 USC §5313). Must be filed within 15 calendar days of the transaction date.", MARGIN, 33);

  doc.setTextColor(0, 0, 0);
  let y = 42;
  const ref = `CTR-${caseItem.id.slice(0, 8).toUpperCase()}`;

  // ── Part I: Person(s) Involved in Transaction(s) ──
  y = sectionHeader(doc, "Part I — Person(s) Involved in Transaction(s)", y);
  y = fieldPair(doc, "Full Legal Name", mf.conductorName || customer?.name || "—", MARGIN, y, CONTENT_W);
  const row1y = y;
  y = fieldPair(doc, "Date of Birth", mf.conductorDOB, MARGIN, y, halfW);
  fieldPair(doc, "SSN / ITIN / EIN", mf.conductorSSN || "—", MARGIN + halfW + 4, row1y, halfW);

  const row2y = y;
  y = fieldPair(doc, "ID Type", mf.conductorIDType || "—", MARGIN, y, halfW / 1.5);
  fieldPair(doc, "ID Number", mf.conductorIDNumber || "—", MARGIN + halfW / 1.5 + 2, row2y, halfW / 1.5);
  fieldPair(doc, "Issuing State", mf.conductorIDState || "—", MARGIN + (halfW / 1.5 + 2) * 2, row2y, halfW / 1.5);

  y = fieldPair(doc, "Address", mf.conductorAddress || "—", MARGIN, y, CONTENT_W);
  const row3y = y;
  y = fieldPair(doc, "City", mf.conductorCity || "—", MARGIN, y, halfW * 0.6);
  fieldPair(doc, "State", mf.conductorState || "—", MARGIN + halfW * 0.6 + 2, row3y, halfW * 0.4);
  fieldPair(doc, "ZIP", mf.conductorZip || "—", MARGIN + halfW + 4, row3y, halfW * 0.4);

  const row4y = y;
  y = fieldPair(doc, "Occupation / Business", mf.conductorOccupation || customer?.type || "—", MARGIN, y, halfW);
  fieldPair(doc, "Employer", mf.conductorEmployer || "—", MARGIN + halfW + 4, row4y, halfW);

  y = fieldPair(doc, "Phone Number", mf.conductorPhone || customer?.email || "—", MARGIN, y, halfW);
  if (mf.multiplePersons) {
    doc.setFontSize(7);
    doc.setTextColor(180, 80, 0);
    doc.text("⚠ Multiple persons involved — see attached continuation sheet", MARGIN, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
  }
  y += 2;

  // ── Part II: Amount and Type of Transaction(s) ──
  y = checkPage(doc, y, 60);
  y = sectionHeader(doc, "Part II — Amount and Type of Transaction(s)", y);

  // Auto-calculate from transactions if not manually specified
  const cashIn = mf.cashInAmount || transactions.filter(t => t.direction === "inbound").reduce((s: number, t: any) => s + Number(t.amount), 0).toFixed(2);
  const cashOut = mf.cashOutAmount || transactions.filter(t => t.direction === "outbound").reduce((s: number, t: any) => s + Number(t.amount), 0).toFixed(2);
  const total = mf.totalAmount || (parseFloat(cashIn) + parseFloat(cashOut)).toFixed(2);

  const amtY = y;
  y = fieldPair(doc, "Total Cash In ($)", `$${Number(cashIn).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, MARGIN, y, halfW * 0.7);
  fieldPair(doc, "Total Cash Out ($)", `$${Number(cashOut).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, MARGIN + halfW * 0.7 + 2, amtY, halfW * 0.7);
  fieldPair(doc, "AGGREGATE TOTAL", `$${Number(total).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, MARGIN + halfW * 1.4 + 4, amtY, halfW * 0.6);

  if (Number(total) < 10000) {
    doc.setFontSize(7);
    doc.setTextColor(200, 0, 0);
    doc.text("⚠ TOTAL BELOW $10,000 THRESHOLD — CTR filing may not be required unless structuring is suspected.", MARGIN, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
  }

  y = fieldPair(doc, "Cash In Breakdown", mf.cashInBreakdown || "Cash deposits, currency exchange, payments", MARGIN, y, CONTENT_W);
  y = fieldPair(doc, "Cash Out Breakdown", mf.cashOutBreakdown || "Cash withdrawals, negotiable instruments", MARGIN, y, CONTENT_W);

  if (mf.foreignCurrencyType) {
    const fcY = y;
    y = fieldPair(doc, "Foreign Currency", mf.foreignCurrencyType, MARGIN, y, halfW);
    fieldPair(doc, "Foreign Currency Amount", mf.foreignCurrencyAmount ? `$${Number(mf.foreignCurrencyAmount).toLocaleString()}` : "—", MARGIN + halfW + 4, fcY, halfW);
  }

  // Transaction table
  if (transactions.length > 0) {
    y = checkPage(doc, y, 30);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Detail", MARGIN, y);
    y += 4;

    // Header row
    doc.setFillColor(240, 240, 240);
    doc.rect(MARGIN, y - 2, CONTENT_W, 5, "F");
    doc.setFontSize(6.5);
    const cols = [MARGIN, MARGIN + 25, MARGIN + 55, MARGIN + 80, MARGIN + 110, MARGIN + 140];
    const headers = ["Date", "Amount (USD)", "Direction", "Counterparty", "Method", "Status"];
    headers.forEach((h, i) => doc.text(h.toUpperCase(), cols[i], y + 1.5));
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    transactions.slice(0, 15).forEach(tx => {
      y = checkPage(doc, y, 6);
      doc.text(new Date(tx.created_at).toLocaleDateString("en-US"), cols[0], y);
      doc.text(`$${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, cols[1], y);
      doc.text(tx.direction || "—", cols[2], y);
      doc.text((tx.counterparty || "—").slice(0, 20), cols[3], y);
      doc.text(tx.method_of_transaction || "Cash", cols[4], y);
      doc.text(tx.monitoring_status || "—", cols[5], y);
      y += 4.5;
    });
    if (transactions.length > 15) {
      doc.setFontSize(6.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`+ ${transactions.length - 15} additional transactions (see continuation)`, MARGIN, y);
      doc.setTextColor(0, 0, 0);
      y += 5;
    }
  }
  y += 3;

  // ── Part III: Financial Institution Where Transaction(s) Takes Place ──
  y = checkPage(doc, y, 45);
  y = sectionHeader(doc, "Part III — Financial Institution Where Transaction(s) Takes Place", y);
  y = fieldPair(doc, "Financial Institution Name", mf.fiName || reportingEntity, MARGIN, y, CONTENT_W);
  const fiY = y;
  y = fieldPair(doc, "EIN", mf.fiEIN || "—", MARGIN, y, halfW);
  fieldPair(doc, "RSSD Number", mf.fiRSSD || "—", MARGIN + halfW + 4, fiY, halfW);
  y = fieldPair(doc, "Institution Address", mf.fiAddress || "—", MARGIN, y, CONTENT_W);
  y = fieldPair(doc, "Branch Address (if different)", mf.fiBranchAddress || "—", MARGIN, y, CONTENT_W);
  y += 2;

  // ── Part IV: Contact Information ──
  y = checkPage(doc, y, 40);
  y = sectionHeader(doc, "Part IV — Contact Information & Filing Details", y);
  const cY = y;
  y = fieldPair(doc, "Contact Person", mf.contactName || submittedBy, MARGIN, y, halfW);
  fieldPair(doc, "Title / Position", mf.contactTitle || "BSA Officer", MARGIN + halfW + 4, cY, halfW);
  const c2Y = y;
  y = fieldPair(doc, "Phone Number", mf.contactPhone || "—", MARGIN, y, halfW);
  fieldPair(doc, "Filing Type", mf.filingType === "amendment" ? "Amendment" : "Initial Report", MARGIN + halfW + 4, c2Y, halfW);
  if (mf.filingType === "amendment" && mf.priorDCN) {
    y = fieldPair(doc, "Prior DCN (Document Control Number)", mf.priorDCN, MARGIN, y, CONTENT_W);
  }

  // ── Declaration ──
  y = checkPage(doc, y, 40);
  y = sectionHeader(doc, "Declaration & Certification", y);
  doc.setFontSize(7.5);
  const decl = "I certify that to the best of my knowledge, this Currency Transaction Report is complete and accurate. I understand that filing a false or fraudulent CTR is a violation of federal law (31 USC §5322) and may result in civil and criminal penalties.";
  const declLines = doc.splitTextToSize(decl, CONTENT_W);
  doc.text(declLines, MARGIN, y);
  y += declLines.length * LINE_H + 8;

  y = checkPage(doc, y, 25);
  doc.setDrawColor(0, 0, 0);
  doc.line(MARGIN, y, MARGIN + 65, y);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("Signature", MARGIN, y + 3.5);
  doc.line(MARGIN + 75, y, MARGIN + 130, y);
  doc.text("Printed Name", MARGIN + 75, y + 3.5);
  doc.line(MARGIN + 140, y, MARGIN + CONTENT_W, y);
  doc.text("Date", MARGIN + 140, y + 3.5);

  // ── Footers ──
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 290, PAGE_W, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.text(
      `CONFIDENTIAL — FinCEN CTR ${ref} — ${reportingEntity} — BSA 31 CFR §1010.311 — Page ${p}/${pages}`,
      PAGE_W / 2, 294.5, { align: "center" }
    );
  }

  const fileName = `CTR_${ref}_${now.toISOString().slice(0, 10)}.pdf`;
  const blob = doc.output("blob");
  return { blobUrl: URL.createObjectURL(blob), fileName };
}
