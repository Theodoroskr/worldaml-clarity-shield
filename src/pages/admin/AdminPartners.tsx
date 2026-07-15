import { Fragment, useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Handshake, Pencil, FileSignature, Bell, History, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { logPartnerAdminAction } from "@/lib/partnerAudit";

const VERTICALS = ["banking", "fintech", "crypto", "igaming", "payments", "legal"];
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  won: "bg-green-100 text-green-800 border-green-200",
  lost: "bg-slate-100 text-slate-800 border-slate-200",
  expired: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function AdminPartners() {
  const { user } = useAuth();
  const [partnerApps, setPartnerApps] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [refFilter, setRefFilter] = useState<string>("all");
  const [dealSearch, setDealSearch] = useState("");
  const [dealStatus, setDealStatus] = useState<string>("all");
  const [dealPartner, setDealPartner] = useState<string>("all");
  const [winDeal, setWinDeal] = useState<any | null>(null);
  const [winForm, setWinForm] = useState<{ customer_id: string; actual_arr_eur: string }>({ customer_id: "", actual_arr_eur: "" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: apps }, { data: pts }, { data: dl }, { data: refs }, { data: cst }] = await Promise.all([
      supabase.from("partner_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("partners").select("*").order("created_at", { ascending: false }),
      supabase.from("deal_registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("referrals").select("*").order("created_at", { ascending: false }),
      supabase.from("suite_customers").select("id,name,company_name,email").order("created_at", { ascending: false }).limit(500),
    ]);
    setPartnerApps((apps as any[]) || []);
    setPartners((pts as any[]) || []);
    setDeals((dl as any[]) || []);
    setReferrals((refs as any[]) || []);
    setCustomers((cst as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const approvePartnerApp = async (app: any) => {
    setActionLoading(app.id);
    const { error: updateErr } = await supabase
      .from("partner_applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any)
      .eq("id", app.id);
    if (updateErr) { toast.error("Failed to approve"); setActionLoading(null); return; }
    const { error: insertErr } = await supabase.from("partners").insert({
      user_id: app.user_id,
      partner_type: app.partner_type,
      display_name: app.company_name,
      website_url: app.website,
    } as any);
    if (insertErr) { toast.error("Failed to create partner record"); console.error(insertErr); }
    else { toast.success("Partner approved — sandbox key & Academy seats issued."); fetchAll(); }
    setActionLoading(null);
  };

  const rejectPartnerApp = async (appId: string) => {
    setActionLoading(appId);
    const { error } = await supabase
      .from("partner_applications")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any)
      .eq("id", appId);
    if (error) toast.error("Failed to reject");
    else { toast.success("Application rejected"); fetchAll(); }
    setActionLoading(null);
  };

  const togglePartner = async (p: any, field: string, value: any) => {
    const { error } = await supabase.from("partners").update({ [field]: value } as any).eq("id", p.id);
    if (error) toast.error("Update failed");
    else { toast.success("Updated"); fetchAll(); }
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setEditForm({
      display_name: p.display_name ?? "",
      logo_url: p.logo_url ?? "",
      tagline: p.tagline ?? "",
      bio: p.bio ?? "",
      website_url: p.website_url ?? "",
      verticals: p.verticals ?? [],
      certification_level: p.certification_level ?? "none",
      academy_seats_granted: p.academy_seats_granted ?? 0,
      commission_lifetime_months: p.commission_lifetime_months ?? 24,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase.from("partners").update(editForm as any).eq("id", editing.id);
    if (error) toast.error("Save failed");
    else { toast.success("Partner profile updated"); setEditing(null); fetchAll(); }
  };

  const reviewDeal = async (dealId: string, status: string) => {
    setActionLoading(dealId);
    const { error } = await supabase
      .from("deal_registrations")
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any)
      .eq("id", dealId);
    if (error) toast.error("Failed to update deal");
    else { toast.success(`Deal ${status}`); fetchAll(); }
    setActionLoading(null);
  };

  const openWinDialog = (deal: any) => {
    setWinDeal(deal);
    setWinForm({
      customer_id: deal.linked_customer_id ?? "",
      actual_arr_eur: deal.actual_arr_eur ? String(deal.actual_arr_eur) : (deal.estimated_arr_eur ? String(deal.estimated_arr_eur) : ""),
    });
  };

  const confirmWin = async () => {
    if (!winDeal) return;
    setActionLoading(winDeal.id);
    const payload: any = {
      status: "won",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user!.id,
      won_at: new Date().toISOString(),
      linked_customer_id: winForm.customer_id || null,
      actual_arr_eur: winForm.actual_arr_eur ? Number(winForm.actual_arr_eur) : null,
    };
    const { error } = await supabase.from("deal_registrations").update(payload).eq("id", winDeal.id);
    if (error) toast.error("Failed to mark won");
    else {
      toast.success("Deal marked as won" + (winForm.customer_id ? " and linked to customer" : ""));
      setWinDeal(null);
      fetchAll();
    }
    setActionLoading(null);
  };

  const pendingCount = partnerApps.filter((a) => a.status === "pending").length;
  const pendingDeals = deals.filter((d) => d.status === "pending").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Handshake className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner Program</h1>
          <p className="text-sm text-muted-foreground">Applications, active partners, and deal registrations.</p>
        </div>
        {pendingCount > 0 && <Badge className="bg-amber-100 text-amber-800 border-amber-200">{pendingCount} pending apps</Badge>}
        {pendingDeals > 0 && <Badge className="bg-blue-100 text-blue-800 border-blue-200">{pendingDeals} pending deals</Badge>}
      </div>

      {/* Applications */}
      <Card>
        <CardHeader><CardTitle className="text-navy">Applications</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
          ) : partnerApps.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No partner applications yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider text-left">
                    <th className="pb-3 pr-4 font-semibold text-navy">Company</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Contact</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Phone</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Country</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Website</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Type</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Date</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Status</th>
                    <th className="pb-3 font-semibold text-navy">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerApps.map((app: any) => (
                    <Fragment key={app.id}>
                    <tr className="border-b border-divider/30 hover:bg-surface-subtle">
                      <td className="py-3 pr-4 font-medium text-navy align-top">{app.company_name}</td>
                      <td className="py-3 pr-4 text-text-secondary align-top">
                        {app.contact_name ? <div className="text-navy">{app.contact_name}</div> : null}
                        {app.contact_email ? (
                          <a href={`mailto:${app.contact_email}`} className="text-teal hover:underline text-xs">{app.contact_email}</a>
                        ) : <span className="text-xs">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-text-secondary align-top text-xs">
                        {app.contact_phone ? <a href={`tel:${app.contact_phone}`} className="hover:underline">{app.contact_phone}</a> : "—"}
                      </td>
                      <td className="py-3 pr-4 text-text-secondary align-top text-xs">{app.country || "—"}</td>
                      <td className="py-3 pr-4 text-text-secondary align-top text-xs">
                        {app.website ? <a href={app.website} target="_blank" rel="noreferrer" className="text-teal hover:underline">{app.website}</a> : "—"}
                      </td>
                      <td className="py-3 pr-4 align-top"><Badge className="bg-purple-100 text-purple-800 border-purple-200">{app.partner_type}</Badge></td>
                      <td className="py-3 pr-4 text-text-secondary align-top text-xs">{new Date(app.created_at).toLocaleDateString("en-GB")}</td>
                      <td className="py-3 pr-4 align-top"><Badge className={STATUS_STYLES[app.status]}>{app.status}</Badge></td>
                      <td className="py-3 align-top">
                        {app.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50" disabled={actionLoading === app.id} onClick={() => approvePartnerApp(app)}>
                              {actionLoading === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50" disabled={actionLoading === app.id} onClick={() => rejectPartnerApp(app.id)}>
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {app.description && (
                      <tr key={`${app.id}-notes`} className="border-b border-divider/50 bg-surface-subtle/40">
                        <td colSpan={9} className="py-2 px-4 text-xs text-text-secondary">
                          <span className="font-semibold text-navy">Notes: </span>{app.description}
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active partners */}
      <Card>
        <CardHeader><CardTitle className="text-navy">Active Partners</CardTitle></CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No active partners yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider text-left">
                    <th className="pb-3 pr-4 font-semibold text-navy">Display / Code</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Type</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Certification</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Verticals</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Featured</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Active</th>
                    <th className="pb-3 font-semibold text-navy">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p: any) => (
                    <tr key={p.id} className="border-b border-divider/50 hover:bg-surface-subtle">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-navy">{p.display_name ?? "—"}</div>
                        <div className="font-mono text-xs text-text-secondary">{p.referral_code}</div>
                      </td>
                      <td className="py-3 pr-4"><Badge className="bg-purple-100 text-purple-800 border-purple-200">{p.partner_type}</Badge></td>
                      <td className="py-3 pr-4"><Badge variant="outline" className="capitalize">{p.certification_level}</Badge></td>
                      <td className="py-3 pr-4 text-xs text-text-secondary">{(p.verticals ?? []).join(", ") || "—"}</td>
                      <td className="py-3 pr-4">
                        <Switch checked={p.is_featured} onCheckedChange={(v) => togglePartner(p, "is_featured", v)} />
                      </td>
                      <td className="py-3 pr-4">
                        <Switch checked={p.is_active} onCheckedChange={(v) => togglePartner(p, "is_active", v)} />
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deal registrations */}
      {(() => {
        const partnerById = new Map(partners.map((p: any) => [p.id, p]));
        const customerById = new Map(customers.map((c: any) => [c.id, c]));
        const q = dealSearch.trim().toLowerCase();
        const filteredDeals = deals.filter((d: any) => {
          if (dealStatus !== "all" && d.status !== dealStatus) return false;
          if (dealPartner !== "all" && d.partner_id !== dealPartner) return false;
          if (!q) return true;
          const p: any = partnerById.get(d.partner_id);
          return [
            d.prospect_company,
            d.prospect_contact_name,
            d.prospect_email,
            d.prospect_country,
            d.notes,
            p?.display_name,
            p?.referral_code,
          ].filter(Boolean).some((v: string) => String(v).toLowerCase().includes(q));
        });

        const totalPipeline = deals
          .filter((d: any) => ["pending", "approved"].includes(d.status))
          .reduce((s: number, d: any) => s + Number(d.estimated_arr_eur || 0), 0);
        const totalWon = deals
          .filter((d: any) => d.status === "won")
          .reduce((s: number, d: any) => s + Number(d.actual_arr_eur || d.estimated_arr_eur || 0), 0);
        const wonCount = deals.filter((d: any) => d.status === "won").length;
        const closeRate = deals.length > 0 ? Math.round((wonCount / deals.length) * 100) : 0;

        return (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-navy flex items-center gap-2">
                  <FileSignature className="h-4 w-4 text-teal" /> Deal Registrations
                </CardTitle>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{deals.length} total</Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">€{totalPipeline.toLocaleString()} pipeline</Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">€{totalWon.toLocaleString()} won ({closeRate}%)</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <Input
                  placeholder="Search prospect, contact, country, partner…"
                  value={dealSearch}
                  onChange={(e) => setDealSearch(e.target.value)}
                  className="h-9 w-72"
                />
                <Select value={dealStatus} onValueChange={setDealStatus}>
                  <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dealPartner} onValueChange={setDealPartner}>
                  <SelectTrigger className="h-9 w-56"><SelectValue placeholder="Partner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All partners</SelectItem>
                    {partners.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.display_name || p.referral_code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(dealSearch || dealStatus !== "all" || dealPartner !== "all") && (
                  <Button size="sm" variant="ghost" onClick={() => { setDealSearch(""); setDealStatus("all"); setDealPartner("all"); }}>
                    Clear
                  </Button>
                )}
                <span className="text-xs text-text-secondary ml-auto">{filteredDeals.length} shown</span>
              </div>

              {filteredDeals.length === 0 ? (
                <p className="text-text-secondary text-sm py-4 text-center">No deal registrations match these filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-divider text-left">
                        <th className="pb-3 pr-4 font-semibold text-navy">Prospect</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Partner</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Contact</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">ARR</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Status</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Linked customer</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Protected until</th>
                        <th className="pb-3 font-semibold text-navy">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeals.map((d: any) => {
                        const p: any = partnerById.get(d.partner_id);
                        const linked: any = d.linked_customer_id ? customerById.get(d.linked_customer_id) : null;
                        return (
                          <tr key={d.id} className="border-b border-divider/50 hover:bg-surface-subtle align-top">
                            <td className="py-3 pr-4">
                              <div className="font-medium text-navy">{d.prospect_company}</div>
                              <div className="text-xs text-text-secondary">{d.prospect_country || "—"}</div>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="text-navy text-xs">{p?.display_name || "—"}</div>
                              <div className="font-mono text-[11px] text-text-secondary">{p?.referral_code ?? d.partner_id.slice(0, 8)}</div>
                            </td>
                            <td className="py-3 pr-4 text-text-secondary text-xs">
                              {d.prospect_contact_name || "—"}<br />
                              {d.prospect_email ? <a href={`mailto:${d.prospect_email}`} className="text-teal hover:underline">{d.prospect_email}</a> : null}
                            </td>
                            <td className="py-3 pr-4 text-text-secondary text-xs">
                              <div>Est: {d.estimated_arr_eur ? `€${d.estimated_arr_eur.toLocaleString()}` : "—"}</div>
                              {d.actual_arr_eur ? <div className="text-navy">Actual: €{d.actual_arr_eur.toLocaleString()}</div> : null}
                            </td>
                            <td className="py-3 pr-4"><Badge className={STATUS_STYLES[d.status]}>{d.status}</Badge></td>
                            <td className="py-3 pr-4 text-xs">
                              {linked ? (
                                <div>
                                  <div className="text-navy">{linked.company_name || linked.name || "—"}</div>
                                  <div className="text-text-secondary">{linked.email || ""}</div>
                                </div>
                              ) : (
                                <span className="text-text-secondary">—</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-text-secondary text-xs">{new Date(d.protection_expires_at).toLocaleDateString("en-GB")}</td>
                            <td className="py-3">
                              <div className="flex flex-wrap gap-1">
                                {d.status === "pending" && (
                                  <>
                                    <Button size="sm" variant="outline" className="text-green-700" disabled={actionLoading === d.id} onClick={() => reviewDeal(d.id, "approved")}>Approve</Button>
                                    <Button size="sm" variant="outline" className="text-red-700" disabled={actionLoading === d.id} onClick={() => reviewDeal(d.id, "rejected")}>Reject</Button>
                                  </>
                                )}
                                {d.status === "approved" && (
                                  <>
                                    <Button size="sm" variant="outline" className="text-green-700" onClick={() => openWinDialog(d)}>Convert to Won…</Button>
                                    <Button size="sm" variant="outline" onClick={() => reviewDeal(d.id, "lost")}>Mark Lost</Button>
                                  </>
                                )}
                                {d.status === "won" && (
                                  <Button size="sm" variant="outline" onClick={() => openWinDialog(d)}>
                                    {linked ? "Update link" : "Link customer"}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}



      {/* Referrals */}
      {(() => {
        const partnerById = new Map(partners.map((p: any) => [p.id, p]));
        const filtered = refFilter === "all"
          ? referrals
          : referrals.filter((r: any) => r.partner_id === refFilter);

        const perPartner = new Map<string, { total: number; converted: number; paid: number; value: number; commission: number }>();
        for (const r of referrals) {
          const bucket = perPartner.get(r.partner_id) ?? { total: 0, converted: 0, paid: 0, value: 0, commission: 0 };
          bucket.total += 1;
          if (["converted", "paid"].includes(r.status)) bucket.converted += 1;
          if (r.status === "paid") bucket.paid += 1;
          bucket.value += Number(r.conversion_value || 0);
          bucket.commission += Number(r.commission_earned || 0);
          perPartner.set(r.partner_id, bucket);
        }

        const totalRefs = referrals.length;
        const totalConv = referrals.filter((r: any) => ["converted", "paid"].includes(r.status)).length;
        const overallRate = totalRefs > 0 ? Math.round((totalConv / totalRefs) * 100) : 0;
        const totalValue = referrals.reduce((s: number, r: any) => s + Number(r.conversion_value || 0), 0);
        const totalCommission = referrals.reduce((s: number, r: any) => s + Number(r.commission_earned || 0), 0);

        const partnerLabel = (id: string) => {
          const p: any = partnerById.get(id);
          if (!p) return id.slice(0, 8);
          return p.display_name || p.referral_code || id.slice(0, 8);
        };

        return (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-navy flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-teal" /> Referrals
                </CardTitle>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{totalRefs} total</Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">{totalConv} converted ({overallRate}%)</Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">€{totalValue.toLocaleString()} ARR attributed</Badge>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">€{totalCommission.toLocaleString()} commission</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Per-partner attribution */}
              {perPartner.size === 0 ? (
                <p className="text-text-secondary text-sm py-4 text-center">No referrals recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <h4 className="text-sm font-semibold text-navy mb-2">Attribution by partner</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-divider text-left">
                        <th className="pb-2 pr-4 font-semibold text-navy">Partner</th>
                        <th className="pb-2 pr-4 font-semibold text-navy">Referrals</th>
                        <th className="pb-2 pr-4 font-semibold text-navy">Converted</th>
                        <th className="pb-2 pr-4 font-semibold text-navy">Paid</th>
                        <th className="pb-2 pr-4 font-semibold text-navy">Conversion rate</th>
                        <th className="pb-2 pr-4 font-semibold text-navy">Attributed ARR</th>
                        <th className="pb-2 font-semibold text-navy">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(perPartner.entries())
                        .sort((a, b) => b[1].total - a[1].total)
                        .map(([pid, s]) => {
                          const rate = s.total > 0 ? Math.round((s.converted / s.total) * 100) : 0;
                          const p: any = partnerById.get(pid);
                          return (
                            <tr key={pid} className="border-b border-divider/50 hover:bg-surface-subtle">
                              <td className="py-2 pr-4">
                                <button
                                  className="text-left hover:underline"
                                  onClick={() => setRefFilter(pid)}
                                >
                                  <div className="font-medium text-navy">{p?.display_name || "—"}</div>
                                  <div className="font-mono text-xs text-text-secondary">{p?.referral_code ?? pid.slice(0, 8)}</div>
                                </button>
                              </td>
                              <td className="py-2 pr-4 text-text-secondary">{s.total}</td>
                              <td className="py-2 pr-4 text-text-secondary">{s.converted}</td>
                              <td className="py-2 pr-4 text-text-secondary">{s.paid}</td>
                              <td className="py-2 pr-4">
                                <Badge className={rate >= 30 ? "bg-green-100 text-green-800 border-green-200" : rate >= 10 ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
                                  {rate}%
                                </Badge>
                              </td>
                              <td className="py-2 pr-4 text-text-secondary">{s.value ? `€${s.value.toLocaleString()}` : "—"}</td>
                              <td className="py-2 text-text-secondary">{s.commission ? `€${s.commission.toLocaleString()}` : "—"}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signup / customer list */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-navy">Signups & customers</h4>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-text-secondary">Partner</Label>
                    <Select value={refFilter} onValueChange={setRefFilter}>
                      <SelectTrigger className="h-8 w-56 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All partners</SelectItem>
                        {partners.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.display_name || p.referral_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {filtered.length === 0 ? (
                  <p className="text-text-secondary text-sm py-4 text-center">No referrals for this filter.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-divider text-left">
                          <th className="pb-2 pr-4 font-semibold text-navy">Referred</th>
                          <th className="pb-2 pr-4 font-semibold text-navy">Partner</th>
                          <th className="pb-2 pr-4 font-semibold text-navy">Code</th>
                          <th className="pb-2 pr-4 font-semibold text-navy">Status</th>
                          <th className="pb-2 pr-4 font-semibold text-navy">Value</th>
                          <th className="pb-2 pr-4 font-semibold text-navy">Commission</th>
                          <th className="pb-2 pr-4 font-semibold text-navy">Signed up</th>
                          <th className="pb-2 font-semibold text-navy">Converted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r: any) => (
                          <tr key={r.id} className="border-b border-divider/50 hover:bg-surface-subtle">
                            <td className="py-2 pr-4 text-navy">
                              {r.referred_email ? (
                                <a href={`mailto:${r.referred_email}`} className="hover:underline">{r.referred_email}</a>
                              ) : <span className="text-text-secondary">(anonymous click)</span>}
                            </td>
                            <td className="py-2 pr-4 text-text-secondary text-xs">{partnerLabel(r.partner_id)}</td>
                            <td className="py-2 pr-4 font-mono text-xs text-text-secondary">{r.referral_code_used}</td>
                            <td className="py-2 pr-4"><Badge className={STATUS_STYLES[r.status] ?? "bg-slate-100 text-slate-700 border-slate-200"}>{r.status}</Badge></td>
                            <td className="py-2 pr-4 text-text-secondary">{r.conversion_value ? `€${Number(r.conversion_value).toLocaleString()}` : "—"}</td>
                            <td className="py-2 pr-4 text-text-secondary">{r.commission_earned ? `€${Number(r.commission_earned).toLocaleString()}` : "—"}</td>
                            <td className="py-2 pr-4 text-text-secondary text-xs">{new Date(r.created_at).toLocaleDateString("en-GB")}</td>
                            <td className="py-2 text-text-secondary text-xs">{r.converted_at ? new Date(r.converted_at).toLocaleDateString("en-GB") : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}


      {/* Convert to Won dialog */}
      <Dialog open={!!winDeal} onOpenChange={(o) => !o && setWinDeal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{winDeal?.status === "won" ? "Update customer link" : "Convert deal to Won"}</DialogTitle>
          </DialogHeader>
          {winDeal && (
            <div className="grid gap-4 py-2">
              <div className="text-sm">
                <div className="font-medium text-navy">{winDeal.prospect_company}</div>
                <div className="text-text-secondary text-xs">
                  Partner: {(partners.find((p: any) => p.id === winDeal.partner_id) as any)?.display_name || winDeal.partner_id.slice(0, 8)}
                </div>
              </div>
              <div>
                <Label>Link to customer</Label>
                <Select value={winForm.customer_id || "__none__"} onValueChange={(v) => setWinForm({ ...winForm, customer_id: v === "__none__" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Choose a customer…" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="__none__">— No customer linked —</SelectItem>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {(c.company_name || c.name || "Unnamed")}{c.email ? ` · ${c.email}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-secondary mt-1">
                  Attributes this deal to a customer record so commission and reporting stay in sync.
                </p>
              </div>
              <div>
                <Label htmlFor="actual_arr_eur">Actual ARR (EUR)</Label>
                <Input
                  id="actual_arr_eur"
                  type="number"
                  min="0"
                  value={winForm.actual_arr_eur}
                  onChange={(e) => setWinForm({ ...winForm, actual_arr_eur: e.target.value })}
                  placeholder={winDeal.estimated_arr_eur ? String(winDeal.estimated_arr_eur) : ""}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setWinDeal(null)}>Cancel</Button>
            <Button onClick={confirmWin} disabled={actionLoading === winDeal?.id}>
              {actionLoading === winDeal?.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {winDeal?.status === "won" ? "Save link" : "Confirm Won"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit partner profile</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Display name</Label>
              <Input value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={editForm.tagline} onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })} />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea rows={3} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Website</Label>
                <Input value={editForm.website_url} onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })} />
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input value={editForm.logo_url} onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Certification</Label>
                <Select value={editForm.certification_level} onValueChange={(v) => setEditForm({ ...editForm, certification_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Academy seats</Label>
                <Input type="number" min="0" value={editForm.academy_seats_granted} onChange={(e) => setEditForm({ ...editForm, academy_seats_granted: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Verticals</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {VERTICALS.map((v) => {
                  const active = (editForm.verticals ?? []).includes(v);
                  return (
                    <Button
                      key={v}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() => setEditForm({
                        ...editForm,
                        verticals: active
                          ? editForm.verticals.filter((x: string) => x !== v)
                          : [...(editForm.verticals ?? []), v],
                      })}
                      className="capitalize"
                    >
                      {v === "igaming" ? "iGaming" : v}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Commission lifetime (months)</Label>
              <Input type="number" min="1" value={editForm.commission_lifetime_months} onChange={(e) => setEditForm({ ...editForm, commission_lifetime_months: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
