import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Search, Shield, ShieldCheck, ShieldX, KeyRound, UserMinus, FileText, Send, History, Handshake, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { REGULATORY_PROFILES, REGULATOR_OPTIONS } from "@/data/regulatoryProfiles";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  status: string;
  subscription_tier: string;
  suite_access_granted_at: string | null;
  regulator: string | null;
  created_at: string;
  signup_source: string | null;
  signup_landing_path: string | null;
  signup_referrer: string | null;
  signup_utm: Record<string, string> | null;
  marketing_consent: boolean | null;
  marketing_consent_at: string | null;
  marketing_opt_out_at: string | null;
}

type EligibilityReason =
  | "explicit_consent"
  | "legitimate_interest"
  | "opted_out"
  | "account_not_approved"
  | "account_too_new"
  | "already_customer"
  | "user_not_found"
  | "not_eligible";

const REASON_LABELS: Record<string, string> = {
  explicit_consent: "Opted in",
  legitimate_interest: "Legitimate interest",
  opted_out: "Opted out of marketing",
  account_not_approved: "Account not approved",
  account_too_new: "Account under 30 days old",
  already_customer: "Already a Suite customer",
  user_not_found: "Not a registered user",
  not_eligible: "Not eligible",
};

function evaluateEligibility(p: Profile): { eligible: boolean; reason: EligibilityReason } {
  if (p.marketing_opt_out_at) return { eligible: false, reason: "opted_out" };
  if (p.marketing_consent) return { eligible: true, reason: "explicit_consent" };
  if (p.status !== "approved") return { eligible: false, reason: "account_not_approved" };
  const ageMs = Date.now() - new Date(p.created_at).getTime();
  if (ageMs < 30 * 24 * 60 * 60 * 1000) return { eligible: false, reason: "account_too_new" };
  if (p.subscription_tier === "suite" || p.subscription_tier === "enterprise") {
    return { eligible: false, reason: "already_customer" };
  }
  return { eligible: true, reason: "legitimate_interest" };
}


const EMAIL_RE = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

