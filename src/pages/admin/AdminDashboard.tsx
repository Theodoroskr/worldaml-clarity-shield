import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Building2, AlertTriangle, UserPlus, DollarSign, Activity, TrendingUp,
  BarChart3, Handshake, GraduationCap, Award, Inbox, ShieldCheck, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from "date-fns";

type CountResult = { count: number | null; error: unknown };

/** Exact head-count helper — every figure below comes straight from the database. */
async function countOf(build: () => PromiseLike<CountResult>): Promise<number | null> {
  const { count, error } = await build();
  if (error) return null; // null => "unavailable", never rendered as a fake 0
  return count ?? 0;
}

interface DashboardData {
  totalUsers: number | null;
  signupsThisWeek: number | null;
  activeOrgs: number | null;
  openAlerts: number | null;
  suiteUsers: number | null;
  totalScreenings: number | null;
  sanctionsSearches: number | null;
  academyPaidOrders: number | null;
  academyRevenueCents: number | null;
  certificates: number | null;
  businessAccounts: number | null;
  activePartners: number | null;
  pendingPartnerApps: number | null;
  dealRegistrations: number | null;
  newLeads: number | null;
  recentSignups: { email: string | null; created_at: string; status: string | null }[];
  recentLeads: { id: string; email: string | null; company: string | null; created_at: string }[];
}

