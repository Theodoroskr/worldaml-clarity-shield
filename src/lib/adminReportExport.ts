import jsPDF from "jspdf";
import { format } from "date-fns";
import type { AdminAnalytics } from "./adminAnalytics";

/** Aggregated KPI rows shared by the CSV export, the PDF export and the email report. */
export function summaryRows(a: AdminAnalytics): { metric: string; value: string; scope: string }[] {
  const eur = (c: number) => `€${Math.round((c ?? 0) / 100).toLocaleString()}`;
  return [
    { metric: "New users", value: String(a.current.new_users ?? 0), scope: "Period" },
    { metric: "Active users", value: String(a.current.active_users ?? 0), scope: "Period" },
    { metric: "New leads", value: String(a.current.new_leads ?? 0), scope: "Period" },
    { metric: "Paid orders", value: String(a.current.paid_orders ?? 0), scope: "Period" },
    { metric: "Revenue (EUR)", value: eur(a.current.revenue_cents ?? 0), scope: "Period" },
    { metric: "New business accounts", value: String(a.current.new_business_accounts ?? 0), scope: "Period" },
    { metric: "New partners", value: String(a.current.new_partners ?? 0), scope: "Period" },
    { metric: "Partner deals registered", value: String(a.current.new_deals ?? 0), scope: "Period" },
    { metric: "Courses started", value: String(a.current.courses_started ?? 0), scope: "Period" },
    { metric: "Courses completed", value: String(a.current.courses_completed ?? 0), scope: "Period" },
    { metric: "Certificates issued", value: String(a.current.certificates ?? 0), scope: "Period" },
    { metric: "Sanctions searches", value: String(a.current.sanctions_searches ?? 0), scope: "Period" },
    { metric: "Total users", value: String(a.lifetime.total_users ?? 0), scope: "Lifetime" },
    { metric: "Business accounts", value: String(a.lifetime.business_accounts ?? 0), scope: "Lifetime" },
    { metric: "Active partners", value: String(a.lifetime.active_partners ?? 0), scope: "Lifetime" },
    { metric: "Certificates", value: String(a.lifetime.certificates ?? 0), scope: "Lifetime" },
    { metric: "Lifetime revenue (EUR)", value: eur(a.lifetime.revenue_cents ?? 0), scope: "Lifetime" },
    { metric: "Pending partner applications", value: String(a.actions.pending_partner_apps ?? 0), scope: "Now" },
    { metric: "Deals awaiting review", value: String(a.actions.deals_pending_review ?? 0), scope: "Now" },
    { metric: "Unreconciled purchases", value: String(a.actions.unreconciled_purchases ?? 0), scope: "Now" },
    { metric: "Open Suite alerts", value: String(a.actions.open_alerts ?? 0), scope: "Now" },
  ];
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Aggregated CSV — no personal data is included. */
export function exportSummaryCsv(a: AdminAnalytics, label: string) {
  const rows = summaryRows(a);
  const csv = [
    `WorldAML admin summary,${label}`,
    `Generated,${format(new Date(a.generated_at), "yyyy-MM-dd HH:mm")}`,
    "",
    "Metric,Value,Scope",
    ...rows.map((r) => `"${r.metric}","${r.value}","${r.scope}"`),
    "",
    "Top courses,Enrolments,Completions",
    ...a.academy.top_courses.map((c) => `"${c.title}",${c.enrolments},${c.completions}`),
    "",
    "Top lead sources,Leads",
    ...a.marketing.by_referrer.map((r) => `"${r.label}",${r.n}`),
    "",
    "Top partners,Deals,Pipeline EUR",
    ...a.partners.top_partners.map((p) => `"${p.name}",${p.deals},${p.pipeline_eur}`),
  ].join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `worldaml-admin-${format(new Date(), "yyyyMMdd-HHmm")}.csv`);
}

/** Aggregated PDF summary for management circulation. */
export function exportSummaryPdf(a: AdminAnalytics, label: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 56;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("WorldAML — Internal Performance Summary", 48, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`${label} · generated ${format(new Date(a.generated_at), "d MMM yyyy HH:mm")}`, 48, y);
  doc.setTextColor(0);
  y += 26;

  const section = (title: string) => {
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, 48, y);
    y += 6;
    doc.setDrawColor(220);
    doc.line(48, y, 547, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const line = (l: string, r: string) => {
    if (y > 780) { doc.addPage(); y = 56; }
    doc.text(l, 48, y);
    doc.text(r, 547, y, { align: "right" });
    y += 15;
  };

  section("Key performance indicators");
  summaryRows(a).forEach((r) => line(`${r.metric} (${r.scope.toLowerCase()})`, r.value));

  if (a.academy.top_courses.length) {
    section("Top courses");
    a.academy.top_courses.forEach((c) => line(c.title, `${c.enrolments} enrolments · ${c.completions} completed`));
  }
  if (a.marketing.by_referrer.length) {
    section("Top lead sources");
    a.marketing.by_referrer.forEach((r) => line(r.label, String(r.n)));
  }
  if (a.partners.top_partners.length) {
    section("Top partners");
    a.partners.top_partners.forEach((p) => line(p.name, `${p.deals} deals · €${p.pipeline_eur.toLocaleString()}`));
  }

  section("Requires attention");
  line("Pending partner applications", String(a.actions.pending_partner_apps ?? 0));
  line("Deals awaiting review", String(a.actions.deals_pending_review ?? 0));
  line("Unreconciled purchases", String(a.actions.unreconciled_purchases ?? 0));
  line("Open Suite alerts", String(a.actions.open_alerts ?? 0));

  doc.save(`worldaml-admin-${format(new Date(), "yyyyMMdd-HHmm")}.pdf`);
}
