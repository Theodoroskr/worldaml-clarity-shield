import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, X, Loader2, Flag, CheckCircle2, ShieldOff, ShieldCheck, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { runScreening, type ScreeningResult, type ScreeningResponse } from "@/services/screeningProvider";
import { useNavigate } from "react-router-dom";
import { useOrganisation } from "@/hooks/useOrganisation";
import { useFeatureLimits } from "@/hooks/useFeatureLimits";
import UpgradeModal, { UpgradeBanner } from "@/components/suite/UpgradeModal";
import {
  applyWhitelist,
  addWhitelistEntry,
  revokeWhitelistEntry,
  fetchWhitelist,
  type WhitelistEntry,
} from "@/lib/suite/screeningWhitelist";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";


interface StoredScreening {
  id: string;
  customer_id: string;
  screening_type: string;
  result: string;
  match_count: number;
  screened_at: string;
}

interface Customer {
  id: string;
  name: string;
}

const confidenceColor = (c: number) =>
  c >= 70 ? "text-destructive" : c >= 40 ? "text-amber-600" : "text-emerald-600";
const confidenceBg = (c: number) =>
  c >= 70 ? "bg-destructive" : c >= 40 ? "bg-amber-400" : "bg-emerald-500";

const listBadgeStyle: Record<string, string> = {
  "OFAC SDN": "bg-red-50 text-red-700 border-red-200",
  "EU Sanctions": "bg-orange-50 text-orange-700 border-orange-200",
  "UN Consolidated": "bg-orange-50 text-orange-700 border-orange-200",
  "HMT UK": "bg-amber-50 text-amber-700 border-amber-200",
  "Interpol": "bg-red-50 text-red-700 border-red-200",
  "FATF High-Risk": "bg-red-50 text-red-700 border-red-200",
};
const pepBadgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
const mediaBadgeStyle = "bg-slate-50 text-slate-600 border-slate-200";

function listBadge(listType: string) {
  if (listType.startsWith("PEP")) return pepBadgeStyle;
  if (listType === "Adverse Media") return mediaBadgeStyle;
  return listBadgeStyle[listType] ?? "bg-muted text-muted-foreground border-border";
}

