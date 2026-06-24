import { useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Award,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Copy,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademyPurchases, ANNUAL_PASS_SLUG } from "@/hooks/useAcademyPurchases";
import { FREE_ACADEMY_COURSES } from "@/data/academyPricing";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  duration_minutes: number | null;
  is_published: boolean;
};

type ModuleCountRow = { course_id: string; module_count: number };

type ReceiptInfo = {
  session_id: string;
  payment_status: string | null;
  amount_total: number | null;
  currency: string | null;
  payment_intent_id: string | null;
  charge_id: string | null;
  receipt_url: string | null;
  receipt_number: string | null;
  invoice_number: string | null;
  invoice_hosted_url: string | null;
  invoice_pdf: string | null;
};

const AcademyAnnualSuccess = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { hasAnnualPass, isLoading: purchasesLoading, refetch } = useAcademyPurchases();

  const { data: receipt, isLoading: receiptLoading } = useQuery({
    queryKey: ["annual-pass-receipt", sessionId],
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-academy-annual-receipt", {
        body: { session_id: sessionId },
      });
      if (error) throw error;
      return data as ReceiptInfo;
    },
  });

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  // Webhook is async — poll for the pass row for ~30s after redirect.
  useEffect(() => {
    if (hasAnnualPass) return;
    const id = setInterval(() => refetch(), 3000);
    const stop = setTimeout(() => clearInterval(id), 30000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [hasAnnualPass, refetch]);

  // Pull the active annual-pass row directly so we can show the exact expiry.
  const { data: passRow } = useQuery({
    queryKey: ["annual-pass-row", user?.id],
    enabled: !!user?.id,
    refetchInterval: hasAnnualPass ? false : 3000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_course_purchases")
        .select("expires_at, paid_at, amount_cents, currency, status")
        .eq("user_id", user!.id)
        .eq("course_slug", ANNUAL_PASS_SLUG)
        .eq("status", "paid")
        .order("paid_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["academy-courses-public-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("id, slug, title, category, duration_minutes, is_published")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as CourseRow[];
    },
  });

  const { data: moduleCounts } = useQuery({
    queryKey: ["academy-module-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_academy_module_counts");
      if (error) throw error;
      return (data || []) as ModuleCountRow[];
    },
  });

  const moduleCountByCourseId = useMemo(() => {
    const map = new Map<string, number>();
    (moduleCounts ?? []).forEach((r) => map.set(r.course_id, Number(r.module_count) || 0));
    return map;
  }, [moduleCounts]);

  const totalCourses = courses?.length ?? 0;
  const totalModules = useMemo(
    () => (moduleCounts ?? []).reduce((sum, r) => sum + (r.module_count ?? 0), 0),
    [moduleCounts],
  );

  // Redirect away if not signed in (annual pass requires login).
  useEffect(() => {
    if (!authLoading && !user) navigate("/login?redirect=/academy/annual-pass-active");
  }, [authLoading, user, navigate]);

  const expiresAt = passRow?.expires_at ? new Date(passRow.expires_at) : null;
  const paidAt = passRow?.paid_at ? new Date(passRow.paid_at) : null;

  const waitingForWebhook = !purchasesLoading && !hasAnnualPass;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Annual Pass Active — WorldAML Academy"
        description="Your WorldAML Academy annual all-access pass is now active. View your expiry date and all the courses included."
        noindex
      />
      <Header />
      <main>
        {/* Hero / confirmation */}
        <section className="bg-gradient-to-b from-accent/10 via-background to-background border-b border-border">
          <div className="container-enterprise section-padding">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/15 text-accent mb-5">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <Badge className="bg-accent text-accent-foreground mb-3">
                <Crown className="h-3.5 w-3.5 mr-1" /> Annual pass active
              </Badge>
              <h1 className="text-display font-bold text-foreground mb-3">
                You're in. Welcome to full Academy access.
              </h1>
              <p className="text-body-lg text-muted-foreground mb-6">
                Your payment is confirmed. Every paid course, every module, every certificate — all
                unlocked for the next 12 months.
              </p>

              {waitingForWebhook ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted text-body-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finalising your access — this usually takes a few seconds.
                </div>
              ) : null}

              {/* Pass details card */}
              <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-caption text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Activated
                    </p>
                    <p className="text-body font-semibold text-foreground">
                      {paidAt ? format(paidAt, "d MMM yyyy") : "—"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-accent/40">
                  <CardContent className="p-4">
                    <p className="text-caption text-muted-foreground mb-1 flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5" /> Expires
                    </p>
                    <p className="text-body font-semibold text-foreground">
                      {expiresAt ? format(expiresAt, "d MMM yyyy") : "—"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-caption text-muted-foreground mb-1 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> Unlocked
                    </p>
                    <p className="text-body font-semibold text-foreground">
                      {totalCourses} courses · {totalModules || "—"} modules
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button asChild variant="accent" size="lg">
                  <Link to="/academy#courses-grid">
                    Browse all courses
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/dashboard">Go to my dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Receipt / invoice */}
        {sessionId ? (
          <section className="bg-muted/30 border-b border-border">
            <div className="container-enterprise section-padding">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Receipt className="h-5 w-5 text-accent" />
                  <h2 className="text-headline font-semibold text-foreground">
                    Receipt & transaction reference
                  </h2>
                </div>
                <p className="text-body-sm text-muted-foreground mb-5">
                  Keep these for your records. The Stripe receipt and (if available) VAT invoice
                  can be downloaded as a PDF.
                </p>

                <Card>
                  <CardContent className="p-5 space-y-4">
                    {receiptLoading ? (
                      <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading transaction details…
                      </div>
                    ) : !receipt ? (
                      <p className="text-body-sm text-muted-foreground">
                        Transaction details aren't available right now. Please refresh in a moment.
                      </p>
                    ) : (
                      <>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { label: "Checkout session", value: receipt.session_id },
                            { label: "Payment intent", value: receipt.payment_intent_id },
                            { label: "Charge ID", value: receipt.charge_id },
                            { label: "Receipt number", value: receipt.receipt_number },
                            { label: "Invoice number", value: receipt.invoice_number },
                          ]
                            .filter((r) => !!r.value)
                            .map((r) => (
                              <div
                                key={r.label}
                                className="rounded-md border border-border bg-background p-3"
                              >
                                <p className="text-caption text-muted-foreground mb-1">{r.label}</p>
                                <div className="flex items-center gap-2">
                                  <code className="text-caption font-mono text-foreground truncate">
                                    {r.value}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(r.value!, r.label)}
                                    className="ml-auto text-muted-foreground hover:text-foreground shrink-0"
                                    aria-label={`Copy ${r.label}`}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {receipt.receipt_url ? (
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={receipt.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Receipt className="h-4 w-4 mr-1.5" />
                                View Stripe receipt
                                <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </a>
                            </Button>
                          ) : null}
                          {receipt.invoice_hosted_url ? (
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={receipt.invoice_hosted_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText className="h-4 w-4 mr-1.5" />
                                View invoice
                                <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </a>
                            </Button>
                          ) : null}
                          {receipt.invoice_pdf ? (
                            <Button asChild variant="accent" size="sm">
                              <a href={receipt.invoice_pdf} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1.5" />
                                Download invoice PDF
                              </a>
                            </Button>
                          ) : null}
                          {!receipt.receipt_url && !receipt.invoice_hosted_url ? (
                            <p className="text-caption text-muted-foreground">
                              A receipt link will be emailed to you by Stripe shortly.
                            </p>
                          ) : null}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        ) : null}



        {/* What's included */}
        <section className="bg-background border-b border-border">
          <div className="container-enterprise section-padding">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-headline font-semibold text-foreground">
                    What you can access now
                  </h2>
                  <p className="text-body-sm text-muted-foreground mt-1">
                    Every course below is unlocked end-to-end — modules, quiz, and certificate.
                  </p>
                </div>
                <Sparkles className="h-6 w-6 text-accent hidden sm:block" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(courses ?? []).map((c) => {
                  const isFree = FREE_ACADEMY_COURSES.has(c.slug);
                  const mods = moduleCountByCourseId.get(c.id);
                  return (
                    <Link
                      key={c.slug}
                      to={`/academy/${c.slug}`}
                      className="group rounded-lg border border-border bg-card p-4 hover:border-accent/60 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-body font-semibold text-foreground group-hover:text-accent line-clamp-2">
                          {c.title}
                        </h3>
                        {isFree ? (
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            Free
                          </Badge>
                        ) : (
                          <Badge className="shrink-0 text-[10px] bg-accent/15 text-accent border-0">
                            Included
                          </Badge>
                        )}
                      </div>
                      <p className="text-caption text-muted-foreground flex items-center gap-3">
                        {mods ? (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> {mods} modules
                          </span>
                        ) : null}
                        {c.duration_minutes ? (
                          <span>{Math.round((c.duration_minutes / 60) * 10) / 10}h</span>
                        ) : null}
                        {c.category ? <span className="capitalize">{c.category}</span> : null}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {/* Benefits reminder */}
              <div className="mt-10 grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Award, text: "All CPD certificates and the MLRO Toolkit included" },
                  { icon: Sparkles, text: "Priority access to new courses added during your year" },
                  { icon: RefreshCw, text: "Certificates you earn never expire — even after the pass ends" },
                  { icon: Crown, text: "Cancel anytime, keep every certificate you've earned" },
                ].map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="flex gap-3 items-start rounded-lg border border-border p-4 bg-card">
                      <Icon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-body-sm text-foreground">{b.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyAnnualSuccess;
