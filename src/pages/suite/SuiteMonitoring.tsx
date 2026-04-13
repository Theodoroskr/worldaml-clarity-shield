import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, Scale, TrendingUp, TrendingDown, BarChart3, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import SuiteAlerts from "./SuiteAlerts";
import SuiteAlertRules from "./SuiteAlertRules";

type Tab = "overview" | "alerts" | "rules";

export default function SuiteMonitoring() {
  const { orgId, isLoading: orgLoading } = useOrganisation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [alertStats, setAlertStats] = useState({ open: 0, reviewing: 0, escalated: 0, closed: 0, total: 0 });
  const [ruleStats, setRuleStats] = useState({ total: 0, active: 0 });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgLoading || !orgId) return;
    const fetchStats = async () => {
      const [alertsRes, rulesRes] = await Promise.all([
        supabase.from("suite_alerts").select("id, status, severity, title, created_at").eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(200),
        supabase.from("suite_alert_rules").select("id, is_active").eq("organisation_id", orgId),
      ]);
      const alerts = alertsRes.data || [];
      setAlertStats({
        open: alerts.filter(a => a.status === "open").length,
        reviewing: alerts.filter(a => a.status === "reviewing").length,
        escalated: alerts.filter(a => a.status === "escalated").length,
        closed: alerts.filter(a => a.status === "closed").length,
        total: alerts.length,
      });
      setRecentAlerts(alerts.slice(0, 5));
      const rules = rulesRes.data || [];
      setRuleStats({ total: rules.length, active: rules.filter(r => r.is_active).length });
      setLoading(false);
    };
    fetchStats();
  }, [orgId, orgLoading]);

  const tabs: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "alerts", label: "Live Alerts", icon: AlertTriangle, badge: alertStats.open + alertStats.escalated },
    { key: "rules", label: "Alert Rules", icon: Scale },
  ];

  if (activeTab === "alerts") return <SuiteAlerts />;
  if (activeTab === "rules") return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-0 flex gap-1 border-b border-border bg-card shrink-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors", activeTab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border")}>
            <t.icon className="w-4 h-4" />{t.label}
            {t.badge != null && t.badge > 0 && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-bold">{t.badge}</span>}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden"><SuiteAlertRules /></div>
    </div>
  );

  // Overview tab
  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="px-6 pt-4 pb-0 flex gap-1 border-b border-border bg-card shrink-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors", activeTab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border")}>
            <t.icon className="w-4 h-4" />{t.label}
            {t.badge != null && t.badge > 0 && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-bold">{t.badge}</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Monitoring Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time alert management and rule configuration</p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading monitoring data…</p>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Open Alerts" value={alertStats.open} color="text-blue-700" bg="bg-blue-50 border-blue-200" onClick={() => setActiveTab("alerts")} />
              <StatCard label="Escalated" value={alertStats.escalated} color="text-destructive" bg="bg-destructive/5 border-destructive/20" onClick={() => setActiveTab("alerts")} />
              <StatCard label="Active Rules" value={ruleStats.active} color="text-emerald-700" bg="bg-emerald-50 border-emerald-200" onClick={() => setActiveTab("rules")} />
              <StatCard label="Total Rules" value={ruleStats.total} color="text-foreground" bg="bg-muted border-border" onClick={() => setActiveTab("rules")} />
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alert pipeline */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Alert Pipeline</h2>
                  <button onClick={() => setActiveTab("alerts")} className="text-xs text-primary hover:underline font-medium">View all →</button>
                </div>
                <div className="space-y-3 mb-4">
                  <PipelineBar label="Open" count={alertStats.open} total={alertStats.total} color="bg-blue-500" />
                  <PipelineBar label="Reviewing" count={alertStats.reviewing} total={alertStats.total} color="bg-amber-500" />
                  <PipelineBar label="Escalated" count={alertStats.escalated} total={alertStats.total} color="bg-red-500" />
                  <PipelineBar label="Closed" count={alertStats.closed} total={alertStats.total} color="bg-emerald-500" />
                </div>
                {alertStats.total === 0 && <p className="text-xs text-muted-foreground text-center py-4">No alerts yet. They appear when screenings detect matches.</p>}
              </div>

              {/* Recent alerts */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />Recent Alerts</h2>
                  <button onClick={() => setActiveTab("alerts")} className="text-xs text-primary hover:underline font-medium">Manage →</button>
                </div>
                {recentAlerts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No recent alerts</p>
                ) : (
                  <div className="space-y-2">
                    {recentAlerts.map(a => (
                      <div key={a.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setActiveTab("alerts")}>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{new Date(a.created_at).toLocaleDateString("en-GB")}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-semibold capitalize",
                            a.severity === "critical" ? "bg-red-50 text-red-700 border-red-200" :
                            a.severity === "high" ? "bg-orange-50 text-orange-700 border-orange-200" :
                            a.severity === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-50 text-slate-600 border-slate-200"
                          )}>{a.severity}</span>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize",
                            a.status === "open" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            a.status === "escalated" ? "bg-red-50 text-red-700 border-red-200" :
                            a.status === "reviewing" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}>{a.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rule effectiveness summary */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Rule Coverage</h2>
                <button onClick={() => setActiveTab("rules")} className="text-xs text-primary hover:underline font-medium">Configure rules →</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <div className="text-2xl font-bold font-mono text-foreground">{ruleStats.total}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Rules</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-2xl font-bold font-mono text-emerald-700">{ruleStats.active}</div>
                  <div className="text-xs text-muted-foreground mt-1">Active</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-2xl font-bold font-mono text-amber-700">{ruleStats.total - ruleStats.active}</div>
                  <div className="text-xs text-muted-foreground mt-1">Inactive</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg, onClick }: { label: string; value: number; color: string; bg: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("rounded-xl border p-4 text-left transition-all hover:shadow-sm", bg)}>
      <div className={cn("text-2xl font-bold font-mono", color)}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </button>
  );
}

function PipelineBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2">
        <div className={cn("h-2 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-foreground w-8 text-right">{count}</span>
    </div>
  );
}
