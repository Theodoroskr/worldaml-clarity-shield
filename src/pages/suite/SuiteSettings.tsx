// src/pages/suite/SuiteSettings.tsx
//
// Full replacement — Organisation settings + team member management.
// Uses useOrganisation() hook. Only org admins can invite/remove members.

import { useState, useEffect } from "react";
import {
  Settings, Users, Building2, Shield, Copy, Check,
  Plus, Trash2, Crown, Eye, Edit2, AlertTriangle, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganisation, type OrgRole } from "@/hooks/useOrganisation";

interface Member {
  id: string;
  user_id: string;
  role: OrgRole;
  invited_email: string | null;
  joined_at: string | null;
  created_at: string;
  email?: string;
  full_name?: string;
}

const ROLE_META: Record<OrgRole, { label: string; description: string; color: string; Icon: React.ElementType }> = {
  admin:              { label: "Admin",              description: "Full access — manage team, settings, and all data", color: "bg-purple-50 text-purple-700 border-purple-200", Icon: Crown },
  mlro:               { label: "MLRO",               description: "Money Laundering Reporting Officer — file SARs, close cases", color: "bg-red-50 text-red-700 border-red-200", Icon: Shield },
  compliance_officer: { label: "Compliance Officer", description: "Manage customers, cases, screening, alert rules", color: "bg-blue-50 text-blue-700 border-blue-200", Icon: Edit2 },
  analyst:            { label: "Analyst",            description: "Run screenings, add notes, create alerts", color: "bg-amber-50 text-amber-700 border-amber-200", Icon: Edit2 },
  viewer:             { label: "Viewer",             description: "Read-only access to all data", color: "bg-slate-50 text-slate-600 border-slate-200", Icon: Eye },
};

