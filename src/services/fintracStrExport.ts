import jsPDF from "jspdf";

export interface FINTRACCustomer {
  name: string;
  type: string;
  email?: string | null;
  country?: string | null;
  company_name?: string | null;
  date_of_birth?: string | null;
  risk_level?: string;
  registration_number?: string | null;
}

export interface FINTRACTransaction {
  id: string;
  amount: number;
  currency: string;
  direction: string;
  counterparty?: string | null;
  counterparty_country?: string | null;
  created_at: string;
  description?: string | null;
  monitoring_status?: string | null;
  risk_flag?: boolean;
}

export interface FINTRACCase {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  alert_id?: string | null;
}

export interface FINTRACNote {
  id: string;
  content: string;
  created_at: string;
}

export interface FINTRACManualFields {
  // Starting Action
  methodOfTransaction: string;
  sourceOfFunds: string;
  conductorName: string;
  thirdPartyIndicator: string;
  thirdPartyName: string;
  // Completing Action
  dispositionOfFunds: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  beneficiaryCountry: string;
  // Part D — Suspicion
  suspicionType: string;
  isPEP: string;
  selectedIndicators: number[];
  // Part F — Declaration
  camloName: string;
  actionTaken: string;
}

export const DEFAULT_MANUAL_FIELDS: FINTRACManualFields = {
  methodOfTransaction: "",
  sourceOfFunds: "",
  conductorName: "",
  thirdPartyIndicator: "own_behalf",
  thirdPartyName: "",
  dispositionOfFunds: "",
  beneficiaryName: "",
  beneficiaryAccount: "",
  beneficiaryCountry: "",
  suspicionType: "ml",
  isPEP: "no",
  selectedIndicators: [],
  camloName: "",
  actionTaken: "",
};

export interface FINTRACSTRExportOptions {
  caseItem: FINTRACCase;
  notes: FINTRACNote[];
  customer: FINTRACCustomer | null;
  transactions: FINTRACTransaction[];
  submittedBy: string;
  reportingEntity: string;
  reportingEntityRef?: string;
  strType: "str" | "lctr" | "eftr";
  manualFields?: FINTRACManualFields;
}

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE_H = 6;

const STR_TYPE_LABELS: Record<string, string> = {
  str: "Suspicious Transaction Report (STR)",
  lctr: "Large Cash Transaction Report (LCTR)",
  eftr: "Electronic Funds Transfer Report (EFTR)",
};

