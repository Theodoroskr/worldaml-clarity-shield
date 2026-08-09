import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Users, Building2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { EnrichedUser, buildGrowthSeries, groupByDomain, topCounts } from "@/lib/adminUserIntel";

const Kpi = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="rounded-lg border border-border bg-card px-3 py-2" title={hint}>
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-lg font-bold text-foreground leading-tight">{value}</div>
  </div>
);

export default function UserIntelSummary({ users, onDomainClick }: { users: EnrichedUser[]; onDomainClick?: (d: string) => void }) {
  const [open, setOpen] = useState(false);
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("month");
  const [series, setSeries] = useState<"all" | "academy" | "business" | "partner">("all");

  const stats = useMemo(() => {
    const now = Date.now();
    const within = (u: EnrichedUser, d: number) => (u.accountAgeDays ?? 9e9) <= d;
    return {
      total: users.length,
      today: users.filter((u) => within(u, 0)).length,
      d7: users.filter((u) => within(u, 7)).length,
      d30: users.filter((u) => within(u, 30)).length,
      academy: users.filter((u) => u.types.includes("academy")).length,
      business: users.filter((u) => u.types.includes("business")).length,
      partner: users.filter((u) => u.types.includes("partner")).length,
      suite: users.filter((u) => u.types.includes("suite")).length,
      paid: users.filter((u) => u.paid).length,
      multiPortal: users.filter((u) => u.types.length > 1).length,
      corporate: users.filter((u) => u.corporate).length,
      inactive90: users.filter((u) => (u.daysInactive ?? 9e9) >= 90).length,
      _now: now,
    };
  }, [users]);

  const chart = useMemo(() => buildGrowthSeries(users, granularity), [users, granularity]);
  const domains = useMemo(() => groupByDomain(users).slice(0, 8), [users]);
  const sources = useMemo(() => topCounts(users, (u) => u.source), [users]);
  const campaigns = useMemo(() => topCounts(users, (u) => u.utm.utm_campaign || ""), [users]);
  const countries = useMemo(() => topCounts(users, (u) => u.country), [users]);

  return (
    <div className="rounded-xl border border-border bg-card/50">
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 lg:grid-cols-8">
        <Kpi label="Total users" value={stats.total} />
        <Kpi label="New today" value={stats.today} />
        <Kpi label="New 7 days" value={stats.d7} />
        <Kpi label="New 30 days" value={stats.d30} />
        <Kpi label="Academy" value={stats.academy} />
        <Kpi label="Business" value={stats.business} />
        <Kpi label="Partners" value={stats.partner} />
        <Kpi label="Paid users" value={stats.paid} />
      </div>
      <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
        <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">{stats.multiPortal} multi-portal</Badge>
          <Badge variant="outline" className="text-[10px]">{stats.corporate} corporate email</Badge>
          <Badge variant="outline" className="text-[10px]">{stats.suite} suite</Badge>
          <Badge variant="outline" className="text-[10px]">{stats.inactive90} inactive 90+ days</Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpen((v) => !v)}>
          {open ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
          {open ? "Hide" : "Show"} growth & acquisition
        </Button>
      </div>

      {open && (
        <div className="grid gap-3 border-t border-border p-3 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-border p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">User growth</p>
              <div className="flex gap-1">
                {(["day", "week", "month"] as const).map((g) => (
                  <Button key={g} size="sm" variant={granularity === g ? "default" : "outline"} className="h-6 px-2 text-[10px] capitalize"
                    onClick={() => setGranularity(g)}>{g}ly</Button>
                ))}
                <span className="mx-1 w-px bg-border" />
                {(["all", "academy", "business", "partner"] as const).map((s) => (
                  <Button key={s} size="sm" variant={series === s ? "default" : "outline"} className="h-6 px-2 text-[10px] capitalize"
                    onClick={() => setSeries(s)}>{s}</Button>
                ))}
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="key" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={28} />
                  <Tooltip contentStyle={{ fontSize: 12, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey={series} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold"><Users className="w-3.5 h-3.5" /> Acquisition</p>
              {[["Top sources", sources], ["Top campaigns", campaigns], ["Top countries", countries]].map(([title, rows]: any) => (
                <div key={title} className="mb-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{title}</p>
                  {rows.length === 0 ? <p className="text-[11px] text-muted-foreground">No data captured.</p> : (
                    <ul className="text-[11px]">
                      {rows.map((r: any) => (
                        <li key={r.label} className="flex justify-between gap-2"><span className="truncate">{r.label}</span><span className="text-muted-foreground">{r.count}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold"><Building2 className="w-3.5 h-3.5" /> Companies with multiple users</p>
              {domains.length === 0 ? <p className="text-[11px] text-muted-foreground">No corporate domain has more than one user yet.</p> : (
                <ul className="space-y-0.5 text-[11px]">
                  {domains.map((d) => (
                    <li key={d.domain}>
                      <button className="flex w-full justify-between gap-2 hover:text-primary" onClick={() => onDomainClick?.(d.domain)}>
                        <span className="truncate">{d.domain}</span>
                        <span className="text-muted-foreground">{d.count} users</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
