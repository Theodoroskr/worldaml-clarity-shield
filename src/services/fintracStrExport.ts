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

// FINTRAC FWR-aligned party records (multi-entry)
export interface FINTRACPartyConductor {
  fullName: string;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  idType?: string;
  idNumber?: string;
  idJurisdiction?: string;
}

export interface FINTRACPartyBeneficialOwner {
  fullName: string;
  dateOfBirth?: string;
  address?: string;
  ownershipPercent?: string;
  controlNature?: string; // e.g. director, signatory, ultimate beneficial owner
}

export interface FINTRACPartyThirdParty {
  fullName: string;
  dateOfBirth?: string;
  address?: string;
  relationshipToConductor?: string; // e.g. employer, spouse, agent
  onBehalfOfIndicator?: string; // who they are acting for
}

// Virtual currency / EMT (Electronic Funds Transfer / Electronic Money Transfer) details
export interface FINTRACVirtualCurrencyDetails {
  vcType: string; // BTC, ETH, USDT, etc.
  senderAddress?: string;
  receiverAddress?: string;
  transactionHash?: string;
  exchangeRateToCad?: string;
  walletProvider?: string;
}

export interface FINTRACEmtDetails {
  emtReference?: string;        // EMT reference / confirmation number
  emtMessage?: string;          // free-text EMT memo / message field
  senderInstitution?: string;
  receiverInstitution?: string;
  senderAccount?: string;
  receiverAccount?: string;
  emtType?: string;             // e-Transfer, SWIFT MT103, ACH, Interac, etc.
}

export interface FINTRACManualFields {
  // Starting Action (legacy single-conductor — kept for backward compat)
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
  // TPR-specific fields
  tprTerroristEntityName: string;
  tprTerroristEntityType: string;
  tprListedUnder: string;
  tprPropertyType: string;
  tprPropertyDescription: string;
  tprPropertyValue: string;
  tprPropertyCurrency: string;
  tprPropertyLocation: string;
  tprDispositionAction: string;
  tprDateDiscovered: string;
  tprRelationshipToEntity: string;
  // ── FWR-aligned multi-party records ──
  conductors: FINTRACPartyConductor[];
  beneficialOwners: FINTRACPartyBeneficialOwner[];
  thirdParties: FINTRACPartyThirdParty[];
  // ── Virtual currency / EMT ──
  isVirtualCurrency: boolean;
  virtualCurrency: FINTRACVirtualCurrencyDetails;
  isEmt: boolean;
  emt: FINTRACEmtDetails;
  // ── FWR multi-action: per-transaction starting + completing actions ──
  // Keyed by transaction.id. When present, overrides the legacy aggregate fields above.
  transactionActions?: Record<string, FINTRACTransactionAction>;
}

// One starting+completing action pair per transaction (FWR multi-action support)
export interface FINTRACTransactionAction {
  // Starting Action — how the funds entered the transaction
  starting: {
    methodOfTransaction?: string;     // in-person, online, ATM, wire…
    sourceOfFunds?: string;           // salary, business revenue, savings…
    conductorName?: string;
    thirdPartyIndicator?: "own_behalf" | "third_party";
    thirdPartyName?: string;
    accountFrom?: string;
    institutionFrom?: string;
  };
  // Completing Action — how the funds left / were disposed
  completing: {
    dispositionOfFunds?: string;
    beneficiaryName?: string;
    beneficiaryAccount?: string;
    beneficiaryCountry?: string;
    accountTo?: string;
    institutionTo?: string;
  };
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
  tprTerroristEntityName: "",
  tprTerroristEntityType: "individual",
  tprListedUnder: "",
  tprPropertyType: "",
  tprPropertyDescription: "",
  tprPropertyValue: "",
  tprPropertyCurrency: "CAD",
  tprPropertyLocation: "",
  tprDispositionAction: "",
  tprDateDiscovered: "",
  tprRelationshipToEntity: "",
  conductors: [],
  beneficialOwners: [],
  thirdParties: [],
  isVirtualCurrency: false,
  virtualCurrency: { vcType: "", senderAddress: "", receiverAddress: "", transactionHash: "", exchangeRateToCad: "", walletProvider: "" },
  isEmt: false,
  emt: { emtReference: "", emtMessage: "", senderInstitution: "", receiverInstitution: "", senderAccount: "", receiverAccount: "", emtType: "" },
};

