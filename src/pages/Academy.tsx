import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, GraduationCap, Clock, Award, Shield, BookOpen, CheckCircle, BarChart3, Globe, MapPin, Layers, Sparkles, X, Linkedin } from "lucide-react";

const difficultyColor: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

const categoryConfig: Record<string, { label: string; color: string; icon: typeof Globe }> = {
  foundational: { label: "Foundational", color: "bg-sky-100 text-sky-700", icon: BookOpen },
  regional: { label: "Regional", color: "bg-violet-100 text-violet-700", icon: MapPin },
  "global-specialisation": { label: "Specialisation", color: "bg-teal-100 text-teal-700", icon: Layers },
  global: { label: "Global", color: "bg-slate-100 text-slate-700", icon: Globe },
};

type FilterTab = "all" | "in-progress" | "completed";
type CategoryFilter = "all" | "foundational" | "regional" | "global-specialisation";
type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

const Academy = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try { return sessionStorage.getItem("academy-new-courses-dismissed") === "1"; } catch { return false; }
  });

  const dismissBanner = () => {
    setBannerDismissed(true);
    try { sessionStorage.setItem("academy-new-courses-dismissed", "1"); } catch {}
  };

  const { data: courses, isLoading } = useQuery({
    queryKey: ["academy-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: progressData } = useQuery({
    queryKey: ["academy-user-progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_progress")
        .select("course_id, quiz_passed, completed_modules")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: certificates } = useQuery({
    queryKey: ["academy-user-certificates", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_certificates")
        .select("course_id, share_token")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const progressMap = new Map(progressData?.map((p) => [p.course_id, p]) || []);
  const certMap = new Map(certificates?.map((c) => [c.course_id, c]) || []);

  const getCourseStatus = (courseId: string): "completed" | "in-progress" | null => {
    if (certMap.has(courseId)) return "completed";
    const prog = progressMap.get(courseId);
    if (prog) {
      const mods = prog.completed_modules as string[] | null;
      if (mods && mods.length > 0) return "in-progress";
    }
    return null;
  };

  const filteredCourses = courses?.filter((course) => {
    // Category filter
    if (categoryFilter !== "all" && (course as any).category !== categoryFilter) return false;
    // Difficulty filter
    if (difficultyFilter !== "all" && course.difficulty !== difficultyFilter) return false;
    // Progress filter (logged-in only)
    if (filter === "all") return true;
    const status = getCourseStatus(course.id);
    if (filter === "completed") return status === "completed";
    if (filter === "in-progress") return status === "in-progress";
    return true;
  });

  const completedCount = courses?.filter((c) => getCourseStatus(c.id) === "completed").length || 0;
  const inProgressCount = courses?.filter((c) => getCourseStatus(c.id) === "in-progress").length || 0;
  const certsCount = certificates?.length || 0;

  const formatCpd = (hours: number) => {
    if (!hours) return null;
    return `${hours} CPD Hr${hours !== 1 ? "s" : ""}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compliance Academy — Free AML & KYC Training | WorldAML"
        description="Earn free compliance certificates with WorldAML Academy. Learn AML, KYC, and sanctions screening through interactive courses and quizzes."
        canonical="/academy"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Academy", url: "/academy" },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "WorldAML Compliance Academy",
          description: "Free compliance training courses with certificates covering AML, KYC, and sanctions screening.",
          url: "https://www.worldaml.com/academy",
        }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-navy overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="container-enterprise section-padding relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-teal-light text-body-sm font-medium mb-6">
                <GraduationCap className="h-4 w-4" />
                Free Compliance Training
              </div>
              <h1 className="text-display text-primary-foreground mb-4">
                WorldAML Academy
              </h1>
              <p className="text-body-lg text-slate-light mb-8 max-w-2xl mx-auto">
                Build your compliance expertise with interactive courses. Pass the quiz, 
                earn a certificate, and share it on LinkedIn — completely free.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-body-sm text-slate-light">
                <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-teal-light" /> Interactive Courses</span>
                <span className="flex items-center gap-2"><Award className="h-4 w-4 text-teal-light" /> Shareable Certificates</span>
                <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-teal-light" /> CPD-Accredited</span>
                <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-teal-light" /> Industry-Recognised</span>
              </div>
            </div>
          </div>
        </section>

        {/* New Courses Announcement Banner */}
        {!bannerDismissed && (
          <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20">
            <div className="container-enterprise py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-foreground">
                      🎓 New Advanced Courses Available!
                    </p>
                    <p className="text-caption text-muted-foreground truncate">
                      <strong>International Sanctions Compliance</strong> and <strong>Beneficial Ownership & UBO Transparency</strong> — start learning today.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="default" className="text-xs" onClick={() => {
                    setCategoryFilter("all");
                    setDifficultyFilter("advanced");
                    dismissBanner();
                  }}>
                    View Courses <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                  <button
                    onClick={dismissBanner}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Dismiss announcement"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* My Progress Summary (logged-in users only) */}
        {user && progressData && (
          <section className="bg-background border-b border-border">
            <div className="container-enterprise py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-subtitle font-semibold text-foreground">My Progress</h2>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-headline font-bold text-primary">{inProgressCount}</p>
                    <p className="text-caption text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-headline font-bold text-accent">{completedCount}</p>
                    <p className="text-caption text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-headline font-bold text-foreground">{certsCount}</p>
                    <p className="text-caption text-muted-foreground">Certificates</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Courses Grid */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="text-center mb-8">
              <h2 className="text-headline text-foreground mb-3">Available Courses</h2>
              <p className="text-body-lg text-muted-foreground max-w-xl mx-auto">
                Choose a course, work through the material, then take the quiz to earn your certificate.
              </p>
            </div>

            {/* Filters */}
            <div className="space-y-4 mb-8">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {([
                  { key: "all" as CategoryFilter, label: "All Categories" },
                  { key: "foundational" as CategoryFilter, label: "Foundational" },
                  { key: "regional" as CategoryFilter, label: "Regional" },
                  { key: "global-specialisation" as CategoryFilter, label: "Specialisation" },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setCategoryFilter(tab.key)}
                    className={`px-4 py-2 rounded-full text-body-sm font-medium transition-colors ${
                      categoryFilter === tab.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Difficulty + Progress Filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {([
                  { key: "all" as DifficultyFilter, label: "All Levels" },
                  { key: "beginner" as DifficultyFilter, label: "Beginner" },
                  { key: "intermediate" as DifficultyFilter, label: "Intermediate" },
                  { key: "advanced" as DifficultyFilter, label: "Advanced" },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDifficultyFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-full text-caption font-medium transition-colors border ${
                      difficultyFilter === tab.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

                {/* Progress filter for logged-in users */}
                {user && (
                  <>
                    <span className="text-border self-center">|</span>
                    {([
                      { key: "all" as FilterTab, label: "All" },
                      { key: "in-progress" as FilterTab, label: "In Progress" },
                      { key: "completed" as FilterTab, label: "Completed" },
                    ]).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-full text-caption font-medium transition-colors border ${
                          filter === tab.key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                    <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-4/5" />
                  </div>
                ))}
              </div>
            ) : filteredCourses && filteredCourses.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const status = getCourseStatus(course.id);
                  const cert = certMap.get(course.id);
                  const catConfig = categoryConfig[(course as any).category] || categoryConfig.global;
                  const cpd = (course as any).cpd_hours as number;
                  const CatIcon = catConfig.icon;
                  return (
                    <Link
                      key={course.id}
                      to={status === "completed" && cert ? `/academy/certificate/${cert.share_token}` : `/academy/${course.slug}`}
                      className="group rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative"
                    >
                      {/* Status Badge */}
                      {status === "completed" && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                            <CheckCircle className="h-3 w-3" /> Completed
                          </span>
                        </div>
                      )}
                      {status === "in-progress" && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            <BarChart3 className="h-3 w-3" /> In Progress
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge className={difficultyColor[course.difficulty] || ""}>
                          {course.difficulty}
                        </Badge>
                        <Badge className={catConfig.color}>
                          <CatIcon className="h-3 w-3 mr-1" />
                          {catConfig.label}
                        </Badge>
                      </div>

                      <h3 className="text-subtitle font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-body-sm text-muted-foreground mb-4 line-clamp-3">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-caption text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {course.duration_minutes} min
                          </span>
                          {cpd > 0 && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <Award className="h-3.5 w-3.5" />
                              {formatCpd(cpd)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Share on LinkedIn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(
                                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://worldaml-clarity-shield.lovable.app/academy/${course.slug}`)}`,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
                          >
                            <Linkedin className="h-4 w-4" />
                          </button>
                          <span className="text-body-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                            {status === "completed" ? "View" : status === "in-progress" ? "Continue" : "Start"} <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No courses found for these filters.</p>
                <button
                  onClick={() => { setCategoryFilter("all"); setDifficultyFilter("all"); setFilter("all"); }}
                  className="text-primary text-body-sm font-medium mt-2 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="section-padding bg-secondary/30">
          <div className="container-enterprise">
            <h2 className="text-headline text-foreground text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Choose a Course", desc: "Pick from our library of compliance courses" },
                { step: "2", title: "Learn the Material", desc: "Work through concise, expert-written modules" },
                { step: "3", title: "Pass the Quiz", desc: "Score 80% or higher to earn your certificate" },
                { step: "4", title: "Share & Showcase", desc: "Download your certificate or share on LinkedIn" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-subtitle font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-body font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-headline text-primary-foreground mb-4">Ready to Get Certified?</h2>
            <p className="text-body-lg text-slate-light mb-8">
              Create a free account to track your progress and earn certificates.
            </p>
            <Button size="lg" variant="accent" asChild>
              <Link to="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Academy;