export default function SuiteScreening() {
  const navigate = useNavigate();
  const { orgId, userId, isLoading: orgLoading } = useOrganisation();
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [response, setResponse] = useState<ScreeningResponse | null>(null);
  const [history, setHistory] = useState<StoredScreening[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [dismissedResults, setDismissedResults] = useState<Set<string>>(new Set());
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // False-positive memory (screening whitelist)
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [suppressed, setSuppressed] = useState<{ result: ScreeningResult; entry: WhitelistEntry }[]>([]);
  const [wlTarget, setWlTarget] = useState<ScreeningResult | null>(null);
  const [wlReason, setWlReason] = useState("");
  const [wlReviewer, setWlReviewer] = useState("");
  const [wlExpiry, setWlExpiry] = useState("");
  const [wlAllLists, setWlAllLists] = useState(false);
  const [wlSaving, setWlSaving] = useState(false);


  const { checkLimit, subscriptionTier } = useFeatureLimits();

  // Count this month's screenings for limit check
  const monthlyScreenings = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return history.filter(h => h.screened_at >= startOfMonth).length;
  }, [history]);

  const screeningLimit = useMemo(
    () => checkLimit("screeningsPerMonth", monthlyScreenings),
    [monthlyScreenings, checkLimit],
  );

  const loadHistory = useCallback(async () => {
    if (!orgId) return;
    const [sRes, cRes] = await Promise.all([
      supabase.from("suite_screenings").select("*").eq("organisation_id", orgId)
        .order("screened_at", { ascending: false }).limit(50),
      supabase.from("suite_customers").select("id, name").eq("organisation_id", orgId),
    ]);
    setHistory(sRes.data ?? []);
    setCustomers(cRes.data ?? []);

    const preselectId = sessionStorage.getItem("screening_preselect_customer_id");
    const preselectName = sessionStorage.getItem("screening_preselect_customer_name");
    if (preselectId) {
      setSelectedCustomerId(preselectId);
      if (preselectName) setSearchName(preselectName);
      sessionStorage.removeItem("screening_preselect_customer_id");
      sessionStorage.removeItem("screening_preselect_customer_name");
    } else if (cRes.data?.length && !selectedCustomerId) {
      setSelectedCustomerId(cRes.data[0].id);
    }
  }, [orgId, selectedCustomerId]);

  const loadWhitelist = useCallback(async () => {
    if (!selectedCustomerId) { setWhitelist([]); return; }
    setWhitelist(await fetchWhitelist(selectedCustomerId));
  }, [selectedCustomerId]);

  useEffect(() => { if (!orgLoading && orgId) loadHistory(); }, [orgId, orgLoading]);
  useEffect(() => { loadWhitelist(); }, [loadWhitelist]);


  const runSearch = async () => {
    if (!searchName.trim()) { toast.error("Enter a name to search"); return; }
    if (!selectedCustomerId) { toast.error("Select a customer to link this screening to"); return; }

    // Feature-limit gate
    if (screeningLimit.isAtLimit) {
      setUpgradeOpen(true);
      return;
    }

    setSearching(true);
    setResponse(null);
    setDismissedResults(new Set());
    setSuppressed([]);

    try {
      const res = await runScreening({ query: searchName, minConfidence: 20 });
      setResponse(res);

      // False-positive memory: suppress hits previously cleared for this customer
      const { live, suppressed: sup, entries } = await applyWhitelist(selectedCustomerId, res.results);
      setSuppressed(sup);
      setWhitelist(entries);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const matchCount = live.length;
      const highConfidence = live.filter(r => r.confidence >= 70);
      const result = matchCount === 0 ? "clear" : highConfidence.length > 0 ? "potential_match" : "low_match";

      await supabase.from("suite_screenings").insert({
        customer_id: selectedCustomerId,
        user_id: user.id,
        screening_type: "sanctions_pep",
        result,
        match_count: matchCount,
      });

      await supabase.from("suite_audit_log").insert({
        user_id: user.id,
        action: `AML screening — "${searchName}" — ${matchCount} matches${sup.length ? ` (${sup.length} whitelisted)` : ""}`,
        entity_type: "screening",
        details: {
          detail: `Provider: ${res.provider}, Lists: ${res.listsSearched.length}, Result: ${result}`,
          query: searchName,
          match_count: matchCount,
          suppressed_count: sup.length,
        },
      });

      if (highConfidence.length > 0) {
        const topHit = highConfidence[0];
        await supabase.from("suite_alerts").insert({
          customer_id: selectedCustomerId,
          user_id: user.id,
          alert_type: "screening",
          severity: topHit.confidence >= 85 ? "critical" : "high",
          title: `Screening match: ${topHit.name} (${topHit.confidence}% confidence)`,
          description: `${matchCount} matches found. Top hit: ${topHit.listType} — ${topHit.position}. Query: "${searchName}"`,
        });
        toast.warning(`${highConfidence.length} high-confidence match${highConfidence.length > 1 ? "es" : ""} found — alert created`);
      } else if (matchCount > 0) {
        toast.info(`${matchCount} low-confidence match${matchCount > 1 ? "es" : ""} found — review recommended`);
      } else if (sup.length > 0) {
        toast.success(`Clear — ${sup.length} known false positive${sup.length > 1 ? "s" : ""} suppressed, no alert raised`);
      } else {
        toast.success("Clear — no matches found across all lists");
      }

      loadHistory();
    } catch (err: any) {
      toast.error(err.message ?? "Screening failed");
    } finally {
      setSearching(false);
    }
  };

  const saveWhitelistEntry = async () => {
    if (!wlTarget) return;
    if (!wlReason.trim()) { toast.error("A reason is required for the audit trail"); return; }
    if (!selectedCustomerId) { toast.error("Select a customer first"); return; }
    setWlSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setWlSaving(false); return; }

    const { error } = await addWhitelistEntry({
      orgId: orgId ?? null,
      customerId: selectedCustomerId,
      userId: user.id,
      result: wlTarget,
      reason: wlReason.trim(),
      reviewedBy: wlReviewer.trim() || null,
      expiresAt: wlExpiry ? new Date(wlExpiry).toISOString() : null,
      scopeAllLists: wlAllLists,
    });
    setWlSaving(false);

    if (error) {
      toast.error(error.message.includes("duplicate") ? "This match is already whitelisted for the customer" : error.message);
      return;
    }

    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `Screening false positive whitelisted: ${wlTarget.name}`,
      entity_type: "screening_whitelist",
      entity_id: selectedCustomerId,
      details: {
        detail: `Reason: ${wlReason.trim()}`,
        list_type: wlAllLists ? "all lists" : wlTarget.listType,
        expires_at: wlExpiry || null,
      },
    });

    setDismissedResults(s => new Set([...s, wlTarget.id]));
    setWlTarget(null);
    setWlReason(""); setWlReviewer(""); setWlExpiry(""); setWlAllLists(false);
    toast.success("Marked as false positive — future hits won't raise alerts");
    loadWhitelist();
  };

  const revokeEntry = async (entry: WhitelistEntry) => {
    const { error } = await revokeWhitelistEntry(entry.id);
    if (error) { toast.error(error.message); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("suite_audit_log").insert({
        user_id: user.id,
        action: `Screening whitelist revoked: ${entry.match_name}`,
        entity_type: "screening_whitelist",
        entity_id: entry.customer_id,
      });
    }
    toast.success("Whitelist entry revoked — matches will alert again");
    loadWhitelist();
  };


  const createCase = async (result: ScreeningResult) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("suite_cases").insert({
      user_id: user.id,
      customer_id: selectedCustomerId || null,
      title: `Screening match: ${result.name}`,
      priority: result.confidence >= 85 ? "critical" : result.confidence >= 70 ? "high" : "medium",
    }).select().single();
    if (error) { toast.error(error.message); return; }
    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `Case created from screening match: ${result.name}`,
      entity_type: "case",
      entity_id: data.id,
    });
    toast.success("Case created — opening…");
    navigate("/suite/cases");
  };

  const customerName = (id: string) =>
    customers.find(c => c.id === id)?.name ?? "Unknown";

  const visibleResults = response?.results.filter(r => !dismissedResults.has(r.id)) ?? [];

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AML Screening</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Sanctions · PEP · Adverse Media · {response ? response.listsSearched.length : 7} lists
        </p>
      </div>

      {/* Upgrade banner — shows at ≥80% of limit */}
      <UpgradeBanner
        context={screeningLimit}
        currentTier={subscriptionTier}
        onUpgradeClick={() => setUpgradeOpen(true)}
      />

      {/* Upgrade modal */}
      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        context={screeningLimit}
        currentTier={subscriptionTier}
      />

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Search</h2>
        <div className="flex gap-3 items-end flex-wrap">
          {customers.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Customer</label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex-1 min-w-56">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name *</label>
            <input
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !searching && runSearch()}
              placeholder="e.g. John Cameron"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={runSearch}
            disabled={searching}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-60"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap text-xs text-muted-foreground">
          <span>Lists:</span>
          {["OFAC SDN", "EU Sanctions", "UN Consolidated", "HMT UK", "PEP Class 1–4", "Adverse Media", "Interpol"].map(l => (
            <span key={l} className="px-2 py-0.5 bg-muted rounded-full border border-border">{l}</span>
          ))}
        </div>
      </div>

      {response && (
        <div className="bg-card rounded-xl border border-border animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="font-semibold text-foreground">
                {visibleResults.length === 0 ? "No matches" : `${visibleResults.length} match${visibleResults.length > 1 ? "es" : ""} found`}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Query: "{searchName}" · Provider: {response.provider} ·{" "}
                {new Date(response.searchedAt).toLocaleTimeString("en-GB")}
              </p>
            </div>
            <button onClick={() => setResponse(null)} className="p-1 hover:bg-muted rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {visibleResults.length === 0 ? (
            <div className="flex items-center gap-3 p-6 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium text-sm">No matches across all searched lists</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleResults.map(result => (
                <div key={result.id} className="p-5 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-semibold text-foreground">{result.name}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded border font-semibold", listBadge(result.listType))}>
                          {result.listType}
                        </span>
                        {result.confidence >= 70 && (
                          <span className="text-xs px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200 font-semibold">
                            High confidence
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap mb-1">
                        {result.dob !== "Unknown" && <span>DOB: {result.dob}</span>}
                        {result.countries.length > 0 && <span>Countries: {result.countries.join(", ")}</span>}
                        {result.aliases.length > 0 && <span>Also known as: {result.aliases.join(", ")}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{result.position}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Source: {result.dataSource} · Updated: {result.lastUpdated}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-center">
                        <div className={cn("text-xl font-bold font-mono", confidenceColor(result.confidence))}>
                          {result.confidence}%
                        </div>
                        <div className="text-xs text-muted-foreground">confidence</div>
                        <div className="w-16 h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", confidenceBg(result.confidence))}
                            style={{ width: `${result.confidence}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => createCase(result)}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium"
                        >
                          <Flag className="w-2.5 h-2.5" /> Create case
                        </button>
                        <button
                          onClick={() => { setWlTarget(result); setWlReason(""); setWlReviewer(""); setWlExpiry(""); setWlAllLists(false); }}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 border border-border rounded text-muted-foreground hover:bg-muted"
                        >
                          <ShieldOff className="w-2.5 h-2.5" /> False positive
                        </button>
                        <button
                          onClick={() => setDismissedResults(s => new Set([...s, result.id]))}
                          className="text-[10px] px-2 py-1 border border-border rounded text-muted-foreground hover:bg-muted"
                        >
                          Dismiss
                        </button>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {suppressed.length > 0 && (
        <div className="bg-card rounded-xl border border-border animate-fade-in">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <h2 className="font-semibold text-foreground text-sm">
                {suppressed.length} hit{suppressed.length > 1 ? "s" : ""} suppressed by false-positive memory
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Previously cleared for this customer — no alert raised, but still logged for audit.
              </p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {suppressed.map(({ result, entry }) => (
              <div key={result.id} className="px-5 py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{result.name}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded border font-semibold", listBadge(result.listType))}>
                      {result.listType}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{result.confidence}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cleared: {entry.reason}
                    {entry.reviewed_by ? ` · by ${entry.reviewed_by}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => revokeEntry(entry)}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 border border-border rounded text-muted-foreground hover:bg-muted shrink-0"
                >
                  <Undo2 className="w-2.5 h-2.5" /> Re-enable alerts
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCustomerId && whitelist.length > 0 && (
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              Whitelist — {customerName(selectedCustomerId)}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {whitelist.length} active false-positive record{whitelist.length > 1 ? "s" : ""}. Suppressed hits never create alerts.
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Match", "List", "Reason", "Reviewer", "Suppressed", "Expires", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {whitelist.map(e => (
                <tr key={e.id} className="hover:bg-muted/20">
                  <td className="px-5 py-3 font-medium text-foreground">{e.match_name}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{e.list_type ?? "All lists"}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground max-w-xs truncate" title={e.reason}>{e.reason}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{e.reviewed_by ?? "—"}</td>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                    {e.hit_count}
                    {e.last_hit_at ? ` · ${new Date(e.last_hit_at).toLocaleDateString("en-GB")}` : ""}
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                    {e.expires_at ? new Date(e.expires_at).toLocaleDateString("en-GB") : "Never"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => revokeEntry(e)}
                      className="text-[10px] px-2 py-1 border border-border rounded text-muted-foreground hover:bg-muted"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Screening History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{history.length} screenings recorded</p>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No screenings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Customer", "Type", "Result", "Matches", "Date"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map(s => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{customerName(s.customer_id)}</td>
                  <td className="px-5 py-3 text-xs capitalize text-muted-foreground">{s.screening_type}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      s.result === "clear" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : s.result === "potential_match" ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {s.result.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono font-bold text-foreground">{s.match_count}</td>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                    {new Date(s.screened_at).toLocaleString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mark as false positive */}
      <Dialog open={!!wlTarget} onOpenChange={o => !o && setWlTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as false positive</DialogTitle>
            <DialogDescription>
              {wlTarget
                ? `"${wlTarget.name}" (${wlTarget.listType}) will be remembered for ${customerName(selectedCustomerId)} and won't raise new alerts.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="wl-reason">Reason / rationale *</Label>
              <Textarea
                id="wl-reason"
                value={wlReason}
                onChange={e => setWlReason(e.target.value)}
                placeholder="e.g. DOB and nationality mismatch confirmed against passport — different individual."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="wl-reviewer">Reviewed by</Label>
                <Input id="wl-reviewer" value={wlReviewer} onChange={e => setWlReviewer(e.target.value)} placeholder="MLRO name" />
              </div>
              <div>
                <Label htmlFor="wl-expiry">Expires (optional)</Label>
                <Input id="wl-expiry" type="date" value={wlExpiry} onChange={e => setWlExpiry(e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={wlAllLists} onChange={e => setWlAllLists(e.target.checked)} />
              Suppress this name across all lists (not just {wlTarget?.listType})
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWlTarget(null)}>Cancel</Button>
            <Button onClick={saveWhitelistEntry} disabled={wlSaving}>
              {wlSaving ? "Saving…" : "Whitelist match"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