const normalizeEmail = (value: string | null | undefined) => {
  const cleaned = (value || "")
    .trim()
    .replace(/^mailto:/i, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
  const displayMatch = cleaned.match(/<([^<>]+)>$/);
  return (displayMatch?.[1] ?? cleaned).trim().toLowerCase();
};

export default function AdminUsers() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [partnerApplicantIds, setPartnerApplicantIds] = useState<Set<string>>(new Set());
  const [partnerApplicantEmails, setPartnerApplicantEmails] = useState<Set<string>>(new Set());
  const [partnerAppMeta, setPartnerAppMeta] = useState<Record<string, { status: string; partner_type: string | null; company_name: string | null; created_at: string }>>({});


  // Grant Suite dialog state
  const [grantDialog, setGrantDialog] = useState<{ open: boolean; profile: Profile | null }>({ open: false, profile: null });
  const [selectedRegulator, setSelectedRegulator] = useState("");
  const [upsellDialog, setUpsellDialog] = useState<{ open: boolean; profile: Profile | null }>({ open: false, profile: null });
  const [upsellTemplate, setUpsellTemplate] = useState<"suite-upsell" | "screening-upsell">("suite-upsell");
  const [upsellSending, setUpsellSending] = useState(false);
  const [upsellCounts, setUpsellCounts] = useState<Record<string, number>>({});
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; profile: Profile | null }>({ open: false, profile: null });
  const [historyRows, setHistoryRows] = useState<Array<{ id: string; template_id: string; created_at: string; sent_by: string | null }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const openHistory = async (profile: Profile) => {
    setHistoryDialog({ open: true, profile });
    setHistoryLoading(true);
    setHistoryRows([]);
    const query = supabase
      .from("admin_upsell_email_log")
      .select("id, template_id, created_at, sent_by")
      .order("created_at", { ascending: false });
    const { data } = profile.user_id
      ? await query.or(`recipient_user_id.eq.${profile.user_id},recipient_email.eq.${profile.email}`)
      : await query.eq("recipient_email", profile.email ?? "");
    setHistoryRows((data as any) || []);
    setHistoryLoading(false);
  };

  const sendUpsellEmail = async () => {
    const recipientEmail = normalizeEmail(upsellDialog.profile?.email);
    if (!recipientEmail || /[\s,;<>]/.test(recipientEmail) || !EMAIL_RE.test(recipientEmail)) {
      toast.error("This user does not have a valid email address.");
      return;
    }
    setUpsellSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-upsell-email", {
        body: {
          recipientEmail,
          recipientName: upsellDialog.profile.full_name || "",
          templateId: upsellTemplate,
        },
      });
      if (error) {
        // Try to surface the real error message from the function response body
        let detail = error.message;
        try {
          const ctx: any = (error as any).context;
          const body = ctx && typeof ctx.json === "function" ? await ctx.json() : null;
          if (body?.error) detail = body.error;
        } catch { /* ignore */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      toast.success(`Upsell email sent to ${recipientEmail}`);
      setUpsellDialog({ open: false, profile: null });
      const key = upsellDialog.profile?.user_id || recipientEmail;
      setUpsellCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setUpsellSending(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const [{ data: p }, { data: r }, { data: logs }, { data: pa }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("admin_upsell_email_log").select("recipient_user_id, recipient_email"),
      supabase.from("partner_applications").select("user_id, email, status, partner_type, company_name, created_at").order("created_at", { ascending: false }),
    ]);
    setProfiles((p || []) as Profile[]);
    const roleMap: Record<string, string[]> = {};
    (r || []).forEach((row: any) => {
      if (!roleMap[row.user_id]) roleMap[row.user_id] = [];
      roleMap[row.user_id].push(row.role);
    });
    setUserRoles(roleMap);
    const counts: Record<string, number> = {};
    (logs || []).forEach((row: any) => {
      const key = row.recipient_user_id || row.recipient_email;
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    setUpsellCounts(counts);
    const ids = new Set<string>();
    const emails = new Set<string>();
    const meta: Record<string, any> = {};
    (pa || []).forEach((row: any) => {
      if (row.user_id) ids.add(row.user_id);
      if (row.email) emails.add(String(row.email).toLowerCase());
      const key = row.user_id || String(row.email || "").toLowerCase();
      // keep the most recent (first due to order desc)
      if (key && !meta[key]) meta[key] = { status: row.status, partner_type: row.partner_type, company_name: row.company_name, created_at: row.created_at };
    });
    setPartnerApplicantIds(ids);
    setPartnerApplicantEmails(emails);
    setPartnerAppMeta(meta);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (profileId: string, newStatus: string) => {
    setActionLoading(profileId);
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", profileId);
    if (error) toast.error("Failed to update");
    else {
      toast.success(`User ${newStatus}`);
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, status: newStatus } : p));
    }
    setActionLoading(null);
  };

  const toggleRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    const hasRole = userRoles[userId]?.includes(role);
    if (hasRole) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
      setUserRoles(prev => ({ ...prev, [userId]: (prev[userId] || []).filter(r => r !== role) }));
      toast.success(`Removed ${role} role`);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      setUserRoles(prev => ({ ...prev, [userId]: [...(prev[userId] || []), role] }));
      toast.success(`Added ${role} role`);
    }
    setActionLoading(null);
  };

  const openGrantDialog = (profile: Profile) => {
    setSelectedRegulator(profile.regulator || "");
    setGrantDialog({ open: true, profile });
  };

  const confirmGrantSuiteAccess = async () => {
    const profile = grantDialog.profile;
    if (!profile?.email) return;
    if (!selectedRegulator) {
      toast.error("Please select a reporting regulator");
      return;
    }

    setActionLoading(profile.id);
    const { error } = await supabase.rpc("admin_grant_suite_access", {
      target_email: profile.email,
      target_regulator: selectedRegulator,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Suite access granted with regulator assigned");
      setProfiles(prev => prev.map(p =>
        p.id === profile.id
          ? { ...p, subscription_tier: "suite", suite_access_granted_at: new Date().toISOString(), regulator: selectedRegulator }
          : p
      ));
    }
    setActionLoading(null);
    setGrantDialog({ open: false, profile: null });
  };

  const toggleMarketingConsent = async (profile: Profile, optIn: boolean) => {
    setActionLoading(profile.id);
    const now = new Date().toISOString();
    const patch = optIn
      ? { marketing_consent: true, marketing_consent_at: now, marketing_opt_out_at: null }
      : { marketing_consent: false, marketing_opt_out_at: now };
    const { error } = await supabase.from("profiles").update(patch as any).eq("id", profile.id);
    if (error) toast.error(error.message);
    else {
      toast.success(optIn ? "Marketing consent recorded" : "Marketing opt-out recorded");
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, ...patch } as Profile : p));
    }
    setActionLoading(null);
  };

  const revokeSuiteAccess = async (email: string, profileId: string) => {
    setActionLoading(profileId);
    const { error } = await supabase.rpc("admin_revoke_suite_access", { target_email: email });
    if (error) toast.error(error.message);
    else {
      toast.success("Suite access revoked");
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, subscription_tier: "free", suite_access_granted_at: null } : p));
    }
    setActionLoading(null);
  };

  const updateRegulator = async (profileId: string, regulator: string) => {
    setActionLoading(profileId);
    const { error } = await supabase.from("profiles").update({ regulator }).eq("id", profileId);
    if (error) toast.error("Failed to update regulator");
    else {
      toast.success(`Regulator updated to ${REGULATORY_PROFILES[regulator]?.shortName || regulator}`);
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, regulator } : p));
    }
    setActionLoading(null);
  };

  const isSuiteUser = (p: Profile) => p.subscription_tier === "suite" || p.subscription_tier === "enterprise";
  const isAcademyUser = (p: Profile) => p.subscription_tier === "academy";
  const isPartnerApplicant = (p: Profile) =>
    (p.user_id && partnerApplicantIds.has(p.user_id)) ||
    (p.email && partnerApplicantEmails.has(p.email.toLowerCase()));
  const nonAcademyProfiles = profiles.filter(p => !isAcademyUser(p));
  const partnerApplicants = nonAcademyProfiles.filter(isPartnerApplicant);
  const nonPartnerProfiles = nonAcademyProfiles.filter(p => !isPartnerApplicant(p));
  const suiteUsers = nonPartnerProfiles.filter(isSuiteUser);
  const regularUsers = nonPartnerProfiles.filter(p => !isSuiteUser(p));
  const academyUsers = profiles.filter(isAcademyUser);

  const allSources = Array.from(
    new Set(profiles.map(p => p.signup_source).filter(Boolean) as string[])
  ).sort();

  const applyFilters = (list: Profile[]) =>
    list.filter(p => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchSource =
        sourceFilter === "all" ||
        (sourceFilter === "unknown" ? !p.signup_source : p.signup_source === sourceFilter);
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (p.full_name || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.company_name || "").toLowerCase().includes(q) ||
        (p.signup_source || "").toLowerCase().includes(q);
      return matchStatus && matchSource && matchSearch;
    });

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>;
    if (s === "rejected") return <Badge className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
  };

  const tierBadge = (tier: string) => {
    if (tier === "enterprise") return <Badge className="bg-violet-50 text-violet-700 border-violet-200">Enterprise</Badge>;
    if (tier === "suite") return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Suite</Badge>;
    if (tier === "academy") return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200">Academy</Badge>;
    return <Badge variant="outline" className="text-xs text-muted-foreground">Free</Badge>;
  };

  const sourceBadge = (p: Profile) => {
    if (!p.signup_source) return <span className="text-xs text-muted-foreground">—</span>;
    const utm = p.signup_utm || {};
    const campaign = utm.utm_campaign || utm.utm_medium;
    const title = [
      p.signup_landing_path && `Landing: ${p.signup_landing_path}`,
      p.signup_referrer && `Referrer: ${p.signup_referrer}`,
      Object.keys(utm).length && `UTM: ${JSON.stringify(utm)}`,
    ].filter(Boolean).join("\n");
    return (
      <div className="flex flex-col gap-0.5" title={title}>
        <Badge variant="outline" className="text-xs font-medium bg-teal-50 text-teal-700 border-teal-200 w-fit">
          {p.signup_source}
        </Badge>
        {campaign && <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{campaign}</span>}
      </div>
    );
  };

  const regulatorBadge = (reg: string | null) => {
    if (!reg) return <span className="text-xs text-muted-foreground">—</span>;
    const profile = REGULATORY_PROFILES[reg];
    return (
      <Badge variant="outline" className="text-xs font-medium bg-primary/5 text-primary border-primary/20">
        <Shield className="w-2.5 h-2.5 mr-1" />
        {profile?.shortName || reg}
      </Badge>
    );
  };


  const renderTable = (list: Profile[], showSuiteActions: boolean) => {
    const filtered = applyFilters(list);
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["User", "Company", "Status", "Tier", "Source", "Regulator", "Roles", "Registered", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{p.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{p.email}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.company_name || "—"}</td>
                <td className="px-4 py-3">{statusBadge(p.status)}</td>
                <td className="px-4 py-3">{tierBadge(p.subscription_tier)}</td>
                <td className="px-4 py-3">{sourceBadge(p)}</td>

                <td className="px-4 py-3">
                  {isSuiteUser(p) ? (
                    <Select
                      value={p.regulator || ""}
                      onValueChange={(v) => updateRegulator(p.id, v)}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs border-dashed">
                        <SelectValue placeholder="Assign…">
                          {p.regulator ? REGULATORY_PROFILES[p.regulator]?.shortName || p.regulator : "Assign…"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {REGULATOR_OPTIONS.map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            <span className="font-medium">{r.label}</span>
                            <span className="text-muted-foreground ml-1">({r.country})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : regulatorBadge(p.regulator)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {(userRoles[p.user_id] || []).map(r => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}
                    {!(userRoles[p.user_id] || []).length && <span className="text-xs text-muted-foreground">user</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    {p.status !== "approved" && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => updateStatus(p.id, "approved")} disabled={actionLoading === p.id}>
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />Approve
                      </Button>
                    )}
                    {p.status !== "rejected" && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => updateStatus(p.id, "rejected")} disabled={actionLoading === p.id}>
                        <ShieldX className="w-3.5 h-3.5 mr-1" />Reject
                      </Button>
                    )}
                    {p.user_id !== user?.id && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleRole(p.user_id, "admin")} disabled={actionLoading === p.user_id}>
                        <Shield className="w-3.5 h-3.5 mr-1" />{userRoles[p.user_id]?.includes("admin") ? "Remove Admin" : "Make Admin"}
                      </Button>
                    )}
                    {showSuiteActions && isSuiteUser(p) && p.email && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => revokeSuiteAccess(p.email!, p.id)} disabled={actionLoading === p.id}>
                        <UserMinus className="w-3.5 h-3.5 mr-1" />Revoke Suite
                      </Button>
                    )}
                    {!showSuiteActions && !isSuiteUser(p) && p.email && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600" onClick={() => openGrantDialog(p)} disabled={actionLoading === p.id}>
                        <KeyRound className="w-3.5 h-3.5 mr-1" />Grant Suite
                      </Button>
                    )}
                    {p.email && (() => {
                      const el = evaluateEligibility(p);
                      return (
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-7 text-xs ${el.eligible ? "text-teal-600" : "text-muted-foreground"}`}
                          onClick={() => { setUpsellTemplate("suite-upsell"); setUpsellDialog({ open: true, profile: p }); }}
                          disabled={!el.eligible}
                          title={el.eligible ? `Basis: ${REASON_LABELS[el.reason]}` : `Blocked: ${REASON_LABELS[el.reason]}`}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Upsell
                          {!el.eligible && <span className="ml-1 text-[10px] opacity-70">· blocked</span>}
                        </Button>
                      );
                    })()}
                    {p.email && (upsellCounts[p.user_id] || upsellCounts[p.email] || 0) > 0 && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => openHistory(p)}>
                        <History className="w-3.5 h-3.5 mr-1" />
                        History
                        <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
                          {upsellCounts[p.user_id] || upsellCounts[p.email] || 0}
                        </Badge>
                      </Button>
                    )}
                    {p.email && (
                      p.marketing_opt_out_at ? (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={() => toggleMarketingConsent(p, true)} disabled={actionLoading === p.id} title={`Opted out ${new Date(p.marketing_opt_out_at).toLocaleDateString()}`}>
                          Opted out · re-enable
                        </Button>
                      ) : p.marketing_consent ? (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => toggleMarketingConsent(p, false)} disabled={actionLoading === p.id} title={p.marketing_consent_at ? `Opted in ${new Date(p.marketing_consent_at).toLocaleDateString()}` : "Opted in"}>
                          Opted in · opt out
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => toggleMarketingConsent(p, true)} disabled={actionLoading === p.id}>
                          Record opt-in
                        </Button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-sm text-muted-foreground">No users found.</div>}
      </div>
    );
  };

  const selectedProfile = REGULATORY_PROFILES[selectedRegulator];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">User Management</h1>
          <p className="text-xs text-muted-foreground">
            {nonPartnerProfiles.length} platform users · {suiteUsers.length} suite users · {partnerApplicants.length} partner applicants (processed in <Link to="/admin/partners" className="text-primary hover:underline">Partner Program</Link>) · {academyUsers.length} academy learners (managed in <a href="/admin/academy-users" className="text-primary hover:underline">Academy Signups</a>)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="w-full pl-8 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40 text-sm"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
            {allSources.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Platform Users ({nonPartnerProfiles.length})</TabsTrigger>
            <TabsTrigger value="suite">Suite Users ({suiteUsers.length})</TabsTrigger>
            <TabsTrigger value="regular">Regular Users ({regularUsers.length})</TabsTrigger>
            <TabsTrigger value="partners" className="gap-1.5">
              <Handshake className="w-3.5 h-3.5" />
              Partner Applicants ({partnerApplicants.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderTable(nonPartnerProfiles, false)}</TabsContent>
          <TabsContent value="suite">{renderTable(suiteUsers, true)}</TabsContent>
          <TabsContent value="regular">{renderTable(regularUsers, false)}</TabsContent>
          <TabsContent value="partners">
            <div className="mb-3 flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <span>These users applied to the Partner Program. Approve, reject, or edit their partner records in the dedicated workspace.</span>
              <Link to="/admin/partners" className="inline-flex items-center gap-1 text-primary hover:underline">
                Open Partner Program <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {renderPartnerApplicantsTable(applyFilters(partnerApplicants))}
          </TabsContent>
        </Tabs>
      )}

      {/* Grant Suite Access Dialog */}
      <Dialog open={grantDialog.open} onOpenChange={(open) => !open && setGrantDialog({ open: false, profile: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Grant Suite Access
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm font-medium">{grantDialog.profile?.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground">{grantDialog.profile?.email}</p>
              {grantDialog.profile?.company_name && (
                <p className="text-xs text-muted-foreground">{grantDialog.profile.company_name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Reporting Regulator <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Select the regulator this customer reports to. This will determine their reporting obligations, alert rules, and risk framework.
              </p>
              <Select value={selectedRegulator} onValueChange={setSelectedRegulator}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select regulator…" />
                </SelectTrigger>
                <SelectContent>
                  {REGULATOR_OPTIONS.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      <span className="font-medium">{r.label}</span>
                      <span className="text-muted-foreground ml-1.5">({r.country})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfile && (
              <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2 animate-fade-in">
                <p className="text-xs font-medium text-foreground">{selectedProfile.name}</p>
                <p className="text-[10px] text-muted-foreground">{selectedProfile.legislation}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedProfile.reportingObligations.map(ob => (
                    <span key={ob.code} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                      <FileText className="w-2.5 h-2.5" /> {ob.code}
                      {ob.threshold && <span className="text-muted-foreground">({ob.threshold})</span>}
                    </span>
                  ))}
                </div>
                <div className="mt-2">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">Will be configured:</p>
                  <ul className="text-[10px] text-muted-foreground space-y-0.5">
                    <li>• {selectedProfile.baselineRules.length} monitoring alert rules</li>
                    <li>• {selectedProfile.reportingObligations.length} reporting obligations</li>
                    <li>• Risk weights: Country {selectedProfile.riskWeights.countryRisk}%, Screening {selectedProfile.riskWeights.screeningMatches}%, Transactions {selectedProfile.riskWeights.transactions}%</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setGrantDialog({ open: false, profile: null })}>
              Cancel
            </Button>
            <Button size="sm" onClick={confirmGrantSuiteAccess} disabled={!selectedRegulator || actionLoading === grantDialog.profile?.id}>
              {actionLoading === grantDialog.profile?.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <KeyRound className="w-3.5 h-3.5 mr-1" />
              )}
              Grant Suite Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Upsell Email Dialog */}
      <Dialog open={upsellDialog.open} onOpenChange={(open) => !open && setUpsellDialog({ open: false, profile: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-600" />
              Send Upsell Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm font-medium">{upsellDialog.profile?.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground">{upsellDialog.profile?.email}</p>
              {upsellDialog.profile?.company_name && (
                <p className="text-xs text-muted-foreground">{upsellDialog.profile.company_name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Template</label>
              <Select value={upsellTemplate} onValueChange={(v: any) => setUpsellTemplate(v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suite-upsell">
                    <span className="font-medium">WorldAML Suite</span>
                    <span className="text-muted-foreground ml-1.5">— Full platform upsell</span>
                  </SelectItem>
                  <SelectItem value="screening-upsell">
                    <span className="font-medium">AML Screening</span>
                    <span className="text-muted-foreground ml-1.5">— 1,900+ watchlists</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {upsellDialog.profile && (() => {
              const el = evaluateEligibility(upsellDialog.profile);
              return el.eligible ? (
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs text-emerald-800">
                  <strong>Eligible to receive sales outreach.</strong><br />
                  Legal basis: <span className="font-medium">{REASON_LABELS[el.reason]}</span>
                  {el.reason === "legitimate_interest" && " — approved account &gt; 30 days, not yet a Suite customer."}
                  {upsellDialog.profile.marketing_consent_at && (
                    <> · Consent recorded {new Date(upsellDialog.profile.marketing_consent_at).toLocaleDateString()}</>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 text-xs text-red-800">
                  <strong>Send blocked:</strong> {REASON_LABELS[el.reason]}.
                  <br />This user does not meet the consent or legitimate-interest rules for one-to-one sales outreach.
                </div>
              );
            })()}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 text-xs text-amber-800">
              <strong>Note:</strong> This sends a single personalised email via Resend to this user. A copy is CC'd to compliance@infocreditgroup.com and logged in the audit trail.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setUpsellDialog({ open: false, profile: null })}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={sendUpsellEmail}
              disabled={upsellSending || !(upsellDialog.profile && evaluateEligibility(upsellDialog.profile).eligible)}
            >
              {upsellSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-1" />
              )}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upsell Email History Dialog */}
      <Dialog open={historyDialog.open} onOpenChange={(open) => !open && setHistoryDialog({ open: false, profile: null })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Upsell Email History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm font-medium">{historyDialog.profile?.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground">{historyDialog.profile?.email}</p>
            </div>
            {historyLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
            ) : historyRows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No upsell emails sent to this user yet.</p>
            ) : (
              <div className="max-h-80 overflow-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Template</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historyRows.map(row => (
                      <tr key={row.id}>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                            {row.template_id}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setHistoryDialog({ open: false, profile: null })}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