function header(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(185, 28, 28);
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
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text(label.toUpperCase(), MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(value || "—", CONTENT_W);
  doc.text(lines, MARGIN, y + 4);
  doc.setDrawColor(210, 210, 210);
  doc.line(MARGIN, y + 4 + lines.length * LINE_H, MARGIN + CONTENT_W, y + 4 + lines.length * LINE_H);
  return y + 4 + lines.length * LINE_H + 5;
}

function fieldPair(doc: jsPDF, l1: string, v1: string, l2: string, v2: string, y: number): number {
  const halfW = CONTENT_W / 2 - 4;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text(l1.toUpperCase(), MARGIN, y);
  doc.text(l2.toUpperCase(), MARGIN + CONTENT_W / 2 + 2, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const lines1 = doc.splitTextToSize(v1 || "—", halfW);
  const lines2 = doc.splitTextToSize(v2 || "—", halfW);
  doc.text(lines1, MARGIN, y + 4);
  doc.text(lines2, MARGIN + CONTENT_W / 2 + 2, y + 4);
  const maxLines = Math.max(lines1.length, lines2.length);
  doc.setDrawColor(210, 210, 210);
  const lineY = y + 4 + maxLines * LINE_H;
  doc.line(MARGIN, lineY, MARGIN + CONTENT_W, lineY);
  return lineY + 5;
}

function checkPage(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

export async function exportFINTRACStr(opts: FINTRACSTRExportOptions): Promise<void> {
  const { caseItem, notes, customer, transactions, submittedBy, reportingEntity, reportingEntityRef, strType, manualFields } = opts;
  const mf = manualFields ?? DEFAULT_MANUAL_FIELDS;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
  const timeStr = now.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
  const refNum = reportingEntityRef ?? `FINTRAC-${strType.toUpperCase()}-${caseItem.id.slice(0, 8).toUpperCase()}`;

  // Cover banner — red for FINTRAC
  doc.setFillColor(185, 28, 28);
  doc.rect(0, 0, PAGE_W, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(STR_TYPE_LABELS[strType] ?? "Suspicious Transaction Report (STR)", MARGIN, 13);
  doc.setFontSize(10);
  doc.text("FINTRAC — Financial Transactions and Reports Analysis Centre of Canada", MARGIN, 20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("CONFIDENTIAL — PCMLTFA s.7 · PCMLTFR Part 1", MARGIN, 27);
  doc.text(`Generated: ${dateStr} ${timeStr}`, PAGE_W - MARGIN, 27, { align: "right" });

  // Regulatory disclaimer
  doc.setFillColor(255, 245, 245);
  doc.rect(0, 34, PAGE_W, 12, "F");
  doc.setTextColor(120, 20, 20);
  doc.setFontSize(7);
  doc.text(
    "This report is filed pursuant to the Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA).",
    MARGIN, 39
  );
  doc.text(
    "Tipping off the subject of this report is a criminal offence under PCMLTFA s.8. Retain for a minimum of 5 years.",
    MARGIN, 43
  );

  doc.setTextColor(0, 0, 0);
  let y = 52;

  // PART A: Report Identification
  y = header(doc, "Part A — Report Identification", y);
  y = fieldPair(doc, "Reference Number", refNum, "Report Type", STR_TYPE_LABELS[strType] ?? "STR", y);
  y = fieldPair(doc, "Reporting Entity", reportingEntity, "Reporting Officer (CAMLO)", submittedBy, y);
  y = fieldPair(doc, "Report Date", dateStr, "Filing Deadline", strType === "str" ? "Within 3 business days of determination" : "Within 15 calendar days", y);
  y = field(doc, "Case Reference", `${caseItem.id} — ${caseItem.title}`, y);
  y = fieldPair(doc, "Case Status", caseItem.status.replace(/_/g, " ").toUpperCase(), "Priority", caseItem.priority.toUpperCase(), y);
  y += 2;

  // PART B: Subject Information
  y = checkPage(doc, y, 60);
  y = header(doc, "Part B — Subject Information (Individual / Entity)", y);
  if (customer) {
    y = fieldPair(doc, "Full Legal Name", customer.name, "Entity Type", customer.type === "business" ? "Legal Entity / Corporation" : "Individual", y);
    if (customer.date_of_birth) {
      y = fieldPair(doc, "Date of Birth", customer.date_of_birth, "Country of Residence", customer.country ?? "—", y);
    } else {
      y = field(doc, "Country of Residence / Incorporation", customer.country ?? "—", y);
    }
    if (customer.company_name) y = field(doc, "Business Operating Name", customer.company_name, y);
    if (customer.registration_number) y = field(doc, "Business Registration No.", customer.registration_number, y);
    if (customer.email) y = field(doc, "Email / Contact", customer.email, y);
    y = field(doc, "Risk Classification", (customer.risk_level ?? "unknown").toUpperCase(), y);
  } else {
    y = field(doc, "Subject", "Not linked to a customer record — walk-in or unverified party", y);
  }
  y += 2;

  // PART C: Transaction Details — Starting & Completing Actions
  y = checkPage(doc, y, 40);
  y = header(doc, "Part C — Transaction Details (Starting & Completing Actions)", y);
  if (transactions.length === 0) {
    y = field(doc, "Transactions", "No linked transactions. See investigation notes for narrative.", y);
  } else {
    // Transaction table
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(245, 245, 245);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    const cols = [MARGIN + 2, MARGIN + 22, MARGIN + 47, MARGIN + 67, MARGIN + 87, MARGIN + 112, MARGIN + 140];
    const headers = ["Date", "Amount", "Currency", "Direction", "Counterparty", "Country", "Status"];
    headers.forEach((h, i) => doc.text(h, cols[i], y + 5));
    y += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    for (const tx of transactions.slice(0, 20)) {
      y = checkPage(doc, y, 8);
      const txDate = new Date(tx.created_at).toLocaleDateString("en-CA");
      const amt = tx.amount.toLocaleString("en-CA", { minimumFractionDigits: 2 });
      doc.text(txDate, cols[0], y + 4);
      doc.text(amt, cols[1], y + 4);
      doc.text(tx.currency, cols[2], y + 4);
      doc.text(tx.direction, cols[3], y + 4);
      doc.text((tx.counterparty ?? "—").slice(0, 16), cols[4], y + 4);
      doc.text(tx.counterparty_country ?? "—", cols[5], y + 4);
      doc.text(tx.monitoring_status ?? "—", cols[6], y + 4);
      doc.setDrawColor(230, 230, 230);
      doc.line(MARGIN, y + 6, MARGIN + CONTENT_W, y + 6);
      y += 8;
    }
    if (transactions.length > 20) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.text(`+ ${transactions.length - 20} additional transactions omitted`, MARGIN, y + 4);
      y += 8;
    }

    // Summary
    y = checkPage(doc, y, 15);
    const totalAmount = transactions.reduce((s, t) => s + t.amount, 0);
    const flaggedCount = transactions.filter(t => t.risk_flag).length;
    y = fieldPair(doc,
      "Total Transactions", String(transactions.length),
      "Aggregate Value", `${totalAmount.toLocaleString("en-CA", { minimumFractionDigits: 2 })} ${transactions[0]?.currency ?? "CAD"}`,
      y
    );
    y = fieldPair(doc,
      "Risk-Flagged Transactions", `${flaggedCount} of ${transactions.length}`,
      "Flagged Percentage", `${transactions.length > 0 ? Math.round((flaggedCount / transactions.length) * 100) : 0}%`,
      y
    );

    // Starting Action section
    y = checkPage(doc, y, 40);
    y += 2;
    doc.setFillColor(255, 240, 240);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 20, 20);
    doc.text("STARTING ACTION — CONDUCTOR & SOURCE (PCMLTFR s.132)", MARGIN + 3, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 10;

    const startingFields = [
      { label: "Method of Transaction", value: mf.methodOfTransaction || "Not specified" },
      { label: "Source of Funds", value: mf.sourceOfFunds || "Not specified" },
      { label: "Conductor Name", value: mf.conductorName || (customer ? customer.name : "Not specified") },
      { label: "Third Party Determination", value: mf.thirdPartyIndicator === "third_party" ? `On behalf of third party: ${mf.thirdPartyName || "—"}` : "Transaction conducted on own behalf" },
    ];
    for (const sf of startingFields) {
      y = checkPage(doc, y, 12);
      y = field(doc, sf.label, sf.value, y);
    }

    // Completing Action section
    y = checkPage(doc, y, 40);
    y += 2;
    doc.setFillColor(255, 240, 240);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 20, 20);
    doc.text("COMPLETING ACTION — DISPOSITION & BENEFICIARY (PCMLTFR s.133)", MARGIN + 3, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 10;

    const completingFields = [
      { label: "Disposition of Funds", value: mf.dispositionOfFunds || "Not specified" },
      { label: "Beneficiary Name", value: mf.beneficiaryName || "Not specified" },
      { label: "Beneficiary Account", value: mf.beneficiaryAccount || "—" },
      { label: "Beneficiary Country", value: mf.beneficiaryCountry || "—" },
    ];
    for (const cf of completingFields) {
      y = checkPage(doc, y, 12);
      y = field(doc, cf.label, cf.value, y);
    }
  }
  y += 2;

  // PART D: Indicators & Grounds for Suspicion
  y = checkPage(doc, y, 30);
  y = header(doc, "Part D — Grounds for Suspicion / Indicators", y);

  // Suspicion type & PEP
  const suspicionLabels: Record<string, string> = { ml: "Money Laundering (ML)", tf: "Terrorist Activity Financing (TF)", sanctions: "Sanctions Evasion", ml_tf: "ML and TF" };
  y = fieldPair(doc, "Suspicion Type", suspicionLabels[mf.suspicionType] ?? mf.suspicionType ?? "Not specified", "PEP Status", mf.isPEP === "yes" ? "YES — Subject is a Politically Exposed Person" : mf.isPEP === "foreign_pep" ? "YES — Foreign PEP" : mf.isPEP === "domestic_pep" ? "YES — Domestic PEP" : "No", y);

  // FINTRAC indicator checklist
  const indicators = [
    "Transaction inconsistent with client's known business or occupation",
    "Structured to avoid reporting thresholds (PCMLTFR s.12)",
    "Involves high-risk jurisdiction (FATF grey/black list)",
    "Rapid movement of funds with no apparent economic purpose",
    "Client unwilling to provide identification or provides suspicious documents",
    "Pattern of transactions below CAD 10,000 threshold",
    "Funds received from or sent to a jurisdiction with weak AML controls",
    "Unusual use of corporate structures or nominee arrangements",
  ];
  doc.setFontSize(8);
  for (let i = 0; i < indicators.length; i++) {
    y = checkPage(doc, y, 7);
    doc.setFont("helvetica", "normal");
    const checked = mf.selectedIndicators.includes(i);
    doc.text((checked ? "☑  " : "☐  ") + indicators[i], MARGIN + 2, y);
    y += 6;
  }
  y += 4;

  // PART E: Investigation Narrative
  y = checkPage(doc, y, 30);
  y = header(doc, "Part E — Investigation Narrative", y);
  if (notes.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 120, 120);
    doc.text("No investigation notes recorded. Add case notes before filing.", MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 8;
  } else {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      y = checkPage(doc, y, 20);
      const noteDate = new Date(note.created_at).toLocaleString("en-CA", {
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
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

  // Action Taken
  y = checkPage(doc, y, 20);
  y = header(doc, "Part F — Action Taken", y);
  y = field(doc, "Action Taken by Reporting Entity", mf.actionTaken || "Not specified — describe what action was or will be taken (e.g., enhanced monitoring, account restriction, relationship terminated)", y);
  y += 2;

  // PART G: Compliance Officer Declaration
  y = checkPage(doc, y, 60);
  y = header(doc, "Part G — Compliance Officer Declaration (PCMLTFA s.7)", y);
  doc.setFontSize(9);
  const declaration = [
    `I, ${mf.camloName || "___________________"}, Chief Anti-Money Laundering Officer (CAMLO) or authorised delegate, hereby declare that:`,
    "",
    "1. This report is filed in compliance with the Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA).",
    "2. The information contained herein is true, complete, and accurate to the best of my knowledge.",
    "3. A reasonable determination has been made that there are reasonable grounds to suspect that the transaction(s)",
    "   are related to the commission or attempted commission of a money laundering or terrorist activity financing offence.",
    "4. This report will be retained for a minimum period of 5 years from the date of filing (PCMLTFR s.69).",
    "5. I understand that failure to file or filing a false report is an offence under PCMLTFA s.75.",
  ].join("\n");
  const declLines = doc.splitTextToSize(declaration, CONTENT_W);
  doc.text(declLines, MARGIN, y);
  y += declLines.length * LINE_H + 12;

  y = checkPage(doc, y, 35);
  doc.setDrawColor(0, 0, 0);
  doc.line(MARGIN, y + 15, MARGIN + 70, y + 15);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("CAMLO Signature", MARGIN, y + 19);
  doc.line(MARGIN + 90, y + 15, MARGIN + 160, y + 15);
  doc.text("Date", MARGIN + 90, y + 19);

  y += 28;
  y = checkPage(doc, y, 15);
  doc.line(MARGIN, y, MARGIN + 70, y);
  doc.text("Print Name: " + (mf.camloName || ""), MARGIN, y + 4);
  doc.line(MARGIN + 90, y, MARGIN + 160, y);
  doc.text("FINTRAC Report ID (if assigned)", MARGIN + 90, y + 4);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(185, 28, 28);
    doc.rect(0, 290, PAGE_W, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(
      `CONFIDENTIAL — FINTRAC ${strType.toUpperCase()} — ${refNum} — ${reportingEntity} — Page ${p} of ${pageCount}`,
      PAGE_W / 2, 294.5, { align: "center" }
    );
  }

  const fileName = `FINTRAC_${strType.toUpperCase()}_${refNum.replace(/[^A-Z0-9]/gi, "_")}_${now.toISOString().slice(0, 10)}.pdf`;
  
  try {
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    doc.save(fileName);
  }
}
