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
import { ArrowRight, ArrowLeft, GraduationCap, Clock, Award, Shield, BookOpen, CheckCircle, BarChart3, Globe, MapPin, Layers, Sparkles, X, Linkedin, Star, FileText, PlayCircle } from "lucide-react";

const difficultyColor: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  advanced: "bg-rose-100 text-rose-700 border-rose-200",
};

const categoryConfig: Record<string, { label: string; color: string; icon: typeof Globe; gradient: string; iconBg: string }> = {
  foundational: {
    label: "Foundational",
    color: "bg-sky-100 text-sky-700",
    icon: BookOpen,
    gradient: "from-sky-500 via-blue-600 to-indigo-700",
    iconBg: "bg-sky-500/20",
  },
  regional: {
    label: "Regional",
    color: "bg-violet-100 text-violet-700",
    icon: MapPin,
    gradient: "from-violet-500 via-purple-600 to-fuchsia-700",
    iconBg: "bg-violet-500/20",
  },
  "global-specialisation": {
    label: "Specialisation",
    color: "bg-teal-100 text-teal-700",
    icon: Layers,
    gradient: "from-teal-500 via-cyan-600 to-emerald-700",
    iconBg: "bg-teal-500/20",
  },
  specialisation: {
    label: "Specialisation",
    color: "bg-teal-100 text-teal-700",
    icon: Layers,
    gradient: "from-teal-500 via-cyan-600 to-emerald-700",
    iconBg: "bg-teal-500/20",
  },
  global: {
    label: "Global",
    color: "bg-slate-100 text-slate-700",
    icon: Globe,
    gradient: "from-slate-500 via-gray-600 to-zinc-700",
    iconBg: "bg-slate-500/20",
  },
};

