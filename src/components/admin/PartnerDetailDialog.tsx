import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download } from "lucide-react";

type Props = {
  partner: any | null;
  application?: any | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const eur = (n: number) => `€${Number(n || 0).toLocaleString()}`;
const dt = (s?: string | null) => (s ? new Date(s).toLocaleDateString("en-GB") : "—");

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground py-6 text-center">{children}</p>;
}

export default function PartnerDetailDialog({ partner, application, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!open || !partner?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const id = partner.id;
      const [refs, deals, comms, payouts, downloads, seats, specs, contacts, events, audit] = await Promise.all([
        supabase.from("referrals").select("*").eq("partner_id", id).order("created_at", { ascending: false }),
        supabase.from("deal_registrations").select("*").eq("partner_id", id).order("created_at", { ascending: false }),
        supabase.from("partner_commissions").select("*").eq("partner_id", id).order("earned_on", { ascending: false }),
        supabase.from("partner_payouts").select("*").eq("partner_id", id).order("created_at", { ascending: false }),
        supabase.from("partner_asset_events").select("*").eq("partner_id", id).order("created_at", { ascending: false }).limit(200),
        supabase.from("partner_academy_seats").select("*").eq("partner_id", id).order("created_at", { ascending: true }),
        supabase.from("partner_specialisations").select("*").eq("partner_id", id),
        supabase.from("partner_contacts").select("*").eq("partner_id", id).order("created_at", { ascending: true }),
        supabase.from("partner_deal_events").select("*").eq("partner_id", id).order("created_at", { ascending: false }).limit(100),
        supabase.from("partner_admin_audit_log" as any).select("*").eq("entity_id", id).order("created_at", { ascending: false }).limit(100),
      ]);
      if (cancelled) return;
      setData({
        referrals: (refs.data as any[]) || [],
        deals: (deals.data as any[]) || [],
        commissions: (comms.data as any[]) || [],
        payouts: (payouts.data as any[]) || [],
        downloads: (downloads.data as any[]) || [],
        seats: (seats.data as any[]) || [],
        specialisations: (specs.data as any[]) || [],
        contacts: (contacts.data as any[]) || [],
        dealEvents: (events.data as any[]) || [],
        audit: (audit.data as any[]) || [],
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, partner?.id]);

  if (!partner) return null;

  const referrals = data.referrals ?? [];
  const deals = data.deals ?? [];
  const commissions = data.commissions ?? [];
  const payouts = data.payouts ?? [];
  const downloads = data.downloads ?? [];

  const converted = referrals.filter((r) => ["converted", "paid"].includes(r.status)).length;
  const convRate = referrals.length ? Math.round((converted / referrals.length) * 100) : 0;
  const pipeline = deals.filter((d) => ["pending", "approved"].includes(d.status))
    .reduce((s, d) => s + Number(d.estimated_arr_eur || 0), 0);
  const won = deals.filter((d) => d.status === "won")
    .reduce((s, d) => s + Number(d.actual_arr_eur || d.estimated_arr_eur || 0), 0);
  const commissionTotal = commissions.reduce((s, c) => s + Number(c.amount_cents || 0), 0) / 100;
  const paidOut = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount_eur || 0), 0);
  const downloadCount = downloads.filter((d) => d.event_type === "download").length;

  const rate = Number(partner.commission_rate || 0);
  const ratePct = rate <= 1 ? Math.round(rate * 1000) / 10 : rate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {partner.display_name || application?.company_name || "Partner"}
            <Badge variant="outline" className="capitalize">{partner.partner_type}</Badge>
            <Badge className="bg-teal-100 text-teal-800 border-teal-200">{ratePct}% commission</Badge>
            <Badge className={partner.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
              {partner.is_active ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label="Referrals" value={String(referrals.length)} sub={`${converted} converted · ${convRate}%`} />
              <Kpi label="Pipeline ARR" value={eur(pipeline)} sub={`${deals.length} deals`} />
              <Kpi label="Won ARR" value={eur(won)} />
              <Kpi label="Commissions" value={eur(commissionTotal)} sub={`${eur(paidOut)} paid out`} />
              <Kpi label="Asset downloads" value={String(downloadCount)} />
              <Kpi label="Academy seats" value={`${(data.seats ?? []).filter((s) => s.status === "assigned").length}/${partner.academy_seats_granted ?? 0}`} />
              <Kpi label="Certification" value={(partner.certification_level && partner.certification_level !== "none") ? String(partner.certification_level) : "—"} />
              <Kpi label="Joined" value={dt(partner.created_at)} sub={partner.onboarding_completed_at ? "Onboarded" : "Onboarding pending"} />
            </div>

            <Tabs defaultValue="profile">
              <TabsList className="flex flex-wrap h-auto">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="referrals">Referrals ({referrals.length})</TabsTrigger>
                <TabsTrigger value="deals">Registrations ({deals.length})</TabsTrigger>
                <TabsTrigger value="commissions">Commissions & payouts</TabsTrigger>
                <TabsTrigger value="downloads">Downloads ({downloads.length})</TabsTrigger>
                <TabsTrigger value="team">Team & seats</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="pt-4 text-sm">
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ["Referral code", partner.referral_code],
                    ["Website", partner.website_url || application?.website || "—"],
                    ["Applicant", application?.contact_name || "—"],
                    ["Applicant email", application?.contact_email || "—"],
                    ["Phone", application?.contact_phone || "—"],
                    ["Country", application?.country || "—"],
                    ["Commission lifetime", `${partner.commission_lifetime_months ?? 24} months`],
                    ["Payout method", partner.payout_method || "—"],
                    ["Verticals", (partner.verticals ?? []).join(", ") || "—"],
                    ["Specialisations", (data.specialisations ?? []).map((s) => s.label).join(", ") || "—"],
                    ["Application status", application?.status || "—"],
                    ["Applied", dt(application?.created_at)],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between gap-4 border-b border-border/50 py-1.5">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-foreground text-right break-all">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
                {(partner.bio || application?.description) && (
                  <p className="mt-3 text-muted-foreground whitespace-pre-wrap">{partner.bio || application?.description}</p>
                )}
              </TabsContent>

              <TabsContent value="referrals" className="pt-4">
                {referrals.length === 0 ? <Empty>No referrals recorded.</Empty> : (
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3">Email</th><th className="pr-3">Source</th><th className="pr-3">Status</th><th className="pr-3">Value</th><th className="pr-3">Commission</th><th>Date</th>
                    </tr></thead>
                    <tbody>
                      {referrals.map((r) => (
                        <tr key={r.id} className="border-b border-border/40">
                          <td className="py-2 pr-3">{r.referred_email || "—"}</td>
                          <td className="pr-3">{r.source || "—"}</td>
                          <td className="pr-3"><Badge variant="outline" className="capitalize">{r.status}</Badge></td>
                          <td className="pr-3">{eur(r.conversion_value)}</td>
                          <td className="pr-3">{eur(r.commission_earned)}</td>
                          <td>{dt(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </TabsContent>

              <TabsContent value="deals" className="pt-4">
                {deals.length === 0 ? <Empty>No deal registrations.</Empty> : (
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3">Prospect</th><th className="pr-3">Contact</th><th className="pr-3">Est. ARR</th><th className="pr-3">Status</th><th>Registered</th>
                    </tr></thead>
                    <tbody>
                      {deals.map((d) => (
                        <tr key={d.id} className="border-b border-border/40">
                          <td className="py-2 pr-3 font-medium text-foreground">{d.prospect_company}</td>
                          <td className="pr-3">{d.prospect_contact_name || "—"}<br />{d.prospect_email || ""}</td>
                          <td className="pr-3">{eur(d.actual_arr_eur || d.estimated_arr_eur)}</td>
                          <td className="pr-3"><Badge variant="outline" className="capitalize">{d.status}</Badge></td>
                          <td>{dt(d.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </TabsContent>

              <TabsContent value="commissions" className="pt-4 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Commissions</h4>
                  {commissions.length === 0 ? <Empty>No commissions recorded.</Empty> : (
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-2 pr-3">Description</th><th className="pr-3">Deal value</th><th className="pr-3">Rate</th><th className="pr-3">Amount</th><th className="pr-3">Status</th><th>Earned</th>
                      </tr></thead>
                      <tbody>
                        {commissions.map((c) => (
                          <tr key={c.id} className="border-b border-border/40">
                            <td className="py-2 pr-3">{c.description || "—"}</td>
                            <td className="pr-3">{eur(Number(c.deal_value_cents || 0) / 100)}</td>
                            <td className="pr-3">{Number(c.commission_rate) <= 1 ? `${Number(c.commission_rate) * 100}%` : `${c.commission_rate}%`}</td>
                            <td className="pr-3">{eur(Number(c.amount_cents || 0) / 100)}</td>
                            <td className="pr-3"><Badge variant="outline" className="capitalize">{c.status}</Badge></td>
                            <td>{dt(c.earned_on)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Payouts</h4>
                  {payouts.length === 0 ? <Empty>No payouts yet.</Empty> : (
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-2 pr-3">Amount</th><th className="pr-3">Method</th><th className="pr-3">Status</th><th className="pr-3">Period</th><th>Paid</th>
                      </tr></thead>
                      <tbody>
                        {payouts.map((p) => (
                          <tr key={p.id} className="border-b border-border/40">
                            <td className="py-2 pr-3">{eur(p.amount_eur)}</td>
                            <td className="pr-3">{p.method || "—"}</td>
                            <td className="pr-3"><Badge variant="outline" className="capitalize">{p.status}</Badge></td>
                            <td className="pr-3">{dt(p.period_start)} – {dt(p.period_end)}</td>
                            <td>{dt(p.paid_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="downloads" className="pt-4">
                {downloads.length === 0 ? <Empty>No asset activity yet.</Empty> : (
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-3">Asset</th><th className="pr-3">Product</th><th className="pr-3">Event</th><th>Date</th>
                    </tr></thead>
                    <tbody>
                      {downloads.map((d) => (
                        <tr key={d.id} className="border-b border-border/40">
                          <td className="py-2 pr-3 flex items-center gap-1.5"><Download className="h-3 w-3 text-muted-foreground" />{d.asset_title || d.asset_id}</td>
                          <td className="pr-3">{d.product || "—"}</td>
                          <td className="pr-3"><Badge variant="outline" className="capitalize">{d.event_type}</Badge></td>
                          <td>{new Date(d.created_at).toLocaleString("en-GB")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </TabsContent>

              <TabsContent value="team" className="pt-4 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Contacts</h4>
                  {(data.contacts ?? []).length === 0 ? <Empty>No teammates added.</Empty> : (
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-2 pr-3">Name</th><th className="pr-3">Email</th><th className="pr-3">Role</th><th>Primary</th>
                      </tr></thead>
                      <tbody>
                        {(data.contacts ?? []).map((c) => (
                          <tr key={c.id} className="border-b border-border/40">
                            <td className="py-2 pr-3">{c.name || "—"}</td>
                            <td className="pr-3">{c.email}</td>
                            <td className="pr-3">{c.role || "—"}</td>
                            <td>{c.is_primary ? "Yes" : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Academy seats</h4>
                  {(data.seats ?? []).length === 0 ? <Empty>No seats assigned.</Empty> : (
                    <ul className="text-xs space-y-1">
                      {(data.seats ?? []).map((s) => (
                        <li key={s.id} className="flex justify-between border-b border-border/40 py-1.5">
                          <span>{s.assigned_name || s.assigned_email || "Unassigned seat"}</span>
                          <span className="text-muted-foreground capitalize">{s.status} · {dt(s.assigned_at)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="pt-4 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Admin actions</h4>
                  {(data.audit ?? []).length === 0 ? <Empty>No admin actions logged for this partner.</Empty> : (
                    <ul className="text-xs space-y-1">
                      {(data.audit ?? []).map((a) => (
                        <li key={a.id} className="border-b border-border/40 py-1.5">
                          <span className="font-medium text-foreground">{a.action}</span>{" "}
                          <span className="text-muted-foreground">by {a.actor_email || "—"} · {new Date(a.created_at).toLocaleString("en-GB")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Deal activity</h4>
                  {(data.dealEvents ?? []).length === 0 ? <Empty>No deal activity.</Empty> : (
                    <ul className="text-xs space-y-1">
                      {(data.dealEvents ?? []).map((e) => (
                        <li key={e.id} className="border-b border-border/40 py-1.5">
                          <span className="font-medium text-foreground capitalize">{e.event_type.replace(/_/g, " ")}</span>{" "}
                          <span className="text-muted-foreground">{e.description || ""} · {new Date(e.created_at).toLocaleString("en-GB")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