export default function SuiteSettings() {
  const { org, orgId, role: myRole, isAdmin, isLoading: orgLoading, refetch } = useOrganisation();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"team" | "organisation" | "roles">("team");
  const [copied, setCopied] = useState(false);

  // Invite form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("analyst");
  const [inviting, setInviting] = useState(false);

  // Org name edit
  const [editingName, setEditingName] = useState(false);
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (org) setOrgName(org.name);
  }, [org]);

  const fetchMembers = async () => {
    if (!orgId) return;
    setLoading(true);
    const { data: memberships } = await supabase
      .from("suite_org_members")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true });

    if (!memberships) { setLoading(false); return; }

    // Enrich with profile data
    const userIds = memberships.map(m => m.user_id).filter(Boolean);
    let profiles: Record<string, { email: string; full_name: string }> = {};

    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, email, full_name")
        .in("user_id", userIds);

      (profileData ?? []).forEach(p => {
        profiles[p.user_id] = { email: p.email ?? "", full_name: p.full_name ?? "" };
      });
    }

    setMembers(memberships.map(m => ({
      ...m,
      role: m.role as OrgRole,
      email: profiles[m.user_id]?.email ?? m.invited_email ?? "—",
      full_name: profiles[m.user_id]?.full_name ?? "",
    })));
    setLoading(false);
  };

  useEffect(() => {
    if (orgId) fetchMembers();
  }, [orgId]);

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !orgId) return;
    setInviting(true);

    // Check if user exists by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", inviteEmail.trim().toLowerCase())
      .maybeSingle();

    if (!profile) {
      toast.error("No WorldAML account found for this email. They need to sign up first.");
      setInviting(false);
      return;
    }

    // Check not already a member
    const existing = members.find(m => m.user_id === profile.user_id);
    if (existing) {
      toast.error("This person is already a member of your organisation.");
      setInviting(false);
      return;
    }

    const { error } = await supabase.from("suite_org_members").insert({
      organization_id: orgId,
      user_id: profile.user_id,
      role: inviteRole,
      invited_email: inviteEmail.trim().toLowerCase(),
      joined_at: new Date().toISOString(),
    });

    if (error) { toast.error(error.message); setInviting(false); return; }

    await supabase.from("suite_audit_log").insert({
      user_id: profile.user_id,
      organisation_id: orgId,
      action: `Team member invited: ${inviteEmail} as ${inviteRole}`,
      entity_type: "organisation",
    });

    toast.success(`${inviteEmail} added as ${ROLE_META[inviteRole].label}`);
    setInviteEmail("");
    setInviteRole("analyst");
    setShowInvite(false);
    fetchMembers();
    setInviting(false);
  };

  const changeRole = async (memberId: string, newRole: OrgRole) => {
    const { error } = await supabase
      .from("suite_org_members")
      .update({ role: newRole })
      .eq("id", memberId);
    if (error) { toast.error(error.message); return; }
    toast.success("Role updated");
    fetchMembers();
  };

  const removeMember = async (member: Member) => {
    if (member.role === "admin" && members.filter(m => m.role === "admin").length <= 1) {
      toast.error("Cannot remove the last admin. Promote another member first.");
      return;
    }
    const { error } = await supabase
      .from("suite_org_members")
      .delete()
      .eq("id", member.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Member removed");
    fetchMembers();
  };

  const saveOrgName = async () => {
    if (!orgId || !orgName.trim()) return;
    const { error } = await supabase
      .from("suite_organizations")
      .update({ name: orgName.trim() })
      .eq("id", orgId);
    if (error) { toast.error(error.message); return; }
    toast.success("Organisation name updated");
    setEditingName(false);
    refetch();
  };

  const copyOrgId = () => {
    if (!orgId) return;
    navigator.clipboard.writeText(orgId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "team" as const, label: "Team Members", Icon: Users },
    { id: "organisation" as const, label: "Organisation", Icon: Building2 },
    { id: "roles" as const, label: "Role Permissions", Icon: Shield },
  ];

  if (orgLoading) return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5" /> Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {org?.name} · {myRole ? ROLE_META[myRole].label : "Member"}
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px",
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── TEAM TAB ─────────────────────────────────────────────────── */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground text-sm">Team members</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {members.length} of {org?.max_users ?? 10} seats used
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                <Plus className="w-3.5 h-3.5" /> Invite member
              </button>
            )}
          </div>

          {/* Invite form */}
          {showInvite && isAdmin && (
            <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
              <h3 className="font-semibold text-foreground text-sm mb-4">Invite a team member</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email address</label>
                  <input
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && inviteMember()}
                    placeholder="colleague@company.com"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as OrgRole)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {(Object.keys(ROLE_META) as OrgRole[]).map(r => (
                      <option key={r} value={r}>{ROLE_META[r].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {ROLE_META[inviteRole].description}
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowInvite(false)} className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted">
                  Cancel
                </button>
                <button onClick={inviteMember} disabled={inviting || !inviteEmail.trim()}
                  className="text-xs px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50">
                  {inviting ? "Adding…" : "Add member"}
                </button>
              </div>
            </div>
          )}

          {/* Member list */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Member", "Role", "Joined", isAdmin ? "Actions" : ""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map(m => {
                    const Meta = ROLE_META[m.role];
                    const Icon = Meta.Icon;
                    return (
                      <tr key={m.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase shrink-0">
                              {(m.full_name || m.email || "?")[0]}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-foreground">{m.full_name || "—"}</div>
                              <div className="text-[10px] text-muted-foreground">{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isAdmin && m.user_id !== members[0]?.user_id ? (
                            <select
                              value={m.role}
                              onChange={e => changeRole(m.id, e.target.value as OrgRole)}
                              className="text-[10px] px-2 py-1 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {(Object.keys(ROLE_META) as OrgRole[]).map(r => (
                                <option key={r} value={r}>{ROLE_META[r].label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={cn("text-[10px] px-2 py-0.5 rounded border font-semibold inline-flex items-center gap-1", Meta.color)}>
                              <Icon className="w-2.5 h-2.5" />{Meta.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground">
                          {m.joined_at ? new Date(m.joined_at).toLocaleDateString("en-GB") : "Pending"}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeMember(m)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-destructive transition-all"
                              title="Remove member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── ORGANISATION TAB ──────────────────────────────────────────── */}
      {activeTab === "organisation" && (
        <div className="space-y-5 max-w-lg">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground text-sm">Organisation details</h2>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Organisation name</label>
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button onClick={saveOrgName} className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">Save</button>
                  <button onClick={() => { setEditingName(false); setOrgName(org?.name ?? ""); }} className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <span className="text-sm font-medium text-foreground">{org?.name}</span>
                  {isAdmin && (
                    <button onClick={() => setEditingName(true)} className="text-xs text-primary hover:underline">Edit</button>
                  )}
                </div>
              )}
            </div>

            {[
              { label: "Subscription plan", value: org?.subscription_tier ?? "—", badge: true },
              { label: "Status", value: org?.status ?? "—" },
              { label: "Regulator", value: org?.regulator ?? "Not set" },
              { label: "Industry", value: org?.industry ?? "Not set" },
              { label: "Country", value: org?.country ?? "Not set" },
            ].map(({ label, value, badge }) => (
              <div key={label}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  {badge ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold capitalize">
                      {value}
                    </span>
                  ) : (
                    <span className="text-sm text-foreground capitalize">{value}</span>
                  )}
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Organisation ID</label>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                <code className="text-[10px] font-mono text-muted-foreground flex-1 truncate">{orgId}</code>
                <button onClick={copyOrgId} className="shrink-0 p-1 hover:bg-muted rounded transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Share with support when reporting issues.</p>
            </div>
          </div>

          {/* Usage limits */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground text-sm mb-4">Plan limits</h2>
            {[
              { label: "Team members", used: members.length, max: org?.max_users ?? 10 },
              { label: "Screenings / month", used: null, max: org?.max_screenings_per_month ?? 1000 },
              { label: "API requests / day", used: null, max: org?.max_api_requests_per_day ?? 5000 },
            ].map(({ label, used, max }) => (
              <div key={label} className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono text-foreground">{used !== null ? `${used} / ` : ""}{max.toLocaleString()}</span>
                </div>
                {used !== null && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", used / max > 0.8 ? "bg-destructive" : "bg-primary")}
                      style={{ width: `${Math.min(100, (used / max) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
            <a href="/contact-sales" className="text-xs text-primary hover:underline mt-2 block">
              Need more capacity? Talk to sales →
            </a>
          </div>
        </div>
      )}

      {/* ── ROLES TAB ─────────────────────────────────────────────────── */}
      {activeTab === "roles" && (
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs text-muted-foreground mb-4">
            Roles control what each team member can see and do within your organisation's suite.
          </p>
          {(Object.entries(ROLE_META) as [OrgRole, typeof ROLE_META[OrgRole]][]).map(([role, meta]) => {
            const Icon = meta.Icon;
            const caps: Record<OrgRole, string[]> = {
              admin:              ["All permissions", "Manage team members", "Manage organisation settings", "Delete data", "All compliance actions"],
              mlro:               ["File SARs / STRs", "Close and escalate cases", "View all data", "Export audit log", "Manage alert rules"],
              compliance_officer: ["Manage customers", "Run screenings", "Manage cases and alerts", "Configure alert rules", "View reports"],
              analyst:            ["Run screenings", "Add case notes", "Create alerts", "View customers and transactions", "Read-only on alert rules"],
              viewer:             ["View all data (read-only)", "No create, update or delete permissions"],
            };
            return (
              <div key={role} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className={cn("text-[10px] px-2 py-1 rounded border font-semibold inline-flex items-center gap-1 shrink-0 mt-0.5", meta.color)}>
                    <Icon className="w-2.5 h-2.5" />{meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-2">{meta.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {caps[role].map(cap => (
                        <span key={cap} className="text-[10px] px-2 py-0.5 bg-muted rounded border border-border text-foreground">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