const CATEGORY_ORDER = ["foundational", "regional", "global-specialisation", "specialisation"];
const CATEGORY_SECTION_TITLES: Record<string, string> = {
  foundational: "Foundational",
  regional: "Regional Compliance",
  "global-specialisation": "Specialisations",
  specialisation: "Advanced Specialisations",
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

  const { data: moduleCounts } = useQuery({
    queryKey: ["academy-module-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_modules")
        .select("course_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((m: any) => {
        counts[m.course_id] = (counts[m.course_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Live social proof: total certificates issued across all learners
  const { data: certifiedCount } = useQuery({
    queryKey: ["academy-certified-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("academy_certificates")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 5 * 60 * 1000,
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
              {user && (
                <Link to="/dashboard" className="inline-flex items-center gap-1 text-slate-light/70 hover:text-white text-body-sm mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
              )}
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
              {typeof certifiedCount === "number" && certifiedCount > 0 && (
                <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-light/15 border border-teal-light/30 text-teal-light text-body-sm font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    <span className="text-white font-bold">{certifiedCount.toLocaleString()}</span> compliance professionals certified
                  </span>
                </div>
              )}
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

            {(() => {
              if (isLoading) {
                return (
                  <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                        <div className="h-32 bg-muted" />
                        <div className="p-5">
                          <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                          <div className="h-4 bg-muted rounded w-full mb-2" />
                          <div className="h-4 bg-muted rounded w-4/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              if (!filteredCourses || filteredCourses.length === 0) {
                return (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No courses found for these filters.</p>
                    <button
                      onClick={() => { setCategoryFilter("all"); setDifficultyFilter("all"); setFilter("all"); }}
                      className="text-primary text-body-sm font-medium mt-2 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                );
              }

              const renderCard = (course: any, opts?: { featured?: boolean }) => {
                const status = getCourseStatus(course.id);
                const cert = certMap.get(course.id);
                const catConfig = categoryConfig[course.category] || categoryConfig.global;
                const cpd = course.cpd_hours as number;
                const CatIcon = catConfig.icon;
                const moduleCount = moduleCounts?.[course.id] ?? 0;
                const prog = progressMap.get(course.id);
                const completedMods = (prog?.completed_modules as string[] | null)?.length ?? 0;
                const progressPct = moduleCount > 0 ? Math.round((completedMods / moduleCount) * 100) : 0;
                const featured = opts?.featured;

                return (
                  <Link
                    key={course.id}
                    to={status === "completed" && cert ? `/academy/certificate/${cert.share_token}` : `/academy/${course.slug}`}
                    className={`group rounded-xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col ${
                      featured ? "md:col-span-3 md:flex-row" : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <div
                      className={`relative bg-gradient-to-br ${catConfig.gradient} overflow-hidden flex-shrink-0 ${
                        featured ? "md:w-2/5 min-h-[220px]" : "h-32"
                      }`}
                    >
                      {/* decorative pattern */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                        }}
                      />
                      <div className={`absolute inset-0 flex items-center justify-center`}>
                        <div className={`${featured ? "h-20 w-20" : "h-14 w-14"} rounded-2xl ${catConfig.iconBg} backdrop-blur-sm border border-white/20 flex items-center justify-center`}>
                          <CatIcon className={`${featured ? "h-10 w-10" : "h-7 w-7"} text-white`} />
                        </div>
                      </div>

                      {/* Featured badge */}
                      {featured && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-primary text-xs font-semibold shadow-sm">
                            <Star className="h-3 w-3 fill-current" /> Most Popular
                          </span>
                        </div>
                      )}

                      {/* Status pill */}
                      {status === "completed" && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/95 text-white text-[11px] font-medium shadow-sm">
                            <CheckCircle className="h-3 w-3" /> Completed
                          </span>
                        </div>
                      )}
                      {status === "in-progress" && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/95 text-white text-[11px] font-medium shadow-sm">
                            <BarChart3 className="h-3 w-3" /> {progressPct}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`p-5 flex-1 flex flex-col ${featured ? "md:p-7" : ""}`}>
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <Badge variant="outline" className={`${difficultyColor[course.difficulty] || ""} text-[10px] uppercase tracking-wide font-semibold border`}>
                          {course.difficulty}
                        </Badge>
                        <Badge variant="outline" className={`${catConfig.color} text-[10px] border-0`}>
                          {catConfig.label}
                        </Badge>
                      </div>

                      <h3 className={`font-semibold text-foreground mb-2 group-hover:text-primary transition-colors ${featured ? "text-2xl" : "text-subtitle"}`}>
                        {course.title}
                      </h3>
                      <p className={`text-body-sm text-muted-foreground mb-4 ${featured ? "line-clamp-4" : "line-clamp-2"}`}>
                        {course.description}
                      </p>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {course.duration_minutes} min
                        </span>
                        {moduleCount > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {moduleCount} module{moduleCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {cpd > 0 && (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Award className="h-3.5 w-3.5" />
                            {formatCpd(cpd)}
                          </span>
                        )}
                      </div>

                      {/* Progress bar (logged-in, in-progress) */}
                      {user && status === "in-progress" && moduleCount > 0 && (
                        <div className="mb-4">
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">{completedMods} of {moduleCount} modules complete</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                        <span className="text-body-sm font-semibold text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                          {status === "completed" ? (
                            <>View Certificate <Award className="h-4 w-4" /></>
                          ) : status === "in-progress" ? (
                            <>Continue Learning <PlayCircle className="h-4 w-4" /></>
                          ) : (
                            <>Start Course <ArrowRight className="h-4 w-4" /></>
                          )}
                        </span>
                        <button
                          type="button"
                          title="Share on LinkedIn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://worldaml-clarity-shield.lovable.app/academy/${course.slug}`)}`;
                            window.open(url, "_blank");
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              };

              // Determine featured course = first course (AML Fundamentals) only when no filters applied
              const noFilters = categoryFilter === "all" && difficultyFilter === "all" && filter === "all";
              const featuredCourse = noFilters ? filteredCourses.find((c) => c.slug === "aml-fundamentals") : null;
              const restCourses = featuredCourse ? filteredCourses.filter((c) => c.id !== featuredCourse.id) : filteredCourses;

              // Group remaining by category
              const grouped: Record<string, typeof restCourses> = {};
              restCourses.forEach((c: any) => {
                const key = c.category || "global";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(c);
              });

              const orderedCategories = [
                ...CATEGORY_ORDER.filter((k) => grouped[k]?.length),
                ...Object.keys(grouped).filter((k) => !CATEGORY_ORDER.includes(k)),
              ];

              return (
                <div className="space-y-12">
                  {/* Featured course hero */}
                  {featuredCourse && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <h3 className="text-body font-semibold text-foreground uppercase tracking-wide">Start Here</h3>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        {renderCard(featuredCourse, { featured: true })}
                      </div>
                    </div>
                  )}

                  {/* Grouped grids */}
                  {noFilters ? (
                    orderedCategories.map((catKey) => {
                      const cfg = categoryConfig[catKey] || categoryConfig.global;
                      const CatIcon = cfg.icon;
                      return (
                        <div key={catKey}>
                          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-border">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
                                <CatIcon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h3 className="text-subtitle font-semibold text-foreground">
                                  {CATEGORY_SECTION_TITLES[catKey] || cfg.label}
                                </h3>
                                <p className="text-caption text-muted-foreground">
                                  {grouped[catKey].length} course{grouped[catKey].length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {grouped[catKey].map((c) => renderCard(c))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCourses.map((c) => renderCard(c))}
                    </div>
                  )}
                </div>
              );
            })()}
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
