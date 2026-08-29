import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import type { FullEntityProfile } from "@/lib/suite/screeningV2";

export type DecisionPdfAttribute = {
  field_label: string;
  subject_value: string | null;
  match_value: string | null;
  assessment: string | null;
};

export type DecisionPdfSource = {
  source_name: string;
  jurisdiction: string | null;
  listing_date: string | null;
  description: string | null;
  category: string | null;
};

export type DecisionPdfInput = {
  matchedName?: string | null;
  entityType?: string | null;
  subjectName?: string | null;
  subjectType?: string | null;
  caseReference?: string | null;
  matchId: string;
  matchStatus?: string | null;
  nameSimilarity?: number | null;
  matchBasisLabel?: string | null;
  categories?: string[];
  countries?: string | null;
  decisionLabel: string;
  reason?: string | null;
  rationale?: string | null;
  /** Full provider profile — when present, all profile details are appended. */
  profile?: FullEntityProfile | null;
  /** Side-by-side match attribute comparison rows. */
  attributes?: DecisionPdfAttribute[];
  /** Source listings attached to the match. */
  sources?: DecisionPdfSource[];
};

type Reviewer = { name: string; email: string; userId: string; organisation?: string | null };

async function currentReviewer(): Promise<Reviewer> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { name: "Unknown user", email: "—", userId: "—" };
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  let name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  let organisation: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, company_name")
      .eq("id", user.id)
      .maybeSingle();
    const p = profile as { full_name?: string | null; company_name?: string | null } | null;
    if (!name && p?.full_name) name = p.full_name;
    organisation = p?.company_name ?? null;
  } catch {
    /* profile lookup is best-effort */
  }
  return {
    name: name || user.email || "Unknown user",
    email: user.email ?? "—",
    userId: user.id,
    organisation,
  };
}

/**
 * Produces a signed-off audit record of a screening match decision, including
 * the reviewer identity and a UTC timestamp so it can be filed as evidence.
 */
export async function exportMatchDecisionPdf(input: DecisionPdfInput) {
  const reviewer = await currentReviewer();
  const now = new Date();
  const timestampUtc = now.toISOString().replace("T", " ").replace(/\..+/, " UTC");
  const timestampLocal = now.toLocaleString();

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  const contentWidth = pageWidth - marginX * 2;
  let y = 56;

  const heading = (text: string) => {
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
    if (y > 760) { doc.addPage(); y = 56; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(90, 100, 115);
    doc.text(label, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 26, 36);
    doc.text(lines, marginX + 150, y);
    y += Math.max(14, lines.length * 12);
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
  doc.text("Match decision record", marginX, 52);
  y = 96;

  heading("Decision");
  row("Decision", input.decisionLabel);
  row("Reason", input.reason);
  row("Rationale", input.rationale);
  row("Recorded status", input.matchStatus);

  heading("Reviewer");
  row("Name", reviewer.name);
  row("Email", reviewer.email);
  row("User ID", reviewer.userId);
  if (reviewer.organisation) row("Organisation", reviewer.organisation);
  row("Timestamp (UTC)", timestampUtc);
  row("Timestamp (local)", timestampLocal);

  heading("Screened subject");
  row("Subject", input.subjectName);
  row("Subject type", input.subjectType);
  row("Case reference", input.caseReference);

  heading("Listed profile");
  row("Matched name", input.matchedName);
  row("Entity type", input.entityType);
  row("Match basis", input.matchBasisLabel);
  row(
    "Name similarity",
    typeof input.nameSimilarity === "number" ? `${Math.round(input.nameSimilarity * 100)}%` : null,
  );
  row("Categories", input.categories?.length ? input.categories.join(", ") : null);
  row("Countries", input.countries);
  row("Match ID", input.matchId);

  y += 24;
  if (y > 750) { doc.addPage(); y = 56; }
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 128, 140);
  doc.text(
    doc.splitTextToSize(
      `Generated ${timestampUtc} by ${reviewer.name} (${reviewer.email}). This document is an audit record of a screening match decision and should be retained with the case file.`,
      contentWidth,
    ),
    marginX,
    y,
  );

  const safe = (input.matchedName ?? "match").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`worldaml-decision-${safe}-${now.toISOString().slice(0, 10)}.pdf`);
}
