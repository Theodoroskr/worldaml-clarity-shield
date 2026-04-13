import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, AlertTriangle, UserPlus, DollarSign, Activity, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from "date-fns";

interface Stats {
  totalUsers: number;
  activeOrgs: number;
  openAlerts: number;
  signupsThisWeek: number;
  suiteUsers: number;
  totalScreenings: number;
  recentSignups: { email: string; created_at: string; status: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const weekAgo = subDays(new Date(), 7).toISOString();

      const [
        { count: totalUsers },
        { count: activeOrgs },
        { count: openAlerts },
        { count: signupsThisWeek },
        { count: suiteUsers },
        { count: totalScreenings },
        { data: recentSignups },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("suite_organizations").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("suite_alerts").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_tier", "suite"),
        supabase.from("suite_screenings").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("email, created_at, status").order("created_at", { ascending: false }).limit(8),
      ]);

      setStats({
        totalUsers: totalUsers ?? 0,
        activeOrgs: activeOrgs ?? 0,
        openAlerts: openAlerts ?? 0,
        signupsThisWeek: signupsThisWeek ?? 0,
        suiteUsers: suiteUsers ?? 0,
        totalScreenings: totalScreenings ?? 0,
        recentSignups: recentSignups ?? [],
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", path: "/admin/users" },
        { label: "Active Orgs", value: stats.activeOrgs, icon: Building2, color: "text-emerald-500", path: "/admin/organizations" },
        { label: "Open Alerts", value: stats.openAlerts, icon: AlertTriangle, color: "text-amber-500", path: "/admin/alert-rules" },
        { label: "Signups (7d)", value: stats.signupsThisWeek, icon: UserPlus, color: "text-purple-500", path: "/admin/users" },
        { label: "Suite Users", value: stats.suiteUsers, icon: TrendingUp, color: "text-primary", path: "/admin/users" },
        { label: "Total Screenings", value: stats.totalScreenings, icon: BarChart3, color: "text-cyan-500", path: null },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : cards.map((c) => (
              <Card
                key={c.label}
                className={`border-border transition-shadow ${c.path ? "cursor-pointer hover:shadow-md" : ""}`}
                onClick={() => c.path && navigate(c.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                    <c.icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{c.value.toLocaleString()}</span>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.recentSignups.map((u, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-foreground truncate max-w-[200px]">{u.email ?? "—"}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={u.status === "approved" ? "default" : u.status === "pending" ? "secondary" : "destructive"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {u.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {format(new Date(u.created_at), "MMM d")}
                      </span>
                    </div>
                  </div>
                ))}
                {stats?.recentSignups.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No signups yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Manage Users", path: "/admin/users", icon: Users },
              { label: "Organizations", path: "/admin/organizations", icon: Building2 },
              { label: "Alert Rules", path: "/admin/alert-rules", icon: AlertTriangle },
              { label: "Pricing Tiers", path: "/admin/pricing", icon: DollarSign },
            ].map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm text-foreground"
              >
                <a.icon className="w-4 h-4 text-muted-foreground" />
                {a.label}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