export interface FINTRACSTRExportOptions {
  caseItem: FINTRACCase;
  notes: FINTRACNote[];
  customer: FINTRACCustomer | null;
  transactions: FINTRACTransaction[];
  submittedBy: string;
  reportingEntity: string;
  reportingEntityRef?: string;
  strType: "str" | "lctr" | "eftr" | "tpr";
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
  tpr: "Terrorist Property Report (TPR)",
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

export async function exportFINTRACStr(opts: FINTRACSTRExportOptions): Promise<{ blobUrl: string; fileName: string }> {
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

  // ════════════════════════════════════════════════════════════════════
  // FWR STR — 6 OFFICIAL SECTIONS
  //   1 General Information · 2 Transaction Information · 3 Starting Action
  //   4 Completing Action · 5 Details of Suspicion · 6 Action Taken
  // ════════════════════════════════════════════════════════════════════

  const txActions = mf.transactionActions ?? {};
  const getStarting = (txId: string) => txActions[txId]?.starting ?? {};
  const getCompleting = (txId: string) => txActions[txId]?.completing ?? {};
  const fallback = (perTx: string | undefined, legacy: string) => (perTx && perTx.trim() ? perTx : legacy);

  const subHeader = (label: string) => {
    doc.setFillColor(255, 240, 240);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 20, 20);
    doc.text(label, MARGIN + 3, y + 5);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 10;
  };

  // ── SECTION 1 — General Information ──
  y = header(doc, "Section 1 — General Information", y);
  y = fieldPair(doc, "Reporting Entity Report Reference", refNum, "Report Type", STR_TYPE_LABELS[strType] ?? "STR", y);
  y = fieldPair(doc, "Reporting Entity", reportingEntity, "Reporting Officer (CAMLO)", submittedBy, y);
  y = fieldPair(doc, "Report Date", dateStr, "Filing Deadline",
    strType === "str" ? "As soon as practicable after RGS established" : "Within 15 calendar days", y);
  y = field(doc, "Internal Case Reference", `${caseItem.id} — ${caseItem.title}`, y);
  y = fieldPair(doc, "Case Status", caseItem.status.replace(/_/g, " ").toUpperCase(), "Priority", caseItem.priority.toUpperCase(), y);
  y += 2;

  y = checkPage(doc, y, 60);
  subHeader("1.1 — SUBJECT OF THE REPORT (INDIVIDUAL / ENTITY)");
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

  if (mf.conductors && mf.conductors.length > 0) {
    y = checkPage(doc, y, 30);
    subHeader(`1.2 — CONDUCTORS (${mf.conductors.length})`);
    mf.conductors.forEach((c, idx) => {
      y = checkPage(doc, y, 30);
      doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(`Conductor ${idx + 1}`, MARGIN, y);
      doc.setFont("helvetica", "normal"); y += 4;
      y = fieldPair(doc, "Full Legal Name", c.fullName || "—", "Date of Birth", c.dateOfBirth || "—", y);
      y = field(doc, "Address", c.address || "—", y);
      y = fieldPair(doc, "Occupation", c.occupation || "—", "ID Type", c.idType || "—", y);
      y = fieldPair(doc, "ID Number", c.idNumber || "—", "ID Issuing Jurisdiction", c.idJurisdiction || "—", y);
    });
    y += 2;
  }

  if (mf.thirdParties && mf.thirdParties.length > 0) {
    y = checkPage(doc, y, 30);
    subHeader(`1.3 — THIRD PARTIES (${mf.thirdParties.length})`);
    mf.thirdParties.forEach((t, idx) => {
      y = checkPage(doc, y, 30);
      doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(`Third Party ${idx + 1}`, MARGIN, y);
      doc.setFont("helvetica", "normal"); y += 4;
      y = fieldPair(doc, "Full Legal Name", t.fullName || "—", "Date of Birth", t.dateOfBirth || "—", y);
      y = field(doc, "Address", t.address || "—", y);
      y = fieldPair(doc, "Relationship to Conductor", t.relationshipToConductor || "—", "On Behalf Of", t.onBehalfOfIndicator || "—", y);
    });
    y += 2;
  }

  if (mf.beneficialOwners && mf.beneficialOwners.length > 0) {
    y = checkPage(doc, y, 30);
    subHeader(`1.4 — BENEFICIAL OWNERS (${mf.beneficialOwners.length})`);
    mf.beneficialOwners.forEach((b, idx) => {
      y = checkPage(doc, y, 30);
      doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(`Beneficial Owner ${idx + 1}`, MARGIN, y);
      doc.setFont("helvetica", "normal"); y += 4;
      y = fieldPair(doc, "Full Legal Name", b.fullName || "—", "Date of Birth", b.dateOfBirth || "—", y);
      y = field(doc, "Address", b.address || "—", y);
      y = fieldPair(doc, "Ownership %", b.ownershipPercent || "—", "Nature of Control", b.controlNature || "—", y);
    });
    y += 2;
  }

