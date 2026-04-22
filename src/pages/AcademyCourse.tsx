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
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Award, Clock, BookOpen, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);
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
    const wasAlreadyComplete = completedModules.includes(moduleId);
    const updated = [...new Set([...completedModules, moduleId])];
    setCompletedModules(updated);

    if (!wasAlreadyComplete) {
      setJustCompletedId(moduleId);
      window.setTimeout(() => {
        setJustCompletedId((curr) => (curr === moduleId ? null : curr));
      }, 2400);
    }

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
              onClick={() => {
                if (user) {
                  setActiveTab("quiz");
                } else {
                  navigate(`/signup?redirect=${encodeURIComponent(`/academy/${slug}?tab=quiz`)}`);
                }
              }}
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
        <section className="py-8 md:py-12 bg-background">
          <div className="container-enterprise">
            {activeTab === "learn" ? (
              <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
                {/* Module sidebar */}
                <aside className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-4 pb-4 border-b border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-caption font-semibold text-foreground uppercase tracking-wide">
                          Course Modules
                        </p>
                        <span className="text-caption font-medium text-foreground tabular-nums">
                          {completedModules.length}/{modules?.length || 0}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-1.5" />
                      <p className="text-caption text-muted-foreground mt-2">
                        {allModulesComplete
                          ? "All modules complete — ready for the quiz."
                          : `${Math.round(progressPercent)}% complete`}
                      </p>
                    </div>
                    <nav className="space-y-1">
                      {modules?.map((mod, i) => {
                        const isComplete = completedModules.includes(mod.id);
                        const isActive = i === activeModule;
                        const justDone = justCompletedId === mod.id;
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
                            } ${justDone ? "ring-2 ring-emerald-500/40" : ""}`}
                          >
                            {isComplete ? (
                              <CheckCircle className={`h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5 ${justDone ? "animate-in zoom-in-50 duration-300" : ""}`} />
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
                          <span>~{Math.ceil(course.duration_minutes / modules.length)} min per module</span>
                        </div>
                      </div>
                    )}
                  </div>
                </aside>

                {/* Module content */}
                {modules && modules[activeModule] && (
                  <article className="min-w-0 max-w-3xl">
                    {/* Module header */}
                    <div className="mb-8 pb-6 border-b border-border">
                      <p className="text-caption text-primary font-semibold uppercase tracking-wide mb-2">
                        Module {activeModule + 1} of {modules.length}
                      </p>
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
                        {modules[activeModule].title}
                      </h2>
                    </div>

                    {/* Article body */}
                    <div className="mb-10">
                      {(() => {
                        // Inline formatter: handles **bold**, *italic*, and `code`
                        const renderInline = (text: string, keyPrefix: string) => {
                          const tokens: React.ReactNode[] = [];
                          const regex = /(\*\*([^*]+)\*\*|(?<!\*)\*([^*\n]+)\*(?!\*)|`([^`]+)`)/g;
                          let lastIndex = 0;
                          let match: RegExpExecArray | null;
                          let idx = 0;
                          while ((match = regex.exec(text)) !== null) {
                            if (match.index > lastIndex) {
                              tokens.push(text.slice(lastIndex, match.index));
                            }
                            if (match[2] !== undefined) {
                              tokens.push(
                                <strong key={`${keyPrefix}-b-${idx++}`} className="font-semibold text-foreground">
                                  {match[2]}
                                </strong>
                              );
                            } else if (match[3] !== undefined) {
                              tokens.push(
                                <em key={`${keyPrefix}-i-${idx++}`} className="italic text-foreground/90">
                                  {match[3]}
                                </em>
                              );
                            } else if (match[4] !== undefined) {
                              tokens.push(
                                <code
                                  key={`${keyPrefix}-c-${idx++}`}
                                  className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-[0.875em]"
                                >
                                  {match[4]}
                                </code>
                              );
                            }
                            lastIndex = match.index + match[0].length;
                          }
                          if (lastIndex < text.length) {
                            tokens.push(text.slice(lastIndex));
                          }
                          return tokens.length ? tokens : [text];
                        };

                        const lines = modules[activeModule].content
                          .replace(/\\n/g, "\n")
                          .split("\n");

                        const elements: React.ReactNode[] = [];
                        let listBuffer: { type: "ul" | "ol"; items: { content: string; marker?: string }[] } | null = null;

                        const flushList = () => {
                          if (!listBuffer) return;
                          const { type, items } = listBuffer;
                          const key = `list-${elements.length}`;
                          if (type === "ul") {
                            elements.push(
                              <ul key={key} className="my-4 space-y-2">
                                {items.map((it, ii) => (
                                  <li key={ii} className="flex items-start gap-3 pl-1">
                                    <span className="mt-[0.7em] flex-shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span className="text-foreground/85 text-body leading-[1.7]">
                                      {renderInline(it.content, `${key}-${ii}`)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            );
                          } else {
                            elements.push(
                              <ol key={key} className="my-4 space-y-2">
                                {items.map((it, ii) => (
                                  <li key={ii} className="flex items-start gap-3 pl-1">
                                    <span className="text-primary font-semibold flex-shrink-0 min-w-[1.5rem] text-body leading-[1.7]">
                                      {it.marker}
                                    </span>
                                    <span className="text-foreground/85 text-body leading-[1.7]">
                                      {renderInline(it.content, `${key}-${ii}`)}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            );
                          }
                          listBuffer = null;
                        };

                        lines.forEach((line, i) => {
                          const trimmed = line.trim();
                          const key = `l-${i}`;

                          if (!trimmed) {
                            flushList();
                            return;
                          }

                          // Markdown headings: #, ##, ###, ####
                          const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
                          if (headingMatch) {
                            flushList();
                            const level = headingMatch[1].length;
                            const text = headingMatch[2].replace(/\*\*/g, "");
                            if (level === 1) {
                              elements.push(
                                <h2 key={key} className="text-2xl md:text-3xl font-bold text-foreground mt-12 mb-4 scroll-mt-24 tracking-tight">
                                  {text}
                                </h2>
                              );
                            } else if (level === 2) {
                              elements.push(
                                <h3 key={key} className="text-xl md:text-2xl font-semibold text-foreground mt-10 mb-3 scroll-mt-24 tracking-tight">
                                  {text}
                                </h3>
                              );
                            } else if (level === 3) {
                              elements.push(
                                <h4 key={key} className="text-lg md:text-xl font-semibold text-foreground mt-8 mb-2 scroll-mt-24">
                                  {text}
                                </h4>
                              );
                            } else {
                              elements.push(
                                <h5 key={key} className="text-base font-semibold text-foreground mt-6 mb-2 uppercase tracking-wide">
                                  {text}
                                </h5>
                              );
                            }
                            return;
                          }

                          // Bold-only line treated as section heading (legacy content support)
                          if (/^\*\*[^*]+\*\*:?$/.test(trimmed)) {
                            flushList();
                            elements.push(
                              <h3 key={key} className="text-xl md:text-2xl font-semibold text-foreground mt-10 mb-3 scroll-mt-24 tracking-tight">
                                {trimmed.replace(/\*\*/g, "").replace(/:$/, "")}
                              </h3>
                            );
                            return;
                          }

                          // Blockquote
                          if (trimmed.startsWith("> ")) {
                            flushList();
                            elements.push(
                              <blockquote key={key} className="my-5 pl-4 border-l-4 border-primary/40 bg-secondary/30 py-3 pr-4 rounded-r-md text-foreground/85 text-body leading-[1.7] italic">
                                {renderInline(trimmed.slice(2), key)}
                              </blockquote>
                            );
                            return;
                          }

                          // Bullet list item
                          if (/^[-*]\s+/.test(trimmed)) {
                            const content = trimmed.replace(/^[-*]\s+/, "");
                            if (!listBuffer || listBuffer.type !== "ul") {
                              flushList();
                              listBuffer = { type: "ul", items: [] };
                            }
                            listBuffer.items.push({ content });
                            return;
                          }

                          // Ordered list item
                          const olMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
                          if (olMatch) {
                            if (!listBuffer || listBuffer.type !== "ol") {
                              flushList();
                              listBuffer = { type: "ol", items: [] };
                            }
                            listBuffer.items.push({ marker: `${olMatch[1]}.`, content: olMatch[2] });
                            return;
                          }

                          // Paragraph
                          flushList();
                          elements.push(
                            <p key={key} className="text-foreground/85 text-body leading-[1.75] my-3">
                              {renderInline(trimmed, key)}
                            </p>
                          );
                        });

                        flushList();
                        return elements;
                      })()}
                    </div>

                    {/* Mark as complete card / inline success */}
                    {(() => {
                      const currentId = modules[activeModule].id;
                      const isComplete = completedModules.includes(currentId);
                      const justDone = justCompletedId === currentId;

                      if (isComplete) {
                        return (
                          <div
                            className={`mb-6 rounded-xl border p-5 flex items-center justify-between gap-4 flex-wrap transition-colors ${
                              justDone
                                ? "border-emerald-500/40 bg-emerald-500/10 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                : "border-border bg-secondary/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className={`h-5 w-5 text-emerald-500 ${justDone ? "animate-in zoom-in-50 duration-300" : ""}`} />
                              </div>
                              <div>
                                <p className="text-body font-medium text-foreground">
                                  {justDone ? "Module complete — nice work!" : "Module completed"}
                                </p>
                                <p className="text-body-sm text-muted-foreground">
                                  {completedModules.length}/{modules.length} modules done
                                  {allModulesComplete ? " — you're ready for the quiz." : ""}
                                </p>
                              </div>
                            </div>
                            {activeModule < modules.length - 1 && (
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setActiveModule(activeModule + 1);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                              >
                                Continue <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            )}
                          </div>
                        );
                      }

                      return (
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
                          <Button onClick={() => markModuleComplete(currentId)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        </div>
                      );
                    })()}

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
            ) : (
              <div className="max-w-2xl mx-auto">
                {quizSubmitted && quizScore !== null && quizScore >= PASS_THRESHOLD ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-accent mx-auto mb-4" />
                    <h3 className="text-headline text-foreground mb-2">Congratulations! 🎉</h3>
                    <p className="text-body-lg text-muted-foreground mb-2">
                      You scored <span className="font-bold text-foreground">{quizScore}%</span> and earned your certificate!
                    </p>
                    <p className="text-body-sm text-muted-foreground mb-6">Your certificate is ready — showcase it on LinkedIn to strengthen your professional profile.</p>
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
