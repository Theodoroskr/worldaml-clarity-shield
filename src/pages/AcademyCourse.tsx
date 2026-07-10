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
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Award, Clock, BookOpen, Lock, ImageIcon, ShoppingBag, LogIn, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ModuleContent, { computeReadingMinutes } from "@/components/academy/ModuleContent";
import ModuleTOC from "@/components/academy/ModuleTOC";
import ContentProtection from "@/components/academy/ContentProtection";
import { getCourseDiagram } from "@/assets/academy";
import { useCourseGate } from "@/hooks/useCourseGate";
import { ACADEMY_PRICING, isPaidCourse, FREE_ACADEMY_COURSES } from "@/data/academyPricing";
import { useRegion } from "@/contexts/RegionContext";
import { AcademyCurrency, convertEurCents, formatPrice, REGION_TO_CURRENCY } from "@/lib/academyFx";
import CurrencyIndicator from "@/components/academy/CurrencyIndicator";
import { useCart } from "@/contexts/CartContext";
import { AcademyCartDrawerMount } from "@/components/academy/AcademyCartDrawer";

const PASS_THRESHOLD = 70;

const AcademyCourse = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const gate = useCourseGate(slug);
  const { region } = useRegion();
  const cart = useCart();
  const currency: AcademyCurrency = REGION_TO_CURRENCY[region] ?? "eur";
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
  const [quizError, setQuizError] = useState<{ message: string; code?: string; details?: string; hint?: string } | null>(null);
  const [errorReported, setErrorReported] = useState(false);
  const [reportingError, setReportingError] = useState(false);
  const [expressLoading, setExpressLoading] = useState(false);

  const handleExpressCheckout = async () => {
    if (!slug) return;
    const rememberedEmail = !user
      ? (typeof window !== "undefined" ? window.localStorage.getItem("academy_last_email") : null)
      : null;
    if (!user && !rememberedEmail) {
      // No identity available — fall back to the basket drawer to collect email
      cart.add(slug);
      cart.open();
      return;
    }
    setExpressLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-academy-checkout", {
        body: {
          courseSlugs: [slug],
          currency,
          ...(user ? {} : { guestEmail: rememberedEmail }),
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      console.error("Express checkout failed:", err);
      toast({
        title: "Could not start checkout",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setExpressLoading(false);
    }
  };

  // Auto-add to cart and open drawer when returning from login with purchase intent
  useEffect(() => {
    if (
      searchParams.get("intent") === "purchase" &&
      user &&
      slug &&
      !gate.loading &&
      gate.requiresPurchase &&
      isPaidCourse(slug)
    ) {
      if (!cart.has(slug)) {
        cart.add(slug);
      }
      cart.open();
      // Clean up the URL param
      const next = new URLSearchParams(searchParams);
      next.delete("intent");
      const qs = next.toString();
      navigate(`/academy/${slug}${qs ? `?${qs}` : ""}`, { replace: true });
    }
  }, [user, slug, gate.loading, gate.requiresPurchase, searchParams]);

  const { data: course } = useQuery({
    queryKey: ["academy-course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("id, slug, title, description, category, difficulty, duration_minutes, cpd_hours, image_url, is_published, sort_order, created_at, price_eur_cents, estimated_words, learning_outcomes, role_track")
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

  const {
    data: questions,
    isLoading: questionsLoading,
    isError: questionsError,
    error: questionsErrorObj,
    refetch: refetchQuestions,
    isFetching: questionsFetching,
  } = useQuery({
    queryKey: ["academy-questions", course?.id],
    enabled: !!course?.id && !!user,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    queryFn: async () => {
      // Hard 15s timeout so a stalled network never wedges the quiz UI
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const { data, error } = await supabase
          .from("academy_questions_safe")
          .select("*")
          .eq("course_id", course!.id)
          .order("sort_order")
          .abortSignal(controller.signal);
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("No questions returned for this course.");
        return data;
      } finally {
        clearTimeout(timeout);
      }
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

  // Existing certificate (source of truth for "passed this course")
  const { data: existingCertificate } = useQuery({
    queryKey: ["academy-course-certificate", course?.id, user?.id],
    enabled: !!course?.id && !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("academy_certificates")
        .select("share_token, score")
        .eq("course_id", course!.id)
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // If a certificate already exists, hydrate the token so the banner
  // can link to it after a fresh pass or on revisit.
  useEffect(() => {
    if (existingCertificate?.share_token && !certificateToken) {
      setCertificateToken(existingCertificate.share_token);
    }
  }, [existingCertificate, certificateToken]);

  const hasPassed = !!existingCertificate || (quizScore !== null && quizScore >= PASS_THRESHOLD);

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

  // Hard-block ?tab=quiz deep links when modules aren't all complete
  // (or learner isn't signed in). Forces them back to the learn tab.
  useEffect(() => {
    if (searchParams.get("tab") !== "quiz") return;
    if (!modules || modules.length === 0) return;
    const allDone = completedModules.length >= modules.length;
    if (!user || !allDone) {
      setActiveTab("learn");
    }
  }, [searchParams, modules, completedModules, user]);

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
    setQuizError(null);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      // Certificates must always be issued in the learner's real name (first + surname),
      // never their email address. If the profile has no full name, prompt for one and
      // persist it so future certificates are correct.
      const looksLikeFullName = (v: string | null | undefined) =>
        !!v && v.trim().includes(" ") && !v.includes("@");

      let holderName = profile?.full_name?.trim() || "";
      if (!looksLikeFullName(holderName)) {
        const entered = window.prompt(
          "Please enter your full name (first name and surname) as it should appear on your certificate:",
          holderName || ""
        )?.trim() || "";
        if (!looksLikeFullName(entered)) {
          setGenerating(false);
          toast({
            title: "Full name required",
            description: "Certificates are issued in your full name (first name and surname). Please try again.",
            variant: "destructive",
          });
          return;
        }
        holderName = entered;
        await supabase.from("profiles").update({ full_name: holderName }).eq("user_id", user.id);
      }

      // Submit answers to server-side validation function, with a 25s
      // client-side timeout so the user is never stuck on "Generating…".
      const SUBMIT_TIMEOUT_MS = 25000;
      const rpcPromise = supabase.rpc("submit_quiz_and_issue_certificate", {
        _course_id: course.id,
        _answers: quizAnswers,
        _holder_name: holderName,
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Submission timed out after 25 seconds. Please retry.")),
          SUBMIT_TIMEOUT_MS,
        ),
      );
      const { data, error } = (await Promise.race([rpcPromise, timeoutPromise])) as Awaited<typeof rpcPromise>;

      if (error) {
        console.error("[QuizSubmit] RPC error:", JSON.stringify(error, null, 2));
        setQuizError({
          message: error.message || "Unknown RPC error",
          code: error.code || undefined,
          details: error.details || undefined,
          hint: error.hint || undefined,
        });
        throw error;
      }

      const result = data as {
        passed: boolean;
        score: number;
        certificate_id?: string;
        share_token?: string;
        correct_answers?: Record<string, number>;
        certificate_withheld?: boolean;
        reason?: string;
        message?: string;
        domain?: string;
        cap?: number;
      };
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

      if (result.passed && result.certificate_withheld) {
        toast({
          title: "✅ You passed — certificate on hold",
          description:
            result.message ||
            `Your team at ${result.domain} has hit the daily certificate limit (${result.cap}). Your pass is recorded; the certificate unlocks once the 24-hour window resets.`,
          duration: 12000,
        });
      } else if (result.passed && result.share_token) {
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
    } catch (err: unknown) {
      const alreadySet = !!quizError;
      if (!alreadySet) {
        const msg = err instanceof Error ? err.message : String(err);
        setQuizError({ message: msg });
      }
      toast({
        title: "Error",
        description: "Failed to submit quiz. See error details below.",
        variant: "destructive",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setGenerating(false);
    }
  };

  const reportErrorToSupport = async () => {
    if (!quizError || !course) return;
    setReportingError(true);
    try {
      await supabase.functions.invoke("report-quiz-error", {
        body: {
          error_message: quizError.message,
          error_code: quizError.code,
          error_details: quizError.details,
          error_hint: quizError.hint,
          course_id: course.id,
          course_slug: slug,
          user_agent: navigator.userAgent,
        },
      });
      setErrorReported(true);
      toast({ title: "Reported", description: "Error details sent to our support team." });
    } catch {
      toast({ title: "Could not send report", description: "Please contact support manually.", variant: "destructive" });
    } finally {
      setReportingError(false);
    }
  };

  const allModulesComplete = modules ? completedModules.length >= modules.length : false;
  const progressPercent = modules?.length ? (completedModules.length / modules.length) * 100 : 0;

  if (!course || gate.loading) {
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

  // Login wall — only for FREE courses. Paid courses fall through to the
  // purchase wall below, which supports guest checkout (no account required to pay).
  if (gate.requiresLogin && !gate.isPaid) {
    const redirectTo = encodeURIComponent(`/academy/${slug}`);
    return (
      <div className="min-h-screen flex flex-col">
        <SEO
          title={`Sign in to start — ${course.title}`}
          description="Create a free account to start this WorldAML Academy course."
          canonical={`/academy/${slug}`}
          noindex
        />
        <Header />
        <main className="flex-1 bg-background">
          <div className="container-enterprise py-16">
            <div className="max-w-lg mx-auto rounded-xl border border-border bg-card p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to start this course</h1>
              <p className="text-muted-foreground mb-6">
                Create a free account to access course modules, take the quiz, and earn your certificate for{" "}
                <span className="font-semibold text-foreground">{course.title}</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild>
                  <Link to={`/signup?redirect=${redirectTo}`}>
                    Create free account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/login?redirect=${redirectTo}`}>
                    Sign in
                  </Link>
                </Button>
              </div>
              <p className="text-caption text-muted-foreground mt-4">
                Two foundational courses are free with any account. Other courses unlock after purchase.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Purchase wall — paid course, no active purchase. Works for guests
  // (cart drawer collects email and auto-creates an account post-payment)
  // and signed-in learners alike.
  if (gate.requiresPurchase || (gate.requiresLogin && gate.isPaid)) {

    const priceEntry = ACADEMY_PRICING[course.slug];
    const dbCents = (course as { price_eur_cents?: number }).price_eur_cents ?? 0;
    const eurCents = priceEntry?.eurCents ?? dbCents;
    const purchasable =
      isPaidCourse(course.slug) ||
      dbCents > 0;
    const displayCents = eurCents > 0 ? convertEurCents(eurCents, currency) : 0;
    const inCart = cart.has(course.slug);

    return (
      <div className="min-h-screen flex flex-col">
        <SEO
          title={`Unlock ${course.title} — WorldAML Academy`}
          description="Purchase this course to access modules, take the quiz, and earn your certificate."
          canonical={`/academy/${slug}`}
          noindex
        />
        <Header />
        <main className="flex-1 bg-background">
          <div className="container-enterprise py-16">
            <div className="max-w-lg mx-auto rounded-xl border border-border bg-card p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Unlock this course</h1>
              <p className="text-muted-foreground mb-6">
                Purchase <span className="font-semibold text-foreground">{course.title}</span> to access all modules,
                take the certified quiz, and earn your shareable WorldAML certificate.
              </p>

              {purchasable && displayCents > 0 && (
                <div className="mb-6 inline-flex items-center gap-2">
                  <Badge variant="outline" className="text-base px-3 py-1.5 border-primary/40 text-primary bg-primary/10 font-bold">
                    {formatPrice(displayCents, currency)}
                  </Badge>
                  <CurrencyIndicator variant="full" showTooltip />
                </div>
              )}

              {purchasable ? (
                <div className="space-y-3">
                  {(() => {
                    const rememberedEmail =
                      !user && typeof window !== "undefined"
                        ? window.localStorage.getItem("academy_last_email")
                        : null;
                    const canExpress = Boolean(user || rememberedEmail);
                    return (
                      <>
                        <Button
                          onClick={handleExpressCheckout}
                          disabled={expressLoading}
                          size="lg"
                          className="w-full"
                        >
                          {expressLoading ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirecting…</>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Express checkout
                              {displayCents > 0 && <span className="ml-2 opacity-90">· {formatPrice(displayCents, currency)}</span>}
                            </>
                          )}
                        </Button>
                        <p className="text-caption text-muted-foreground">
                          {canExpress
                            ? user
                              ? `One click — billed to ${user.email}. Apple Pay, Google Pay & Link supported at checkout.`
                              : `One click as ${rememberedEmail}. Apple Pay, Google Pay & Link supported at checkout.`
                            : "Goes straight to secure Stripe Checkout — Apple Pay, Google Pay & Link supported."}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-caption text-muted-foreground">or</span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          {inCart ? (
                            <Button variant="outline" onClick={() => cart.open()}>
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              View basket
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => {
                                cart.add(course.slug);
                                cart.open();
                              }}
                            >
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Add to basket
                            </Button>
                          )}
                          <Button variant="ghost" asChild>
                            <Link to="/academy">
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Browse other courses
                            </Link>
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-body-sm text-muted-foreground">
                    This course is not yet available for purchase. Check back soon.
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/academy">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Academy
                    </Link>
                  </Button>
                </div>
              )}

              <p className="text-caption text-muted-foreground mt-6">
                Buy 2+ courses for 5% off, 3+ for 10% off — applied automatically at checkout.
              </p>
            </div>
          </div>
        </main>
        <Footer />
        <AcademyCartDrawerMount />
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
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Academy", url: "/academy" },
          { name: course.title, url: `/academy/${course.slug}` },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.description,
          provider: {
            "@type": "Organization",
            name: "WorldAML Academy",
            sameAs: "https://academy.worldaml.com",
          },
          url: `https://academy.worldaml.com/${course.slug}`,
          ...(course.image_url ? { image: course.image_url } : {}),
          inLanguage: "en",
          timeRequired: `PT${course.duration_minutes}M`,
          educationalLevel: course.difficulty,
          ...(course.learning_outcomes && Array.isArray(course.learning_outcomes) && course.learning_outcomes.length
            ? { teaches: course.learning_outcomes }
            : {}),
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: `PT${course.duration_minutes}M`,
          },
          offers: {
            "@type": "Offer",
            category: isPaidCourse(course.slug) ? "Paid" : "Free",
            price: isPaidCourse(course.slug)
              ? (ACADEMY_PRICING[course.slug].eurCents / 100).toFixed(2)
              : "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: `https://academy.worldaml.com/${course.slug}`,
          },
        }}
      />
      <Header />
      <main className="flex-1">
        {/* Course Header — editorial */}
        <section className="relative bg-navy overflow-hidden border-b border-white/5">
          <div className="pointer-events-none absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-teal-light/10 blur-[140px]" aria-hidden />
          <div className="container-enterprise relative py-10 sm:py-14">
            <Link to="/academy" className="text-slate-light/70 text-body-sm hover:text-white inline-flex items-center gap-1 mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Academy
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-block py-1 px-3 rounded-full border border-teal-light/30 bg-teal-light/5 text-teal-light text-[11px] font-medium tracking-[0.22em] uppercase">
                WorldAML Academy · Course
              </span>
              {(() => {
                if (FREE_ACADEMY_COURSES.has(course.slug)) {
                  return (
                    <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-teal-light">
                      Free
                    </span>
                  );
                }
                if (isPaidCourse(course.slug)) {
                  const cents = convertEurCents(ACADEMY_PRICING[course.slug].eurCents, currency);
                  return (
                    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-white/80">
                      {formatPrice(cents, currency)}
                      <span className="text-slate-light/70 normal-case tracking-normal">
                        <CurrencyIndicator variant="full" showTooltip className="!text-slate-light/70" />
                      </span>
                    </span>
                  );
                }
                return null;
              })()}
            </div>

            <h1 className="text-white font-bold leading-[0.95] tracking-tighter mb-5 text-3xl sm:text-5xl lg:text-6xl max-w-4xl">
              {course.title}
            </h1>
            <p className="text-body-lg text-slate-light/80 max-w-2xl leading-relaxed mb-6">{course.description}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-slate-light/75 mb-6">
              <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-teal-light" /> {course.duration_minutes} min</span>
              <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-teal-light" /> {modules?.length || 0} modules</span>
              <span className="inline-flex items-center gap-2 uppercase tracking-widest text-[11px] font-semibold">{course.difficulty}</span>
            </div>

            {user ? (
              <div className="mt-2 max-w-md">
                <div className="flex justify-between items-baseline text-[11px] uppercase tracking-[0.22em] text-slate-light/60 font-semibold mb-2">
                  <span>Progress</span>
                  <span className="text-white tabular-nums text-body-sm normal-case tracking-normal">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-px w-full bg-white/10 relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-teal-light transition-all duration-500"
                    style={{ width: `${progressPercent}%`, height: "2px", top: "-0.5px" }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-2 inline-flex items-start gap-2 text-caption text-slate-light bg-white/5 border border-white/10 px-3 py-2 max-w-full">
                <BookOpen className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">Reading freely — <Link to="/signup" className="text-teal-light underline hover:text-white">sign up</Link> to save progress and earn a certificate.</span>
              </div>
            )}
          </div>
        </section>

        {/* Tabs — teal underline */}
        <section className="border-b border-border bg-background sticky top-16 z-30">
          <div className="container-enterprise flex gap-0">
            <button
              onClick={() => setActiveTab("learn")}
              className={`px-6 py-4 text-[11px] uppercase tracking-[0.22em] font-semibold border-b-2 transition-colors ${
                activeTab === "learn" ? "border-teal text-teal" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Learn · {modules?.length || 0} modules
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
              className={`px-6 py-4 text-[11px] uppercase tracking-[0.22em] font-semibold border-b-2 transition-colors ${
                activeTab === "quiz" ? "border-teal text-teal" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="h-4 w-4 inline mr-2" />
              Quiz & Certificate
              {(!user || !allModulesComplete) && <Lock className="h-3 w-3 inline ml-2" />}
            </button>
          </div>
        </section>


        {/* Content */}
        <section className="py-8 md:py-12 bg-background">
          <div className="container-enterprise">
            {activeTab === "learn" ? (
              <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
                {/* Module rail — numbered, hairline */}
                <aside className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto pr-1">
                  <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-border">
                    <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-teal">
                      Curriculum
                    </p>
                    <span className="text-caption text-muted-foreground tabular-nums">
                      {completedModules.length} / {modules?.length || 0}
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
                          className={`group w-full text-left px-4 py-3.5 text-body-sm transition-all flex items-start gap-3.5 border-l-2 ${
                            isActive
                              ? "border-teal bg-teal/5 text-foreground font-medium"
                              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/40"
                          }`}
                        >
                          {isComplete ? (
                            <span className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 bg-teal text-white">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className={`w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold tabular-nums border transition-colors ${
                              isActive
                                ? "border-teal text-teal bg-transparent"
                                : "border-border text-muted-foreground group-hover:border-teal/40 group-hover:text-teal"
                            }`}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          )}
                          <span className="leading-snug pt-0.5">{mod.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                  {modules && modules.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-caption text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>~{modules.reduce((s, m) => s + computeReadingMinutes(m.content), 0)} min total reading</span>
                      </div>
                    </div>
                  )}
                </aside>

                {/* Module content */}
                {modules && modules[activeModule] && (
                  <article className="min-w-0 max-w-3xl">
                    {/* Module header — editorial */}
                    <div className="mb-10 pb-8 border-b border-border">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-teal font-semibold mb-4 tabular-nums">
                        Module {String(activeModule + 1).padStart(2, "0")} / {String(modules.length).padStart(2, "0")}
                      </p>
                      <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-[1.05] tracking-tighter mb-5">
                        {modules[activeModule].title}
                      </h2>
                      <div className="flex items-center gap-4 text-caption uppercase tracking-widest text-muted-foreground font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-teal" />
                          {computeReadingMinutes(modules[activeModule].content)} min read
                        </span>
                        <span className="h-px w-8 bg-border" aria-hidden />
                        <span className="tabular-nums normal-case tracking-normal">
                          {modules[activeModule].content.replace(/\\n/g, " ").split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                    </div>

                    <ModuleTOC content={modules[activeModule].content} />

                    {activeModule === 0 && course?.slug && getCourseDiagram(course.slug) && (
                      <div className="mb-10 border border-border bg-card overflow-hidden">
                        <div className="aspect-video relative">
                          <img
                            src={getCourseDiagram(course.slug)}
                            alt={`${course.title} concept diagram`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-4 py-3 bg-muted/30 border-t border-border">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold flex items-center gap-2">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Key concepts visualized
                          </p>
                        </div>
                      </div>
                    )}

                    <ContentProtection watermarkLabel={user?.email || "WorldAML Academy"}>
                      <ModuleContent content={modules[activeModule].content} className="mb-12" />
                    </ContentProtection>

                    {/* Mark complete — teal-bordered ribbon */}
                    {!completedModules.includes(modules[activeModule].id) && (
                      <div className="mb-8 border-l-4 border-teal bg-card p-6 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 border border-teal/40 flex items-center justify-center flex-shrink-0 text-teal">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-body font-semibold text-foreground">Finished reading?</p>
                            <p className="text-body-sm text-muted-foreground">Mark this module complete to track your progress.</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => markModuleComplete(modules[activeModule].id)}
                          className="bg-teal hover:bg-teal/90 text-white font-semibold rounded-none px-6"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      </div>
                    )}

                    {/* Prev/Next — squared, editorial */}
                    <div className="flex items-center justify-between gap-4 pt-8 border-t border-border">
                      <Button
                        variant="outline"
                        className="rounded-none px-6 py-6 border-border text-foreground hover:bg-secondary disabled:opacity-30"
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
                          className="rounded-none px-6 py-6 bg-teal hover:bg-teal/90 text-white font-semibold"
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
                          className="rounded-none px-6 py-6 bg-teal hover:bg-teal/90 text-white font-semibold"
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
                          className="rounded-none px-6 py-6 bg-teal hover:bg-teal/90 text-white font-semibold"
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
                {quizError && (
                  <div className="mb-8 rounded-xl border border-rose-500/40 bg-rose-50 p-6">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-rose-800 mb-2">Quiz Submission Failed</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold text-rose-700">Error: </span>
                            <span className="text-rose-900 font-mono">{quizError.message}</span>
                          </div>
                          {quizError.code && (
                            <div>
                              <span className="font-semibold text-rose-700">Code: </span>
                              <span className="text-rose-900 font-mono">{quizError.code}</span>
                            </div>
                          )}
                          {quizError.details && (
                            <div>
                              <span className="font-semibold text-rose-700">Details: </span>
                              <span className="text-rose-900 font-mono">{quizError.details}</span>
                            </div>
                          )}
                          {quizError.hint && (
                            <div>
                              <span className="font-semibold text-rose-700">Hint: </span>
                              <span className="text-rose-900 font-mono">{quizError.hint}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 p-3 bg-white/60 rounded-lg border border-rose-200">
                          <p className="font-semibold text-rose-800 mb-1">Suggested next steps:</p>
                          <ul className="list-disc list-inside text-rose-700 text-sm space-y-1">
                            {quizError.code === "42501" && (
                              <li>Permission denied — the database function or table RLS policy is blocking access. Contact support.</li>
                            )}
                            {quizError.code === "PGRST202" && (
                              <li>The RPC function was not found. A database migration may be pending.</li>
                            )}
                            {quizError.message?.includes("rate") && (
                              <li>You may be rate-limited. Wait a minute and try again.</li>
                            )}
                            {quizError.message?.includes("JWT") && (
                              <li>Your session may have expired. Try logging out and back in.</li>
                            )}
                            <li>Try refreshing the page and submitting again.</li>
                            <li>If the issue persists, contact support with the error details above.</li>
                          </ul>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => { setQuizError(null); submitQuiz(); }}
                            disabled={generating}
                          >
                            {generating ? "Retrying…" : "Retry Quiz"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-300 text-rose-700 hover:bg-rose-100"
                            onClick={() => { setQuizError(null); setErrorReported(false); }}
                          >
                            Dismiss
                          </Button>
                          {user && !errorReported && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-rose-300 text-rose-700 hover:bg-rose-100"
                              disabled={reportingError}
                              onClick={reportErrorToSupport}
                            >
                              {reportingError ? "Sending…" : "Report to Support"}
                            </Button>
                          )}
                          {errorReported && (
                            <span className="text-sm text-emerald-700 self-center">✓ Reported</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                          {quizScore >= PASS_THRESHOLD
                            ? `Passed — ${quizScore}% · Certificate unlocked 🎉`
                            : `Did not pass — ${quizScore}% · ${PASS_THRESHOLD}% required`}
                        </h3>
                        <p className="text-body-sm text-muted-foreground mb-4">
                          You answered <span className="font-semibold text-foreground">
                            {Object.values(quizAnswers).filter((ans, i) => {
                              const q = questions?.[i];
                              return q && correctAnswers[q.id] === ans;
                            }).length} of {questions?.length || 0}
                          </span> correctly.
                          {quizScore >= PASS_THRESHOLD
                            ? " Your certificate is ready to view and share."
                            : ` You need ${PASS_THRESHOLD}% to unlock your certificate. Review every question and explanation below, then retake the quiz.`}
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
                          <Button
                            variant={quizScore >= PASS_THRESHOLD ? "outline" : "default"}
                            onClick={() => {
                              setQuizAnswers({});
                              setQuizSubmitted(false);
                              setQuizScore(null);
                              setCorrectAnswers({});
                              setReviewMode(false);
                              if (quizScore < PASS_THRESHOLD) {
                                setCertificateToken(null);
                              }
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Retake Quiz
                          </Button>
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


                    {questionsLoading && (
                      <div className="rounded-xl border border-border p-6 text-center text-muted-foreground">
                        Loading quiz questions…
                      </div>
                    )}

                    {questionsError && (
                      <div className="rounded-xl border border-rose-500/40 bg-rose-50 p-6 mb-6">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-rose-800 mb-1">Couldn't load the quiz</h3>
                            <p className="text-sm text-rose-700 mb-3">
                              {(questionsErrorObj as Error)?.message || "Network timed out while fetching questions."} You can retry without losing your progress.
                            </p>
                            <Button
                              size="sm"
                              onClick={() => refetchQuestions()}
                              disabled={questionsFetching}
                            >
                              {questionsFetching ? "Retrying…" : "Retry loading quiz"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {!questionsLoading && !questionsError && (!questions || questions.length === 0) && (
                      <div className="rounded-xl border border-border p-6 text-center">
                        <p className="text-muted-foreground mb-3">No quiz questions are available for this course yet.</p>
                        <Button size="sm" variant="outline" onClick={() => refetchQuestions()}>Try again</Button>
                      </div>
                    )}

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
                                      className={`w-full text-left px-4 py-3 rounded-lg border-2 text-body-sm transition-all duration-150 flex items-center gap-3 ${
                                        showCorrect
                                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                          : isSelected && isWrong
                                          ? "border-rose-500 bg-rose-50 text-rose-800"
                                          : isSelected
                                          ? "border-teal bg-teal/10 text-foreground font-semibold shadow-sm ring-2 ring-teal/30"
                                          : "border-border hover:border-teal/40 hover:bg-secondary hover:shadow-sm text-muted-foreground hover:text-foreground cursor-pointer"
                                      }`}
                                    >
                                      {showCorrect && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                                      {isSelected && isWrong && <XCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />}
                                      {!showCorrect && !(isSelected && isWrong) && (
                                        <span
                                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                            isSelected ? "border-teal" : "border-current"
                                          }`}
                                        >
                                          {isSelected && <span className="w-2 h-2 rounded-full bg-teal" />}
                                        </span>
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