  // ── SECTION 2 — Transaction Information (multi-transaction) ──
  y = checkPage(doc, y, 40);
  y = header(doc, `Section 2 — Transaction Information (${transactions.length} transaction${transactions.length === 1 ? "" : "s"})`, y);

  if (transactions.length === 0) {
    y = field(doc, "Transactions", "No linked transactions. See Section 5 (Details of Suspicion) for narrative.", y);
  } else {
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    doc.setFillColor(245, 245, 245);
    doc.rect(MARGIN, y, CONTENT_W, 7, "F");
    const cols = [MARGIN + 2, MARGIN + 22, MARGIN + 47, MARGIN + 67, MARGIN + 87, MARGIN + 112, MARGIN + 140];
    const cellHeaders = ["Date", "Amount", "Currency", "Direction", "Counterparty", "Country", "Status"];
    cellHeaders.forEach((h, i) => doc.text(h, cols[i], y + 5));
    y += 9;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);

    for (const tx of transactions.slice(0, 30)) {
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
    if (transactions.length > 30) {
      doc.setFontSize(7); doc.setFont("helvetica", "italic");
      doc.text(`+ ${transactions.length - 30} additional transactions omitted from summary table`, MARGIN, y + 4);
      y += 8;
    }

    y = checkPage(doc, y, 15);
    const totalAmount = transactions.reduce((s, t) => s + t.amount, 0);
    const flaggedCount = transactions.filter(t => t.risk_flag).length;
    y = fieldPair(doc, "Total Transactions", String(transactions.length),
      "Aggregate Value", `${totalAmount.toLocaleString("en-CA", { minimumFractionDigits: 2 })} ${transactions[0]?.currency ?? "CAD"}`, y);
    y = fieldPair(doc, "Risk-Flagged Transactions", `${flaggedCount} of ${transactions.length}`,
      "Flagged Percentage", `${transactions.length > 0 ? Math.round((flaggedCount / transactions.length) * 100) : 0}%`, y);
  }

  if (mf.isVirtualCurrency) {
    const vc = mf.virtualCurrency;
    y = checkPage(doc, y, 50);
    subHeader("2.1 — VIRTUAL CURRENCY DETAILS (PCMLTFR s.7.1)");
    y = fieldPair(doc, "Virtual Currency Type", vc.vcType || "—", "Wallet / Exchange Provider", vc.walletProvider || "—", y);
    y = field(doc, "Sender VC Address", vc.senderAddress || "—", y);
    y = field(doc, "Receiver VC Address", vc.receiverAddress || "—", y);
    y = field(doc, "Transaction Hash / TXID", vc.transactionHash || "—", y);
    y = field(doc, "Exchange Rate to CAD at Time of Transaction", vc.exchangeRateToCad || "—", y);
    y += 2;
  }

  if (mf.isEmt) {
    const emt = mf.emt;
    y = checkPage(doc, y, 60);
    subHeader("2.2 — ELECTRONIC FUNDS / MONEY TRANSFER DETAILS");
    y = fieldPair(doc, "EMT / EFT Type", emt.emtType || "—", "EMT Reference Number", emt.emtReference || "—", y);
    y = fieldPair(doc, "Sender Institution", emt.senderInstitution || "—", "Receiver Institution", emt.receiverInstitution || "—", y);
    y = fieldPair(doc, "Sender Account", emt.senderAccount || "—", "Receiver Account", emt.receiverAccount || "—", y);
    y = field(doc, "EMT Message / Memo", emt.emtMessage || "—", y);
    y += 2;
  }

  // ── SECTION 3 — Starting Action (per-transaction multi-action) ──
  y = checkPage(doc, y, 30);
  y = header(doc, "Section 3 — Starting Action (PCMLTFR s.132)", y);
  doc.setFontSize(7.5); doc.setFont("helvetica", "italic"); doc.setTextColor(100, 100, 100);
  doc.text("How each transaction was initiated — conductor, source of funds, method, third-party determination.", MARGIN, y);
  doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
  y += 6;

