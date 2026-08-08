import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Handshake, Users, TrendingUp, Euro, FileSignature, Percent, Wallet, Clock,
} from "lucide-react";

interface Props {
  applications: any[];
  partners: any[];
  deals: any[];
  referrals: any[];
  loading?: boolean;
}

const eur = (n: number) => `€${Math.round(n).toLocaleString()}`;

function Kpi({
  label, value, sub, icon: Icon, tone = "text-primary",
}: { label: string; value: string; sub?: string; icon: any; tone?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <div className="mt-2 text-2xl font-bold text-foreground leading-none">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function PartnerProgramAnalytics({ applications, partners, deals, referrals, loading }: Props) {
  const m = useMemo(() => {
    const pendingApps = applications.filter((a) => a.status === "pending").length;
    const approvedApps = applications.filter((a) => a.status === "approved").length;
    const rejectedApps = applications.filter((a) => a.status === "rejected").length;
    const approvalRate = applications.length ? Math.round((approvedApps / applications.length) * 100) : 0;

    const activePartners = partners.filter((p: any) => p.is_active !== false).length;

    const convertedRefs = referrals.filter((r: any) => ["converted", "paid"].includes(r.status)).length;
    const refRate = referrals.length ? Math.round((convertedRefs / referrals.length) * 100) : 0;
    const attributedArr = referrals.reduce((s: number, r: any) => s + Number(r.conversion_value || 0), 0);
    const commission = referrals.reduce((s: number, r: any) => s + Number(r.commission_earned || 0), 0);

    const pipeline = deals
      .filter((d: any) => ["pending", "approved"].includes(d.status))
      .reduce((s: number, d: any) => s + Number(d.estimated_arr_eur || 0), 0);
    const wonDeals = deals.filter((d: any) => d.status === "won");
    const wonArr = wonDeals.reduce((s: number, d: any) => s + Number(d.actual_arr_eur || d.estimated_arr_eur || 0), 0);
    const dealWinRate = deals.length ? Math.round((wonDeals.length / deals.length) * 100) : 0;
    const pendingDeals = deals.filter((d: any) => d.status === "pending").length;

    // 12-month trend
    const months: { key: string; label: string; applications: number; partners: number; referrals: number; deals: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-GB", { month: "short" }),
        applications: 0, partners: 0, referrals: 0, deals: 0,
      });
    }
    const idx = new Map(months.map((x, i) => [x.key, i]));
    const bump = (rows: any[], field: "applications" | "partners" | "referrals" | "deals") => {
      for (const r of rows) {
        if (!r?.created_at) continue;
        const d = new Date(r.created_at);
        const i = idx.get(`${d.getFullYear()}-${d.getMonth()}`);
        if (i !== undefined) months[i][field] += 1;
      }
    };
    bump(applications, "applications");
    bump(partners, "partners");
    bump(referrals, "referrals");
    bump(deals, "deals");

    const dealStatuses = ["pending", "approved", "won", "lost", "rejected", "expired"];
    const dealsByStatus = dealStatuses
      .map((s) => ({ status: s, n: deals.filter((d: any) => d.status === s).length }))
      .filter((r) => r.n > 0);

    const byType = new Map<string, number>();
    for (const p of partners) {
      const t = p.partner_type || "unspecified";
      byType.set(t, (byType.get(t) || 0) + 1);
    }

    // Top partners by attributed value
    const perPartner = new Map<string, { name: string; refs: number; value: number; commission: number; deals: number }>();
    const nameOf = (id: string) => {
      const p: any = partners.find((x: any) => x.id === id);
      return p?.display_name || p?.referral_code || id?.slice(0, 8) || "—";
    };
    for (const r of referrals) {
      if (!r.partner_id) continue;
      const b = perPartner.get(r.partner_id) ?? { name: nameOf(r.partner_id), refs: 0, value: 0, commission: 0, deals: 0 };
      b.refs += 1;
      b.value += Number(r.conversion_value || 0);
      b.commission += Number(r.commission_earned || 0);
      perPartner.set(r.partner_id, b);
    }
    for (const d of deals) {
      if (!d.partner_id) continue;
      const b = perPartner.get(d.partner_id) ?? { name: nameOf(d.partner_id), refs: 0, value: 0, commission: 0, deals: 0 };
      b.deals += 1;
      if (d.status === "won") b.value += Number(d.actual_arr_eur || d.estimated_arr_eur || 0);
      perPartner.set(d.partner_id, b);
    }
    const topPartners = Array.from(perPartner.values())
      .sort((a, b) => b.value - a.value || b.refs - a.refs)
      .slice(0, 6);

    return {
      pendingApps, approvedApps, rejectedApps, approvalRate, activePartners,
      convertedRefs, refRate, attributedArr, commission,
      pipeline, wonArr, dealWinRate, pendingDeals, wonCount: wonDeals.length,
      months, dealsByStatus, byType: Array.from(byType.entries()), topPartners,
    };
  }, [applications, partners, deals, referrals]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Applications" value={String(applications.length)} sub={`${m.pendingApps} pending · ${m.approvalRate}% approved`} icon={FileSignature} />
        <Kpi label="Active partners" value={String(m.activePartners)} sub={`${partners.length} total signed up`} icon={Handshake} tone="text-teal" />
        <Kpi label="Referred signups" value={String(referrals.length)} sub={`${m.convertedRefs} converted · ${m.refRate}% rate`} icon={Users} tone="text-blue-600" />
        <Kpi label="Attributed ARR" value={eur(m.attributedArr)} sub="From converted referrals" icon={Euro} tone="text-green-600" />
        <Kpi label="Deal pipeline" value={eur(m.pipeline)} sub={`${m.pendingDeals} deals awaiting review`} icon={Clock} tone="text-amber-600" />
        <Kpi label="Won revenue" value={eur(m.wonArr)} sub={`${m.wonCount} deals won`} icon={TrendingUp} tone="text-green-600" />
        <Kpi label="Deal win rate" value={`${m.dealWinRate}%`} sub={`${deals.length} registrations total`} icon={Percent} tone="text-purple-600" />
        <Kpi label="Commission earned" value={eur(m.commission)} sub="Across all partners" icon={Wallet} tone="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-navy text-base">Programme growth — last 12 months</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={m.months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="applications" name="Applications" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="partners" name="New partners" stroke="#14b8a6" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="referrals" name="Referred signups" stroke="#3b82f6" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="deals" name="Deals registered" stroke="#f59e0b" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-navy text-base">Deals by status</CardTitle></CardHeader>
          <CardContent>
            {m.dealsByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No deal registrations yet.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={m.dealsByStatus} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="status" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Bar dataKey="n" name="Deals" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-navy text-base">Application outcomes</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Pending review</span><Badge className="bg-amber-100 text-amber-800 border-amber-200">{m.pendingApps}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Approved</span><Badge className="bg-green-100 text-green-800 border-green-200">{m.approvedApps}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Rejected</span><Badge className="bg-red-100 text-red-800 border-red-200">{m.rejectedApps}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-navy text-base">Partners by type</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {m.byType.length === 0 ? (
              <p className="text-muted-foreground">No partners yet.</p>
            ) : m.byType.map(([t, n]) => (
              <div key={t} className="flex items-center justify-between">
                <span className="text-muted-foreground capitalize">{String(t).replace(/_/g, " ")}</span>
                <Badge variant="outline">{n}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-navy text-base">Top partners by value</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {m.topPartners.length === 0 ? (
              <p className="text-muted-foreground">No attributed activity yet.</p>
            ) : m.topPartners.map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-2">
                <span className="truncate text-foreground">{p.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{p.refs} refs · {p.deals} deals · <strong className="text-foreground">{eur(p.value)}</strong></span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
