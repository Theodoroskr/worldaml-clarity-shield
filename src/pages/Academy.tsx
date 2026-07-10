import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, GraduationCap, Clock, Award, Shield, BookOpen, CheckCircle, BarChart3, Globe, MapPin, Layers, Sparkles, X, Linkedin, Star, FileText, PlayCircle, Lock, ShoppingBag, Check, LogIn, Calendar, RefreshCw, Crown, Loader2 } from "lucide-react";

import { z } from "zod";

// Block common disposable / throwaway inbox providers from the guest annual-pass
// flow — these accounts can't receive receipts or course-access links reliably.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "temp-mail.org", "10minutemail.com",
  "guerrillamail.com", "yopmail.com", "trashmail.com", "throwawaymail.com",
  "fakeinbox.com", "getnada.com", "maildrop.cc", "sharklasers.com",
  "dispostable.com", "mintemail.com", "mailnesia.com",
]);

const guestEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .email("Please enter a valid email address")
  .refine(
    (email) => {
      const domain = email.split("@")[1];
      return domain ? !DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
    },
    { message: "Please use a work or permanent email address" },
  );
import { getCourseCover } from "@/assets/academy";
import AcademyLogo from "@/components/AcademyLogo";
import worldAmlLogoDark from "@/assets/worldaml-logo-dark.png.asset.json";
import heroShield from "@/assets/academy-hero-professional.jpg";
import AcademyCartButton from "@/components/academy/AcademyCartDrawer";
import LearnerLogos from "@/components/academy/LearnerLogos";
import StickyMobileCTA from "@/components/academy/StickyMobileCTA";
import { useCart } from "@/contexts/CartContext";
import { useAcademyPurchases } from "@/hooks/useAcademyPurchases";
import { ACADEMY_PRICING, isPaidCourse, FREE_ACADEMY_COURSES } from "@/data/academyPricing";
import { computeDiscount, applyDiscount } from "@/lib/academyDiscount";
import { useRegion } from "@/contexts/RegionContext";
import { AcademyCurrency, convertEurCents, formatPrice, REGION_TO_CURRENCY, currencyCode } from "@/lib/academyFx";
import CurrencyIndicator from "@/components/academy/CurrencyIndicator";
import TeamQuoteBanner from "@/components/academy/TeamQuoteBanner";
import { toast } from "sonner";


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
  const cart = useCart();
  const { purchasedSlugs, hasAnnualPass, refetch: refetchPurchases } = useAcademyPurchases();
  const { region, regionConfig, wasAutoDetected, isLoading: regionLoading } = useRegion();
  const currency: AcademyCurrency = REGION_TO_CURRENCY[region] ?? "eur";
  const [searchParams, setSearchParams] = useSearchParams();

  // Slugs that were just purchased — drives the on-screen success banner.
  const [justPurchasedSlugs, setJustPurchasedSlugs] = useState<string[]>([]);

  // --- Annual all-access pass quick checkout ---
  const [annualLoading, setAnnualLoading] = useState(false);
  const [annualGuestEmail, setAnnualGuestEmail] = useState("");
  const [annualPromptOpen, setAnnualPromptOpen] = useState(false);
  const [annualEmailError, setAnnualEmailError] = useState<string | null>(null);
  // Ref guard runs synchronously on click — prevents the double-Stripe-session
  // race where rapid clicks fire before React commits `setAnnualLoading(true)`.
  const annualInFlightRef = useRef(false);

  const startAnnualCheckout = async (emailOverride?: string) => {
    if (annualInFlightRef.current) return;
    const invokeBody: Record<string, unknown> = { currency };
    if (!user) {
      const raw = emailOverride ?? annualGuestEmail;
      const parsed = guestEmailSchema.safeParse(raw);
      if (!parsed.success) {
        setAnnualEmailError(parsed.error.issues[0]?.message ?? "Invalid email");
        setAnnualPromptOpen(true);
        return;
      }
      const email = parsed.data;
      invokeBody.guestEmail = email;
      try { window.localStorage.setItem("academy_last_email", email); } catch { /* noop */ }
    }
    annualInFlightRef.current = true;
    setAnnualLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-academy-annual-checkout",
        { body: invokeBody },
      );
      if (error) throw error;
      if (!data?.url || typeof data.url !== "string" || !data.url.startsWith("https://checkout.stripe.com/")) {
        throw new Error("Invalid checkout URL returned");
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("Annual checkout failed:", err);
      toast.error(err instanceof Error ? err.message : "Could not start checkout. Please try again.");
      annualInFlightRef.current = false;
      setAnnualLoading(false);
    }
  };

  // Post-checkout success toast (Stripe redirects back with ?purchase=success).
  // Intentionally runs once on mount only — the URL param is stripped via
  // setSearchParams below, so re-running on every searchParams change would
  // either no-op or duplicate the toast. Browser back/forward landing on the
  // same param again is an accepted edge case (user can refresh to retrigger).
  useEffect(() => {
    const purchase = searchParams.get("purchase");
    if (purchase === "success") {
      // Snapshot cart BEFORE clearing so we can show what was unlocked, but
      // intersect with the server-confirmed `purchasedSlugs` after refetch so
      // a stale cart (e.g. cleared in another tab) doesn't show fake unlocks.
      const snapshot = Array.from(cart.items);
      if (snapshot.length > 0) setJustPurchasedSlugs(snapshot);

      toast.success("Payment received — your courses are unlocked.", {
        description: "Scroll down to start learning.",
        duration: 6000,
      });
      // Clear cart locally; the webhook has recorded the purchase server-side.
      cart.clear();
      // Refetch purchases so card CTAs flip from "Unlock course" to "Start course".
      // Webhook may take a moment; retry a few times, then reconcile the banner.
      const reconcile = async () => {
        await refetchPurchases();
        setJustPurchasedSlugs((prev) =>
          prev.filter((slug) => purchasedSlugs.has(slug)),
        );
      };
      void reconcile();
      const t1 = setTimeout(() => { void reconcile(); }, 1500);
      const t2 = setTimeout(() => { void reconcile(); }, 4000);
      const next = new URLSearchParams(searchParams);
      next.delete("purchase");
      setSearchParams(next, { replace: true });
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else if (purchase === "cancelled") {
      toast("Checkout cancelled.", { description: "Your basket is still saved." });
      const next = new URLSearchParams(searchParams);
      next.delete("purchase");
      setSearchParams(next, { replace: true });
    }
    // Mount-only; see comment above for rationale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First-visit toast: announce auto-detected region once per browser.
  useEffect(() => {
    if (regionLoading || !wasAutoDetected) return;
    // Key the dismiss flag by region so a different detected region (travel,
    // VPN switch, relocation) re-announces the new currency once.
    const dismissKey = `academy_region_toast_dismissed:${region}`;
    try {
      if (localStorage.getItem(dismissKey) === "1") return;
      const id = toast(
        `Showing prices in ${currencyCode(currency)} for ${regionConfig.name}. Change region anytime from the cart.`,
        {
          duration: 8000,
          action: {
            label: "Got it",
            onClick: () => {
              try { localStorage.setItem(dismissKey, "1"); } catch { /* ignore */ }
              toast.dismiss(id);
            },
          },
        }
      );
      // Mark as shown immediately so it never reappears for this region even
      // without explicit dismiss.
      try { localStorage.setItem(dismissKey, "1"); } catch { /* ignore */ }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionLoading, wasAutoDetected, region]);

  const [filter, setFilter] = useState<FilterTab>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return window.sessionStorage.getItem("academy-new-courses-dismissed") === "1"; } catch { return false; }
  });

  const dismissBanner = () => {
    setBannerDismissed(true);
    try { sessionStorage.setItem("academy-new-courses-dismissed", "1"); } catch { /* ignore */ }
  };

  const { data: courses, isLoading } = useQuery({
    queryKey: ["academy-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("id, slug, title, description, category, difficulty, duration_minutes, cpd_hours, image_url, is_published, sort_order, created_at, price_eur_cents, estimated_words, learning_outcomes, role_track")
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
      const { data, error } = await supabase.rpc("get_academy_module_counts");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((m: { course_id: string; module_count: number }) => {
        counts[m.course_id] = Number(m.module_count) || 0;
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

  // Sequential unlock: a course is locked if the previous course (same category,
  // lower sort_order) hasn't been passed yet (no certificate).
  // The first course in each category is always unlocked.
  const lockInfo = (() => {
    const map = new Map<string, { locked: boolean; prereqTitle?: string }>();
    if (!courses) return map;
    const byCategory: Record<string, typeof courses> = {};
    courses.forEach((c) => {
      const key = (c as { category?: string }).category || "global";
      (byCategory[key] ||= []).push(c);
    });
    Object.values(byCategory).forEach((list) => {
      const ordered = [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      ordered.forEach((c, idx) => {
        if (idx === 0) {
          map.set(c.id, { locked: false });
          return;
        }
        const prev = ordered[idx - 1];
        const prevPassed = certMap.has(prev.id);
        map.set(c.id, prevPassed ? { locked: false } : { locked: true, prereqTitle: prev.title });
      });
    });
    return map;
  })();

  // Logged-out visitors browse freely (gating only kicks in once signed in).
  // Prerequisite gating removed — every course is open to browse; paid courses still require purchase.
  void lockInfo;
  const isCourseLocked = (_courseId: string) => false;
  const getPrereqTitle = (_courseId: string): string | undefined => undefined;

  const filteredCourses = courses?.filter((course) => {
    // Category filter
    if (categoryFilter !== "all" && (course as { category?: string }).category !== categoryFilter) return false;
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
        title="Free AML & KYC Training — CPD Certified"
        description="CPD-accredited AML, KYC and sanctions training for compliance professionals in the US, UK, EU and UAE. Free courses available. Earn verifiable certificates."
        canonical="/academy"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Academy", url: "/academy" },
        ]}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "WorldAML Academy",
            description: "CPD-accredited compliance training courses with verifiable certificates. AML, KYC and sanctions screening for regulated firms in the US, UK, Europe and Middle East.",
            url: "https://academy.worldaml.com",
            sameAs: ["https://www.worldaml.com/academy"],
            areaServed: [
              { "@type": "Country", name: "United States" },
              { "@type": "Country", name: "United Kingdom" },
              { "@type": "Country", name: "United Arab Emirates" },
              { "@type": "AdministrativeArea", name: "European Union" },
            ],
          },
          ...(courses && courses.length
            ? [{
                "@context": "https://schema.org",
                "@type": "ItemList",
                itemListElement: courses.map((c, idx) => ({
                  "@type": "ListItem",
                  position: idx + 1,
                  url: `https://academy.worldaml.com/${c.slug}`,
                  name: c.title,
                })),
              }]
            : []),
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero — editorial split with cinematic visual */}
        <section className="relative bg-navy overflow-hidden border-b border-white/5">
          {/* ambient teal glow */}
          <div className="pointer-events-none absolute -top-40 -right-20 h-[600px] w-[600px] rounded-full bg-teal-light/10 blur-[140px]" aria-hidden />
          <div className="pointer-events-none absolute bottom-0 left-1/4 h-[300px] w-[600px] rounded-full bg-teal-light/5 blur-[120px]" aria-hidden />

          <div className="container-enterprise relative pt-12 lg:pt-16 pb-10 lg:pb-14">
            {user && (
              <Link to="/dashboard" className="inline-flex items-center gap-1 text-slate-light/70 hover:text-white text-body-sm mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
            )}

            <div className="grid lg:grid-cols-[1.05fr,0.95fr] gap-10 lg:gap-14 items-center">
              {/* Left — copy */}
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 mb-7">
                  <span className="h-px w-8 bg-teal-light" />
                  <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-teal-light">
                    WorldAML Academy · CPD-Accredited
                  </span>
                </div>

                <h1 className="font-display text-white text-[2.5rem] sm:text-5xl lg:text-[3.75rem] leading-[1.05] tracking-tight mb-6">
                  Exceptional <span className="text-teal-light">compliance</span> training.
                  <span className="block text-slate-light font-normal text-3xl sm:text-4xl lg:text-[2.5rem] mt-3 leading-[1.15]">
                    Training that changes behaviour. Evidence that proves it.
                  </span>
                </h1>

                <p className="text-body-lg text-slate-light/85 mb-9 max-w-lg leading-relaxed">
                  AML, KYC and sanctions courses written by working MLROs. Pass the quiz, download a verifiable
                  certificate, and walk into your next audit with the evidence in hand.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Button asChild variant="accent" size="lg" className="font-semibold rounded-full px-7">
                    <Link to="/academy/aml-fundamentals">
                      <BookOpen className="h-4 w-4" /> Start free course
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-white/25 text-white hover:bg-white/10 hover:text-white font-semibold rounded-full px-7"
                    onClick={() => startAnnualCheckout()}
                    disabled={annualLoading}
                  >
                    {annualLoading ? "Opening checkout…" : <>Buy Annual Pass — €199</>}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-slate-light/80">
                  <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-teal-light" /> CPD-Accredited</span>
                  <span className="flex items-center gap-2"><Award className="h-4 w-4 text-teal-light" /> Verifiable certificate</span>
                  <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-light" /> Unlimited retakes</span>
                  <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-teal-light" /> Regulator-aligned</span>
                </div>

                <div className="mt-5">
                  <AcademyCartButton />
                </div>
              </div>

              {/* Right — cinematic visual */}
              <div className="relative hidden lg:block">
                <div className="relative aspect-[4/5] w-full max-w-[520px] ml-auto">
                  {/* circular vignette mask */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      WebkitMaskImage:
                        "radial-gradient(ellipse 60% 70% at 55% 50%, #000 55%, transparent 85%)",
                      maskImage:
                        "radial-gradient(ellipse 60% 70% at 55% 50%, #000 55%, transparent 85%)",
                    }}
                  >
                    <img
                      src={heroShield}
                      alt="AML compliance shield and verifiable certificate visualization"
                      width={1024}
                      height={1280}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* WorldAML monogram outline overlay */}
                  <svg
                    className="absolute inset-0 m-auto h-3/4 w-3/4 text-teal-light/35"
                    viewBox="0 0 200 200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    <circle cx="100" cy="100" r="92" strokeDasharray="2 6" />
                    <circle cx="100" cy="100" r="70" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Slim stat ledger — institutional hairline grid */}
          <div className="relative border-t border-white/10 bg-navy/60 backdrop-blur-sm">
            <div className="container-enterprise">
              <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-light/60 font-semibold mb-1">Professionals certified</dt>
                  <dd className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">
                    {typeof certifiedCount === "number" && certifiedCount > 0 ? certifiedCount.toLocaleString() : "1,200+"}
                  </dd>
                </div>
                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-light/60 font-semibold mb-1">Specialist courses</dt>
                  <dd className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">{courses?.length ?? 12}</dd>
                </div>
                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-light/60 font-semibold mb-1">Countries reached</dt>
                  <dd className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">40+</dd>
                </div>
                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-light/60 font-semibold mb-1">Learner rating</dt>
                  <dd className="text-2xl sm:text-3xl font-semibold text-white tabular-nums flex items-baseline gap-1">
                    4.8 <span className="text-teal-light text-lg">★</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Team quote banner (≥3 colleagues from same domain) */}
        {user && (
          <section className="bg-background border-b border-border">
            <div className="container-enterprise py-4">
              <TeamQuoteBanner />
            </div>
          </section>
        )}

        {/* Access & pricing callout */}
        <section className="bg-background border-b border-border">
          <div className="container-enterprise py-6">
            <div
              className="rounded-xl border border-border bg-card p-5 sm:p-6 flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between"
              role="region"
              aria-label="Course access and pricing"
            >
              <div className="flex gap-4 min-w-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-subtitle font-semibold text-foreground mb-1">
                    How access works
                  </h2>
                  <ul className="text-body-sm text-muted-foreground space-y-1.5">
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-foreground">2 free courses</strong> — AML Fundamentals & Sanctions Screening Essentials. Sign in and start instantly.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <Lock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-foreground">All other courses</strong> are paid (from €29). Add to basket, check out, then access modules, quiz & certificate.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <Sparkles className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-foreground">Bundle discount</strong> — 5% off 2 courses, 10% off 3+. Applied automatically at checkout.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              {!user && (
                <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0 lg:ml-4">
                  <Button asChild size="sm">
                    <Link to={`/signup?redirect=${encodeURIComponent("/academy")}`}>
                      Create free account
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/login?redirect=${encodeURIComponent("/academy")}`}>
                      Sign in
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Social proof — testimonials */}
        <section className="bg-secondary/30 border-b border-border">
          <div className="container-enterprise section-padding">
            <div className="text-center mb-10">
              <p className="text-caption uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Trusted by compliance teams worldwide
              </p>
              <h2 className="text-headline text-foreground">What learners say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  quote: "Crisp, practical, and aligned with what regulators actually expect. Our analysts use the regional courses as onboarding day one.",
                  name: "MLRO",
                  role: "EU-licensed payments firm",
                },
                {
                  quote: "The crypto and sanctions modules saved us weeks of policy drafting. The certificate is a nice extra to put on LinkedIn.",
                  name: "Compliance Lead",
                  role: "VASP, MENA region",
                },
                {
                  quote: "Finally, AML training that doesn't read like a textbook. The case studies are realistic and decision-driven.",
                  name: "Senior Analyst",
                  role: "Tier-1 retail bank",
                },
              ].map((t, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-6 flex flex-col">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-body-sm text-foreground mb-4 leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="border-t border-border pt-3">
                    <p className="text-body-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-caption text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you get — Three-tier pricing */}
        <section className="bg-background border-b border-border">
          <div className="container-enterprise section-padding">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="text-headline text-foreground mb-3">Choose your plan</h2>
              <p className="text-body-lg text-muted-foreground">
                Start free, buy individual courses, or unlock everything with an annual subscription.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {/* Free tier */}
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">Free</p>
                    <h3 className="text-subtitle font-bold text-foreground mt-0.5">Foundation</h3>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">€0</Badge>
                </div>
                <p className="text-body-sm text-muted-foreground mb-4">
                  Get started with the essentials. Perfect for new joiners and anyone needing a refresher.
                </p>
                <ul className="space-y-2.5 mb-5 flex-1">
                  {[
                    "AML Fundamentals — full course access",
                    "Sanctions Screening Essentials — full course access",
                    "Interactive quizzes with instant feedback",
                    "Shareable digital certificate on completion",
                    "LinkedIn-ready credential",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-body-sm text-foreground">
                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {!user ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/signup">
                      Create free account
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/academy/aml-fundamentals">
                      Start free course
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>

              {/* Per-Course tier */}
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">Per Course</p>
                    <h3 className="text-subtitle font-bold text-foreground mt-0.5">Specialisation</h3>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">From €29</Badge>
                </div>
                <p className="text-body-sm text-muted-foreground mb-4">
                  Pick the regions and topics that match your role. Buy individually or bundle for a discount.
                </p>
                <ul className="space-y-2.5 mb-5 flex-1">
                  {[
                    "16+ regional & specialist courses",
                    "5–6 in-depth modules per course with case studies",
                    "CPD-accredited certificates",
                    "Bundle discount: 5% off 2 courses, 10% off 3+",
                    "MLRO Toolkit: editable policy & SAR templates",
                    "Lifetime access to purchased material",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-body-sm text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {(
                  <Button asChild className="w-full" variant="outline">
                    <a href="#courses-grid">
                      Browse paid courses
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </a>
                  </Button>
                )}

              </div>

              {/* Annual All-Access tier */}
              <div className="rounded-xl border-2 border-accent bg-card p-6 flex flex-col relative shadow-lg">
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-accent text-accent-foreground text-caption font-semibold flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Best value
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-caption font-semibold uppercase tracking-wider text-accent">Annual</p>
                    <h3 className="text-subtitle font-bold text-foreground mt-0.5">All-Access</h3>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-accent text-accent-foreground">€199/year</Badge>
                  </div>
                </div>
                <p className="text-body-sm text-muted-foreground mb-4">
                  One annual payment, unlimited access to every course. Certificates never expire.
                </p>
                <ul className="space-y-2.5 mb-5 flex-1">
                  {[
                    { icon: BookOpen, text: "Unlimited access to all 16+ courses" },
                    { icon: Calendar, text: "Annual prepaid billing — one payment, full year" },
                    { icon: RefreshCw, text: "Unused course completions roll over — certificates never expire" },
                    { icon: Sparkles, text: "Priority access to new courses added during your subscription" },
                    { icon: Award, text: "All CPD certificates and MLRO Toolkit included" },
                    { icon: Shield, text: "Cancel anytime, keep every certificate you've earned" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <li key={i} className="flex gap-2 text-body-sm text-foreground">
                        <Icon className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={() => startAnnualCheckout()}
                  disabled={annualLoading}
                >
                  {annualLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Starting checkout…
                    </>
                  ) : (
                    <>
                      Buy annual access
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
                <p className="mt-2 text-caption text-muted-foreground text-center">
                  Instant checkout — no onboarding required.
                </p>
              </div>
            </div>

            {/* Rollover usage callout */}
            <div className="max-w-3xl mx-auto mt-8">
              <div className="rounded-lg border border-accent/30 bg-accent/5 px-5 py-4 flex gap-3 items-start">
                <RefreshCw className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-body-sm text-muted-foreground">
                  <strong className="text-foreground">Annual subscribers:</strong> your access renews each year. Certificates and CPD credits you've earned are yours forever — they never expire, even if you cancel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What you get — checklist grid */}
        <section className="bg-secondary/30 border-b border-border">
          <div className="container-enterprise section-padding">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="text-headline text-foreground mb-3">What you get</h2>
              <p className="text-body-lg text-muted-foreground">
                Every plan includes practical, regulator-aligned resources designed to make you audit-ready.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: Award,
                  title: "Certificates",
                  color: "text-primary",
                  bg: "bg-primary/10",
                  items: [
                    "Branded, CPD-accredited digital certificate",
                    "One-click LinkedIn profile integration",
                    "Public verification page with unique URL",
                    "A4 PDF ready to print or attach to a CV",
                  ],
                },
                {
                  icon: Calendar,
                  title: "Access duration",
                  color: "text-accent",
                  bg: "bg-accent/10",
                  items: [
                    "Free courses: lifetime access after sign-up",
                    "Purchased courses: lifetime access to material",
                    "Annual pass: unlimited access for 12 months",
                    "Certificates remain valid forever after completion",
                  ],
                },
                {
                  icon: FileText,
                  title: "Templates",
                  color: "text-teal-600",
                  bg: "bg-teal-600/10",
                  items: [
                    "MLRO Toolkit: editable policy templates",
                    "SAR / STR narrative templates by regulator",
                    "Risk assessment & customer due-diligence forms",
                    "Downloadable Word, PDF and spreadsheet formats",
                  ],
                },
                {
                  icon: RefreshCw,
                  title: "Exam retakes",
                  color: "text-emerald-600",
                  bg: "bg-emerald-600/10",
                  items: [
                    "80% pass mark on every course quiz",
                    "Unlimited free retakes until you pass",
                    "Instant feedback on every answer",
                    "Retake after 24 hours to reinforce learning",
                  ],
                },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-6 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-full ${card.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                      <h3 className="text-subtitle font-semibold text-foreground">{card.title}</h3>
                    </div>
                    <ul className="space-y-2.5 flex-1">
                      {card.items.map((item, j) => (
                        <li key={j} className="flex gap-2 text-body-sm text-foreground">
                          <Check className={`h-4 w-4 ${card.color} flex-shrink-0 mt-0.5`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Certificate showcase */}
        <section className="bg-navy text-primary-foreground border-b border-border">
          <div className="container-enterprise section-padding">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-light text-caption font-semibold mb-4">
                  <Award className="h-3.5 w-3.5" />
                  Verifiable Credentials
                </div>
                <h2 className="text-headline text-primary-foreground mb-4">
                  Earn a credential that proves what you know
                </h2>
                <p className="text-body-lg text-slate-light mb-6">
                  Pass the end-of-course quiz and instantly receive a branded, shareable certificate. Every certificate has a
                  unique verification link so employers and regulators can confirm authenticity in one click.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: Award, text: "Branded landscape A4 PDF, ready to print or attach to a CV" },
                    { icon: Linkedin, text: "One-click 'Add to LinkedIn' for your profile's Licenses & Certifications" },
                    { icon: Shield, text: "Public verification page with course details, score, and date" },
                    { icon: BarChart3, text: "CPD hours logged automatically — count toward annual requirements" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <li key={i} className="flex gap-3 text-body-sm text-slate-light">
                        <Icon className="h-5 w-5 text-teal-light flex-shrink-0 mt-0.5" />
                        <span>{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
                <Button asChild variant="accent" size="lg">
                  <a href="#courses-grid">
                    Choose a course
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>

              </div>

              {/* Mock certificate preview */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-light/20 via-transparent to-primary/20 blur-3xl" aria-hidden />
                <div className="relative aspect-[1.414/1] rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-2xl border-8 border-white/90 p-6 sm:p-8 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <img src={worldAmlLogoDark.url} alt="World AML" width={200} height={68} className="h-7 sm:h-9 w-auto mb-2" />
                      <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 font-semibold">Certificate of Completion</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5">WorldAML Academy · CPD-Accredited</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center text-center">
                    <p className="text-[10px] sm:text-xs text-slate-500 mb-1">This is to certify that</p>
                    <p className="text-base sm:text-xl font-bold text-slate-900 mb-2 truncate" style={{ fontFamily: "'Times New Roman', serif" }}>
                      Jane Compliance
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 mb-1">has successfully completed</p>
                    <p className="text-sm sm:text-base font-semibold text-primary mb-3 leading-tight">
                      AML Compliance in Europe
                    </p>
                    <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-amber-600">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="font-semibold">Score: 96%</span>
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    </div>
                  </div>
                  <div className="flex items-end justify-between pt-3 border-t border-slate-200">
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-slate-600">Issued</p>
                      <p className="text-[10px] sm:text-xs font-medium text-slate-700">Apr 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] sm:text-[9px] text-slate-600">Verify at</p>
                      <p className="text-[10px] sm:text-xs font-mono text-slate-700">worldaml.com/verify</p>
                    </div>
                  </div>
                </div>
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

        {/* Just-purchased success banner */}
        {justPurchasedSlugs.length > 0 && (
          <section className="bg-background pt-8">
            <div className="container-enterprise">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 relative">
                <button
                  onClick={() => setJustPurchasedSlugs([])}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-foreground mb-1">
                      You're enrolled — {justPurchasedSlugs.length === 1 ? "1 course" : `${justPurchasedSlugs.length} courses`} unlocked
                    </h2>
                    <p className="text-body-sm text-muted-foreground mb-4">
                      Your purchase is confirmed and access is active. Jump in below to start a course.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {justPurchasedSlugs.map((slug) => {
                        const c = courses?.find((row) => row.slug === slug);
                        const title = c?.title ?? slug;
                        return (
                          <Button key={slug} size="sm" asChild>
                            <Link to={`/academy/${slug}`}>
                              <PlayCircle className="h-4 w-4 mr-1.5" />
                              Start: {title}
                            </Link>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Learner logos — social proof from real corporate learners */}
        <LearnerLogos />

        {/* Courses Grid */}
        <section id="courses-grid" className="section-padding bg-background scroll-mt-20">
          <div className="container-enterprise">
            <div className="text-center mb-8">
              <h2 className="text-headline text-foreground mb-3">Available Courses</h2>
              <p className="text-body-lg text-muted-foreground max-w-xl mx-auto">
                Choose a course, work through the material, then take the quiz to earn your certificate.
              </p>
            </div>

            {/* Bundle savings banner */}
            {(() => {
              const standardEur = 2900; // €29 standard course price used for examples
              const tiers = [1, 2, 3, 5].map((n) => {
                const subtotalEur = standardEur * n;
                const subtotal = convertEurCents(subtotalEur, currency);
                const { pct } = computeDiscount(n);
                const total = applyDiscount(subtotal, pct);
                const saved = subtotal - total;
                return { n, pct, subtotal, total, saved };
              });
              const inBasket = cart.count;
              const basketTier = computeDiscount(inBasket);
              const nextTierAt = inBasket < 2 ? 2 : inBasket < 3 ? 3 : null;
              const nextTierPct = nextTierAt === 2 ? 5 : nextTierAt === 3 ? 10 : 0;
              const remaining = nextTierAt ? nextTierAt - inBasket : 0;

              return (
                <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <h3 className="text-body font-semibold text-foreground uppercase tracking-wide">
                          Bundle & Save
                        </h3>
                      </div>
                      <p className="text-body-sm text-muted-foreground">
                        Add multiple courses to one basket — the discount is applied automatically at checkout.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {inBasket === 0 ? (
                        <span className="text-body-sm text-muted-foreground">
                          Your basket is empty — start adding courses below.
                        </span>
                      ) : nextTierAt ? (
                        <span className="text-body-sm text-foreground">
                          <span className="font-semibold text-primary">{inBasket}</span> in basket — add{" "}
                          <span className="font-semibold text-primary">{remaining}</span> more to unlock{" "}
                          <span className="font-semibold text-accent">{nextTierPct}% off</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-body-sm font-semibold text-accent">
                          <Check className="h-4 w-4" /> {basketTier.pct}% bundle discount applied
                        </span>
                      )}
                      {inBasket > 0 && (
                        <button
                          type="button"
                          onClick={() => cart.open()}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-body-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <ShoppingBag className="h-4 w-4" /> View basket
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {tiers.map((t) => {
                      const isActive = inBasket === t.n || (t.n === 5 && inBasket >= 5);
                      const tierLabel =
                        t.n === 1 ? "1 course" : t.n === 5 ? "5-course bundle" : `${t.n}-course bundle`;
                      return (
                        <div
                          key={t.n}
                          className={`rounded-xl border p-3 sm:p-4 transition-colors ${
                            isActive
                              ? "border-primary bg-primary/10"
                              : t.pct > 0
                              ? "border-accent/30 bg-card"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <span className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                              {tierLabel}
                            </span>
                            {t.pct > 0 && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                                Save {t.pct}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                              {formatPrice(t.total, currency)}
                            </span>
                            {t.pct > 0 && (
                              <span className="text-body-sm text-muted-foreground line-through tabular-nums">
                                {formatPrice(t.subtotal, currency)}
                              </span>
                            )}
                          </div>
                          <p className="text-caption text-muted-foreground mt-1">
                            {t.pct > 0
                              ? `${formatPrice(t.saved, currency)} off · ${formatPrice(Math.round(t.total / t.n), currency)} per course`
                              : `${formatPrice(t.total, currency)} per course`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-caption text-muted-foreground mt-3">
                    Examples based on €29 standard courses. Advanced courses (€49) and regional prices are calculated the same way.
                  </p>
                </div>
              );
            })()}

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
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                        <div className="aspect-[16/9] sm:aspect-[16/10] md:h-40 bg-muted" />
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

              const renderCard = (course: NonNullable<typeof courses>[number], opts?: { featured?: boolean }) => {
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

                const locked = isCourseLocked(course.id);
                const prereqTitle = getPrereqTitle(course.id);
                const cardClassName = `group rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 flex flex-col ${
                  featured ? "md:col-span-3 md:flex-row" : ""
                } ${
                  locked
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5"
                }`;

                if (locked) {
                  return (
                    <div
                      key={course.id}
                      className={cardClassName}
                      aria-disabled="true"
                      title={`Pass ${prereqTitle ?? "the previous course"} (70%+) to unlock this course`}
                    >
                      {/* Thumbnail */}
                      <div
                        className={`relative bg-gradient-to-br ${catConfig.gradient} overflow-hidden flex-shrink-0 grayscale ${
                          featured
                            ? "aspect-[16/10] md:aspect-auto md:w-2/5 md:min-h-[260px]"
                            : "aspect-[16/9] sm:aspect-[16/10] md:aspect-auto md:h-40"
                        }`}
                      >
                        {(() => {
                          const cover = getCourseCover(course.slug);
                          return cover ? (
                            <img src={cover} alt={course.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={`${featured ? "h-20 w-20" : "h-14 w-14"} rounded-2xl ${catConfig.iconBg} backdrop-blur-sm border border-white/20 flex items-center justify-center`}>
                                <CatIcon className={`${featured ? "h-10 w-10" : "h-7 w-7"} text-white`} />
                              </div>
                            </div>
                          );
                        })()}
                        <div className="absolute inset-0 bg-background/40" />
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted-foreground/90 text-background text-[11px] font-medium shadow-sm">
                            <Lock className="h-3 w-3" /> Locked
                          </span>
                        </div>
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
                        <h3 className={`font-semibold text-foreground mb-2 ${featured ? "text-2xl" : "text-subtitle"}`}>
                          {course.title}
                        </h3>
                        <p className={`text-body-sm text-muted-foreground mb-4 ${featured ? "line-clamp-4" : "line-clamp-2"}`}>
                          {course.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption text-muted-foreground mb-4">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration_minutes} min</span>
                          {moduleCount > 0 && (
                            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{moduleCount} module{moduleCount !== 1 ? "s" : ""}</span>
                          )}
                          {cpd > 0 && (
                            <span className="flex items-center gap-1 text-primary font-medium"><Award className="h-3.5 w-3.5" />{formatCpd(cpd)}</span>
                          )}
                        </div>
                        <div className="mt-auto pt-2 border-t border-border/50">
                          <p className="text-body-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Lock className="h-4 w-4" />
                            Complete <span className="text-foreground">{prereqTitle ?? "the previous course"}</span> (70%+) to unlock
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={course.id}
                    to={status === "completed" && cert ? `/academy/certificate/${cert.share_token}` : `/academy/${course.slug}`}
                    className={cardClassName}
                  >
                    {/* Thumbnail */}
                    <div
                      className={`relative bg-gradient-to-br ${catConfig.gradient} overflow-hidden flex-shrink-0 ${
                        featured
                          ? "aspect-[16/10] md:aspect-auto md:w-2/5 md:min-h-[260px]"
                          : "aspect-[16/9] sm:aspect-[16/10] md:aspect-auto md:h-40"
                      }`}
                    >
                      {(() => {
                        const cover = getCourseCover(course.slug);
                        return cover ? (
                          <img
                            src={cover}
                            alt={course.title}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <>
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
                          </>
                        );
                      })()}

                      {/* Featured badge */}
                      {featured && (
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
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
                        {(() => {
                          if (FREE_ACADEMY_COURSES.has(course.slug)) {
                            return (
                              <Badge variant="outline" className="text-[10px] border-accent/40 text-accent bg-accent/10">
                                Free
                              </Badge>
                            );
                          }
                          if (isPaidCourse(course.slug)) {
                            const cents = convertEurCents(ACADEMY_PRICING[course.slug].eurCents, currency);
                            return (
                              <span className="inline-flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary bg-primary/10">
                                  {formatPrice(cents, currency)}
                                </Badge>
                                <CurrencyIndicator variant="compact" />
                              </span>
                            );
                          }
                          return null;
                        })()}
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
                        {(() => {
                          const isFree = FREE_ACADEMY_COURSES.has(course.slug);
                          const purchased = hasAnnualPass || purchasedSlugs.has(course.slug);
                          const requiresPurchase = !isFree && !purchased;
                          const inCart = cart.has(course.slug);

                          if (status === "completed") {
                            return (
                              <span className="text-body-sm font-semibold text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                View Certificate <Award className="h-4 w-4" />
                              </span>
                            );
                          }
                          if (requiresPurchase) {
                            // Guest-friendly Buy now — adds to cart and opens drawer (no login required).
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!inCart) cart.add(course.slug);
                                  cart.open();
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-body-sm font-semibold hover:bg-primary/90 transition-colors"
                              >
                                <ShoppingBag className="h-4 w-4" />
                                {inCart ? "View basket" : "Buy now"}
                              </button>
                            );
                          }
                          if (!user) {
                            // Free course, not signed in — still needs an account to track progress.
                            return (
                              <span className="text-body-sm font-semibold text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                <LogIn className="h-4 w-4" /> Sign up to start
                              </span>
                            );
                          }
                          if (status === "in-progress") {
                            return (
                              <span className="text-body-sm font-semibold text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                Continue Learning <PlayCircle className="h-4 w-4" />
                              </span>
                            );
                          }
                          return (
                            <span className="text-body-sm font-semibold text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                              Start Course <ArrowRight className="h-4 w-4" />
                            </span>
                          );
                        })()}
                        <button
                          type="button"
                          title="Share on LinkedIn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.worldaml.com/academy/${course.slug}`)}`;
                            window.open(url, "_blank", "noopener,noreferrer");
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
              restCourses.forEach((c) => {
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
                      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
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
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {grouped[catKey].map((c) => renderCard(c))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                { step: "3", title: "Pass the Quiz", desc: "Score 70% or higher to earn your certificate" },
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

      {/* Guest email prompt for annual all-access pass */}
      <Dialog
        open={annualPromptOpen}
        onOpenChange={(open) => {
          setAnnualPromptOpen(open);
          if (!open) setAnnualEmailError(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buy annual access</DialogTitle>
            <DialogDescription>
              Enter your email to start checkout. We'll send your receipt and access link there as soon as payment completes — no account setup required.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const parsed = guestEmailSchema.safeParse(annualGuestEmail);
              if (!parsed.success) {
                setAnnualEmailError(parsed.error.issues[0]?.message ?? "Invalid email");
                return;
              }
              setAnnualEmailError(null);
              setAnnualPromptOpen(false);
              startAnnualCheckout(parsed.data);
            }}
            className="space-y-3"
            noValidate
          >
            <Input
              type="email"
              placeholder="you@example.com"
              value={annualGuestEmail}
              onChange={(e) => {
                setAnnualGuestEmail(e.target.value);
                if (annualEmailError) setAnnualEmailError(null);
              }}
              autoFocus
              maxLength={255}
              aria-invalid={annualEmailError ? true : undefined}
              aria-describedby={annualEmailError ? "annual-email-error" : undefined}
              className={annualEmailError ? "border-destructive focus-visible:ring-destructive" : undefined}
              required
            />
            {annualEmailError && (
              <p id="annual-email-error" role="alert" className="text-caption text-destructive">
                {annualEmailError}
              </p>
            )}
            <Button type="submit" variant="accent" className="w-full" disabled={annualLoading}>
              {annualLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Starting checkout…
                </>
              ) : (
                <>Continue to payment</>
              )}
            </Button>
            <p className="text-caption text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/login" className="underline">Sign in</Link> first for an even faster checkout.
            </p>
          </form>
        </DialogContent>
      </Dialog>
      <StickyMobileCTA
        onAnnualClick={() => startAnnualCheckout()}
        annualLoading={annualLoading}
        annualPriceLabel={formatPrice(convertEurCents(19900, currency), currency)}
      />
    </div>
  );
};

export default Academy;
