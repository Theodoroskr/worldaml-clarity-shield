import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";

export type CaseReportMatch = {
  matchedName: string | null;
  entityType: string | null;
  statusLabel: string;
  matchBasisLabel?: string | null;
  nameSimilarity?: number | null;
  country?: string | null;
  categories?: string[];
};

export type CaseReportInput = {
  caseReference: string;
  caseStatusLabel?: string | null;
  monitoringActive?: boolean;
  screenedAt?: string | null;
  searchReference?: string | null;
  categoriesScreened?: string[];
  adverseMediaRequested?: boolean;
  monitoringRequested?: boolean;
  nameSimilarityThresholdPct?: number | null;
  subject: {
    typeLabel?: string | null;
    name: string;
    dateOfBirth?: string | null;
    countryOfResidence?: string | null;
    nationality?: string | null;
    countryOfIncorporation?: string | null;
  } | null;
  matches: CaseReportMatch[];
  matchTally: { confirmed: number; open: number; cleared: number };
};

async function currentReviewer() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { name: "Unknown user", email: "—" };
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  let name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  if (!name) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      const p = profile as { full_name?: string | null } | null;
      if (p?.full_name) name = p.full_name;
    } catch { /* best-effort */ }
  }
  return { name: name || user.email || "Unknown user", email: user.email ?? "—" };
}

/**
 * Produces a case-level screening report PDF covering the searched subject,
 * search parameters, and every match (or an explicit "no matches" clear
 * statement) so the file can be saved to the client file even when the
 * search returned zero results.
 */
export async function exportCaseReportPdf(input: CaseReportInput) {
  const reviewer = await currentReviewer();
  const now = new Date();
  const timestampUtc = now.toISOString().replace("T", " ").replace(/\..+/, " UTC");
  const timestampLocal = now.toLocaleString();

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  const contentWidth = pageWidth - marginX * 2;
  let y = 56;

  const ensure = (needed = 40) => {
    if (y > 800 - needed) { doc.addPage(); y = 56; }
  };
  const heading = (text: string) => {
    ensure(50);
    y += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 42, 68);
    doc.text(text, marginX, y);
    y += 6;
    doc.setDrawColor(210, 216, 224);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 12;
  };
  const row = (label: string, value?: string | null) => {
    const text = value && String(value).trim() ? String(value) : "—";
    const lines = doc.splitTextToSize(text, contentWidth - 150);
    ensure(Math.max(14, lines.length * 12));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(90, 100, 115);
    doc.text(label, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 26, 36);
    doc.text(lines, marginX + 150, y);
    y += Math.max(14, lines.length * 12);
  };
  const fmtDate = (v?: string | null) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
  };

  // Header band
  doc.setFillColor(15, 42, 68);
  doc.rect(0, 0, pageWidth, 72, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("WorldAML Screening & Monitoring", marginX, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(160, 226, 220);
  doc.text("Screening results report", marginX, 52);
  y = 96;

  heading("Case");
  row("Case reference", input.caseReference);
  row("Case status", input.caseStatusLabel);
  row("Search reference", input.searchReference);
  row("Screened at", fmtDate(input.screenedAt));
  if (input.monitoringActive) row("Monitoring", "Active — ongoing monitoring enabled");
  else if (input.monitoringRequested) row("Monitoring", "Requested");

  heading("Screened subject");
  row("Name", input.subject?.name);
  row("Subject type", input.subject?.typeLabel);
  row("Date of birth", input.subject?.dateOfBirth);
  row("Nationality", input.subject?.nationality);
  row("Country of residence", input.subject?.countryOfResidence);
  row("Country of incorporation", input.subject?.countryOfIncorporation);

  heading("Search parameters");
  row(
    "Categories screened",
    input.categoriesScreened?.length ? input.categoriesScreened.join(", ") : null,
  );
  row("Adverse media", input.adverseMediaRequested ? "Included" : "Not included");
  if (typeof input.nameSimilarityThresholdPct === "number") {
    row("Name match threshold", `${Math.round(input.nameSimilarityThresholdPct)}%`);
  }

  heading("Results");
  row("Total potential matches", String(input.matches.length));
  row("Confirmed", String(input.matchTally.confirmed));
  row("Awaiting review", String(input.matchTally.open));
  row("Cleared (false positive)", String(input.matchTally.cleared));

  if (input.matches.length === 0) {
    y += 10;
    ensure(60);
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(marginX, y, contentWidth, 46, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(6, 95, 70);
    doc.text("No matches found — clear result", marginX + 14, y + 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      doc.splitTextToSize(
        "This search returned no potential matches against the screened lists at the time of the search. This report may be retained as evidence of a clear screening result.",
        contentWidth - 28,
      ),
      marginX + 14,
      y + 33,
    );
    y += 56;
  } else {
    input.matches.forEach((m, i) => {
      ensure(90);
      y += 10;
      doc.setFillColor(244, 246, 249);
      doc.roundedRect(marginX, y, contentWidth, 22, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 42, 68);
      doc.text(
        doc.splitTextToSize(`${i + 1}. ${m.matchedName ?? "Unnamed profile"}`, contentWidth - 16),
        marginX + 8,
        y + 15,
      );
      y += 32;
      row("Status", m.statusLabel);
      row("Entity type", m.entityType);
      row("Match basis", m.matchBasisLabel);
      row(
        "Name similarity",
        typeof m.nameSimilarity === "number" ? `${Math.round(m.nameSimilarity * 100)}%` : null,
      );
      row("Country", m.country);
      row("Categories", m.categories?.length ? m.categories.join(", ") : null);
    });
  }

  heading("Generated by");
  row("Name", reviewer.name);
  row("Email", reviewer.email);
  row("Timestamp (UTC)", timestampUtc);
  row("Timestamp (local)", timestampLocal);

  y += 24;
  ensure(30);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 128, 140);
  doc.text(
    doc.splitTextToSize(
      `Generated ${timestampUtc} by ${reviewer.name} (${reviewer.email}). This report records the screening results for case ${input.caseReference} and should be retained with the case file.`,
      contentWidth,
    ),
    marginX,
    y,
  );

  const safe = input.caseReference.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`worldaml-screening-report-${safe}-${now.toISOString().slice(0, 10)}.pdf`);
}