  if (transactions.length === 0) {
    y = field(doc, "Method of Transaction", mf.methodOfTransaction || "Not specified", y);
    y = field(doc, "Source of Funds", mf.sourceOfFunds || "Not specified", y);
    y = field(doc, "Conductor Name", mf.conductorName || (customer ? customer.name : "Not specified"), y);
    y = field(doc, "Third Party Determination",
      mf.thirdPartyIndicator === "third_party" ? `On behalf of third party: ${mf.thirdPartyName || "—"}` : "Transaction conducted on own behalf", y);
  } else {
    transactions.forEach((tx, idx) => {
      const s = getStarting(tx.id);
      y = checkPage(doc, y, 38);
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(120, 20, 20);
      const txDate = new Date(tx.created_at).toLocaleDateString("en-CA");
      const amt = tx.amount.toLocaleString("en-CA", { minimumFractionDigits: 2 });
      doc.text(`Starting Action ${idx + 1} — Tx ${tx.id.slice(0, 8)} · ${txDate} · ${amt} ${tx.currency}`, MARGIN, y);
      doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal"); y += 4;
      y = fieldPair(doc,
        "Method of Transaction", fallback(s.methodOfTransaction, mf.methodOfTransaction || "Not specified"),
        "Source of Funds", fallback(s.sourceOfFunds, mf.sourceOfFunds || "Not specified"), y);
      y = fieldPair(doc,
        "Conductor Name", fallback(s.conductorName, mf.conductorName || (customer?.name ?? "Not specified")),
        "Third Party Determination",
        (s.thirdPartyIndicator ?? mf.thirdPartyIndicator) === "third_party"
          ? `On behalf of: ${fallback(s.thirdPartyName, mf.thirdPartyName || "—")}`
          : "Conducted on own behalf",
        y);
      if (s.accountFrom || s.institutionFrom) {
        y = fieldPair(doc, "Account From", s.accountFrom || "—", "Institution From", s.institutionFrom || "—", y);
      }
    });
  }
  y += 2;

  // ── SECTION 4 — Completing Action (per-transaction multi-action) ──
  y = checkPage(doc, y, 30);
  y = header(doc, "Section 4 — Completing Action (PCMLTFR s.133)", y);
  doc.setFontSize(7.5); doc.setFont("helvetica", "italic"); doc.setTextColor(100, 100, 100);
  doc.text("How each transaction was completed — disposition of funds, beneficiary, receiving account/institution.", MARGIN, y);
  doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
  y += 6;

  if (transactions.length === 0) {
    y = field(doc, "Disposition of Funds", mf.dispositionOfFunds || "Not specified", y);
    y = field(doc, "Beneficiary Name", mf.beneficiaryName || "Not specified", y);
    y = field(doc, "Beneficiary Account", mf.beneficiaryAccount || "—", y);
    y = field(doc, "Beneficiary Country", mf.beneficiaryCountry || "—", y);
  } else {
    transactions.forEach((tx, idx) => {
      const c = getCompleting(tx.id);
      y = checkPage(doc, y, 38);
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(120, 20, 20);
      const txDate = new Date(tx.created_at).toLocaleDateString("en-CA");
      const amt = tx.amount.toLocaleString("en-CA", { minimumFractionDigits: 2 });
      doc.text(`Completing Action ${idx + 1} — Tx ${tx.id.slice(0, 8)} · ${txDate} · ${amt} ${tx.currency}`, MARGIN, y);
      doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal"); y += 4;
      y = fieldPair(doc,
        "Disposition of Funds", fallback(c.dispositionOfFunds, mf.dispositionOfFunds || "Not specified"),
        "Beneficiary Name", fallback(c.beneficiaryName, mf.beneficiaryName || "Not specified"), y);
      y = fieldPair(doc,
        "Beneficiary Account", fallback(c.beneficiaryAccount, mf.beneficiaryAccount || "—"),
        "Beneficiary Country", fallback(c.beneficiaryCountry, mf.beneficiaryCountry || "—"), y);
      if (c.accountTo || c.institutionTo) {
        y = fieldPair(doc, "Account To", c.accountTo || "—", "Institution To", c.institutionTo || "—", y);
      }
    });
  }
  y += 2;

