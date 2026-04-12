import jsPDF from "jspdf";

export interface MOKASCustomer {
  name: string;
  type: string;
  email?: string | null;
  country?: string | null;
  company_name?: string | null;
  date_of_birth?: string | null;
  risk_level?: string;
  registration_number?: string | null;
}

export interface MOKASTransaction {
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

export interface MOKASCase {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  alert_id?: string | null;
}

export interface MOKASNote {
  id: string;
  content: string;
  created_at: string;
}

export interface MOKASManualFields {
  // Reporting officer
  complianceOfficerName: string;
  complianceOfficerPosition: string;
  // Reporting entity
  reportingEntityLicense: string;
  reportingEntityCIF: string;
  reportingEntityDRCOR: string;
  // Subject details
  subjectPassportId: string;
  subjectAddress: string;
  subjectOccupation: string;
  subjectPEP: string;
  // Transaction details
  sourceOfFunds: string;
  destinationOfFunds: string;
  methodOfPayment: string;
  beneficialOwner: string;
  // Suspicion
  suspicionType: string;
  selectedIndicators: number[];
  // Action
  actionTaken: string;
  internalMeasures: string;
}

export const DEFAULT_MOKAS_FIELDS: MOKASManualFields = {
  complianceOfficerName: "",
  complianceOfficerPosition: "",
  reportingEntityLicense: "",
  reportingEntityCIF: "",
  reportingEntityDRCOR: "",
  subjectPassportId: "",
  subjectAddress: "",
  subjectOccupation: "",
  subjectPEP: "no",
  sourceOfFunds: "",
  destinationOfFunds: "",
  methodOfPayment: "",
  beneficialOwner: "",
  suspicionType: "ml",
  selectedIndicators: [],
  actionTaken: "",
  internalMeasures: "",
};

export interface MOKASSTRExportOptions {
  caseItem: MOKASCase;
  notes: MOKASNote[];
  customer: MOKASCustomer | null;
  transactions: MOKASTransaction[];
  submittedBy: string;
  reportingEntity: string;
  reportingEntityRef?: string;
  manualFields?: MOKASManualFields;
}

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE_H = 6;

// CySEC / MOKAS teal brand
const BRAND_R = 0, BRAND_G = 128, BRAND_B = 128;

function header(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(BRAND_R, BRAND_G, BRAND_B);
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

export async function exportMOKASStr(opts: MOKASSTRExportOptions): Promise<{ blobUrl: string; fileName: string }> {
  const { caseItem, notes, customer, transactions, submittedBy, reportingEntity, reportingEntityRef, manualFields } = opts;
  const mf = manualFields ?? DEFAULT_MOKAS_FIELDS;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const refNum = reportingEntityRef ?? `MOKAS-STR-${caseItem.id.slice(0, 8).toUpperCase()}`;

  // Cover banner — teal for CySEC/MOKAS
  doc.setFillColor(BRAND_R, BRAND_G, BRAND_B);
  doc.rect(0, 0, PAGE_W, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SUSPICIOUS TRANSACTION REPORT (STR)", MARGIN, 13);
  doc.setFontSize(10);
  doc.text("MOKAS — Unit for Combating Money Laundering, Cyprus", MARGIN, 20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("CONFIDENTIAL — AML Law 188(I)/2007 · CySEC Directive DI144-2007-08", MARGIN, 27);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, PAGE_W - MARGIN, 27, { align: "right" });

  // Regulatory disclaimer
  doc.setFillColor(240, 250, 250);
  doc.rect(0, 34, PAGE_W, 14, "F");
  doc.setTextColor(0, 80, 80);
  doc.setFontSize(7);
  doc.text(
    "This report is filed pursuant to the Prevention and Suppression of Money Laundering and Terrorist Financing Law",
    MARGIN, 39
  );
  doc.text(
    "188(I)/2007, as amended. Tipping off the subject is a criminal offence (Art. 48). Retain records for minimum 5 years (Art. 68).",
    MARGIN, 43
  );
  doc.text(
    "CySEC-regulated entities must file within 3 working days of forming suspicion (CySEC Directive DI144-2007-08, Para. 34).",
    MARGIN, 47
  );

  doc.setTextColor(0, 0, 0);
  let y = 54;

  // SECTION 1: Report Identification
  y = header(doc, "Section 1 — Report Identification", y);
  y = fieldPair(doc, "MOKAS Reference", refNum, "Report Date", dateStr, y);
  y = fieldPair(doc, "Reporting Entity", reportingEntity, "CySEC License / CIF Number", mf.reportingEntityCIF || "—", y);
  y = fieldPair(doc, "DRCOR Registration", mf.reportingEntityDRCOR || "—", "Entity License No.", mf.reportingEntityLicense || "—", y);
  y = fieldPair(doc, "Compliance Officer", mf.complianceOfficerName || submittedBy, "Position / Title", mf.complianceOfficerPosition || "AMLCO", y);
  y = field(doc, "Case Reference", `${caseItem.id} — ${caseItem.title}`, y);
  y = fieldPair(doc, "Case Status", caseItem.status.replace(/_/g, " ").toUpperCase(), "Priority", caseItem.priority.toUpperCase(), y);
  y += 2;

  // SECTION 2: Subject Information
  y = checkPage(doc, y, 60);
  y = header(doc, "Section 2 — Subject of Suspicion", y);
  if (customer) {
    y = fieldPair(doc, "Full Legal Name", customer.name, "Entity Type", customer.type === "business" ? "Legal Entity / Corporation" : "Natural Person", y);
    if (customer.date_of_birth) {
      y = fieldPair(doc, "Date of Birth", customer.date_of_birth, "Nationality / Country", customer.country ?? "—", y);
    } else {
      y = field(doc, "Country of Residence / Incorporation", customer.country ?? "—", y);
    }
    y = fieldPair(doc, "Passport / ID Number", mf.subjectPassportId || "—", "Occupation / Business Activity", mf.subjectOccupation || "—", y);
    y = field(doc, "Address", mf.subjectAddress || "—", y);
    if (customer.company_name) y = field(doc, "Business Trading Name", customer.company_name, y);
    if (customer.registration_number) y = field(doc, "DRCOR / Company Registration No.", customer.registration_number, y);
    if (customer.email) y = field(doc, "Email / Contact", customer.email, y);
    y = fieldPair(doc, "Risk Classification", (customer.risk_level ?? "unknown").toUpperCase(), "PEP Status",
      mf.subjectPEP === "yes" ? "YES — Politically Exposed Person" :
      mf.subjectPEP === "domestic_pep" ? "YES — Domestic PEP" :
      mf.subjectPEP === "foreign_pep" ? "YES — Foreign PEP (Art. 38)" : "No", y);
    y = field(doc, "Beneficial Owner", mf.beneficialOwner || "Same as subject / Not applicable", y);
  } else {
    y = field(doc, "Subject", "Not linked to a customer record — walk-in or unverified party", y);
  }
  y += 2;

  // SECTION 3: Transaction Details
  y = checkPage(doc, y, 40);
  y = header(doc, "Section 3 — Suspicious Transaction(s)", y);
  if (transactions.length === 0) {
    y = field(doc, "Transactions", "No linked transactions. See investigation narrative for details.", y);
  } else {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 250, 250);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    const cols = [MARGIN + 2, MARGIN + 22, MARGIN + 47, MARGIN + 67, MARGIN + 87, MARGIN + 112, MARGIN + 140];
    const headers = ["Date", "Amount", "Currency", "Direction", "Counterparty", "Country", "Status"];
    headers.forEach((h, i) => doc.text(h, cols[i], y + 5));
    y += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    for (const tx of transactions.slice(0, 20)) {
      y = checkPage(doc, y, 8);
      const txDate = new Date(tx.created_at).toLocaleDateString("en-GB");
      const amt = tx.amount.toLocaleString("en-GB", { minimumFractionDigits: 2 });
      doc.text(txDate, cols[0], y + 4);
      doc.text(`€${amt}`, cols[1], y + 4);
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
      "Aggregate Value", `€${totalAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })} ${transactions[0]?.currency ?? "EUR"}`,
      y
    );
    y = fieldPair(doc,
      "Risk-Flagged Transactions", `${flaggedCount} of ${transactions.length}`,
      "Flagged Percentage", `${transactions.length > 0 ? Math.round((flaggedCount / transactions.length) * 100) : 0}%`,
      y
    );

    // Source & Destination
    y = checkPage(doc, y, 30);
    y += 2;
    doc.setFillColor(240, 250, 250);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 80, 80);
    doc.text("TRANSACTION DETAILS — SOURCE, DESTINATION & METHOD (AML LAW Art. 58)", MARGIN + 3, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 10;

    y = field(doc, "Source of Funds", mf.sourceOfFunds || "Not specified", y);
    y = field(doc, "Destination of Funds", mf.destinationOfFunds || "Not specified", y);
    y = field(doc, "Method of Payment", mf.methodOfPayment || "Not specified", y);
  }
  y += 2;

  // SECTION 4: Grounds for Suspicion / Indicators
  y = checkPage(doc, y, 30);
  y = header(doc, "Section 4 — Grounds for Suspicion (Art. 27)", y);

  const suspicionLabels: Record<string, string> = {
    ml: "Money Laundering (ML)",
    tf: "Terrorist Financing (TF)",
    sanctions: "Sanctions Evasion",
    ml_tf: "ML and TF",
    fraud: "Fraud / Predicate Offence",
  };
  y = fieldPair(doc, "Suspicion Type", suspicionLabels[mf.suspicionType] ?? mf.suspicionType ?? "Not specified", "PEP Status",
    mf.subjectPEP === "yes" ? "YES — PEP" : mf.subjectPEP === "foreign_pep" ? "YES — Foreign PEP (Art. 38)" : "No", y);

  // Cyprus-specific indicators from MOKAS / CySEC guidance
  const indicators = [
    "Transaction inconsistent with client's known business or economic profile",
    "Structuring transactions to avoid €10,000 reporting threshold",
    "Involvement of high-risk third country (EU Commission list)",
    "Unusual use of shell companies, trusts, or nominee structures",
    "Client unable or unwilling to provide source of funds/wealth",
    "Rapid movement of funds with no apparent economic rationale",
    "Transactions involving sanctioned jurisdictions or persons",
    "Use of complex corporate structures disproportionate to business needs",
    "Funds originating from or destined to jurisdictions with weak AML frameworks",
    "Client is a PEP or close associate / family member of a PEP (Art. 38)",
    "Adverse media linking client to financial crime or corruption",
    "Dormant account suddenly reactivated with significant transactions",
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

  // SECTION 5: Investigation Narrative
  y = checkPage(doc, y, 30);
  y = header(doc, "Section 5 — Investigation Narrative", y);
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

  // SECTION 6: Action Taken & Internal Measures
  y = checkPage(doc, y, 30);
  y = header(doc, "Section 6 — Action Taken & Internal Measures (Art. 27(5))", y);
  y = field(doc, "Action Taken", mf.actionTaken || "Not specified — describe measures taken (e.g., enhanced monitoring, account restriction, relationship terminated)", y);
  y = field(doc, "Internal Measures Applied", mf.internalMeasures || "Not specified — describe enhanced due diligence or other internal measures", y);
  y += 2;

  // SECTION 7: AMLCO Declaration
  y = checkPage(doc, y, 60);
  y = header(doc, "Section 7 — AMLCO Declaration (Art. 69)", y);
  doc.setFontSize(9);
  const declaration = [
    `I, ${mf.complianceOfficerName || "___________________"}, Anti-Money Laundering Compliance Officer (AMLCO),`,
    `holding the position of ${mf.complianceOfficerPosition || "___________________"}, hereby declare that:`,
    "",
    "1. This report is filed in compliance with the Prevention and Suppression of Money Laundering and",
    "   Terrorist Financing Law 188(I)/2007, as amended.",
    "2. The information contained herein is true, complete, and accurate to the best of my knowledge.",
    "3. A reasonable determination has been made that there are grounds for suspicion that the transaction(s)",
    "   may be related to money laundering, terrorist financing, or a predicate offence.",
    "4. This report will be retained for a minimum period of 5 years from the end of the business relationship",
    "   or date of the occasional transaction (Art. 68).",
    "5. I confirm that no tipping off has occurred in relation to the subject(s) of this report (Art. 48).",
    "6. I understand that failure to file or late filing is a criminal offence under Art. 4 and Art. 5.",
  ].join("\n");
  const declLines = doc.splitTextToSize(declaration, CONTENT_W);
  doc.text(declLines, MARGIN, y);
  y += declLines.length * LINE_H + 12;

  y = checkPage(doc, y, 35);
  doc.setDrawColor(0, 0, 0);
  doc.line(MARGIN, y + 15, MARGIN + 70, y + 15);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("AMLCO Signature", MARGIN, y + 19);
  doc.line(MARGIN + 90, y + 15, MARGIN + 160, y + 15);
  doc.text("Date", MARGIN + 90, y + 19);

  y += 28;
  y = checkPage(doc, y, 15);
  doc.line(MARGIN, y, MARGIN + 70, y);
  doc.text("Print Name: " + (mf.complianceOfficerName || ""), MARGIN, y + 4);
  doc.line(MARGIN + 90, y, MARGIN + 160, y);
  doc.text("CySEC License / CIF: " + (mf.reportingEntityCIF || ""), MARGIN + 90, y + 4);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(BRAND_R, BRAND_G, BRAND_B);
    doc.rect(0, 290, PAGE_W, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(
      `CONFIDENTIAL — MOKAS STR — ${refNum} — ${reportingEntity} — Page ${p} of ${pageCount}`,
      PAGE_W / 2, 294.5, { align: "center" }
    );
  }

  const fileName = `MOKAS_STR_${refNum.replace(/[^A-Z0-9-]/gi, "_")}_${now.toISOString().slice(0, 10)}.pdf`;
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  return { blobUrl, fileName };
}
