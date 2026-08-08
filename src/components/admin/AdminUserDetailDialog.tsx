import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, Sparkles, Euro, GraduationCap, Building2, Handshake, ShieldAlert } from "lucide-react";
import { recommendUpsell, UpsellTemplate } from "@/lib/upsellRecommendation";
import { buildUpsellOptions, type UpsellOption, type CourseRow } from "@/lib/upsellCatalog";

export interface RevenueItem {
  source: "academy" | "product";
  label: string;
  amountCents: number;
  currency: string;
  status: string;
  date: string | null;
}

interface Props {
  profile: Record<string, any> | null;
  revenue: { total: number; currency: string; items: RevenueItem[] };
  roles: string[];
  onClose: () => void;
  onSendUpsell: (template: UpsellTemplate, templateData?: Record<string, any>) => void;
}

const money = (cents: number, currency = "EUR") =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);

const Field = ({ label, value }: { label: string; value: any }) => (
  <div className="space-y-0.5">
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-sm text-foreground break-words">
      {value === null || value === undefined || value === "" ? "—" : String(value)}
    </div>
  </div>
);

export default function AdminUserDetailDialog({ profile, revenue, roles, onClose, onSendUpsell }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [business, setBusiness] = useState<any[]>([]);
  const [partner, setPartner] = useState<any | null>(null);
  const [upsellLog, setUpsellLog] = useState<any[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      setLoading(true);
      const uid = profile.user_id;
      const email = (profile.email || "").toLowerCase();
      const [pg, ce, bm, pt, ul, co, pu] = await Promise.all([
        uid ? supabase.from("academy_progress").select("*").eq("user_id", uid) : Promise.resolve({ data: [] } as any),
        uid ? supabase.from("academy_certificates").select("*").eq("user_id", uid) : Promise.resolve({ data: [] } as any),
        email ? supabase.from("business_members").select("id, business_account_id, role, status, academy_seat, products").eq("email", email) : Promise.resolve({ data: [] } as any),
        uid ? supabase.from("partners").select("id, company_name, status, certification_level, partner_type").eq("user_id", uid).maybeSingle() : Promise.resolve({ data: null } as any),
        supabase.from("admin_upsell_email_log").select("id, template_id, created_at").or(
          uid ? `recipient_user_id.eq.${uid},recipient_email.eq.${email}` : `recipient_email.eq.${email}`,
        ).order("created_at", { ascending: false }),
        supabase.from("academy_courses").select("id, slug, title, description, category, difficulty, cpd_hours, price_eur_cents, is_published").eq("is_published", true).order("sort_order"),
        uid ? supabase.from("academy_course_purchases").select("course_id, status").eq("user_id", uid) : Promise.resolve({ data: [] } as any),
      ]);
      if (!active) return;
      setProgress((pg as any).data || []);
      setCerts((ce as any).data || []);
      setBusiness((bm as any).data || []);
      setPartner((pt as any).data || null);
      setUpsellLog((ul as any).data || []);
      setCourses(((co as any).data || []) as CourseRow[]);
      setPurchases((pu as any).data || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile?.id]);

  if (!profile) return null;

  const rec = recommendUpsell({
    subscription_tier: profile.subscription_tier,
    status: profile.status,
    revenueCents: revenue.total,
    academyPurchases: revenue.items.filter((i) => i.source === "academy" && i.status === "paid").length,
    industry: profile.industry,
    company_size: profile.company_size,
    seniority: profile.seniority,
    regulator: profile.regulator,
    marketing_opt_out_at: profile.marketing_opt_out_at,
  });

  const optedOut = !!profile.marketing_opt_out_at;

  const ownedCourseIds = new Set<string>([
    ...purchases.filter((p) => p.status === "paid").map((p) => p.course_id),
    ...progress.map((p) => p.course_id),
  ]);
  const ownedSlugs = new Set(
    courses.filter((c) => c.id && ownedCourseIds.has(c.id)).map((c) => c.slug),
  );
  const isBusiness = !!profile.company_name || business.length > 0 ||
    ["business", "suite", "enterprise"].includes(String(profile.subscription_tier || "").toLowerCase());

  const options: UpsellOption[] = buildUpsellOptions({
    isBusiness,
    courses,
    ownedSlugs,
    signals: {
      interest_area: profile.interest_area,
      industry: profile.industry,
      regulator: profile.regulator,
      company_name: profile.company_name,
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {profile.full_name || profile.email}
            <Badge variant="outline" className="text-[10px] capitalize">{profile.subscription_tier}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{profile.status}</Badge>
            {roles.map((r) => <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Euro className="w-3.5 h-3.5" /> Lifetime revenue</div>
            <div className="text-xl font-bold text-foreground">{money(revenue.total, revenue.currency)}</div>
            <div className="text-[11px] text-muted-foreground">{revenue.items.filter(i => i.status === "paid").length} paid transaction(s)</div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><GraduationCap className="w-3.5 h-3.5" /> Academy</div>
            <div className="text-xl font-bold text-foreground">{certs.length}</div>
            <div className="text-[11px] text-muted-foreground">{progress.length} course(s) in progress · {certs.length} certificate(s)</div>
          </div>
          <div className={`rounded-lg border p-3 ${optedOut ? "border-red-200 bg-red-50/60" : "border-border"}`}>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldAlert className="w-3.5 h-3.5" /> Marketing consent</div>
            <div className={`text-sm font-semibold ${optedOut ? "text-red-700" : "text-emerald-700"}`}>
              {optedOut ? "Opted out" : profile.marketing_consent ? "Opted in" : "No consent recorded"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {optedOut
                ? `Unsubscribed ${new Date(profile.marketing_opt_out_at).toLocaleDateString()}`
                : profile.marketing_consent_at
                  ? `Since ${new Date(profile.marketing_consent_at).toLocaleDateString()}`
                  : "—"}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-teal-800">
            <Sparkles className="w-4 h-4" /> Recommended next play: {rec.title}
          </div>
          <p className="text-xs text-teal-900/80">{rec.rationale}</p>
          <ul className="text-xs text-teal-900/80 list-disc pl-4 space-y-0.5">
            {rec.nextSteps.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" disabled={rec.blocked} onClick={() => onSendUpsell(rec.template)}>
              <Send className="w-3.5 h-3.5 mr-1" /> Send {rec.template === "suite-upsell" ? "Suite" : "Screening"} upsell
            </Button>
            {rec.blocked && <span className="text-xs text-red-700">{rec.blockedReason}</span>}
          </div>
        </div>

        <Tabs defaultValue="profile" className="mt-2">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="revenue">Revenue ({revenue.items.length})</TabsTrigger>
            <TabsTrigger value="academy">Academy ({progress.length + certs.length})</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            <TabsTrigger value="marketing">Marketing ({upsellLog.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-3 sm:grid-cols-3 rounded-lg border border-border p-3">
              <Field label="Full name" value={profile.full_name} />
              <Field label="Email" value={profile.email} />
              <Field label="Phone" value={profile.phone} />
              <Field label="Company" value={profile.company_name} />
              <Field label="Job title" value={profile.job_title} />
              <Field label="Department" value={profile.department} />
              <Field label="Industry" value={profile.industry} />
              <Field label="Company size" value={profile.company_size} />
              <Field label="Seniority" value={profile.seniority} />
              <Field label="Interest area" value={profile.interest_area} />
              <Field label="Country" value={profile.country} />
              <Field label="City" value={profile.city} />
              <Field label="Billing address" value={profile.billing_address} />
              <Field label="Postal code" value={profile.postal_code} />
              <Field label="VAT number" value={profile.vat_number} />
              <Field label="Regulator" value={profile.regulator} />
              <Field label="Registered" value={profile.created_at ? new Date(profile.created_at).toLocaleString() : null} />
              <Field label="Signup source" value={profile.signup_source} />
              <Field label="Landing page" value={profile.signup_landing_path} />
              <Field label="Referrer" value={profile.signup_referrer} />
              <Field label="UTM" value={profile.signup_utm ? JSON.stringify(profile.signup_utm) : null} />
              <Field label="Terms accepted" value={profile.terms_accepted_at ? new Date(profile.terms_accepted_at).toLocaleString() : null} />
              <Field label="GDPR consent" value={profile.gdpr_consent_at ? new Date(profile.gdpr_consent_at).toLocaleString() : null} />
              <Field label="Suite access granted" value={profile.suite_access_granted_at ? new Date(profile.suite_access_granted_at).toLocaleString() : null} />
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Item</th>
                    <th className="text-left px-3 py-2">Source</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-right px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {revenue.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{i.label}</td>
                      <td className="px-3 py-2 capitalize text-xs text-muted-foreground">{i.source}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={`text-[10px] ${i.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}`}>{i.status}</Badge>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{i.date ? new Date(i.date).toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2 text-right font-medium">{money(i.amountCents, i.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {revenue.items.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">No transactions recorded.</div>}
            </div>
          </TabsContent>

          <TabsContent value="academy">
            {loading ? <div className="py-6 flex justify-center"><Loader2 className="w-4 h-4 animate-spin" /></div> : (
              <div className="space-y-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold mb-2">Course progress</p>
                  {progress.length === 0 ? <p className="text-xs text-muted-foreground">No course activity.</p> : (
                    <ul className="space-y-1 text-xs">
                      {progress.map((p) => (
                        <li key={p.id} className="flex justify-between gap-2">
                          <span className="text-foreground">{p.course_id}</span>
                          <span className="text-muted-foreground">
                            {p.completed_at ? `Completed ${new Date(p.completed_at).toLocaleDateString()}` : `${(p.completed_modules || []).length} module(s) done`}{p.quiz_score != null ? ` · quiz ${p.quiz_score}%` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold mb-2">Certificates</p>
                  {certs.length === 0 ? <p className="text-xs text-muted-foreground">No certificates issued.</p> : (
                    <ul className="space-y-1 text-xs">
                      {certs.map((c) => (
                        <li key={c.id} className="flex justify-between gap-2">
                          <span>{c.course_id}{c.score != null ? ` · ${c.score}%` : ""}</span>
                          <span className="text-muted-foreground">{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : ""}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="workspaces">
            <div className="space-y-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Business memberships</p>
                {business.length === 0 ? <p className="text-xs text-muted-foreground">Not part of a business account.</p> : (
                  <ul className="space-y-1 text-xs">
                    {business.map((b) => (
                      <li key={b.id}>
                        {b.role} · {b.status} · Academy seat: {b.academy_seat ? "yes" : "no"} · Products: {(b.products || []).join(", ") || "—"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Handshake className="w-3.5 h-3.5" /> Partner record</p>
                {!partner ? <p className="text-xs text-muted-foreground">Not a partner.</p> : (
                  <p className="text-xs">{partner.company_name} · {partner.partner_type} · {partner.status} · {partner.certification_level}</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marketing">
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-xs">
                Consent status:{" "}
                <span className={optedOut ? "text-red-700 font-semibold" : "text-emerald-700 font-semibold"}>
                  {optedOut ? "Unsubscribed from marketing communications" : profile.marketing_consent ? "Opted in" : "No consent recorded"}
                </span>
              </p>
              {optedOut && <p className="text-xs text-muted-foreground">Do not include this user in campaigns or upsell sends.</p>}
              <p className="text-xs font-semibold pt-1">Upsell emails sent</p>
              {upsellLog.length === 0 ? <p className="text-xs text-muted-foreground">None sent.</p> : (
                <ul className="space-y-1 text-xs">
                  {upsellLog.map((l) => (
                    <li key={l.id} className="flex justify-between gap-2">
                      <span>{l.template_id}</span>
                      <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
