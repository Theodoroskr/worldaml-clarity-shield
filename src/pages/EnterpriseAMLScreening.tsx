import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Globe,
  Layers,
  Radar,
  Send,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getWebAttribution } from "@/lib/webAttribution";

/**
 * Enterprise AML Screening — landing page + inline lead form.
 * Targets: enterprise aml screening, aml screening, enterprise sanctions screening.
 * Two-lane positioning: WorldAML platform (workflow) powered by LexisNexis Risk Solutions data.
 */

const leadSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name").max(100),
  lastName: z.string().trim().min(1, "Enter your last name").max(100),
  email: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(1, "Enter your company").max(150),
  jobTitle: z.string().trim().max(100).optional(),
  volume: z.string().max(50).optional(),
  message: z.string().trim().max(1000).optional(),
});

const volumes = ["Under 10k", "10k – 100k", "100k – 1M", "1M+"];

const capabilities = [
  { icon: Database, title: "LexisNexis® risk data", desc: "Sanctions, PEPs, relatives & close associates, enforcement and adverse-media profiles from LexisNexis Risk Solutions — the data tier-one banks rely on." },
  { icon: Globe, title: "1,900+ global lists", desc: "OFAC, OFSI, EU, UN and national regimes in one screening call, refreshed within minutes of publication." },
  { icon: Zap, title: "Real-time & batch", desc: "Onboarding and payment screening via API, plus bulk file screening for portfolios of any size." },
  { icon: Radar, title: "Ongoing monitoring", desc: "Daily rescreening against list changes — your team reviews only what changed, not the whole base." },
  { icon: Users, title: "Case management & four-eyes", desc: "Alert queues, escalation, dual review and disposition codes built into the WorldAML platform." },
  { icon: Shield, title: "Audit-ready evidence", desc: "Every screen logs list version, thresholds, reviewer and decision — export-ready for regulators and auditors." },
];

const enterpriseItems = [
  "Dedicated onboarding and matching-threshold tuning",
  "SSO, role-based access and multi-entity organisations",
  "Negotiated volume pricing — no per-seat surprises",
  "EU and global data residency options",
  "Named account manager and priority support SLA",
  "API, SFTP batch and web platform on one contract",
];

const faqs = [
  { q: "What is enterprise AML screening?", a: "Screening customers and transactions against sanctions, PEP and adverse-media lists as part of an anti-money-laundering programme. Enterprise AML screening adds the volume, controls and audit evidence regulated firms need: case management, four-eyes review, SSO and full audit trails." },
  { q: "Which data and lists does it screen against?", a: "1,900+ global lists supplied by LexisNexis Risk Solutions — OFAC, OFSI, EU, UN and national regimes, PEPs, relatives & close associates, enforcement and adverse-media profiles — refreshed within minutes of publication." },
  { q: "What are the best AML screening tools for enterprises?", a: "Look for tier-one data coverage, tunable fuzzy matching, API plus batch screening, daily monitoring, case management and regulator-ready audit logs. WorldAML Enterprise combines all of these on one platform, powered by LexisNexis® data." },
  { q: "How do you reduce false positives in AML screening?", a: "Tunable name-matching thresholds, screening against the right list set for your risk profile, and workflow that surfaces only real hits for review. The WorldAML platform lets compliance teams tune matching per entity type and monitor only what changes." },
  { q: "Can we screen at scale — API, batch or both?", a: "Yes: real-time API screening for onboarding and payments, SFTP/file batch screening for large portfolios, and daily rescreening against list changes — all on one contract." },
  { q: "How fast can we go live?", a: "Most teams start screening through the web platform within days. API and batch integrations typically take two to four weeks, including threshold tuning." },
  { q: "Can we try it first?", a: "Yes — run a free sanctions search today, then request a demo for a guided trial on your own sample data." },
];

