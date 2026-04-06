import { useState } from "react";
import {
  TrendingUp, Users, Activity, AlertTriangle, Briefcase, Clock, CheckCircle, Bell, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Timeline, TimelineEvent } from "@/components/ui/timeline";

const kpiData = [
  { label: "Active Customers", value: "50,048", change: "+2.4%", positive: true, icon: Users, color: "text-primary", bg: "bg-primary/10", spark: [30,35,32,40,38,44,50,48,52,50] },
  { label: "Open Cases", value: "14", change: "+3 today", positive: false, icon: Briefcase, color: "text-destructive", bg: "bg-destructive/10", spark: [8,10,9,11,10,12,13,12,14,14] },
  { label: "Pending Reviews", value: "37", change: "8 overdue", positive: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", spark: [20,25,22,30,28,35,32,38,37,37] },
  { label: "Flagged Today", value: "5", change: "+5 vs yesterday", positive: false, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", spark: [5,3,2,4,1,2,0,1,3,5] },
];

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

const riskDistribution = [
  { name: "High Risk", value: 12, color: "hsl(0,84%,60%)" },
  { name: "Medium Risk", value: 23, color: "hsl(36,95%,53%)" },
  { name: "Low Risk", value: 51, color: "hsl(142,71%,45%)" },
  { name: "Unscored", value: 14, color: "hsl(220,9%,60%)" },
];

const amlSummary = [
  { label: "Total Screened", value: "50,048", change: "+124 today", positive: true },
  { label: "PEP Hits", value: "83", change: "+2", positive: false, highlight: true },
  { label: "Sanctions Hits", value: "11", change: "0", positive: true, highlight: true },
  { label: "Adverse Media", value: "27", change: "+5", positive: false, highlight: true },
  { label: "False Positives Dismissed", value: "241", change: "+8 today", positive: true },
  { label: "Pending Review", value: "37", change: "-3", positive: true },
];

const activityFeed: TimelineEvent[] = [
  { id: "1", timestamp: "06/04 14:32", actor: "System", action: "AML screening completed for John Cameron", type: "screening", detail: "No new matches" },
  { id: "2", timestamp: "06/04 13:15", actor: "Admin", action: "Case #CSE-2341 escalated", type: "case", detail: "STR filed — amount threshold exceeded" },
  { id: "3", timestamp: "06/04 12:02", actor: "System", action: "New customer onboarded — PEP match detected", type: "screening", detail: "PEP Class 2 — manual review required", after: "Pending Review" },
  { id: "4", timestamp: "06/04 11:45", actor: "Maria P.", action: "Document verified for customer 96685261", type: "document", detail: "Passport — extraction confirmed" },
  { id: "5", timestamp: "06/04 10:30", actor: "Admin", action: "Risk status updated for Cameron Group", type: "status", before: "Medium", after: "High" },
  { id: "6", timestamp: "06/04 09:10", actor: "System", action: "Scheduled re-screening batch completed", type: "system", detail: "247 profiles re-screened, 3 new hits" },
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
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance Operations Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time overview — April 6, 2026</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className={cn(
            "bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5",
            "border-border"
          )}>
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2 rounded-lg", kpi.bg)}>
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </div>
              <SparkLine data={kpi.spark} positive={kpi.positive} />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
            <div className={cn("text-xs font-medium mt-1", kpi.positive ? "text-emerald-600" : "text-destructive")}>
              {kpi.change}
            </div>
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

      {/* AML Summary + Activity Feed */}
      <div className="grid grid-cols-[1fr_340px] gap-5">
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="font-semibold text-foreground">AML Screening Summary</h2>
              <p className="text-xs text-muted-foreground mt-0.5">OFAC · EU Sanctions · UN · PEP · Adverse Media</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Metric</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Count</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Change</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {amlSummary.map((row) => (
                <tr key={row.label} className={cn("hover:bg-muted/20 transition-colors", row.highlight && "bg-amber-50/30")}>
                  <td className="px-5 py-3 font-medium text-foreground text-sm">{row.label}</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-foreground">{row.value}</td>
                  <td className={cn("px-5 py-3 text-right font-medium text-sm", row.positive ? "text-emerald-600" : "text-destructive")}>{row.change}</td>
                  <td className="px-5 py-3 text-right">
                    {row.highlight ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Activity Feed</h2>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="p-4 overflow-y-auto max-h-[340px]">
            <Timeline events={activityFeed} />
          </div>
        </div>
      </div>
    </div>
  );
}
