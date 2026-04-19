import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccess } from "@/hooks/useAccess";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2, User, Building2, LogOut, CreditCard, ShieldAlert,
  GraduationCap, Award, Share2, ExternalLink, Copy, Globe,
  Search, BookOpen, Shield, ChevronRight, Sparkles, PlayCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DashboardSanctionsWidget } from "@/components/sanctions/DashboardSanctionsWidget";
import { SearchHistoryPanel, SearchHistoryHandle } from "@/components/sanctions/SearchHistoryPanel";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";


const Dashboard = () => {
  const { user, profile, isLoading, isApproved, isAdmin, signOut } = useAuth();
  const { hasSuiteAccess } = useAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const historyRef = useRef<SearchHistoryHandle>(null);
  const sanctionsRef = useRef<HTMLDivElement>(null);

  /* ─── scroll to sanctions widget if ?scroll=sanctions ─── */
  useEffect(() => {
    if (searchParams.get("scroll") === "sanctions" && sanctionsRef.current) {
      setTimeout(() => sanctionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
  }, [searchParams]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [inProgressCourses, setInProgressCourses] = useState<any[]>([]);

  /* ─── fetch certificates + in-progress courses ─── */
  useEffect(() => {
    if (!user) return;

    supabase
      .from("academy_certificates")
      .select("*, academy_courses(title, slug)")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false })
      .then(({ data }) => {
        setCertificates(data ?? []);
        setCertsLoading(false);
      });

    (async () => {
      const { data: progress } = await supabase
        .from("academy_progress")
        .select("course_id, completed_modules, quiz_passed, academy_courses(id, title, slug, category, difficulty, duration_minutes)")
        .eq("user_id", user.id)
        .eq("quiz_passed", false);

      if (!progress || progress.length === 0) {
        setInProgressCourses([]);
        return;
      }

      const courseIds = progress.map((p: any) => p.course_id);
      const { data: modules } = await supabase
        .from("academy_modules")
        .select("course_id")
        .in("course_id", courseIds);

      const totals: Record<string, number> = {};
      (modules ?? []).forEach((m: any) => {
        totals[m.course_id] = (totals[m.course_id] || 0) + 1;
      });

      const enriched = progress
        .map((p: any) => {
          const completed = Array.isArray(p.completed_modules) ? p.completed_modules.length : 0;
          const total = totals[p.course_id] || 0;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return { ...p, completed, total, pct };
        })
        .filter((p: any) => p.completed > 0 && p.pct < 100 && p.academy_courses);

      setInProgressCourses(enriched);
    })();
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }
  if (!user) return null;

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

          {/* Suite banner – only for suite/enterprise users */}
          {hasSuiteAccess && (
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
          )}

          {/* ══════════ WELCOME / ONBOARDING (free users) ══════════ */}
          {!hasSuiteAccess && !isAdmin && (
            <div className="mb-8">
              <div className="rounded-xl border border-teal/20 bg-gradient-to-br from-navy/[0.03] via-teal/[0.04] to-transparent p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal/20 to-navy/10 text-teal flex-shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-navy mb-1">Welcome to WorldAML</h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Get started with free compliance tools. Explore sanctions screening, earn certifications, and upgrade when you're ready.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-teal" /> Getting Started
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-dashed hover:border-teal/30 hover:shadow-sm transition-all cursor-pointer group" onClick={() => sanctionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 transition-colors">
                      <Search className="h-4 w-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy mb-0.5">Run a Free AML Check</p>
                      <p className="text-xs text-text-secondary">Screen a name against global sanctions lists</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed hover:border-teal/30 hover:shadow-sm transition-all cursor-pointer group" onClick={() => navigate("/academy")}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0 group-hover:bg-teal/20 transition-colors">
                      <BookOpen className="h-4 w-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy mb-0.5">Take a Course</p>
                      <p className="text-xs text-text-secondary">Learn AML best practices & earn certificates</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed hover:border-teal/30 hover:shadow-sm transition-all cursor-pointer group" onClick={() => navigate("/eu-sanctions-map")}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0 group-hover:bg-navy/15 transition-colors">
                      <Globe className="h-4 w-4 text-navy" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy mb-0.5">EU Sanctions Map</p>
                      <p className="text-xs text-text-secondary">Explore restrictive measures by country</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed hover:border-navy/20 hover:shadow-sm transition-all cursor-pointer group" onClick={() => navigate("/pricing")}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0 group-hover:bg-navy/15 transition-colors">
                      <Shield className="h-4 w-4 text-navy" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy mb-0.5">Upgrade Plan</p>
                      <p className="text-xs text-text-secondary">Unlock API access, Suite & full monitoring</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ══════════ CONTINUE LEARNING ══════════ */}
          {inProgressCourses.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-navy flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-teal" /> Continue Learning
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/academy")}>
                  Browse all →
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressCourses.slice(0, 3).map((p) => (
                  <Card
                    key={p.course_id}
                    className="border-teal/20 hover:shadow-md hover:border-teal/40 transition-all cursor-pointer group"
                    onClick={() => navigate(`/academy/${p.academy_courses.slug}?resume=1`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal/20 to-navy/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-teal" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-navy line-clamp-2 group-hover:text-teal transition-colors">
                            {p.academy_courses.title}
                          </p>
                          <p className="text-xs text-text-secondary capitalize mt-0.5">
                            {p.academy_courses.difficulty} · {p.completed}/{p.total} modules
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Progress</span>
                          <span className="font-semibold text-navy">{p.pct}%</span>
                        </div>
                        <Progress value={p.pct} className="h-1.5" />
                      </div>
                      <Button size="sm" variant="accent" className="w-full">
                        <PlayCircle className="h-4 w-4 mr-1.5" /> Resume Course
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
            <div ref={sanctionsRef}>
              <DashboardSanctionsWidget onSearchComplete={() => historyRef.current?.refresh()} />
            </div>
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