const EnterpriseAMLScreening = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", company: "", jobTitle: "", volume: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    const errs: Record<string, string> = {};
    if (!parsed.success) parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
    if (!terms) errs.terms = "Please accept the Terms & Conditions and Privacy Policy.";
    setErrors(errs);
    if (Object.keys(errs).length || !parsed.success) return;

    setSubmitting(true);
    const ts = new Date().toISOString();
    const d = parsed.data;
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({
          form_type: "contact-sales",
          first_name: d.firstName,
          last_name: d.lastName,
          email: d.email,
          company: d.company,
          job_title: d.jobTitle || null,
          message: [
            "Source: Enterprise AML Screening page",
            d.volume ? `Annual screening volume: ${d.volume}` : null,
            d.message || null,
          ].filter(Boolean).join("\n"),
          products: ["worldaml-suite", "worldcompliance"],
          metadata: {
            landing_page: "/enterprise-aml-screening",
            screening_volume: d.volume || null,
            attribution: getWebAttribution(),
            terms_accepted: true,
            terms_accepted_at: ts,
            marketing_consent: marketing,
            marketing_consent_at: marketing ? ts : null,
            consent_timestamp: ts,
            consent_text:
              "I accept the Terms & Conditions and the Privacy Policy." +
              (marketing ? " I'd like to receive marketing communications about WorldAML products, events and regulatory updates." : ""),
          },
        }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or email sales.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name: keyof typeof form, label: string, type = "text", required = true) => (
    <div className="space-y-1.5">
      <Label htmlFor={`ent-${name}`}>{label}{required && " *"}</Label>
      <Input id={`ent-${name}`} name={name} type={type} value={form[name]} onChange={onChange} maxLength={255} aria-invalid={!!errors[name]} />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WorldAML Enterprise AML Screening",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Enterprise AML screening across 1,900+ global lists, powered by LexisNexis Risk Solutions data. Sanctions, PEP and adverse-media checks via API, batch and daily monitoring.",
    url: "https://worldaml.com/enterprise-aml-screening",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Enterprise AML Screening — LexisNexis® Data | WorldAML"
        description="Enterprise AML screening across 1,900+ global lists, powered by LexisNexis® data. Sanctions, PEP and adverse-media checks via API, batch and daily monitoring."
        canonical="/enterprise-aml-screening"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Enterprise AML Screening", url: "/enterprise-aml-screening" },
        ]}
        structuredData={[softwareLd]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero + lead form */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
            <div>
              <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">Enterprise AML Screening</p>
              <h1 className="text-headline text-navy mb-6">
                Enterprise AML screening — the WorldAML platform, powered by LexisNexis® data
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                Screen customers, counterparties and payments against 1,900+ sanctions, PEP and
                adverse-media lists. Tier-one LexisNexis Risk Solutions data, with WorldAML's
                workflow, case management and audit trail — without legacy enterprise pricing.
              </p>
              <ul className="space-y-3 mb-8">
                {["LexisNexis® Risk Solutions watchlist & PEP data", "Real-time API, batch and ongoing monitoring", "Four-eyes review and regulator-ready evidence"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-text-secondary">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />{t}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" asChild>
                <Link to="/sanctions-check">Try a free sanctions search <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>

            <Card id="enterprise-demo" className="shadow-lg scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-navy">Request an enterprise demo</CardTitle>
                <CardDescription>A screening specialist will reply within 1 business day.</CardDescription>
              </CardHeader>
              <CardContent>
                {done ? (
                  <div className="text-center py-10" role="status">
                    <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
                    <p className="text-lg font-semibold text-navy mb-2">Thanks — request received</p>
                    <p className="text-text-secondary">We'll be in touch within 1 business day to schedule your demo.</p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-4" noValidate>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {field("firstName", "First name")}
                      {field("lastName", "Last name")}
                    </div>
                    {field("email", "Work email", "email")}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {field("company", "Company")}
                      {field("jobTitle", "Job title", "text", false)}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Annual screening volume</Label>
                      <div className="flex flex-wrap gap-2">
                        {volumes.map((v) => (
                          <Button key={v} type="button" size="sm" variant={form.volume === v ? "accent" : "outline"}
                            onClick={() => setForm((p) => ({ ...p, volume: p.volume === v ? "" : v }))}>
                            {v}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ent-message">What do you need to screen?</Label>
                      <Textarea id="ent-message" name="message" rows={3} maxLength={1000} value={form.message} onChange={onChange}
                        placeholder="e.g. customer onboarding, payments, existing portfolio rescreening" />
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox id="ent-terms" checked={terms} onCheckedChange={(c) => setTerms(c === true)} />
                      <Label htmlFor="ent-terms" className="text-sm font-normal leading-snug">
                        I accept the <Link to="/terms" className="underline">Terms & Conditions</Link> and the{" "}
                        <Link to="/privacy" className="underline">Privacy Policy</Link>. *
                      </Label>
                    </div>
                    {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
                    <div className="flex items-start gap-2">
                      <Checkbox id="ent-mkt" checked={marketing} onCheckedChange={(c) => setMarketing(c === true)} />
                      <Label htmlFor="ent-mkt" className="text-sm font-normal leading-snug text-text-secondary">
                        Send me product news and regulatory updates (optional).
                      </Label>
                    </div>
                    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
                      {submitting ? "Sending…" : <>Request demo <Send className="ml-2 h-4 w-4" /></>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Two-lane explainer */}
        <section className="section-padding">
          <div className="container-enterprise">
            <h2 className="text-title text-navy mb-4 max-w-3xl">Best-in-class data. A platform built for your team.</h2>
            <p className="text-body-lg text-text-secondary mb-10 max-w-3xl">
              LexisNexis Risk Solutions supplies the risk intelligence. WorldAML turns it into a
              working compliance operation — screening, alerts, review and evidence in one place.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Database className="h-8 w-8 text-accent mb-2" />
                  <CardTitle className="text-navy">The data: LexisNexis® Risk Solutions</CardTitle>
                </CardHeader>
                <CardContent className="text-text-secondary">
                  Global sanctions, PEPs, relatives and close associates, enforcement actions and
                  adverse media — researched and maintained by one of the world's largest risk
                  data providers.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Layers className="h-8 w-8 text-accent mb-2" />
                  <CardTitle className="text-navy">The platform: WorldAML</CardTitle>
                </CardHeader>
                <CardContent className="text-text-secondary">
                  Matching, alert queues, four-eyes review, ongoing monitoring, reporting and a
                  full audit trail — via web platform, API or batch files.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-title text-navy mb-10">Everything enterprise screening needs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map(({ icon: Icon, title, desc }) => (
                <Card key={title}>
                  <CardHeader>
                    <Icon className="h-7 w-7 text-accent mb-2" />
                    <CardTitle className="text-lg text-navy">{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-text-secondary">{desc}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise terms */}
        <section className="section-padding">
          <div className="container-enterprise grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-title text-navy mb-4">Built for regulated enterprises</h2>
              <p className="text-body-lg text-text-secondary">
                Banks, payment providers, crypto firms, iGaming operators and legal practices use
                WorldAML to consolidate screening vendors onto a single contract.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-4">
              {enterpriseItems.map((t) => (
                <li key={t} className="flex items-start gap-3 text-text-secondary">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />{t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-title text-navy mb-8">Enterprise AML screening FAQs</h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="font-semibold text-navy mb-2">{f.q}</h3>
                  <p className="text-text-secondary">{f.a}</p>
                </div>
              ))}
            </div>
            <Button variant="accent" size="lg" className="mt-10" asChild>
              <a href="#enterprise-demo">Request an enterprise demo</a>
            </Button>
          </div>
        </section>

        <RelatedGuidesSection
          currentPath="/enterprise-aml-screening"
          intro="Explore screening in more depth."
          links={[
            GUIDE_LINKS.platformScreening,
            GUIDE_LINKS.whatIsSanctions,
            GUIDE_LINKS.sanctionsLists,
            GUIDE_LINKS.worldCheckAlt,
            GUIDE_LINKS.compareProviders,
            GUIDE_LINKS.amlChecklist,
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default EnterpriseAMLScreening;
