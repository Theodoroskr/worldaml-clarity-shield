import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX, Lock, Unlock, Database, HardDrive,
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, ChevronDown, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Static edge-function registry ── */

type AuthLevel = "admin" | "authenticated" | "service_role" | "anon_key" | "webhook_secret" | "none";

interface EdgeFunctionMeta {
  name: string;
  authLevel: AuthLevel;
  description: string;
  notes?: string;
}

const EDGE_FUNCTIONS: EdgeFunctionMeta[] = [
  { name: "send-upsell-email", authLevel: "admin", description: "Send templated upsell / password-reset emails", notes: "JWT + admin role check" },
  { name: "send-admin-notification", authLevel: "admin", description: "Send arbitrary notification emails to users", notes: "JWT + admin role check" },
  { name: "notify-user-approved", authLevel: "admin", description: "Notify user their account was approved", notes: "JWT + admin role check" },
  { name: "admin-sync-course-stripe", authLevel: "admin", description: "Sync academy courses to Stripe products", notes: "JWT + admin role check" },
  { name: "send-certificate-email", authLevel: "authenticated", description: "Send certificate email after quiz pass", notes: "JWT + email ownership verification" },
  { name: "sanctions-search", authLevel: "authenticated", description: "Search sanctions lists", notes: "JWT validation" },
  { name: "suggest-rules", authLevel: "authenticated", description: "AI-powered alert rule suggestions", notes: "JWT validation" },
  { name: "assist-report", authLevel: "authenticated", description: "AI-assisted report drafting", notes: "JWT validation" },
  { name: "analyse-rule", authLevel: "authenticated", description: "AI rule analysis", notes: "JWT validation" },
  { name: "execute-workflow", authLevel: "authenticated", description: "Execute compliance workflows", notes: "JWT validation" },
  { name: "evaluate-transactions", authLevel: "authenticated", description: "Evaluate transactions against rules", notes: "JWT validation" },
  { name: "aml-ar-lookup", authLevel: "authenticated", description: "Mastercard AML AR lookup", notes: "JWT validation" },
  { name: "sof-reconcile", authLevel: "authenticated", description: "Source of Funds AI reconciliation", notes: "JWT validation" },
  { name: "customer-portal", authLevel: "authenticated", description: "Stripe customer portal session", notes: "JWT validation" },
  { name: "create-academy-checkout", authLevel: "authenticated", description: "Create Stripe checkout for academy", notes: "JWT validation" },
  { name: "create-worldaml-checkout", authLevel: "authenticated", description: "Create Stripe checkout for WorldAML", notes: "JWT validation" },
  { name: "create-worldcompliance-checkout", authLevel: "authenticated", description: "Create Stripe checkout for WorldCompliance", notes: "JWT validation" },
  { name: "create-worldid-checkout", authLevel: "authenticated", description: "Create Stripe checkout for WorldID", notes: "JWT validation" },
  { name: "certificate-og", authLevel: "none", description: "Generate OG image for certificate sharing", notes: "Public — renders images for social previews" },
  { name: "notify-new-signup", authLevel: "authenticated", description: "Admin notification on new signup", notes: "JWT or service role key" },
  { name: "send-activation-nudge", authLevel: "service_role", description: "Cron: 24h activation nudge email", notes: "Cron mode auto, test mode requires service role key" },
  { name: "send-signup-followup", authLevel: "service_role", description: "Cron: 1-day signup follow-up email", notes: "Cron mode auto, test mode requires service role key" },
  { name: "sof-expire-declarations", authLevel: "service_role", description: "Cron: expire stale SoF declarations", notes: "Internal cron job" },
  { name: "weekly-course-reminders", authLevel: "service_role", description: "Cron: weekly course reminder emails", notes: "Internal cron job" },
  { name: "stripe-academy-webhook", authLevel: "webhook_secret", description: "Stripe webhook for academy purchases", notes: "Verified via STRIPE_WEBHOOK_SECRET" },
  { name: "submit-form", authLevel: "anon_key", description: "Public form submission (contact/demo)", notes: "Accepts anon key — public forms" },
];

const AUTH_BADGE: Record<AuthLevel, { label: string; color: string; icon: typeof Shield }> = {
  admin:          { label: "Admin",         color: "bg-red-500/15 text-red-400 border-red-500/30",      icon: ShieldAlert },
  authenticated:  { label: "Authenticated", color: "bg-teal-500/15 text-teal-400 border-teal-500/30",   icon: ShieldCheck },
  service_role:   { label: "Service Role",  color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Lock },
  webhook_secret: { label: "Webhook",       color: "bg-purple-500/15 text-purple-400 border-purple-500/30", icon: Lock },
  anon_key:       { label: "Anon Key",      color: "bg-orange-500/15 text-orange-400 border-orange-500/30", icon: Unlock },
  none:           { label: "Public",        color: "bg-slate-500/15 text-slate-400 border-slate-500/30",    icon: ShieldX },
};

/* ── RLS Policy types ── */

interface RlsPolicy {
  table: string;
  rls_enabled: boolean;
  policy_name: string | null;
  command: string | null;
  permissive: string | null;
}

interface BucketInfo {
  name: string;
  public: boolean;
}

/* ── Component ── */

