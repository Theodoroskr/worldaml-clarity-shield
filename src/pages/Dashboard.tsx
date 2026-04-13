import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, User, Building2, LogOut, CreditCard, ShieldAlert, Search,
  GraduationCap, Award, Share2, ExternalLink, Copy, Globe,
  Users, FileText, AlertTriangle, Activity, TrendingUp, CheckCircle2,
  Clock, Shield, BarChart3, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { DashboardSanctionsWidget } from "@/components/sanctions/DashboardSanctionsWidget";
import { SearchHistoryPanel, SearchHistoryHandle } from "@/components/sanctions/SearchHistoryPanel";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

/* ─── animated counter hook ─── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      setValue(start);
      if (start >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return value;
}

/* ─── types ─── */
interface DashboardStats {
  totalCustomers: number;
  totalAlerts: number;
  openAlerts: number;
  totalScreenings: number;
  totalCases: number;
  openCases: number;
  totalTransactions: number;
  flaggedTransactions: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: "customer" | "alert" | "screening" | "case" | "transaction";
  label: string;
  detail: string;
  time: string;
  severity?: string;
}

const Dashboard = () => {
  const { user, profile, isLoading, isApproved, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const historyRef = useRef<SearchHistoryHandle>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  /* ─── fetch live stats ─── */
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setStatsLoading(true);
      const [
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
        { data: recentScreenings },
      ] = await Promise.all([
        supabase.from("suite_customers").select("id", { count: "exact", head: true }),
        supabase.from("suite_alerts").select("id", { count: "exact", head: true }),
        supabase.from("suite_alerts").select("id", { count: "exact", head: true }).in("status", ["open", "in_review"]),
        supabase.from("suite_screenings").select("id", { count: "exact", head: true }),
        supabase.from("suite_cases").select("id", { count: "exact", head: true }),
        supabase.from("suite_cases").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
        supabase.from("suite_transactions").select("id", { count: "exact", head: true }),
        supabase.from("suite_transactions").select("id", { count: "exact", head: true }).eq("risk_flag", true),
        supabase.from("suite_customers").select("id, name, type, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("suite_alerts").select("id, title, severity, status, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("suite_screenings").select("id, screening_type, result, created_at, suite_customers(name)").order("created_at", { ascending: false }).limit(3),
      ]);

      const activity: ActivityItem[] = [];
      (recentCustomers ?? []).forEach(c => activity.push({
        id: c.id, type: "customer", label: c.name, detail: `${c.type} onboarded`,
        time: c.created_at,
      }));
      (recentAlerts ?? []).forEach(a => activity.push({
        id: a.id, type: "alert", label: a.title, detail: a.status,
        time: a.created_at, severity: a.severity,
      }));
      (recentScreenings ?? []).forEach(s => {
        const custName = (s as any).suite_customers?.name ?? "Entity";
        activity.push({
          id: s.id, type: "screening", label: custName,
          detail: `${s.screening_type} — ${s.result}`, time: s.created_at,
        });
      });
      activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setStats({
        totalCustomers: totalCustomers ?? 0,
        totalAlerts: totalAlerts ?? 0,
        openAlerts: openAlerts ?? 0,
        totalScreenings: totalScreenings ?? 0,
        totalCases: totalCases ?? 0,
        openCases: openCases ?? 0,
        totalTransactions: totalTransactions ?? 0,
        flaggedTransactions: flaggedTransactions ?? 0,
        recentActivity: activity.slice(0, 8),
      });
      setStatsLoading(false);
    };
    load();
  }, [user]);

  /* ─── fetch certificates ─── */
  useEffect(() => {
    if (user) {
      supabase
        .from("academy_certificates")
        .select("*, academy_courses(title, slug)")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false })
        .then(({ data }) => {
          setCertificates(data ?? []);
          setCertsLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
    else if (!isLoading && user && !isAdmin) navigate("/academy");
  }, [user, isLoading, isAdmin, navigate]);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Unable to open subscription management.');
    } finally {
      setIsManagingSubscription(false);
    }
  };

  /* animated values */
  const animCustomers = useCountUp(stats?.totalCustomers ?? 0);
  const animAlerts = useCountUp(stats?.openAlerts ?? 0);
  const animScreenings = useCountUp(stats?.totalScreenings ?? 0);
  const animCases = useCountUp(stats?.openCases ?? 0);
  const animTransactions = useCountUp(stats?.totalTransactions ?? 0);
  const animFlagged = useCountUp(stats?.flaggedTransactions ?? 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }
  if (!user) return null;

  const alertRate = stats && stats.totalAlerts > 0
    ? Math.round((stats.openAlerts / stats.totalAlerts) * 100) : 0;
  const flagRate = stats && stats.totalTransactions > 0
    ? Math.round((stats.flaggedTransactions / stats.totalTransactions) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Dashboard" description="Manage your WorldAML account and subscriptions." noindex />
      <Header />
      <main className="flex-1 py-12">
        <div className="container-enterprise">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
              <p className="text-text-secondary">Welcome back, {profile?.full_name || user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>

          {/* Admin / Suite banners */}
          {isAdmin && (
            <div className="mb-6 p-4 rounded-lg border border-navy/20 bg-navy/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-navy" />
                <div>
                  <p className="font-semibold text-navy text-sm">Admin Access</p>
                  <p className="text-text-secondary text-xs">Manage user approvals and accounts</p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate("/admin")}>Go to Admin Panel</Button>
            </div>
          )}

          <div className="mb-6 p-5 rounded-lg border border-teal/20 bg-gradient-to-r from-teal/5 to-navy/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 text-teal">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">WorldAML Suite</p>
                <p className="text-text-secondary text-xs">Onboarding, screening, monitoring, alerts & compliance — all in one place</p>
              </div>
            </div>
            <Button variant="accent" size="sm" onClick={() => navigate("/suite")}>
              Go to WorldAML Suite <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          {/* ══════════ LIVE STATS GRID ══════════ */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal" /> Live Overview
            </h2>
            {statsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-5 space-y-3">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-8 w-16 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Customers */}
                <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/onboarding")}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customers</p>
                        <p className="text-3xl font-bold text-navy mt-1">{animCustomers.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-teal/10 text-teal group-hover:bg-teal group-hover:text-white transition-colors">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-teal" /> View onboarding →
                    </p>
                  </CardContent>
                </Card>

                {/* Open Alerts */}
                <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/alerts")}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Open Alerts</p>
                        <p className="text-3xl font-bold text-navy mt-1">{animAlerts.toLocaleString()}</p>
                      </div>
                      <div className={`p-2 rounded-lg transition-colors ${
                        (stats?.openAlerts ?? 0) > 0
                          ? "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white"
                          : "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white"
                      }`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={alertRate} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{alertRate}% open</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Screenings */}
                <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/screening")}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Screenings</p>
                        <p className="text-3xl font-bold text-navy mt-1">{animScreenings.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-navy/10 text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                        <Shield className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> All-time total
                    </p>
                  </CardContent>
                </Card>

                {/* Open Cases */}
                <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/cases")}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Open Cases</p>
                        <p className="text-3xl font-bold text-navy mt-1">{animCases.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      of {stats?.totalCases ?? 0} total cases
                    </p>
                  </CardContent>
                </Card>

                {/* Transactions */}
                <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/transactions")}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transactions</p>
                        <p className="text-3xl font-bold text-navy mt-1">{animTransactions.toLocaleString()}</p>
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

                {/* Flagged */}
                <Card className="group hover:shadow-md transition-all cursor-pointer border-border" onClick={() => navigate("/suite/transactions")}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Flagged TXNs</p>
                        <p className="text-3xl font-bold text-navy mt-1">{animFlagged.toLocaleString()}</p>
                      </div>
                      <div className={`p-2 rounded-lg transition-colors ${
                        (stats?.flaggedTransactions ?? 0) > 0
                          ? "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white"
                          : "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white"
                      }`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={flagRate} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{flagRate}% flagged</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* ══════════ RECENT ACTIVITY FEED ══════════ */}
          {stats && stats.recentActivity.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-navy" /> Recent Activity
              </h2>
              <Card className="border-border">
                <CardContent className="p-0 divide-y divide-border">
                  {stats.recentActivity.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        item.type === "alert"
                          ? item.severity === "critical" ? "bg-destructive/10" : item.severity === "high" ? "bg-orange-50" : "bg-amber-50"
                          : item.type === "customer" ? "bg-teal/10"
                          : item.type === "screening" ? "bg-navy/10"
                          : "bg-blue-50"
                      }`}>
                        {item.type === "alert" && <AlertTriangle className={`h-4 w-4 ${
                          item.severity === "critical" ? "text-destructive" : item.severity === "high" ? "text-orange-600" : "text-amber-600"
                        }`} />}
                        {item.type === "customer" && <Users className="h-4 w-4 text-teal" />}
                        {item.type === "screening" && <Shield className="h-4 w-4 text-navy" />}
                        {item.type === "case" && <FileText className="h-4 w-4 text-blue-600" />}
                        {item.type === "transaction" && <TrendingUp className="h-4 w-4 text-blue-600" />}
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
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════ PROFILE / SUBSCRIPTIONS / ACADEMY ══════════ */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 text-teal mb-2">
                  <User className="h-5 w-5" />
                </div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm"><strong>Email:</strong> {user.email}</p>
                {profile?.full_name && <p className="text-sm"><strong>Name:</strong> {profile.full_name}</p>}
                {profile?.company_name && <p className="text-sm"><strong>Company:</strong> {profile.company_name}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/10 text-navy mb-2">
                  <Building2 className="h-5 w-5" />
                </div>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>Your active plans</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">No active subscriptions</p>
                <div className="mt-4 space-y-2">
                  <Button className="w-full" variant="outline" onClick={() => navigate("/pricing")}>View Plans</Button>
                  <Button className="w-full" variant="secondary" onClick={handleManageSubscription} disabled={isManagingSubscription}>
                    {isManagingSubscription ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal/20 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/academy")}>
              <CardHeader>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 text-teal mb-2">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <CardTitle>WorldAML Academy</CardTitle>
                <CardDescription>Courses, quizzes & certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-4">Build your compliance expertise and earn shareable certificates.</p>
                <Button className="flex-1" size="sm" onClick={(e) => { e.stopPropagation(); navigate("/academy"); }}>
                  <GraduationCap className="mr-2 h-4 w-4" /> Browse Courses
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ══════════ QUICK TOOLS ══════════ */}
          <div className="mt-10 space-y-6">
            <h2 className="text-xl font-semibold text-navy">Quick Tools</h2>
            <Card className="border-navy/20 hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy">EU Sanctions Map</p>
                  <p className="text-xs text-text-secondary">Interactive map of EU restrictive measures by country</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/eu-sanctions-map")}>Explore Map</Button>
              </CardContent>
            </Card>
            <DashboardSanctionsWidget onSearchComplete={() => historyRef.current?.refresh()} />
            <SearchHistoryPanel ref={historyRef} />
          </div>

          {/* ══════════ CERTIFICATES ══════════ */}
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy flex items-center gap-2">
                <Award className="h-5 w-5 text-teal" /> My Certificates
              </h2>
              {certificates.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/academy")}>Earn more →</Button>
              )}
            </div>
            {certsLoading ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading certificates…
              </div>
            ) : certificates.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-navy mb-1">No certificates yet</p>
                  <p className="text-xs text-text-secondary mb-4">Complete a course quiz with 80%+ to earn your first certificate.</p>
                  <Button size="sm" onClick={() => navigate("/academy")}>Start Learning</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {certificates.map((cert) => {
                  const certUrl = `${window.location.origin}/academy/certificate/${cert.share_token}`;
                  return (
                    <Card key={cert.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                          <Award className="h-5 w-5 text-teal" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-navy truncate">{cert.academy_courses?.title ?? "Course"}</p>
                          <p className="text-xs text-text-secondary">Score: {cert.score}% · {new Date(cert.issued_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Copy share link"
                            onClick={() => { navigator.clipboard.writeText(certUrl); toast.success("Certificate link copied!"); }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View certificate"
                            onClick={() => navigate(`/academy/certificate/${cert.share_token}`)}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Share on LinkedIn"
                            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`, "_blank")}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
