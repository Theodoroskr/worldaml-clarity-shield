import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  FileSpreadsheet,
  Lock,
  ShieldCheck,
  Sparkles,
  Award,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type Template = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  file_format: string;
  file_url: string;
  file_size_kb: number | null;
  jurisdictions: string[];
  sort_order: number;
};

const categoryLabel: Record<string, string> = {
  governance: "Governance",
  "risk-assessment": "Risk Assessment",
  monitoring: "Monitoring",
  policy: "Policy",
};

const categoryColor: Record<string, string> = {
  governance: "bg-sky-100 text-sky-700 border-sky-200",
  "risk-assessment": "bg-amber-100 text-amber-700 border-amber-200",
  monitoring: "bg-violet-100 text-violet-700 border-violet-200",
  policy: "bg-slate-100 text-slate-700 border-slate-200",
};

const formatIcon = (fmt: string) => {
  if (fmt === "xlsx" || fmt === "xls") return FileSpreadsheet;
  return FileText;
};

const AcademyTemplates = () => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["academy-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_templates")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data as Template[];
    },
  });

  // Pro access = user has any issued certificate (proxy for "Pro toolkit" entitlement)
  // This will be replaced by Stripe-backed academy_pro_certificates check once checkout ships.
  const { data: hasProAccess } = useQuery({
    queryKey: ["academy-pro-access", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("academy_certificates")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      if (error) throw error;
      return (count ?? 0) > 0;
    },
  });

  const handleDownload = async (template: Template) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Create a free account to access the toolkit." });
      return;
    }
    if (!hasProAccess) {
      toast({
        title: "Pro Toolkit locked",
        description: "Pass any Academy course quiz to unlock all MLRO templates.",
      });
      return;
    }
    setDownloading(template.id);
    try {
      const { data, error } = await supabase.storage
        .from("academy-templates")
        .createSignedUrl(template.file_url, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message ?? "Try again later.", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  const locked = !user || !hasProAccess;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Free MLRO Templates — Board Report, Risk Assessment & SAR Log | WorldAML"
        description="Download regulator-ready MLRO templates: board reports, enterprise risk assessment, suspicious activity log. Unlock the Pro Toolkit by completing any Academy course."
        canonical="/academy/templates"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Academy", url: "/academy" },
          { name: "Templates", url: "/academy/templates" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-navy overflow-hidden">
          <div className="container-enterprise section-padding relative">
            <Link
              to="/academy"
              className="inline-flex items-center gap-1 text-slate-light/70 hover:text-white text-body-sm mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Academy
            </Link>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-light/15 border border-teal-light/30 text-teal-light text-body-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Pro Toolkit
              </div>
              <h1 className="text-display text-primary-foreground mb-4">
                MLRO Templates Library
              </h1>
              <p className="text-body-lg text-slate-light mb-8 max-w-2xl">
                Regulator-ready Word and Excel templates built by compliance practitioners.
                Editable, branded, and aligned with FATF, 6AMLD, FCA, and MOKAS guidance —
                save weeks of drafting time.
              </p>
              <div className="flex flex-wrap gap-6 text-body-sm text-slate-light">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-light" /> Practitioner-built
                </span>
                <span className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-teal-light" /> Audit-ready
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-light" /> Editable .docx / .xlsx
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Unlock banner */}
        {locked && (
          <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20">
            <div className="container-enterprise py-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-foreground">
                      {user
                        ? "Unlock the full MLRO Toolkit"
                        : "Sign in to unlock the MLRO Toolkit"}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {user
                        ? "Complete and pass any Academy course quiz to unlock all templates — included free with your certificate."
                        : "Free account + pass any Academy quiz unlocks all MLRO templates."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!user && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/login">Sign in</Link>
                    </Button>
                  )}
                  <Button asChild size="sm">
                    <Link to="/academy">
                      Browse Courses <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Templates grid */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card h-72 animate-pulse"
                  />
                ))}
              </div>
            ) : !templates?.length ? (
              <p className="text-center text-muted-foreground">No templates available yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((t) => {
                  const Icon = formatIcon(t.file_format);
                  return (
                    <Card
                      key={t.id}
                      className="flex flex-col hover:shadow-lg transition-shadow relative overflow-hidden"
                    >
                      {locked && (
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/80 text-background text-xs font-semibold backdrop-blur">
                          <Lock className="h-3 w-3" /> Pro
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <Badge
                            variant="outline"
                            className={categoryColor[t.category] ?? categoryColor.policy}
                          >
                            {categoryLabel[t.category] ?? t.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-snug">{t.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {t.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto space-y-4">
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground uppercase font-mono">
                            .{t.file_format}
                          </span>
                          {t.file_size_kb && (
                            <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                              {t.file_size_kb} KB
                            </span>
                          )}
                          {t.jurisdictions.slice(0, 3).map((j) => (
                            <span
                              key={j}
                              className="px-2 py-0.5 rounded bg-secondary text-muted-foreground"
                            >
                              {j}
                            </span>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleDownload(t)}
                          disabled={downloading === t.id}
                          className="w-full"
                          variant={locked ? "outline" : "default"}
                        >
                          {locked ? (
                            <>
                              <Lock className="h-4 w-4" /> Unlock to Download
                            </>
                          ) : downloading === t.id ? (
                            "Preparing…"
                          ) : (
                            <>
                              <Download className="h-4 w-4" /> Download
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Why these templates */}
        <section className="bg-secondary/30 section-padding">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-headline text-foreground mb-8 text-center">
              Why MLROs use these templates
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Regulator-aligned",
                  body: "Built around FATF, 6AMLD, FCA, MOKAS, and FINTRAC expectations.",
                },
                {
                  icon: FileText,
                  title: "Save weeks of drafting",
                  body: "Skip the blank page — start from a proven structure used by compliance teams.",
                },
                {
                  icon: Award,
                  title: "Audit-ready format",
                  body: "Clear sections, version control fields, and sign-off blocks examiners expect.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-card border border-border rounded-xl p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="text-body-sm text-muted-foreground mb-4">
                Want to generate these documents automatically from live data?
              </p>
              <Button asChild variant="outline">
                <Link to="/platform/regulatory-reporting">
                  Explore WorldAML Suite Reporting <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyTemplates;
