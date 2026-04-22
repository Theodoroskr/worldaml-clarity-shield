import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Award, Clock, BookOpen, Lock, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ModuleContent, { computeReadingMinutes } from "@/components/academy/ModuleContent";
import ModuleTOC from "@/components/academy/ModuleTOC";
import ContentProtection from "@/components/academy/ContentProtection";
import { getCourseDiagram } from "@/assets/academy";

const PASS_THRESHOLD = 80;

const AcademyCourse = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"learn" | "quiz">(
    searchParams.get("tab") === "quiz" ? "quiz" : "learn"
  );
  const [activeModule, setActiveModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, number>>({});
  const [certificateToken, setCertificateToken] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  const { data: course } = useQuery({
    queryKey: ["academy-course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: modules } = useQuery({
    queryKey: ["academy-modules", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_modules")
        .select("*")
        .eq("course_id", course!.id)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: questions } = useQuery({
    queryKey: ["academy-questions", course?.id],
    enabled: !!course?.id && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_questions_safe")
        .select("*")
        .eq("course_id", course!.id)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Load existing progress
  const { data: progress } = useQuery({
    queryKey: ["academy-progress", course?.id, user?.id],
    enabled: !!course?.id && !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("academy_progress")
        .select("*")
        .eq("course_id", course!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (progress) {
      const mods = progress.completed_modules as string[] | null;
      if (mods) setCompletedModules(mods);
      if (progress.quiz_passed && progress.quiz_score !== null) {
        setQuizSubmitted(true);
        setQuizScore(progress.quiz_score);
      }
    }
  }, [progress]);

  // Auto-jump to first incomplete module when resuming from dashboard (?resume=1)
  useEffect(() => {
    if (searchParams.get("resume") !== "1") return;
    if (!modules || modules.length === 0) return;

    const completedSet = new Set(completedModules);
    const firstIncompleteIdx = modules.findIndex((m: any) => !completedSet.has(m.id));
    const targetIdx = firstIncompleteIdx === -1 ? modules.length - 1 : firstIncompleteIdx;

    setActiveTab("learn");
    setActiveModule(targetIdx);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, [modules, completedModules, searchParams]);

  const markModuleComplete = async (moduleId: string) => {
    const updated = [...new Set([...completedModules, moduleId])];
    setCompletedModules(updated);

    if (user && course) {
      await supabase.from("academy_progress").upsert(
        { user_id: user.id, course_id: course.id, completed_modules: updated },
        { onConflict: "user_id,course_id" }
      );
    }
  };

  const handleAnswer = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitQuiz = async () => {
    if (!questions || !user || !course) return;

    setGenerating(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const holderName = profile?.full_name || user.email || "Learner";

      // Submit answers to server-side validation function
      const { data, error } = await supabase.rpc("submit_quiz_and_issue_certificate", {
        _course_id: course.id,
        _answers: quizAnswers,
        _holder_name: holderName,
      });

      if (error) throw error;

      const result = data as { passed: boolean; score: number; certificate_id?: string; share_token?: string; correct_answers?: Record<string, number> };
      setQuizScore(result.score);
      setQuizSubmitted(true);
      setReviewMode(true);
      if (result.correct_answers) {
        setCorrectAnswers(result.correct_answers);
      }
      if (result.share_token) {
        setCertificateToken(result.share_token);
      }
      // Scroll to top of quiz to show summary
      window.scrollTo({ top: 0, behavior: "smooth" });

      if (result.passed && result.share_token) {
        toast({
          title: "🎉 You passed!",
          description: `Score: ${result.score}%. Review your answers below — your certificate is ready.`,
        });

        // Fire-and-forget certificate email
        const certUrl = `${window.location.origin}/academy/certificate/${result.share_token}`;
        supabase.functions.invoke("send-certificate-email", {
          body: {
            holder_name: holderName,
            email: user.email,
            course_title: course.title,
            score: result.score,
            certificate_url: certUrl,
            certificate_id: result.certificate_id,
          },
        }).catch(() => {});
      } else {
        toast({
          title: "Not quite!",
          description: `You scored ${result.score}%. Review the correct answers below, then try again.`,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const allModulesComplete = modules ? completedModules.length >= modules.length : false;
  const progressPercent = modules?.length ? (completedModules.length / modules.length) * 100 : 0;

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading course...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${course.title} — WorldAML Academy`}
        description={course.description.slice(0, 160)}
        canonical={`/academy/${course.slug}`}
        ogType="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.description,
          provider: { "@type": "Organization", name: "WorldAML" },
          timeRequired: `PT${course.duration_minutes}M`,
          educationalLevel: course.difficulty,
        }}
      />
      <Header />
      <main className="flex-1">
        {/* Course Header */}
        <section className="bg-navy py-6 sm:py-8">
          <div className="container-enterprise">
            <Link to="/academy" className="text-slate-light text-body-sm hover:text-white inline-flex items-center gap-1 mb-3 sm:mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Academy
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-headline text-primary-foreground mb-2 leading-tight">{course.title}</h1>
            <p className="text-body-sm sm:text-body text-slate-light mb-4">{course.description}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm text-slate-light">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration_minutes} min</span>
              <Badge variant="secondary">{course.difficulty}</Badge>
            </div>
            {user ? (
              <div className="mt-4 max-w-sm">
                <div className="flex justify-between text-caption text-slate-light mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            ) : (
              <div className="mt-4 inline-flex items-start gap-2 text-caption text-slate-light bg-white/5 border border-white/10 rounded-md px-3 py-2 max-w-full">
                <BookOpen className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">Reading freely — <Link to="/signup" className="text-white underline hover:text-accent">sign up</Link> to save progress and earn a certificate.</span>
              </div>
            )}
          </div>
        </section>

        {/* Tabs */}
        <section className="border-b border-border bg-background sticky top-16 z-30">
          <div className="container-enterprise flex gap-0">
            <button
              onClick={() => setActiveTab("learn")}
              className={`px-6 py-3 text-body-sm font-medium border-b-2 transition-colors ${
                activeTab === "learn" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-1.5" />
              Learn ({modules?.length || 0} modules)
            </button>
            <button
              onClick={() => {
                if (!user) {
                  navigate(`/signup?redirect=${encodeURIComponent(`/academy/${slug}?tab=quiz`)}`);
                  return;
                }
                if (!allModulesComplete) {
                  toast({
                    title: "Complete all modules first",
                    description: `Finish all ${modules?.length || 0} modules to unlock the quiz.`,
                    variant: "destructive",
                  });
                  setActiveTab("learn");
                  return;
                }
                setActiveTab("quiz");
              }}
              className={`px-6 py-3 text-body-sm font-medium border-b-2 transition-colors ${
                activeTab === "quiz" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="h-4 w-4 inline mr-1.5" />
              Quiz & Certificate
              {(!user || !allModulesComplete) && <Lock className="h-3 w-3 inline ml-1" />}
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="py-8 md:py-12 bg-background">
          <div className="container-enterprise">
            {activeTab === "learn" ? (
              <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
                {/* Module sidebar */}
                <aside className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                      <p className="text-caption font-semibold text-foreground uppercase tracking-wide">
                        Course Modules
                      </p>
                      <span className="text-caption text-muted-foreground">
                        {completedModules.length}/{modules?.length || 0}
                      </span>
                    </div>
                    <nav className="space-y-1">
                      {modules?.map((mod, i) => {
                        const isComplete = completedModules.includes(mod.id);
                        const isActive = i === activeModule;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => {
                              setActiveModule(i);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-body-sm transition-all flex items-start gap-2.5 ${
                              isActive
                                ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                                : "text-muted-foreground hover:bg-secondary border-l-2 border-transparent"
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-semibold ${
                                isActive ? "bg-primary text-primary-foreground" : "border border-border"
                              }`}>
                                {i + 1}
                              </span>
                            )}
                            <span className="leading-snug">{mod.title}</span>
                          </button>
                        );
                      })}
                    </nav>
                    {modules && modules.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-caption text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>~{modules.reduce((s, m) => s + computeReadingMinutes(m.content), 0)} min total reading</span>
                        </div>
                      </div>
                    )}
                  </div>
                </aside>

                {/* Module content */}
                {modules && modules[activeModule] && (
                  <article className="min-w-0 max-w-3xl">
                    {/* Module header */}
                    <div className="mb-6 pb-6 border-b border-border">
                      <p className="text-caption text-primary font-semibold uppercase tracking-wide mb-2">
                        Module {activeModule + 1} of {modules.length}
                      </p>
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight mb-3">
                        {modules[activeModule].title}
                      </h2>
                      <div className="flex items-center gap-4 text-caption text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {computeReadingMinutes(modules[activeModule].content)} min read
                        </span>
                        <span aria-hidden>·</span>
                        <span>{modules[activeModule].content.replace(/\\n/g, " ").split(/\s+/).filter(Boolean).length} words</span>
                      </div>
                    </div>

                    {/* In-page table of contents (auto-built from headings) */}
                    <ModuleTOC content={modules[activeModule].content} />

                    {/* Course diagram - shown only for first module */}
                    {activeModule === 0 && course?.slug && getCourseDiagram(course.slug) && (
                      <div className="mb-8 rounded-xl border border-border bg-card overflow-hidden">
                        <div className="aspect-video relative">
                          <img
                            src={getCourseDiagram(course.slug)}
                            alt={`${course.title} concept diagram`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-4 py-3 bg-muted/30 border-t border-border">
                          <p className="text-caption text-muted-foreground flex items-center gap-2">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Key concepts visualized
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Article body */}
                    <ContentProtection watermarkLabel={user?.email || "WorldAML Academy"}>
                      <ModuleContent content={modules[activeModule].content} className="mb-10" />
                    </ContentProtection>

                    {/* Mark as complete card */}
                    {!completedModules.includes(modules[activeModule].id) && (
                      <div className="mb-6 rounded-xl border border-border bg-secondary/30 p-5 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-body font-medium text-foreground">Finished reading?</p>
                            <p className="text-body-sm text-muted-foreground">Mark this module complete to track your progress.</p>
                          </div>
                        </div>
                        <Button onClick={() => markModuleComplete(modules[activeModule].id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      </div>
                    )}

                    {/* Prev/Next navigation */}
                    <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
                      <Button
                        variant="outline"
                        disabled={activeModule === 0}
                        onClick={() => {
                          setActiveModule(activeModule - 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      {activeModule < modules.length - 1 ? (
                        <Button
                          variant="default"
                          onClick={() => {
                            markModuleComplete(modules[activeModule].id);
                            setActiveModule(activeModule + 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          Next Module <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : allModulesComplete ? (
                        <Button
                          variant="accent"
                          onClick={() => {
                            if (user) {
                              setActiveTab("quiz");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else {
                              navigate(`/signup?redirect=${encodeURIComponent(`/academy/${slug}?tab=quiz`)}`);
                            }
                          }}
                        >
                          <Award className="h-4 w-4 mr-2" />
                          {user ? "Take the Quiz" : "Sign Up & Take the Quiz"}
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          onClick={() => markModuleComplete(modules[activeModule].id)}
                          disabled={completedModules.includes(modules[activeModule].id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {completedModules.includes(modules[activeModule].id) ? "Completed" : "Mark Complete"}
                        </Button>
                      )}
                    </div>
                  </article>
                )}
              </div>
            ) : !user ? (
              <div className="max-w-md mx-auto text-center py-12">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-subtitle font-semibold mb-2">Sign In Required</h3>
                <p className="text-muted-foreground mb-6">Create a free account to take the quiz and earn your certificate.</p>
                <Button asChild>
                  <Link to="/signup">Create Free Account</Link>
                </Button>
              </div>
            ) : !allModulesComplete ? (
              <div className="max-w-md mx-auto text-center py-12">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-subtitle font-semibold mb-2">Complete all modules to unlock the quiz</h3>
                <p className="text-muted-foreground mb-6">
                  You've completed {completedModules.length} of {modules?.length || 0} modules.
                  Finish the remaining {(modules?.length || 0) - completedModules.length} to take the quiz and earn your certificate.
                </p>
                <div className="max-w-xs mx-auto mb-6">
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <Button
                  onClick={() => {
                    setActiveTab("learn");
                    const firstIncompleteIdx = (modules || []).findIndex((m: any) => !completedModules.includes(m.id));
                    if (firstIncompleteIdx >= 0) setActiveModule(firstIncompleteIdx);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {quizSubmitted && quizScore !== null && (
                  <div className={`mb-8 rounded-xl border p-6 ${
                    quizScore >= PASS_THRESHOLD
                      ? "border-emerald-500/40 bg-emerald-50"
                      : "border-rose-500/40 bg-rose-50"
                  }`}>
                    <div className="flex items-start gap-4">
                      {quizScore >= PASS_THRESHOLD ? (
                        <Award className="h-10 w-10 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-10 w-10 text-rose-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          {quizScore >= PASS_THRESHOLD ? "Congratulations — you passed! 🎉" : "Not quite — review and retry"}
                        </h3>
                        <p className="text-body-sm text-muted-foreground mb-4">
                          You scored <span className="font-semibold text-foreground">{quizScore}%</span>
                          {" "}({Object.values(quizAnswers).filter((ans, i) => {
                            const q = questions?.[i];
                            return q && correctAnswers[q.id] === ans;
                          }).length} of {questions?.length || 0} correct).
                          {" "}Pass mark: {PASS_THRESHOLD}%.
                          {" "}Review every question and explanation below.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {quizScore >= PASS_THRESHOLD && certificateToken && (
                            <Button
                              variant="accent"
                              onClick={() => navigate(`/academy/certificate/${certificateToken}`)}
                            >
                              <Award className="h-4 w-4 mr-2" />
                              View Certificate
                            </Button>
                          )}
                          {quizScore < PASS_THRESHOLD && (
                            <Button
                              onClick={() => {
                                setQuizAnswers({});
                                setQuizSubmitted(false);
                                setQuizScore(null);
                                setCorrectAnswers({});
                                setReviewMode(false);
                                setCertificateToken(null);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              Retake Quiz
                            </Button>
                          )}
                          <Button variant="outline" asChild>
                            <Link to="/academy">Back to Academy</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {false ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-accent mx-auto mb-4" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-subtitle font-semibold text-foreground mb-2">
                      {quizSubmitted ? `${course.title} — Review` : `${course.title} — Quiz`}
                    </h2>
                    <p className="text-body-sm text-muted-foreground mb-8">
                      {quizSubmitted
                        ? "Correct answers are highlighted in green. Read the explanation under each question to reinforce the concept."
                        : `Answer all questions. You need ${PASS_THRESHOLD}% to pass and earn your certificate.`}
                    </p>

                    <ContentProtection watermarkLabel={user?.email || "WorldAML Academy"}>
                      <div className="space-y-8">
                        {questions?.map((q, qi) => {
                          const options = q.options as string[];
                          const answered = quizAnswers[q.id] !== undefined;
                          const correctIdx = correctAnswers[q.id];
                          const isCorrect = quizSubmitted && quizAnswers[q.id] === correctIdx;
                          const isWrong = quizSubmitted && answered && quizAnswers[q.id] !== correctIdx;

                          return (
                            <div key={q.id} className="rounded-xl border border-border p-6">
                              <p className="text-body font-medium text-foreground mb-4">
                                {qi + 1}. {q.question}
                              </p>
                              <div className="space-y-2">
                                {options.map((opt, oi) => {
                                  const isSelected = quizAnswers[q.id] === oi;
                                  const showCorrect = quizSubmitted && oi === correctIdx;
                                  return (
                                    <button
                                      key={oi}
                                      onClick={() => handleAnswer(q.id, oi)}
                                      disabled={quizSubmitted}
                                      className={`w-full text-left px-4 py-3 rounded-lg border text-body-sm transition-all duration-150 flex items-center gap-3 ${
                                        showCorrect
                                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                          : isSelected && isWrong
                                          ? "border-rose-500 bg-rose-50 text-rose-800"
                                          : isSelected
                                          ? "border-primary bg-primary/10 text-primary font-medium shadow-sm"
                                          : "border-border hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-muted-foreground hover:text-foreground cursor-pointer"
                                      }`}
                                    >
                                      {showCorrect && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                                      {isSelected && isWrong && <XCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />}
                                      {!showCorrect && !(isSelected && isWrong) && (
                                        <span className="w-4 h-4 rounded-full border border-current flex-shrink-0" />
                                      )}
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              {quizSubmitted && q.explanation && (
                                <p className="mt-3 text-body-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                                  💡 {q.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ContentProtection>

                    {!quizSubmitted ? (
                      <div className="mt-8">
                        <Button
                          size="lg"
                          onClick={submitQuiz}
                          disabled={!questions || Object.keys(quizAnswers).length < (questions?.length || 0) || generating}
                        >
                          {generating ? "Generating Certificate..." : "Submit Quiz"}
                        </Button>
                        {questions && Object.keys(quizAnswers).length < questions.length && (
                          <p className="text-body-sm text-muted-foreground mt-2">
                            Answer all {questions.length} questions to submit.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyCourse;
