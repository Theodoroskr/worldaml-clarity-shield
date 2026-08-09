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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, XCircle, Handshake, Pencil, FileSignature, Bell, History, Trash2, Eye, Search, ShieldCheck, ShieldOff, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { logPartnerAdminAction } from "@/lib/partnerAudit";
import PartnerProgramAnalytics from "@/components/admin/PartnerProgramAnalytics";
import PartnerDetailDialog from "@/components/admin/PartnerDetailDialog";
import PartnerActionCentre from "@/components/admin/PartnerActionCentre";
import PartnerApplicationReviewDialog from "@/components/admin/PartnerApplicationReviewDialog";
import {
import AdminActionRequired from "@/components/admin/AdminActionRequired";
import AdminPageAttention from "@/components/admin/AdminPageAttention";
  APPLICATION_STATUS_LABEL, APPLICATION_STATUS_STYLE, PORTAL_ACCESS_LABEL, PORTAL_ACCESS_STYLE,
  applicationAge, ageSeverity, auditActionLabel, summariseChanges, toPercent,
} from "@/lib/partnerLifecycle";



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
  const [detailPartner, setDetailPartner] = useState<any | null>(null);
  const [removeTarget, setRemoveTarget] = useState<any | null>(null);
  const [reviewApp, setReviewApp] = useState<any | null>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [appSearch, setAppSearch] = useState("");
  const [appStatus, setAppStatus] = useState("all");
  const [appType, setAppType] = useState("all");
  const [appCountry, setAppCountry] = useState("all");
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});
  const [ptType, setPtType] = useState("all");
  const [ptActive, setPtActive] = useState("all");
  const [ptAccess, setPtAccess] = useState("all");
  const [ptCert, setPtCert] = useState("all");
  const [accessTarget, setAccessTarget] = useState<{ partner: any; access: string } | null>(null);
  const [approveDeal, setApproveDeal] = useState<any | null>(null);
  const [dealForm, setDealForm] = useState<{ protection_expires_at: string; status: string; customer_id: string; admin_notes: string }>({
    protection_expires_at: "", status: "approved", customer_id: "", admin_notes: "",
  });

  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [auditEntity, setAuditEntity] = useState<string>("all");
  const [notifSettings, setNotifSettings] = useState<any[]>([]);
  const [myNotif, setMyNotif] = useState<any>({
    notify_new_application: true,
    notify_new_deal: true,
    notify_deal_status_change: false,
    is_active: true,
  });
  const [savingNotif, setSavingNotif] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: apps }, { data: pts }, { data: dl }, { data: refs }, { data: cst }, { data: audit }, { data: nset }] = await Promise.all([
      supabase.from("partner_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("partners").select("*").order("created_at", { ascending: false }),
      supabase.from("deal_registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("referrals").select("*").order("created_at", { ascending: false }),
      supabase.from("suite_customers").select("id,name,company_name,email").order("created_at", { ascending: false }).limit(500),
      supabase.from("partner_admin_audit_log" as any).select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("partner_notification_settings" as any).select("*").order("email", { ascending: true }),
    ]);
    const { data: mgrs } = await supabase.from("partner_managers" as any).select("id,name,email");
    setManagers((mgrs as any[]) || []);
    setPartnerApps((apps as any[]) || []);
    setPartners((pts as any[]) || []);
    setDeals((dl as any[]) || []);
    setReferrals((refs as any[]) || []);
    setCustomers((cst as any[]) || []);
    setAuditLog((audit as any[]) || []);
    setNotifSettings((nset as any[]) || []);
    const mine = ((nset as any[]) || []).find((n: any) => n.user_id === user?.id);
    if (mine) {
      setMyNotif({
        notify_new_application: mine.notify_new_application,
        notify_new_deal: mine.notify_new_deal,
        notify_deal_status_change: mine.notify_deal_status_change,
        is_active: mine.is_active,
      });
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Keep the open review drawer in sync with refreshed data
  useEffect(() => {
    if (!reviewApp) return;
    const fresh = partnerApps.find((a: any) => a.id === reviewApp.id);
    if (fresh && fresh !== reviewApp) setReviewApp(fresh);
  }, [partnerApps]); // eslint-disable-line react-hooks/exhaustive-deps

  const setPortalAccess = async (partner: any, access: string, reason?: string) => {
    setActionLoading(partner.id);
    const { error } = await supabase.rpc("admin_set_partner_portal_access" as any, {
      _partner_id: partner.id, _access: access, _reason: reason ?? null,
    } as any);
    if (error) toast.error(error.message || "Failed to update portal access");
    else {
      toast.success(`Portal access ${PORTAL_ACCESS_LABEL[access].toLowerCase()}`);
      fetchAll();
    }
    setActionLoading(null);
    setAccessTarget(null);
  };

  const togglePartner = async (p: any, field: string, value: any) => {
    const { error } = await supabase.from("partners").update({ [field]: value } as any).eq("id", p.id);
    if (error) toast.error("Update failed");
    else {
      toast.success("Updated");
      await logPartnerAdminAction({
        action: field === "is_active" ? (value ? "activate_partner" : "deactivate_partner") : `toggle_${field}`,
        entity_type: "partner",
        entity_id: p.id,
        entity_label: p.display_name ?? p.referral_code,
        changes: { [field]: { from: p[field], to: value } },
      });
      fetchAll();
    }
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
      commission_rate: Number(p.commission_rate ?? 0),
    });
  };

  const removePartner = async () => {
    if (!removeTarget) return;
    setActionLoading(removeTarget.id);
    const { error } = await supabase.from("partners").delete().eq("id", removeTarget.id);
    if (error) {
      toast.error("Failed to remove partner");
      console.error(error);
    } else {
      toast.success("Partner removed");
      await logPartnerAdminAction({
        action: "remove_partner",
        entity_type: "partner",
        entity_id: removeTarget.id,
        entity_label: removeTarget.display_name ?? removeTarget.referral_code,
        changes: { removed: true, partner_type: removeTarget.partner_type },
      });
      setRemoveTarget(null);
      fetchAll();
    }
    setActionLoading(null);
  };


  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase.from("partners").update(editForm as any).eq("id", editing.id);
    if (error) toast.error("Save failed");
    else {
      toast.success("Partner profile updated");
      const diff: Record<string, any> = {};
      for (const key of Object.keys(editForm)) {
        const before = (editing as any)[key];
        const after = (editForm as any)[key];
        if (JSON.stringify(before) !== JSON.stringify(after)) {
          diff[key] = { from: before, to: after };
        }
      }
      await logPartnerAdminAction({
        action: "edit_partner_profile",
        entity_type: "partner",
        entity_id: editing.id,
        entity_label: editForm.display_name || editing.referral_code,
        changes: diff,
      });
      setEditing(null);
      fetchAll();
    }
  };

  const reviewDeal = async (dealId: string, status: string) => {
    setActionLoading(dealId);
    const before = deals.find((d) => d.id === dealId);
    const { error } = await supabase
      .from("deal_registrations")
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any)
      .eq("id", dealId);
    if (error) toast.error("Failed to update deal");
    else {
      toast.success(`Deal ${status}`);
      await logPartnerAdminAction({
        action: `deal_${status}`,
        entity_type: "deal_registration",
        entity_id: dealId,
        entity_label: before?.prospect_company ?? null,
        changes: { status: { from: before?.status, to: status } },
      });
      fetchAll();
    }
    setActionLoading(null);
  };

  const openApproveDeal = (deal: any) => {
    setApproveDeal(deal);
    setDealForm({
      protection_expires_at: deal.protection_expires_at
        ? new Date(deal.protection_expires_at).toISOString().slice(0, 10)
        : "",
      status: "approved",
      customer_id: deal.linked_customer_id ?? "",
      admin_notes: deal.admin_notes ?? "",
    });
  };

  const confirmApproveDeal = async () => {
    if (!approveDeal) return;
    setActionLoading(approveDeal.id);
    const payload: any = {
      status: dealForm.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user!.id,
      admin_notes: dealForm.admin_notes || approveDeal.admin_notes || null,
    };
    // Commercial data is never overwritten silently — only what the admin confirms.
    if (dealForm.protection_expires_at) {
      payload.protection_expires_at = new Date(dealForm.protection_expires_at).toISOString();
    }
    if (dealForm.customer_id) payload.linked_customer_id = dealForm.customer_id;

    const { error } = await supabase.from("deal_registrations").update(payload).eq("id", approveDeal.id);
    if (error) toast.error("Failed to update deal");
    else {
      toast.success(`Deal ${dealForm.status}`);
      await logPartnerAdminAction({
        action: `deal_${dealForm.status}`,
        entity_type: "deal_registration",
        entity_id: approveDeal.id,
        entity_label: approveDeal.prospect_company,
        changes: {
          status: { from: approveDeal.status, to: dealForm.status },
          protection_expires_at: { from: approveDeal.protection_expires_at, to: payload.protection_expires_at ?? approveDeal.protection_expires_at },
          linked_customer_id: { from: approveDeal.linked_customer_id ?? null, to: payload.linked_customer_id ?? approveDeal.linked_customer_id ?? null },
        },
      });
      setApproveDeal(null);
      fetchAll();
    }
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
      await logPartnerAdminAction({
        action: winDeal.status === "won" ? "update_deal_link" : "convert_deal_to_won",
        entity_type: "deal_registration",
        entity_id: winDeal.id,
        entity_label: winDeal.prospect_company,
        changes: {
          status: { from: winDeal.status, to: "won" },
          linked_customer_id: { from: winDeal.linked_customer_id ?? null, to: winForm.customer_id || null },
          actual_arr_eur: { from: winDeal.actual_arr_eur ?? null, to: payload.actual_arr_eur },
        },
      });
      setWinDeal(null);
      fetchAll();
    }
    setActionLoading(null);
  };

  const saveMyNotif = async () => {
    if (!user) return;
    setSavingNotif(true);
    const existing = notifSettings.find((n: any) => n.user_id === user.id);
    const payload = {
      user_id: user.id,
      email: user.email ?? "",
      ...myNotif,
    };
    const { error } = await supabase
      .from("partner_notification_settings" as any)
      .upsert(payload as any, { onConflict: "user_id" });
    if (error) toast.error("Failed to save preferences");
    else {
      toast.success("Notification preferences saved");
      await logPartnerAdminAction({
        action: existing ? "update_notification_settings" : "create_notification_settings",
        entity_type: "notification_settings",
        entity_id: user.id,
        entity_label: user.email ?? null,
        changes: myNotif,
      });
      fetchAll();
    }
    setSavingNotif(false);
  };

  const removeNotifRecipient = async (row: any) => {
    if (row.user_id !== user?.id) {
      toast.error("You can only remove your own row.");
      return;
    }
    const { error } = await supabase
      .from("partner_notification_settings" as any)
      .delete()
      .eq("user_id", row.user_id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Removed from recipients");
      await logPartnerAdminAction({
        action: "remove_notification_settings",
        entity_type: "notification_settings",
        entity_id: row.user_id,
        entity_label: row.email,
      });
      fetchAll();
    }
  };


  const pendingCount = partnerApps.filter((a) => a.status === "pending").length;
  const moreInfoCount = partnerApps.filter((a) => a.status === "more_info").length;
  const pendingDeals = deals.filter((d) => d.status === "pending").length;
  const accessIssues = partners.filter(
    (p: any) => p.is_active && (p.portal_access ?? "active") !== "active",
  ).length;
  const managerName = (id?: string | null) =>
    managers.find((m: any) => m.id === id)?.name ?? null;
  const partnerByUser = new Map(partners.map((p: any) => [p.user_id, p]));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Handshake className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner Program</h1>
          <AdminPageAttention path="/admin/partners" className="ml-2" />
          <p className="text-sm text-muted-foreground">Analytics, applications, active partners, referrals and deal registrations.</p>
        </div>
        {pendingCount > 0 && <Badge className="bg-amber-100 text-amber-800 border-amber-200">{pendingCount} pending applications</Badge>}
        {pendingDeals > 0 && <Badge className="bg-blue-100 text-blue-800 border-blue-200">{pendingDeals} pending deals</Badge>}
      </div>

      <AdminActionRequired path="/admin/partners" />

      <PartnerActionCentre
        pendingApplications={pendingCount}
        moreInfoApplications={moreInfoCount}
        pendingDeals={pendingDeals}
        accessIssues={accessIssues}
        onReviewApplications={() => {
          setAppStatus("pending");
          document.getElementById("partner-applications")?.scrollIntoView({ behavior: "smooth" });
        }}
        onReviewDeals={() => {
          setDealStatus("pending");
          document.getElementById("deal-registrations")?.scrollIntoView({ behavior: "smooth" });
        }}
        onReviewAccess={() => {
          setPtAccess("issues");
          document.getElementById("active-partners")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Quick jump */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: "partner-applications", label: "Applications" },
          { id: "active-partners", label: "Active partners" },
          { id: "deal-registrations", label: "Deal registrations" },
          { id: "partner-referrals", label: "Referrals" },
        ].map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* Programme analytics */}
      <PartnerProgramAnalytics
        applications={partnerApps}
        partners={partners}
        deals={deals}
        referrals={referrals}
        loading={loading}
      />

      {/* Applications */}
      <Card id="partner-applications" className="scroll-mt-24">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-navy">Applications</CardTitle>
              <p className="text-xs text-text-secondary mt-1">
                {pendingCount} pending review · {moreInfoCount} awaiting information · {partnerApps.length} total
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search company, contact, email…"
                className="h-9 w-72 pl-8"
              />
            </div>
            <Select value={appStatus} onValueChange={setAppStatus}>
              <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(APPLICATION_STATUS_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={appType} onValueChange={setAppType}>
              <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="affiliate">Affiliate</SelectItem>
                <SelectItem value="reseller">Reseller</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
              </SelectContent>
            </Select>
            <Select value={appCountry} onValueChange={setAppCountry}>
              <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {Array.from(new Set(partnerApps.map((a: any) => a.country).filter(Boolean))).map((c: any) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(appSearch || appStatus !== "all" || appType !== "all" || appCountry !== "all") && (
              <Button size="sm" variant="ghost" onClick={() => { setAppSearch(""); setAppStatus("all"); setAppType("all"); setAppCountry("all"); }}>
                Clear
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
          ) : partnerApps.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No partner applications yet.</p>
          ) : (() => {
            const q = appSearch.trim().toLowerCase();
            const rows = partnerApps.filter((a: any) => {
              if (appStatus !== "all" && a.status !== appStatus) return false;
              if (appType !== "all" && a.partner_type !== appType) return false;
              if (appCountry !== "all" && a.country !== appCountry) return false;
              if (!q) return true;
              return [a.company_name, a.contact_name, a.contact_email, a.country, a.website]
                .filter(Boolean).some((v: string) => String(v).toLowerCase().includes(q));
            });
            if (rows.length === 0) {
              return <p className="text-text-secondary text-sm py-4 text-center">No applications match these filters.</p>;
            }
            return (
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
                    <th className="pb-3 pr-4 font-semibold text-navy">Submitted</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Status</th>
                    <th className="pb-3 pr-4 font-semibold text-navy">Portal access</th>
                    <th className="pb-3 font-semibold text-navy text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider/40">
                  {rows.map((app: any) => {
                    const linkedPartner = partnerByUser.get(app.user_id);
                    const access = linkedPartner?.portal_access ?? "not_granted";
                    const sev = ageSeverity(app.created_at, app.status);
                    const notesText = [app.description, app.notes].filter(Boolean).join("\n\n");
                    const notesOpen = !!openNotes[app.id];
                    return (
                    <Fragment key={app.id}>
                    <tr className="hover:bg-surface-subtle align-top">
                      <td className="py-4 pr-4 font-medium text-navy">{app.company_name}</td>
                      <td className="py-4 pr-4 text-text-secondary">
                        {app.contact_name ? <div className="text-navy">{app.contact_name}</div> : null}
                        {app.contact_email ? (
                          <a href={`mailto:${app.contact_email}`} className="text-teal hover:underline text-xs">{app.contact_email}</a>
                        ) : <span className="text-xs">—</span>}
                      </td>
                      <td className="py-4 pr-4 text-text-secondary text-xs">
                        {app.contact_phone ? <a href={`tel:${app.contact_phone}`} className="hover:underline">{app.contact_phone}</a> : "—"}
                      </td>
                      <td className="py-4 pr-4 text-text-secondary text-xs">{app.country || "—"}</td>
                      <td className="py-4 pr-4 text-text-secondary text-xs">
                        {app.website ? <a href={app.website} target="_blank" rel="noreferrer" className="text-teal hover:underline">{app.website}</a> : "—"}
                      </td>
                      <td className="py-4 pr-4"><Badge className="bg-purple-100 text-purple-800 border-purple-200 capitalize">{app.partner_type}</Badge></td>
                      <td className="py-4 pr-4 text-xs">
                        <div className="text-navy whitespace-nowrap">
                          {new Date(app.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        <div className={
                          sev === "late" ? "text-red-600 font-medium"
                            : sev === "warn" ? "text-amber-600"
                            : "text-text-secondary"
                        }>
                          {applicationAge(app.created_at)}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge className={APPLICATION_STATUS_STYLE[app.status] ?? STATUS_STYLES[app.status]}>
                          {APPLICATION_STATUS_LABEL[app.status] ?? app.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge variant="outline" className={PORTAL_ACCESS_STYLE[access]}>
                          {PORTAL_ACCESS_LABEL[access]}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {notesText && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setOpenNotes({ ...openNotes, [app.id]: !notesOpen })}
                            >
                              {notesOpen ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                              Notes
                            </Button>
                          )}
                          <Button size="sm" onClick={() => setReviewApp(app)}>
                            <Eye className="h-3 w-3 mr-1" /> Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {notesText && notesOpen && (
                      <tr className="bg-surface-subtle/40">
                        <td colSpan={10} className="py-3 px-4 text-xs text-text-secondary whitespace-pre-wrap">
                          <span className="font-semibold text-navy">Notes: </span>{notesText}
                          {app.review_message && (
                            <div className="mt-2"><span className="font-semibold text-navy">Last message to applicant: </span>{app.review_message}</div>
                          )}
                        </td>
                      </tr>
                    )}
                    </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Active partners */}
      {(() => {
        const appByUser = new Map(partnerApps.map((a: any) => [a.user_id, a]));
        const certStyle = (lvl?: string | null) => {
          switch ((lvl || "").toLowerCase()) {
            case "gold": return "bg-amber-100 text-amber-800 border-amber-200";
            case "silver": return "bg-slate-200 text-slate-800 border-slate-300";
            case "bronze": return "bg-orange-100 text-orange-800 border-orange-200";
            default: return "bg-muted text-muted-foreground border-border";
          }
        };
        const activePartners = partners.filter((p: any) => p.is_active);
        return (
          <Card id="active-partners" className="scroll-mt-24">

            <CardHeader>
              <CardTitle className="text-navy">Active Partners</CardTitle>
              <p className="text-xs text-text-secondary mt-1">
                {activePartners.length} active · {partners.length - activePartners.length} inactive ·{" "}
                {partners.filter((p: any) => (p.portal_access ?? "active") === "active").length} with portal access
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={ptType} onValueChange={setPtType}>
                  <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="affiliate">Affiliate</SelectItem>
                    <SelectItem value="reseller">Reseller</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ptActive} onValueChange={setPtActive}>
                  <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Partner status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any partner status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ptAccess} onValueChange={setPtAccess}>
                  <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Portal access" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any portal access</SelectItem>
                    <SelectItem value="issues">Access issues only</SelectItem>
                    {Object.entries(PORTAL_ACCESS_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={ptCert} onValueChange={setPtCert}>
                  <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Certification" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any certification</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                  </SelectContent>
                </Select>
                {(ptType !== "all" || ptActive !== "all" || ptAccess !== "all" || ptCert !== "all") && (
                  <Button size="sm" variant="ghost" onClick={() => { setPtType("all"); setPtActive("all"); setPtAccess("all"); setPtCert("all"); }}>Clear</Button>
                )}
              </div>
              {partners.length === 0 ? (
                <p className="text-text-secondary text-sm py-4 text-center">No active partners yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-divider text-left">
                        <th className="pb-3 pr-4 font-semibold text-navy">Partner</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Referral code</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Type</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Commission</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Certification</th>

                        <th className="pb-3 pr-4 font-semibold text-navy">Verticals</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Portal access</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Partner since</th>
                        <th className="pb-3 pr-4 font-semibold text-navy">Manager</th>
                        <th className="pb-3 pr-4 font-semibold text-navy text-center">Featured</th>
                        <th className="pb-3 pr-4 font-semibold text-navy text-center">Partner status</th>
                        <th className="pb-3 font-semibold text-navy text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.filter((p: any) => {
                        const acc = p.portal_access ?? "active";
                        if (ptType !== "all" && p.partner_type !== ptType) return false;
                        if (ptActive === "active" && !p.is_active) return false;
                        if (ptActive === "inactive" && p.is_active) return false;
                        if (ptAccess === "issues" && !(p.is_active && acc !== "active")) return false;
                        if (ptAccess !== "all" && ptAccess !== "issues" && acc !== ptAccess) return false;
                        if (ptCert !== "all" && (p.certification_level ?? "none") !== ptCert) return false;
                        return true;
                      }).map((p: any) => {
                        const app = appByUser.get(p.user_id);
                        const access = p.portal_access ?? "active";
                        const displayName = p.display_name || app?.company_name || "Unnamed partner";
                        const contactEmail = app?.contact_email;
                        const cert = (p.certification_level || "").toLowerCase();
                        const certLabel = cert && cert !== "none" ? cert : "—";
                        const verticals = (p.verticals ?? []).filter(Boolean);
                        return (
                          <tr key={p.id} className="border-b border-divider/50 hover:bg-surface-subtle">
                            <td className="py-3 pr-4">
                              <div className="font-medium text-navy">{displayName}</div>
                              {contactEmail && (
                                <div className="text-xs text-text-secondary truncate max-w-[220px]">{contactEmail}</div>
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(p.referral_code);
                                  toast.success("Referral code copied");
                                }}
                                className="font-mono text-xs px-2 py-1 rounded bg-surface-subtle border border-divider hover:bg-muted"
                                title="Click to copy"
                              >
                                {p.referral_code}
                              </button>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200 capitalize">
                                {p.partner_type}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                                {(() => { const r = Number(p.commission_rate || 0); return `${Math.round((r <= 1 ? r * 100 : r) * 10) / 10}%`; })()}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">

                              <Badge variant="outline" className={`capitalize ${certStyle(cert)}`}>
                                {certLabel}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">
                              {verticals.length === 0 ? (
                                <span className="text-xs text-text-secondary">—</span>
                              ) : (
                                <div className="flex flex-wrap gap-1 max-w-[220px]">
                                  {verticals.slice(0, 3).map((v: string) => (
                                    <Badge key={v} variant="outline" className="text-[10px] capitalize">
                                      {v}
                                    </Badge>
                                  ))}
                                  {verticals.length > 3 && (
                                    <span className="text-[10px] text-text-secondary">+{verticals.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              <Badge variant="outline" className={PORTAL_ACCESS_STYLE[access]}>
                                {PORTAL_ACCESS_LABEL[access]}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-xs text-text-secondary whitespace-nowrap">
                              {p.partner_since || p.created_at
                                ? new Date(p.partner_since || p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                : "—"}
                            </td>
                            <td className="py-3 pr-4 text-xs text-text-secondary">
                              {managerName(p.partner_manager_id) ?? "Unassigned"}
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <Switch checked={p.is_featured} onCheckedChange={(v) => togglePartner(p, "is_featured", v)} />
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <Switch checked={p.is_active} onCheckedChange={(v) => togglePartner(p, "is_active", v)} />
                              <div className="text-[10px] text-text-secondary mt-1">{p.is_active ? "Active" : "Inactive"}</div>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="outline" onClick={() => setDetailPartner(p)}>
                                  <Eye className="h-3 w-3 mr-1" /> View
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                                  <Pencil className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                {access === "active" ? (
                                  <Button
                                    size="sm" variant="outline"
                                    className="text-orange-700 border-orange-300 hover:bg-orange-50"
                                    disabled={actionLoading === p.id}
                                    onClick={() => setAccessTarget({ partner: p, access: "suspended" })}
                                  >
                                    <ShieldOff className="h-3 w-3 mr-1" /> Suspend access
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm" variant="outline"
                                    className="text-green-700 border-green-300 hover:bg-green-50"
                                    disabled={actionLoading === p.id}
                                    onClick={() => setPortalAccess(p, "active")}
                                  >
                                    <ShieldCheck className="h-3 w-3 mr-1" /> Reactivate access
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-700 border-red-300 hover:bg-red-50"
                                  onClick={() => setRemoveTarget(p)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" /> Remove partner
                                </Button>
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
          <Card id="deal-registrations" className="scroll-mt-24">

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
                                    <Button size="sm" variant="outline" className="text-green-700" disabled={actionLoading === d.id} onClick={() => openApproveDeal(d)}>Approve…</Button>
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
          <Card id="partner-referrals" className="scroll-mt-24">

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

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy flex items-center gap-2">
            <Bell className="h-4 w-4 text-teal" /> Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-divider p-4 bg-surface-subtle/40">
            <div className="text-sm font-semibold text-navy mb-1">Your alerts</div>
            <div className="text-xs text-text-secondary mb-3">
              Notifications sent to <span className="font-mono">{user?.email ?? "—"}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 text-[11px] font-semibold uppercase tracking-wide text-teal">Partner applications</div>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>New partner applications</span>
                <Switch
                  checked={myNotif.notify_new_application}
                  onCheckedChange={(v) => setMyNotif({ ...myNotif, notify_new_application: v })}
                />
              </label>
              <div className="sm:col-span-2 text-[11px] font-semibold uppercase tracking-wide text-teal mt-2">Deals</div>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>New deal registrations</span>
                <Switch
                  checked={myNotif.notify_new_deal}
                  onCheckedChange={(v) => setMyNotif({ ...myNotif, notify_new_deal: v })}
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>Deal status changes</span>
                <Switch
                  checked={myNotif.notify_deal_status_change}
                  onCheckedChange={(v) => setMyNotif({ ...myNotif, notify_deal_status_change: v })}
                />
              </label>
              <div className="sm:col-span-2 text-[11px] font-semibold uppercase tracking-wide text-teal mt-2">General</div>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>Receive partner programme alerts</span>
                <Switch
                  checked={myNotif.is_active}
                  onCheckedChange={(v) => setMyNotif({ ...myNotif, is_active: v })}
                />
              </label>
            </div>
            <div className="mt-4">
              <Button onClick={saveMyNotif} disabled={savingNotif}>
                {savingNotif ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save preferences
              </Button>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-navy mb-1">All recipients</div>
            <p className="text-xs text-text-secondary mb-2">
              Admins who currently receive Partner Programme notifications.
            </p>
            {notifSettings.length === 0 ? (
              <p className="text-text-secondary text-sm py-4 text-center">No admins have opted in yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-divider text-left">
                      <th className="pb-2 pr-4 font-semibold text-navy">Admin</th>
                      <th className="pb-2 pr-4 font-semibold text-navy">Applications</th>
                      <th className="pb-2 pr-4 font-semibold text-navy">Deals</th>
                      <th className="pb-2 pr-4 font-semibold text-navy">Status changes</th>
                      <th className="pb-2 pr-4 font-semibold text-navy">Active</th>
                      <th className="pb-2 font-semibold text-navy"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifSettings.map((n: any) => (
                      <tr key={n.user_id} className="border-b border-divider/50">
                        <td className="py-2 pr-4">
                          <div className="text-navy">{n.email}</div>
                          {n.user_id === user?.id && <div className="text-xs text-teal">(you)</div>}
                        </td>
                        <td className="py-2 pr-4">{n.notify_new_application ? "✓" : "—"}</td>
                        <td className="py-2 pr-4">{n.notify_new_deal ? "✓" : "—"}</td>
                        <td className="py-2 pr-4">{n.notify_deal_status_change ? "✓" : "—"}</td>
                        <td className="py-2 pr-4">
                          <Badge className={n.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
                            {n.is_active ? "on" : "off"}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {n.user_id === user?.id && (
                            <Button size="sm" variant="ghost" className="text-red-700" onClick={() => removeNotifRecipient(n)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-text-secondary mt-2">
              Each admin controls their own row. Toggle "Receive alerts" off to pause without removing yourself.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-navy flex items-center gap-2">
              <History className="h-4 w-4 text-teal" /> Audit Log
            </CardTitle>
            <Select value={auditEntity} onValueChange={setAuditEntity}>
              <SelectTrigger className="h-9 w-56 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entity types</SelectItem>
                <SelectItem value="partner_application">Applications</SelectItem>
                <SelectItem value="partner">Partners</SelectItem>
                <SelectItem value="deal_registration">Deal registrations</SelectItem>
                <SelectItem value="notification_settings">Notification settings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const rows = auditEntity === "all"
              ? auditLog
              : auditLog.filter((r: any) => r.entity_type === auditEntity);
            if (rows.length === 0) {
              return <p className="text-text-secondary text-sm py-4 text-center">No audit events yet.</p>;
            }
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-divider text-left">
                      <th className="pb-2 pr-4 font-semibold text-navy">When</th>
                      <th className="pb-2 pr-4 font-semibold text-navy">Actor</th>
                      <th className="pb-2 pr-4 font-semibold text-navy">Action</th>
                      <th className="pb-2 pr-4 font-semibold text-navy">Entity</th>
                      <th className="pb-2 pr-4 font-semibold text-navy">Target</th>
                      <th className="pb-2 font-semibold text-navy">Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r: any) => (
                      <tr key={r.id} className="border-b border-divider/50 hover:bg-surface-subtle align-top">
                        <td className="py-2 pr-4 text-text-secondary text-xs whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString("en-GB")}
                        </td>
                        <td className="py-2 pr-4 text-text-secondary text-xs">{r.actor_email ?? r.actor_user_id?.slice(0, 8) ?? "—"}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline" className="text-[11px] whitespace-nowrap">{auditActionLabel(r.action)}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-text-secondary text-xs">{r.entity_type.replace(/_/g, " ")}</td>
                        <td className="py-2 pr-4 text-navy text-xs">{r.entity_label ?? r.entity_id?.slice(0, 8) ?? "—"}</td>
                        <td className="py-2 text-text-secondary text-xs max-w-md">
                          {r.changes && Object.keys(r.changes).length > 0 ? (
                            <details>
                              <summary className="cursor-pointer list-none">
                                <span className="space-y-0.5 block">
                                  {summariseChanges(r.changes).map((line, i) => (
                                    <span key={i} className="block text-navy">{line}</span>
                                  ))}
                                </span>
                                <span className="text-[10px] text-teal underline">raw</span>
                              </summary>
                              <pre className="whitespace-pre-wrap font-mono text-[11px] bg-surface-subtle/60 p-2 rounded max-h-32 overflow-auto mt-1">
{JSON.stringify(r.changes, null, 2)}
                              </pre>
                            </details>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </CardContent>
      </Card>


      {/* Application review */}
      <PartnerApplicationReviewDialog
        app={reviewApp}
        partners={partners}
        applications={partnerApps}
        onClose={() => setReviewApp(null)}
        onDone={fetchAll}
      />

      {/* Suspend portal access confirmation */}
      <AlertDialog open={!!accessTarget} onOpenChange={(o) => !o && setAccessTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Partner Portal access?</AlertDialogTitle>
            <AlertDialogDescription>
              {accessTarget?.partner?.display_name || "This partner"} will immediately lose access to /partner/*.
              The partner relationship, commissions, deals and any Academy or Business account access are kept intact,
              and access can be reactivated at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => accessTarget && setPortalAccess(accessTarget.partner, "suspended")}
            >
              Suspend access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve deal dialog */}
      <Dialog open={!!approveDeal} onOpenChange={(o) => !o && setApproveDeal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Approve deal registration</DialogTitle></DialogHeader>
          {approveDeal && (
            <div className="grid gap-4 py-2 text-sm">
              <div className="rounded-md border border-divider bg-surface-subtle/50 p-3 space-y-1">
                <div><span className="text-text-secondary">Prospect: </span><span className="font-medium text-navy">{approveDeal.prospect_company}</span></div>
                <div><span className="text-text-secondary">Partner: </span>{(partners.find((p: any) => p.id === approveDeal.partner_id) as any)?.display_name || approveDeal.partner_id.slice(0, 8)}</div>
                <div><span className="text-text-secondary">Contact: </span>{approveDeal.prospect_contact_name || "—"}{approveDeal.prospect_email ? ` · ${approveDeal.prospect_email}` : ""}</div>
                <div><span className="text-text-secondary">Estimated ARR: </span>{approveDeal.estimated_arr_eur ? `€${Number(approveDeal.estimated_arr_eur).toLocaleString()}` : "—"}</div>
                <div><span className="text-text-secondary">Current status: </span>{approveDeal.status}</div>
                <div><span className="text-text-secondary">Protection start: </span>{new Date(approveDeal.created_at).toLocaleDateString("en-GB")}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Protection end</Label>
                  <Input
                    type="date"
                    value={dealForm.protection_expires_at}
                    onChange={(e) => setDealForm({ ...dealForm, protection_expires_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Deal status</Label>
                  <Select value={dealForm.status} onValueChange={(v) => setDealForm({ ...dealForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="pending">Keep pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Linked customer (optional)</Label>
                <Select
                  value={dealForm.customer_id || "__none__"}
                  onValueChange={(v) => setDealForm({ ...dealForm, customer_id: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger><SelectValue placeholder="No customer linked" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="__none__">— No customer linked —</SelectItem>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {(c.company_name || c.name || "Unnamed")}{c.email ? ` · ${c.email}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Internal note</Label>
                <Textarea rows={2} value={dealForm.admin_notes} onChange={(e) => setDealForm({ ...dealForm, admin_notes: e.target.value })} />
              </div>
              <p className="text-xs text-text-secondary">Estimated and actual ARR are left untouched.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDeal(null)}>Cancel</Button>
            <Button onClick={confirmApproveDeal} disabled={actionLoading === approveDeal?.id}>
              {actionLoading === approveDeal?.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Label>Commission rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={Math.round(Number(editForm.commission_rate ?? 0) * 1000) / 10}
                onChange={(e) => setEditForm({ ...editForm, commission_rate: Number(e.target.value) / 100 })}
              />
              <p className="text-[11px] text-text-secondary mt-1">Shown on the partner record and used for commission calculations.</p>
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

      {/* Partner 360 detail */}
      <PartnerDetailDialog
        partner={detailPartner}
        application={detailPartner ? partnerApps.find((a: any) => a.user_id === detailPartner.user_id) ?? null : null}
        open={!!detailPartner}
        onOpenChange={(o) => !o && setDetailPartner(null)}
      />

      {/* Remove partner confirmation */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove partner?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{removeTarget?.display_name || removeTarget?.referral_code}</strong> from
              the Partner Program, along with their referrals, deal registrations, commissions, payouts, seats and asset
              activity. To keep the history instead, switch the partner to inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => { e.preventDefault(); removePartner(); }}
            >
              {actionLoading === removeTarget?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove partner"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
}
