import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import AdminFilters from "@/components/admin/AdminFilters";
import { Funnel, Panel, RankList, SectionHeading } from "@/components/admin/AnalyticsPrimitives";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import {
  DateRange, PortalKey, RANGE_LABELS, RangeKey, fmtEur, fmtEurCents, fmtNum, rate, resolveRange,
} from "@/lib/adminAnalytics";
import { exportSummaryCsv, exportSummaryPdf } from "@/lib/adminReportExport";
import { Button } from "@/components/ui/button";

function KeyValues({ data }: { data: Record<string, number | string> }) {
  const entries = Object.entries(data);
  if (!entries.length) return <p className="text-xs text-muted-foreground py-2">No data for this period</p>;
  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.map(([k, v]) => (
        <div key={k} className="rounded-md border border-border/60 px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{k.replace(/_/g, " ")}</div>
          <div className="text-sm font-semibold text-foreground">{typeof v === "number" ? fmtNum(v) : v}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const [rangeKey, setRangeKey] = useState<RangeKey>("last_30_days");
  const [custom, setCustom] = useState<DateRange>(resolveRange("last_30_days"));
  const [portal, setPortal] = useState<PortalKey>("all");

  const range = useMemo(() => resolveRange(rangeKey, custom), [rangeKey, custom]);
  const rangeLabel = rangeKey === "custom"
    ? `${format(range.from, "d MMM")} – ${format(range.to, "d MMM yyyy")}`
    : RANGE_LABELS[rangeKey];

  const { data: a, isLoading, isFetching, refetch } = useAdminAnalytics(range);

  const series = a?.series.map((p) => ({ ...p, bucket: format(new Date(p.date), "d MMM") })) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deep-dive breakdowns per area of the WorldAML ecosystem — {rangeLabel}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminFilters
            rangeKey={rangeKey}
            onRangeKey={(k) => { setRangeKey(k); if (k !== "custom") setCustom(resolveRange(k)); }}
            custom={custom}
            onCustom={setCustom}
            portal={portal}
            onPortal={setPortal}
            onRefresh={() => refetch()}
            refreshing={isFetching}
            lastUpdated={a?.generated_at ?? null}
          />
          <Button size="sm" variant="outline" className="h-9" disabled={!a} onClick={() => a && exportSummaryCsv(a, rangeLabel)}>CSV</Button>
          <Button size="sm" variant="outline" className="h-9" disabled={!a} onClick={() => a && exportSummaryPdf(a, rangeLabel)}>PDF</Button>
        </div>
      </div>

      {isLoading || !a ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border"><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academy">Academy</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <Panel title="Daily activity">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 10 }} minTickGap={24} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="users" name="New users" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="leads" name="Leads" stroke="hsl(var(--accent))" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="starts" name="Course starts" stroke="#f59e0b" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="searches" name="Sanctions searches" stroke="#06b6d4" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Panel title="Selected period"><KeyValues data={a.current} /></Panel>
              <Panel title="Previous period"><KeyValues data={a.previous} /></Panel>
              <Panel title="Lifetime"><KeyValues data={a.lifetime} /></Panel>
            </div>
          </TabsContent>

          <TabsContent value="academy" className="space-y-4 pt-4">
            <SectionHeading title="Learner funnel" hint={rangeLabel} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel title="Signup → certificate">
                <Funnel steps={[
                  { label: "Signups", value: a.academy.funnel.signups },
                  { label: "Started a course", value: a.academy.funnel.started },
                  { label: "Completed a course", value: a.academy.funnel.completed },
                  { label: "Certificate issued", value: a.academy.funnel.certified },
                ]} />
                <p className="text-[11px] text-muted-foreground">
                  Completion rate {a.academy.completion_rate}% · {fmtNum(a.academy.no_activity_users)} learners with no activity yet
                </p>
              </Panel>
              <Panel title="Revenue by course">
                <RankList items={a.academy.revenue_by_course.map((c) => ({
                  label: c.slug, value: c.orders, sub: fmtEurCents(c.revenue_cents),
                }))} />
              </Panel>
              <Panel title="Top courses">
                <RankList items={a.academy.top_courses.map((c) => ({ label: c.title, value: c.enrolments, sub: `${c.completions} completed` }))} />
              </Panel>
              <Panel title="Learners">
                <KeyValues data={{
                  learners_with_activity: a.academy.learners_with_activity,
                  paying_users: a.academy.paying_users,
                  repeat_purchasers: a.academy.repeat_purchasers,
                  certificates_lifetime: a.lifetime.certificates,
                }} />
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel title="Business funnel">
                <Funnel steps={[
                  { label: "Business signup", value: a.business.funnel.signups },
                  { label: "Solutions viewed", value: a.business.funnel.solutions_viewed },
                  { label: "Product viewed", value: a.business.funnel.product_viewed },
                  { label: "Checkout started", value: a.business.funnel.checkout_started },
                  { label: "Purchased", value: a.business.funnel.purchased },
                ]} />
                <p className="text-[11px] text-muted-foreground">
                  Checkout conversion {rate(a.business.funnel.purchased, a.business.funnel.checkout_started)}
                </p>
              </Panel>
              <Panel title="Top products viewed">
                <RankList items={a.business.top_products.map((p) => ({ label: p.product, value: p.views }))} />
              </Panel>
              <Panel title="Accounts by status"><KeyValues data={a.business.by_status} /></Panel>
              <Panel title="Entitlements">
                <KeyValues data={{
                  accounts: a.business.total,
                  members: a.business.members,
                  entitlements: a.business.entitlements,
                  active_entitlements: a.business.active_entitlements,
                }} />
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel title="Partner funnel">
                <Funnel steps={[
                  { label: "Applications", value: a.partners.funnel.applications },
                  { label: "Approved", value: a.partners.funnel.approved },
                  { label: "Registered a deal", value: a.partners.funnel.registered_deal },
                  { label: "Deal approved", value: a.partners.funnel.approved_deal },
                  { label: "Deal won", value: a.partners.funnel.won_deal },
                ]} />
              </Panel>
              <Panel title="Commercials">
                <KeyValues data={{
                  pipeline: fmtEur(a.partners.pipeline_eur),
                  won: fmtEur(a.partners.won_eur),
                  average_deal: fmtEur(a.partners.avg_deal_eur),
                  commission_earned: fmtEurCents(a.partners.commission_earned_cents),
                  commission_paid: fmtEurCents(a.partners.commission_paid_cents),
                  referrals: a.partners.referrals,
                }} />
              </Panel>
              <Panel title="Deals by status"><KeyValues data={a.partners.deals_by_status} /></Panel>
              <Panel title="Partners by tier"><KeyValues data={{ ...a.partners.by_type, ...a.partners.by_certification }} /></Panel>
              <Panel title="Top partners">
                <RankList items={a.partners.top_partners.map((p) => ({ label: p.name, value: p.deals, sub: fmtEur(p.pipeline_eur) }))} />
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-4 pt-4">
            <Panel title="Leads by form type">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={a.marketing.by_form_type} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Bar dataKey="n" name="Leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Panel title="Referrers"><RankList items={a.marketing.by_referrer.map((r) => ({ label: r.label, value: r.n }))} /></Panel>
              <Panel title="UTM sources"><RankList items={a.marketing.by_utm_source.map((r) => ({ label: r.label, value: r.n }))} empty="No UTM-tagged leads yet" /></Panel>
              <Panel title="Countries"><RankList items={a.marketing.by_country.map((r) => ({ label: r.label, value: r.n }))} /></Panel>
              <Panel title="Signup sources"><RankList items={a.marketing.by_signup_source.map((r) => ({ label: r.label, value: r.n }))} /></Panel>
            </div>
            <Panel title="Lead status"><KeyValues data={a.marketing.by_status} /></Panel>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