async function loadDashboard(): Promise<DashboardData> {
  const weekAgo = subDays(new Date(), 7).toISOString();

  const [
    totalUsers, signupsThisWeek, activeOrgs, openAlerts, suiteUsers, totalScreenings,
    sanctionsSearches, academyPaidOrders, certificates, businessAccounts, activePartners,
    pendingPartnerApps, dealRegistrations, newLeads,
  ] = await Promise.all([
    countOf(() => supabase.from("profiles").select("*", { count: "exact", head: true })),
    countOf(() => supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo)),
    countOf(() => supabase.from("suite_organizations").select("*", { count: "exact", head: true }).eq("status", "active")),
    countOf(() => supabase.from("suite_alerts").select("*", { count: "exact", head: true }).eq("status", "open")),
    countOf(() => supabase.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_tier", "suite")),
    countOf(() => supabase.from("suite_screenings").select("*", { count: "exact", head: true })),
    countOf(() => supabase.from("sanctions_searches").select("*", { count: "exact", head: true })),
    countOf(() => supabase.from("academy_course_purchases").select("*", { count: "exact", head: true }).eq("status", "paid")),
    countOf(() => supabase.from("academy_certificates").select("*", { count: "exact", head: true })),
    countOf(() => supabase.from("business_accounts").select("*", { count: "exact", head: true })),
    countOf(() => supabase.from("partners").select("*", { count: "exact", head: true }).eq("is_active", true)),
    countOf(() => supabase.from("partner_applications").select("*", { count: "exact", head: true }).eq("status", "pending")),
    countOf(() => supabase.from("deal_registrations").select("*", { count: "exact", head: true })),
    countOf(() => supabase.from("form_submissions").select("*", { count: "exact", head: true }).gte("created_at", weekAgo)),
  ]);

  const [{ data: revenueRows }, { data: recentSignups }, { data: recentLeads }] = await Promise.all([
    supabase.from("academy_course_purchases").select("amount_cents").eq("status", "paid").eq("currency", "eur"),
    supabase.from("profiles").select("email, created_at, status").order("created_at", { ascending: false }).limit(8),
    supabase.from("form_submissions").select("id, email, company, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  return {
    totalUsers, signupsThisWeek, activeOrgs, openAlerts, suiteUsers, totalScreenings,
    sanctionsSearches, academyPaidOrders, certificates, businessAccounts, activePartners,
    pendingPartnerApps, dealRegistrations, newLeads,
    academyRevenueCents: revenueRows
      ? revenueRows.reduce((s, r) => s + (r.amount_cents ?? 0), 0)
      : null,
    recentSignups: recentSignups ?? [],
    recentLeads: (recentLeads ?? []) as DashboardData["recentLeads"],
  };
}

const fmt = (v: number | null) => (v === null ? "—" : v.toLocaleString());
const eur = (cents: number | null) =>
  cents === null ? "—" : `€${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: loadDashboard,
    staleTime: 60_000,
  });

  const groups: { title: string; cards: { label: string; value: string; icon: typeof Users; color: string; path?: string }[] }[] = data
    ? [
        {
          title: "Platform",
          cards: [
            { label: "Total Users", value: fmt(data.totalUsers), icon: Users, color: "text-blue-500", path: "/admin/users" },
            { label: "Signups (7d)", value: fmt(data.signupsThisWeek), icon: UserPlus, color: "text-purple-500", path: "/admin/users" },
            { label: "Active Orgs", value: fmt(data.activeOrgs), icon: Building2, color: "text-emerald-500", path: "/admin/organizations" },
            { label: "Open Alerts", value: fmt(data.openAlerts), icon: AlertTriangle, color: "text-amber-500", path: "/admin/alert-rules" },
            { label: "Suite Users", value: fmt(data.suiteUsers), icon: TrendingUp, color: "text-primary", path: "/admin/users" },
            { label: "New Leads (7d)", value: fmt(data.newLeads), icon: Inbox, color: "text-cyan-500", path: "/admin/forms" },
          ],
        },
        {
          title: "Academy",
          cards: [
            { label: "Paid Orders", value: fmt(data.academyPaidOrders), icon: DollarSign, color: "text-emerald-500", path: "/admin/purchase-status" },
            { label: "Revenue (EUR)", value: eur(data.academyRevenueCents), icon: BarChart3, color: "text-emerald-500", path: "/admin/academy-funnel" },
            { label: "Certificates", value: fmt(data.certificates), icon: Award, color: "text-amber-500", path: "/admin/academy-users" },
            { label: "Academy Users", value: fmt(data.totalUsers), icon: GraduationCap, color: "text-blue-500", path: "/admin/academy-users" },
          ],
        },
        {
          title: "Business & Partners",
          cards: [
            { label: "Business Accounts", value: fmt(data.businessAccounts), icon: Building2, color: "text-blue-500", path: "/admin/business" },
            { label: "Active Partners", value: fmt(data.activePartners), icon: Handshake, color: "text-teal-500", path: "/admin/partners" },
            { label: "Pending Applications", value: fmt(data.pendingPartnerApps), icon: UserPlus, color: "text-amber-500", path: "/admin/partners" },
            { label: "Deal Registrations", value: fmt(data.dealRegistrations), icon: Activity, color: "text-purple-500", path: "/admin/partners" },
          ],
        },
        {
          title: "Screening Activity",
          cards: [
            { label: "Suite Screenings", value: fmt(data.totalScreenings), icon: ShieldCheck, color: "text-cyan-500" },
            { label: "Sanctions Searches", value: fmt(data.sanctionsSearches), icon: BarChart3, color: "text-cyan-500" },
          ],
        },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live platform metrics — every figure is queried directly from the database.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">
            Could not load metrics from the backend. Try refreshing.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.title} className="space-y-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {g.cards.map((c) => (
                <Card
                  key={`${g.title}-${c.label}`}
                  className={`border-border transition-shadow ${c.path ? "cursor-pointer hover:shadow-md" : ""}`}
                  onClick={() => c.path && navigate(c.path)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                      <c.icon className={`w-4 h-4 ${c.color}`} />
                    </div>
                    <span className="text-2xl font-bold text-foreground">{c.value}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {data?.recentSignups.map((u, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-foreground truncate max-w-[200px]">{u.email ?? "—"}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={u.status === "approved" ? "default" : u.status === "pending" ? "secondary" : "destructive"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {u.status ?? "unknown"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {format(new Date(u.created_at), "MMM d")}
                      </span>
                    </div>
                  </div>
                ))}
                {data?.recentSignups.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No signups yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Inbox className="w-4 h-4 text-primary" />
              Latest Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {data?.recentLeads.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-foreground truncate max-w-[220px]">
                      {l.email ?? "—"}
                      {l.company ? <span className="text-muted-foreground"> · {l.company}</span> : null}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(l.created_at), "MMM d")}
                    </span>
                  </div>
                ))}
                {data?.recentLeads.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No enquiries yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
