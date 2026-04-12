import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp, Users, Activity, AlertTriangle, Briefcase, Clock, CheckCircle, Bell, ChevronRight,
  CalendarClock,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Timeline, TimelineEvent } from "@/components/ui/timeline";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, addMonths, isPast } from "date-fns";
import { useNavigate } from "react-router-dom";

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

function SparkLine({ data, positive }: { data: number[]; positive: boolean }) {
  const points = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width={80} height={32}>
      <LineChart data={points} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <Line type="monotone" dataKey="v" stroke={positive ? "hsl(142,71%,45%)" : "hsl(0,84%,60%)"} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

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
  const [customerCount, setCustomerCount] = useState(0);
  const [openAlerts, setOpenAlerts] = useState(0);
  const [screeningCount, setScreeningCount] = useState(0);
  const [regulator, setRegulator] = useState<string | null>(null);
  const [riskDistribution, setRiskDistribution] = useState([
    { name: "High Risk", value: 0, color: "hsl(0,84%,60%)" },
    { name: "Medium Risk", value: 0, color: "hsl(36,95%,53%)" },
    { name: "Low Risk", value: 0, color: "hsl(142,71%,45%)" },
    { name: "Critical", value: 0, color: "hsl(280,70%,50%)" },
  ]);
  const [auditEvents, setAuditEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [customersRes, alertsRes, screeningsRes, auditRes, profileRes] = await Promise.all([
        supabase.from("suite_customers").select("id, risk_level").eq("user_id", user.id),
        supabase.from("suite_alerts").select("id, status").eq("user_id", user.id),
        supabase.from("suite_screenings").select("id").eq("user_id", user.id),
        supabase.from("suite_audit_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("profiles").select("regulator").eq("user_id", user.id).single(),
      ]);

      setRegulator(profileRes.data?.regulator ?? null);

      const customers = customersRes.data || [];
      const alerts = alertsRes.data || [];
      const screenings = screeningsRes.data || [];
      const audit = auditRes.data || [];

      setCustomerCount(customers.length);
      setOpenAlerts(alerts.filter(a => a.status === "open" || a.status === "reviewing").length);
      setScreeningCount(screenings.length);

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
    };
    fetchData();
  }, []);

  /* ─── Compliance Calendar from Regulatory Hub data ─── */
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
    amld: [
      { title: "Risk Assessment Review", deadline: "Ongoing" },
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
          : nextDue ? "on-track"
          : "continuous";

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

  const kpiData = [
    { label: "Active Customers", value: customerCount.toLocaleString(), change: "live", positive: true, icon: Users, color: "text-primary", bg: "bg-primary/10", spark: [30,35,32,40,38,44,50,48,52, customerCount] },
    { label: "Open Alerts", value: openAlerts.toString(), change: "live", positive: openAlerts === 0, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", spark: [8,10,9,11,10,12,13,12,14, openAlerts] },
    { label: "Total Screenings", value: screeningCount.toLocaleString(), change: "live", positive: true, icon: Activity, color: "text-primary", bg: "bg-primary/10", spark: [20,25,22,30,28,35,32,38,37, screeningCount] },
    { label: "Flagged Today", value: "—", change: "", positive: true, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", spark: [5,3,2,4,1,2,0,1,3,0] },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance Operations Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time overview{loading ? " — loading…" : ""}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className={cn("bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5", "border-border")}>
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2 rounded-lg", kpi.bg)}>
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </div>
              <SparkLine data={kpi.spark} positive={kpi.positive} />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
            {kpi.change && <div className={cn("text-xs font-medium mt-1", kpi.positive ? "text-emerald-600" : "text-destructive")}>{kpi.change}</div>}
          </div>
        ))}
      </div>

      {/* Charts */}
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

      {/* Compliance Calendar Widget */}
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
        <div className="p-4">
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
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    ) : item.status === "urgent" ? (
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    ) : item.status === "upcoming" ? (
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    ) : item.status === "on-track" ? (
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">{item.title}</span>
                  </div>
                  <div className="text-right shrink-0">
                    {item.nextDue ? (
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-foreground">{format(item.nextDue, "d MMM yyyy")}</div>
                        <div className={cn("text-[10px]",
                          item.daysUntil !== null && item.daysUntil <= 30 ? "text-destructive font-semibold" : "text-muted-foreground"
                        )}>
                          {item.daysUntil !== null && item.daysUntil >= 0
                            ? `${item.daysUntil}d left`
                            : item.daysUntil !== null
                            ? `${Math.abs(item.daysUntil)}d overdue`
                            : ""}
                        </div>
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
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Activity</h2>
          <Bell className="w-4 h-4 text-muted-foreground" />
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
