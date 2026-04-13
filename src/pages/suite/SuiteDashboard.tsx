import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronRight, CalendarClock, RefreshCw, Users, AlertTriangle,
  Shield, FileText, TrendingUp, Activity, BarChart3, ArrowUpRight, Clock,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Timeline, TimelineEvent } from "@/components/ui/timeline";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, differenceInDays, addMonths, isPast, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useOrganisation } from "@/hooks/useOrganisation";

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.06 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export default function SuiteDashboard() {
  const { orgId, org, isLoading: orgLoading } = useOrganisation();
  const [regulator, setRegulator] = useState<string | null>(null);
  const [riskDistribution, setRiskDistribution] = useState([
    { name: "High Risk", value: 0, color: "hsl(0,84%,60%)" },
    { name: "Medium Risk", value: 0, color: "hsl(36,95%,53%)" },
    { name: "Low Risk", value: 0, color: "hsl(142,71%,45%)" },
    { name: "Critical", value: 0, color: "hsl(280,70%,50%)" },
  ]);
  const [auditEvents, setAuditEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const navigate = useNavigate();

  // KPI stats
  const [kpi, setKpi] = useState({
    totalCustomers: 0, openAlerts: 0, totalAlerts: 0,
    totalScreenings: 0, openCases: 0, totalCases: 0,
    totalTransactions: 0, flaggedTransactions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<{ id: string; type: string; label: string; detail: string; time: string; severity?: string }[]>([]);

  const fetchData = useCallback(async (silent = false) => {
    if (!orgId) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const [
      customersRes, auditRes,
      { count: totalCustomers },
      { count: totalAlerts },
      { count: openAlerts },
      { count: totalScreenings },
      { count: totalCases },
      { count: openCases },
      { count: totalTransactions },
      { count: flaggedTransactions },
      { data: recentCustomers },
      { data: recentAlerts },
    ] = await Promise.all([
      supabase.from("suite_customers").select("id, risk_level").eq("organisation_id", orgId),
      supabase.from("suite_audit_log").select("*").eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(10),
      supabase.from("suite_customers").select("id", { count: "exact", head: true }).eq("organisation_id", orgId),
      supabase.from("suite_alerts").select("id", { count: "exact", head: true }).eq("organisation_id", orgId),
      supabase.from("suite_alerts").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).in("status", ["open", "in_review"]),
      supabase.from("suite_screenings").select("id", { count: "exact", head: true }).eq("organisation_id", orgId),
      supabase.from("suite_cases").select("id", { count: "exact", head: true }).eq("organisation_id", orgId),
      supabase.from("suite_cases").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).in("status", ["open", "in_progress"]),
      supabase.from("suite_transactions").select("id", { count: "exact", head: true }).eq("organisation_id", orgId),
      supabase.from("suite_transactions").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("risk_flag", true),
      supabase.from("suite_customers").select("id, name, type, created_at").eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(3),
      supabase.from("suite_alerts").select("id, title, severity, status, created_at").eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(5),
    ]);

    setKpi({
      totalCustomers: totalCustomers ?? 0,
      openAlerts: openAlerts ?? 0,
      totalAlerts: totalAlerts ?? 0,
      totalScreenings: totalScreenings ?? 0,
      openCases: openCases ?? 0,
      totalCases: totalCases ?? 0,
      totalTransactions: totalTransactions ?? 0,
      flaggedTransactions: flaggedTransactions ?? 0,
    });

    // Build recent activity
    const activity: typeof recentActivity = [];
    (recentCustomers ?? []).forEach(c => activity.push({ id: c.id, type: "Customer", label: c.name, detail: `${c.type} onboarded`, time: c.created_at }));
    (recentAlerts ?? []).forEach(a => activity.push({ id: a.id, type: "Alert", label: a.title, detail: a.status, time: a.created_at, severity: a.severity }));
    activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setRecentActivity(activity.slice(0, 8));

    setRegulator(org?.regulator ?? null);

    const customers = customersRes.data || [];
    const audit = auditRes.data || [];

    const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
    customers.forEach(c => { if (c.risk_level in riskCounts) riskCounts[c.risk_level as keyof typeof riskCounts]++; });
    const total = customers.length || 1;
    setRiskDistribution([
      { name: "High Risk", value: Math.round((riskCounts.high / total) * 100), color: "hsl(0,84%,60%)" },
      { name: "Medium Risk", value: Math.round((riskCounts.medium / total) * 100), color: "hsl(36,95%,53%)" },
      { name: "Low Risk", value: Math.round((riskCounts.low / total) * 100), color: "hsl(142,71%,45%)" },
      { name: "Critical", value: Math.round((riskCounts.critical / total) * 100), color: "hsl(280,70%,50%)" },
    ]);

    setAuditEvents(audit.map(a => ({
      id: a.id,
      timestamp: new Date(a.created_at).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
      actor: "You",
      action: a.action,
      type: a.entity_type as any,
      detail: typeof a.details === "object" && a.details !== null ? (a.details as any).detail || "" : "",
    })));

    setLoading(false);
    setRefreshing(false);
    setLastRefresh(new Date());
  }, [orgId, org]);

  useEffect(() => { if (orgId) fetchData(); }, [fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(id);
  }, [fetchData]);

  /* ─── Compliance Calendar ─── */
  const PERIODIC_BY_REGULATOR: Record<string, { title: string; deadline: string; month?: number; day?: number; frequencyMonths?: number }[]> = {
    fincen: [
      { title: "BSA/AML Compliance Program Review", deadline: "Annual", frequencyMonths: 12 },
      { title: "OFAC Sanctions List Update", deadline: "Continuous" },
    ],
    fintrac: [
      { title: "Two-Year Effectiveness Review", deadline: "Every 2 years", frequencyMonths: 24 },
      { title: "Risk Assessment Update", deadline: "As needed / ongoing" },
    ],
    fca: [
      { title: "REP-CRIM (Annual Financial Crime Report)", deadline: "Annually (30 business days after period end)", frequencyMonths: 12 },
      { title: "AML/CTF Risk Assessment", deadline: "Ongoing / Annual review", frequencyMonths: 12 },
    ],
    cysec: [
      { title: "Annual Compliance Report (ACR)", deadline: "By 30 April", month: 3, day: 30 },
      { title: "Internal Audit Report", deadline: "Annually", frequencyMonths: 12 },
    ],
    icpac: [
      { title: "Internal Assessment Report (IAR)", deadline: "Annually", frequencyMonths: 12 },
      { title: "AML Compliance Questionnaire", deadline: "Annually", frequencyMonths: 12 },
    ],
    amld: [{ title: "Risk Assessment Review", deadline: "Ongoing" }],
    dfsa: [
      { title: "Annual MLRO Report to Senior Management", deadline: "Annually", frequencyMonths: 12 },
      { title: "Independent AML/CFT Audit", deadline: "Annually", frequencyMonths: 12 },
    ],
    cbuae: [
      { title: "Annual Compliance Officer Report", deadline: "Annually", frequencyMonths: 12 },
      { title: "Independent AML/CFT Audit", deadline: "Annually", frequencyMonths: 12 },
    ],
    cbc: [
      { title: "Annual AML/CFT Compliance Report", deadline: "Annually", frequencyMonths: 12 },
      { title: "Internal Audit Report", deadline: "Annually", frequencyMonths: 12 },
    ],
    bog: [
      { title: "Annual AML/CFT Compliance Report", deadline: "Annually", frequencyMonths: 12 },
      { title: "Internal Audit Report", deadline: "Annually", frequencyMonths: 12 },
    ],
  };

  const calendarItems = useMemo(() => {
    if (!regulator) return [];
    const obligations = PERIODIC_BY_REGULATOR[regulator.toLowerCase()] ?? [];
    const now = new Date();
    const currentYear = now.getFullYear();

    return obligations
      .map((ob) => {
        let nextDue: Date | null = null;
        let daysUntil: number | null = null;
        if (ob.month !== undefined && ob.day !== undefined) {
          nextDue = new Date(currentYear, ob.month, ob.day);
          if (isPast(nextDue)) nextDue = new Date(currentYear + 1, ob.month, ob.day);
          daysUntil = differenceInDays(nextDue, now);
        } else if (ob.frequencyMonths) {
          nextDue = new Date(currentYear, ob.frequencyMonths - 1, 1);
          while (isPast(nextDue)) nextDue = addMonths(nextDue, ob.frequencyMonths);
          daysUntil = differenceInDays(nextDue, now);
        }
        const status =
          daysUntil !== null && daysUntil < 0 ? "overdue"
          : daysUntil !== null && daysUntil <= 30 ? "urgent"
          : daysUntil !== null && daysUntil <= 90 ? "upcoming"
          : nextDue ? "on-track" : "continuous";
        return { title: ob.title, deadline: ob.deadline, nextDue, daysUntil, status };
      })
      .sort((a, b) => {
        const order: Record<string, number> = { overdue: 0, urgent: 1, upcoming: 2, "on-track": 3, continuous: 4 };
        const diff = (order[a.status] ?? 5) - (order[b.status] ?? 5);
        if (diff !== 0) return diff;
        if (a.daysUntil !== null && b.daysUntil !== null) return a.daysUntil - b.daysUntil;
        return 0;
      });
  }, [regulator]);

  const trendData = [
    { date: "30/01", flagged: 0, clear: 29, pending: 0 },
    { date: "01/02", flagged: 0, clear: 26, pending: 0 },
    { date: "05/02", flagged: 1, clear: 27, pending: 2 },
    { date: "10/02", flagged: 0, clear: 19, pending: 0 },
    { date: "15/02", flagged: 2, clear: 30, pending: 1 },
    { date: "20/02", flagged: 0, clear: 34, pending: 0 },
    { date: "25/02", flagged: 3, clear: 31, pending: 2 },
    { date: "28/02", flagged: 5, clear: 37, pending: 3 },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance Operations Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time overview{loading ? " — loading…" : ""}
            {!loading && <span className="ml-2 text-xs">· Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}</span>}
          </p>
        </div>
        <Button
          variant="outline" size="sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* ══════════ LIVE OVERVIEW KPI CARDS ══════════ */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-primary" /> Live Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/onboarding")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customers</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.totalCustomers.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-primary" /> View onboarding →
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/alerts")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Open Alerts</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.openAlerts.toLocaleString()}</p>
                </div>
                <div className={cn("p-2 rounded-lg transition-colors", kpi.openAlerts > 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-600")}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={kpi.totalAlerts > 0 ? Math.round((kpi.openAlerts / kpi.totalAlerts) * 100) : 0} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">{kpi.totalAlerts > 0 ? Math.round((kpi.openAlerts / kpi.totalAlerts) * 100) : 0}% open</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/screening")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Screenings</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.totalScreenings.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Shield className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <BarChart3 className="h-3 w-3" /> All-time total
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/cases")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Open Cases</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.openCases.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">of {kpi.totalCases} total cases</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/transactions")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transactions</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.totalTransactions.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Monitored volume
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/transactions")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Flagged TXNs</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.flaggedTransactions.toLocaleString()}</p>
                </div>
                <div className={cn("p-2 rounded-lg transition-colors", kpi.flaggedTransactions > 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-600")}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={kpi.totalTransactions > 0 ? Math.round((kpi.flaggedTransactions / kpi.totalTransactions) * 100) : 0} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">{kpi.totalTransactions > 0 ? Math.round((kpi.flaggedTransactions / kpi.totalTransactions) * 100) : 0}% flagged</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ══════════ RECENT ACTIVITY FEED ══════════ */}
      {recentActivity.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-foreground" /> Recent Activity
          </h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  item.type === "Alert"
                    ? item.severity === "critical" ? "bg-destructive/10" : item.severity === "high" ? "bg-orange-50" : "bg-amber-50"
                    : "bg-primary/10"
                )}>
                  {item.type === "Alert" && <AlertTriangle className={cn("h-4 w-4", item.severity === "critical" ? "text-destructive" : item.severity === "high" ? "text-orange-600" : "text-amber-600")} />}
                  {item.type === "Customer" && <Users className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ CHARTS ROW ══════════ */}
      <div className="grid grid-cols-[1fr_300px] gap-5">
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="font-semibold text-foreground">Screening Trend</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" />Flagged</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />Clear</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Pending</span>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="clearGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221,83%,35%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(221,83%,35%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(220,13%,88%)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="clear" stroke="hsl(221,83%,35%)" strokeWidth={2} fill="url(#clearGrad)" name="Clear" />
                <Area type="monotone" dataKey="flagged" stroke="hsl(0,84%,60%)" strokeWidth={2} fill="none" name="Flagged" />
                <Area type="monotone" dataKey="pending" stroke="hsl(36,95%,53%)" strokeWidth={2} fill="none" name="Pending" strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Risk Distribution</h2>
            <p className="text-xs text-muted-foreground mt-0.5">% of customers by risk level</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-xs">
              {riskDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-muted-foreground truncate">{d.name}</span>
                  <span className="font-bold text-foreground ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ COMPLIANCE CALENDAR ══════════ */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">Compliance Calendar</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Upcoming periodic filing deadlines</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/suite/regulatory")}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="p-4 max-h-[320px] overflow-y-auto">
          {!regulator ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Set your regulator in{" "}
              <button onClick={() => navigate("/suite/settings")} className="text-primary underline underline-offset-2 hover:text-primary/80">
                Settings
              </button>{" "}
              to see filing deadlines.
            </p>
          ) : calendarItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No periodic obligations found for your regulator.</p>
          ) : (
            <div className="divide-y divide-border">
              {calendarItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="shrink-0">
                    {item.status === "overdue" ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                    ) : item.status === "urgent" ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    ) : item.status === "upcoming" ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    ) : item.status === "on-track" ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">{item.title}</span>
                  </div>
                  <div className="text-right shrink-0">
                    {item.nextDue ? (
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-foreground">{format(item.nextDue, "d MMM yyyy")}</div>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0",
                            item.status === "overdue" && "border-destructive/40 text-destructive bg-destructive/5",
                            item.status === "urgent" && "border-orange-300 text-orange-700 bg-orange-50",
                            item.status === "upcoming" && "border-yellow-300 text-yellow-700 bg-yellow-50",
                            item.status === "on-track" && "border-emerald-300 text-emerald-700 bg-emerald-50",
                          )}
                        >
                          {item.daysUntil !== null && item.daysUntil >= 0
                            ? `${item.daysUntil}d left`
                            : item.daysUntil !== null
                            ? `${Math.abs(item.daysUntil)}d overdue`
                            : ""}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.deadline}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ AUDIT TRAIL ══════════ */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Audit Trail</h2>
          <button
            onClick={() => navigate("/suite/audit")}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View full log <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[340px]">
          {auditEvents.length > 0 ? (
            <Timeline events={auditEvents} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {loading ? "Loading activity…" : "No activity yet. Start by adding a customer."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