  // TPR addendum (after the 4 transactional sections, before suspicion)
  if (strType === "tpr") {
    y = checkPage(doc, y, 60);
    y = header(doc, "TPR Addendum — Terrorist Entity / Listed Person", y);
    y = fieldPair(doc, "Listed Entity / Person Name", mf.tprTerroristEntityName || "Not specified",
      "Entity Type", mf.tprTerroristEntityType === "entity" ? "Entity / Organisation" : "Individual", y);
    y = field(doc, "Listed Under (Regulation)", mf.tprListedUnder || "Not specified — e.g., Criminal Code s.83.05, UN Regulations (UNAQTR)", y);
    y = field(doc, "Relationship of Subject to Listed Entity", mf.tprRelationshipToEntity || "Not specified", y);
    y = field(doc, "Date Property Identified / Discovered", mf.tprDateDiscovered || "Not specified", y);

    y = checkPage(doc, y, 60);
    y = header(doc, "TPR Addendum — Property Details (PCMLTFA s.7.1)", y);
    const propTypes: Record<string, string> = {
      bank_account: "Bank Account / Deposit", investment: "Investment / Securities",
      real_estate: "Real Estate / Property", vehicle: "Vehicle / Vessel / Aircraft",
      cash: "Cash / Currency", crypto: "Virtual Currency / Crypto-asset",
      insurance: "Insurance Policy / Annuity", precious: "Precious Metals / Stones", other: "Other Property",
    };
    y = fieldPair(doc, "Property Type", (propTypes[mf.tprPropertyType] ?? mf.tprPropertyType) || "Not specified",
      "Estimated Value", `${mf.tprPropertyCurrency || "CAD"} ${mf.tprPropertyValue || "—"}`, y);
    y = field(doc, "Property Description", mf.tprPropertyDescription || "Not specified", y);
    y = field(doc, "Location of Property", mf.tprPropertyLocation || "Not specified", y);

    y = checkPage(doc, y, 30);
    y = header(doc, "TPR Addendum — Disposition (Criminal Code s.83.08)", y);
    const dispActions: Record<string, string> = {
      frozen: "Property Frozen / Account Blocked", seized: "Property Seized by Law Enforcement",
      reported_rcmp: "Reported to RCMP / CSIS", retained: "Property Retained — Awaiting Direction",
      released: "Property Released (with FINTRAC/court order)", other: "Other — See Notes",
    };
    y = field(doc, "Disposition Action", (dispActions[mf.tprDispositionAction] ?? mf.tprDispositionAction) || "Not specified", y);
  }

  // ── SECTION 5 — Details of Suspicion ──
  y = checkPage(doc, y, 30);
  y = header(doc, "Section 5 — Details of Suspicion", y);
  doc.setFontSize(7.5); doc.setFont("helvetica", "italic"); doc.setTextColor(100, 100, 100);
  doc.text("Reasonable grounds to suspect (RGS) — facts, context, ML/TF indicators, and full investigation narrative.", MARGIN, y);
  doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
  y += 6;

  const suspicionLabels: Record<string, string> = { ml: "Money Laundering (ML)", tf: "Terrorist Activity Financing (TF)", sanctions: "Sanctions Evasion", ml_tf: "ML and TF" };
  y = fieldPair(doc, "Suspicion Type", suspicionLabels[mf.suspicionType] ?? mf.suspicionType ?? "Not specified",
    "PEP Status",
    mf.isPEP === "yes" ? "YES — Politically Exposed Person"
      : mf.isPEP === "foreign_pep" ? "YES — Foreign PEP"
      : mf.isPEP === "domestic_pep" ? "YES — Domestic PEP"
      : "No",
    y);

  y = checkPage(doc, y, 20);
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(120, 20, 20);
  doc.text("5.1 — ML / TF INDICATORS (FINTRAC Guidance)", MARGIN, y);
  doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
  y += 5;

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

  y = checkPage(doc, y, 20);
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(120, 20, 20);
  doc.text("5.2 — INVESTIGATION NARRATIVE (RGS)", MARGIN, y);
  doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
  y += 6;

  if (notes.length === 0) {
    doc.setFontSize(9); doc.setFont("helvetica", "italic"); doc.setTextColor(120, 120, 120);
    doc.text("No investigation notes recorded. Add case notes before filing.", MARGIN, y);
    doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
    y += 8;
  } else {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      y = checkPage(doc, y, 20);
      const noteDate = new Date(note.created_at).toLocaleString("en-CA", {
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
      });
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 80);
      doc.text(`Note ${i + 1} — ${noteDate}`, MARGIN, y);
      y += 4;
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(note.content, CONTENT_W);
      y = checkPage(doc, y, lines.length * LINE_H + 6);
      doc.text(lines, MARGIN, y);
      y += lines.length * LINE_H + 6;
      doc.setDrawColor(220, 220, 220);
      doc.line(MARGIN, y - 3, MARGIN + CONTENT_W, y - 3);
    }
  }
  y += 4;

  // ── SECTION 6 — Action Taken ──
  y = checkPage(doc, y, 20);
  y = header(doc, "Section 6 — Action Taken", y);
  y = field(doc, "Action Taken by Reporting Entity",
    mf.actionTaken || "Not specified — describe what action was or will be taken (e.g., enhanced monitoring, account restriction, relationship terminated, file referred to law enforcement)", y);
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
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);
  return { blobUrl, fileName };
}
