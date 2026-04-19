import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Award, Clock, BookOpen, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PASS_THRESHOLD = 80;

const AcademyCourse = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"learn" | "quiz">("learn");
  const [activeModule, setActiveModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, number>>({});

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
      if (result.correct_answers) {
        setCorrectAnswers(result.correct_answers);
      }
      setQuizSubmitted(true);

      if (result.passed && result.share_token) {
        toast({
          title: "🎉 Certificate Earned!",
          description: "Congratulations! You can now download or share your certificate.",
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

        navigate(`/academy/certificate/${result.share_token}`);
      } else {
        toast({
          title: "Not quite!",
          description: `You scored ${result.score}%. You need ${PASS_THRESHOLD}% to pass. Try again!`,
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
        <section className="bg-navy py-8">
          <div className="container-enterprise">
            <Link to="/academy" className="text-slate-light text-body-sm hover:text-white inline-flex items-center gap-1 mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Academy
            </Link>
            <h1 className="text-headline text-primary-foreground mb-2">{course.title}</h1>
            <p className="text-body text-slate-light mb-4">{course.description}</p>
            <div className="flex items-center gap-4 text-body-sm text-slate-light">
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
              <div className="mt-4 inline-flex items-center gap-2 text-caption text-slate-light bg-white/5 border border-white/10 rounded-md px-3 py-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Reading freely — <Link to="/signup" className="text-white underline hover:text-accent">sign up</Link> to save progress and earn a certificate.</span>
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
              onClick={() => user ? setActiveTab("quiz") : toast({ title: "Sign in required", description: "Please sign in to take the quiz.", variant: "destructive" })}
              className={`px-6 py-3 text-body-sm font-medium border-b-2 transition-colors ${
                activeTab === "quiz" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="h-4 w-4 inline mr-1.5" />
              Quiz & Certificate
              {!user && <Lock className="h-3 w-3 inline ml-1" />}
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            {activeTab === "learn" ? (
              <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                {/* Module sidebar */}
                <nav className="space-y-1">
                  {modules?.map((mod, i) => {
                    const isComplete = completedModules.includes(mod.id);
                    return (
                      <button
                        key={mod.id}
                        onClick={() => setActiveModule(i)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-body-sm transition-colors flex items-center gap-2 ${
                          i === activeModule
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-border flex-shrink-0 text-center text-[10px] leading-4">
                            {i + 1}
                          </span>
                        )}
                        {mod.title}
                      </button>
                    );
                  })}
                </nav>

                {/* Module content */}
                {modules && modules[activeModule] && (
                  <div className="min-w-0">
                    <h2 className="text-subtitle font-semibold text-foreground mb-6">
                      {modules[activeModule].title}
                    </h2>
                    <div className="prose prose-slate dark:prose-invert max-w-none mb-8 space-y-1">
                      {modules[activeModule].content
                        .replace(/\\n/g, "\n")
                        .split("\n")
                        .map((line, i) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <div key={i} className="h-3" />;
                          if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                            return (
                              <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-2">
                                {trimmed.replace(/\*\*/g, "")}
                              </h3>
                            );
                          }
                          if (trimmed.startsWith("- ")) {
                            return (
                              <div key={i} className="flex items-start gap-2 pl-4 py-0.5">
                                <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                                <span className="text-muted-foreground text-body leading-relaxed">
                                  {trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}
                                </span>
                              </div>
                            );
                          }
                          if (/^\d+\.?\s/.test(trimmed)) {
                            const match = trimmed.match(/^(\d+\.?\s)(.*)/);
                            return (
                              <div key={i} className="flex items-start gap-2 pl-4 py-0.5">
                                <span className="text-primary font-medium flex-shrink-0">{match?.[1]}</span>
                                <span className="text-muted-foreground text-body leading-relaxed">
                                  {(match?.[2] || "").replace(/\*\*(.*?)\*\*/g, "$1")}
                                </span>
                              </div>
                            );
                          }
                          // Inline bold handling
                          const parts = trimmed.split(/\*\*(.*?)\*\*/g);
                          return (
                            <p key={i} className="text-muted-foreground text-body leading-relaxed">
                              {parts.map((part, pi) =>
                                pi % 2 === 1 ? (
                                  <strong key={pi} className="text-foreground font-medium">{part}</strong>
                                ) : (
                                  <span key={pi}>{part}</span>
                                )
                              )}
                            </p>
                          );
                        })}
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      {!completedModules.includes(modules[activeModule].id) && (
                        <Button onClick={() => markModuleComplete(modules[activeModule].id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </Button>
                      )}
                      {activeModule < modules.length - 1 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            markModuleComplete(modules[activeModule].id);
                            setActiveModule(activeModule + 1);
                          }}
                        >
                          Next Module <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                      {activeModule === modules.length - 1 && allModulesComplete && (
                        <Button variant="accent" onClick={() => setActiveTab("quiz")}>
                          Take the Quiz <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
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
            ) : (
              <div className="max-w-2xl mx-auto">
                {quizSubmitted && quizScore !== null && quizScore >= PASS_THRESHOLD ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-accent mx-auto mb-4" />
                    <h3 className="text-headline text-foreground mb-2">Congratulations! 🎉</h3>
                    <p className="text-body-lg text-muted-foreground mb-2">
                      You scored <span className="font-bold text-foreground">{quizScore}%</span> and earned your certificate!
                    </p>
                    <p className="text-body-sm text-muted-foreground mb-6">Redirecting to your certificate...</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-subtitle font-semibold text-foreground mb-2">
                      {course.title} — Quiz
                    </h2>
                    <p className="text-body-sm text-muted-foreground mb-8">
                      Answer all questions. You need {PASS_THRESHOLD}% to pass and earn your certificate.
                    </p>

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
                    ) : quizScore !== null && quizScore < PASS_THRESHOLD && (
                      <div className="mt-8 text-center">
                        <p className="text-body text-muted-foreground mb-4">
                          You scored {quizScore}%. Review the material and try again!
                        </p>
                        <Button
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                            setQuizScore(null);
                          }}
                        >
                          Retake Quiz
                        </Button>
                      </div>
                    )}
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