export default function AdminSecurityAudit() {
  const [rlsData, setRlsData] = useState<RlsPolicy[]>([]);
  const [buckets, setBuckets] = useState<BucketInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [filterAuth, setFilterAuth] = useState<AuthLevel | "all">("all");

  useEffect(() => {
    fetchSecurityData();
  }, []);

  async function fetchSecurityData() {
    setLoading(true);
    try {
      // Fetch RLS status and policies
      const { data: rlsRows } = await supabase.rpc("get_rls_audit" as any);
      if (rlsRows) setRlsData(rlsRows as unknown as RlsPolicy[]);

      // Fetch storage buckets
      const { data: bucketRows } = await supabase.rpc("get_storage_buckets_audit" as any);
      if (bucketRows) setBuckets(bucketRows as unknown as BucketInfo[]);
    } catch (err) {
      console.error("Security audit fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const toggleTable = (t: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  // Group RLS data by table
  const tableMap = rlsData.reduce<Record<string, RlsPolicy[]>>((acc, row) => {
    (acc[row.table] ??= []).push(row);
    return acc;
  }, {});

  const tablesWithoutRls = Object.entries(tableMap).filter(([, rows]) => !rows[0]?.rls_enabled);
  const tablesWithRls = Object.entries(tableMap).filter(([, rows]) => rows[0]?.rls_enabled);

  const filteredFunctions = filterAuth === "all"
    ? EDGE_FUNCTIONS
    : EDGE_FUNCTIONS.filter(f => f.authLevel === filterAuth);

  const authCounts = EDGE_FUNCTIONS.reduce<Record<string, number>>((acc, f) => {
    acc[f.authLevel] = (acc[f.authLevel] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Security Audit
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edge function authentication, RLS policies, and storage bucket status
          </p>
        </div>
        <button
          onClick={fetchSecurityData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={Lock}
          label="Edge Functions"
          value={EDGE_FUNCTIONS.length}
          sub={`${authCounts.admin || 0} admin-only`}
          color="text-teal-400"
        />
        <SummaryCard
          icon={Database}
          label="Tables with RLS"
          value={tablesWithRls.length}
          sub={`${tablesWithoutRls.length} without RLS`}
          color={tablesWithoutRls.length > 0 ? "text-red-400" : "text-teal-400"}
        />
        <SummaryCard
          icon={HardDrive}
          label="Storage Buckets"
          value={buckets.length}
          sub={`${buckets.filter(b => b.public).length} public`}
          color="text-amber-400"
        />
        <SummaryCard
          icon={ShieldX}
          label="Public Endpoints"
          value={EDGE_FUNCTIONS.filter(f => f.authLevel === "none" || f.authLevel === "anon_key").length}
          sub="No auth required"
          color="text-orange-400"
        />
      </div>

      {/* ── Section 1: Edge Functions ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Edge Functions ({filteredFunctions.length})
          </h2>
          <div className="flex gap-1 flex-wrap">
            <FilterChip active={filterAuth === "all"} onClick={() => setFilterAuth("all")} label="All" />
            {Object.keys(AUTH_BADGE).map(level => (
              <FilterChip
                key={level}
                active={filterAuth === level}
                onClick={() => setFilterAuth(level as AuthLevel)}
                label={AUTH_BADGE[level as AuthLevel].label}
              />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Function</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Auth Level</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Description</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredFunctions.map((fn) => {
                const badge = AUTH_BADGE[fn.authLevel];
                const Icon = badge.icon;
                return (
                  <tr key={fn.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">{fn.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", badge.color)}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{fn.description}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground hidden lg:table-cell">{fn.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 2: RLS Policies ── */}
      <section>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-primary" />
          Row-Level Security ({Object.keys(tableMap).length} tables)
        </h2>

        {tablesWithoutRls.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4" />
              Tables WITHOUT RLS ({tablesWithoutRls.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {tablesWithoutRls.map(([table]) => (
                <span key={table} className="font-mono text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                  {table}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/50">
          {tablesWithRls.map(([table, policies]) => {
            const expanded = expandedTables.has(table);
            const policyCount = policies.filter(p => p.policy_name).length;
            return (
              <div key={table}>
                <button
                  onClick={() => toggleTable(table)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors"
                >
                  {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span className="font-mono text-xs text-foreground">{table}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{policyCount} {policyCount === 1 ? "policy" : "policies"}</span>
                </button>
                {expanded && policyCount > 0 && (
                  <div className="bg-muted/20 px-4 pb-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left py-1 px-2 font-medium">Policy</th>
                          <th className="text-left py-1 px-2 font-medium">Command</th>
                          <th className="text-left py-1 px-2 font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policies.filter(p => p.policy_name).map((p, i) => (
                          <tr key={i} className="border-t border-border/30">
                            <td className="py-1.5 px-2 font-mono text-foreground">{p.policy_name}</td>
                            <td className="py-1.5 px-2">
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium uppercase">
                                {p.command === "*" ? "ALL" : p.command}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-muted-foreground">{p.permissive}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 3: Storage Buckets ── */}
      <section>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
          <HardDrive className="w-5 h-5 text-primary" />
          Storage Buckets ({buckets.length})
        </h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Bucket</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Visibility</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map(b => (
                <tr key={b.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{b.name}</td>
                  <td className="px-4 py-2.5">
                    {b.public ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                        <Unlock className="w-3 h-3" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-teal-400">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {b.public ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                        <AlertTriangle className="w-3 h-3" /> Review access
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-teal-400">
                        <CheckCircle2 className="w-3 h-3" /> Secured
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ── Helpers ── */

function SummaryCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Shield; label: string; value: number; sub: string; color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-5 h-5", color)} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
        active
          ? "bg-primary/15 text-primary border-primary/30"
          : "bg-transparent text-muted-foreground border-border hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}
