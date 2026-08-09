import { useEffect, useMemo, useState } from "react";
import AdminActionRequired from "@/components/admin/AdminActionRequired";
import AdminPageAttention from "@/components/admin/AdminPageAttention";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertTriangle, Download, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { KpiCard, DefinitionsButton, MetricInfo } from "@/components/admin/AcademyMetricUI";
import { money } from "@/lib/academyAdmin";

type ReconcileResult = {
  ok: boolean;
  dryRun: boolean;
  sessions_checked: number;
  rows_pending: number;
  rows_marked_paid: number;
  details: Array<{
    sessionId: string;
    payment_status?: string;
    status?: string;
    rows?: number;
    will_update?: boolean;
    update_error?: string;
    error?: string;
  }>;
};

type PendingSnapshot = {
  count: number;
  value: number;
  withSession: number;
  withoutSession: number;
  oldestDays: number | null;
};

type RunLogEntry = {
  at: Date;
  dryRun: boolean;
  sessions: number;
  flipped: number;
  errors: number;
};

export default function AdminReconcilePurchases() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [confirmLive, setConfirmLive] = useState(false);
  const [snapshot, setSnapshot] = useState<PendingSnapshot | null>(null);
  const [snapLoading, setSnapLoading] = useState(true);
  const [runLog, setRunLog] = useState<RunLogEntry[]>([]);
  const [detailFilter, setDetailFilter] = useState<"all" | "flip" | "skip" | "error">("all");

  const loadSnapshot = async () => {
    setSnapLoading(true);
    const { data, error } = await supabase
      .from("academy_course_purchases")
      .select("amount_cents, created_at, stripe_session_id, status")
      .eq("status", "pending");
    if (error) {
      toast.error(error.message);
      setSnapLoading(false);
      return;
    }
    const rows = data || [];
    const now = Date.now();
    const oldest = rows.reduce<number | null>((acc, r) => {
      const days = (now - new Date(r.created_at as string).getTime()) / 86_400_000;
      return acc === null || days > acc ? days : acc;
    }, null);
    setSnapshot({
      count: rows.length,
      value: rows.reduce((s, r) => s + ((r.amount_cents as number) || 0), 0),
      withSession: rows.filter((r) => !!r.stripe_session_id).length,
      withoutSession: rows.filter((r) => !r.stripe_session_id).length,
      oldestDays: oldest === null ? null : Math.floor(oldest),
    });
    setSnapLoading(false);
  };

  useEffect(() => { loadSnapshot(); }, []);

  const run = async (dryRun: boolean) => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        `reconcile-academy-purchases?dryRun=${dryRun}`,
        { method: "POST" },
      );
      if (error) throw error;
      const res = data as ReconcileResult;
      setResult(res);
      const errors = res.details.filter((d) => d.error || d.update_error).length;
      setRunLog((log) => [
        { at: new Date(), dryRun, sessions: res.sessions_checked, flipped: res.rows_marked_paid, errors },
        ...log,
      ].slice(0, 10));
      toast.success(
        dryRun
          ? `Dry run: ${res.sessions_checked} sessions checked, ${res.details.filter(d => d.will_update).length} would flip to paid`
          : `Live run: ${res.rows_marked_paid} rows marked paid`,
      );
      if (!dryRun) loadSnapshot();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Reconciliation failed");
    } finally {
      setLoading(false);
      setConfirmLive(false);
    }
  };

  const outcome = useMemo(() => {
    if (!result) return null;
    const flip = result.details.filter((d) => d.will_update && !d.error && !d.update_error).length;
    const errors = result.details.filter((d) => d.error || d.update_error).length;
    const unpaid = result.details.filter((d) => !d.will_update && !d.error && !d.update_error).length;
    return { flip, errors, unpaid };
  }, [result]);

  const visibleDetails = useMemo(() => {
    if (!result) return [];
    return result.details.filter((d) => {
      const isError = !!(d.error || d.update_error);
      if (detailFilter === "all") return true;
      if (detailFilter === "error") return isError;
      if (detailFilter === "flip") return !!d.will_update && !isError;
      return !d.will_update && !isError;
    });
  }, [result, detailFilter]);

  const exportDetails = () => {
    if (!result) return;
    const csv = [
      ["session_id", "stripe_payment_status", "stripe_status", "rows_affected", "action", "error"],
      ...result.details.map((d) => [
        d.sessionId,
        d.payment_status || "",
        d.status || "",
        d.rows ?? "",
        d.error || d.update_error ? "error" : d.will_update ? "flip_to_paid" : "skip",
        d.error || d.update_error || "",
      ]),
    ]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reconciliation-${result.dryRun ? "dryrun" : "live"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reconcile Academy Purchases</h1>
          <AdminPageAttention path="/admin/reconcile-purchases" className="ml-2" />
          <p className="text-sm text-muted-foreground mt-1">
            Cross-checks every <code className="text-xs">pending</code> Academy purchase against its
            Stripe Checkout Session and flips truly-paid rows to <code className="text-xs">paid</code>.
            Always dry-run first — a live run writes to the database and unlocks course access.
          </p>
          <DefinitionsButton />
        </div>
        <Button variant="ghost" size="sm" onClick={loadSnapshot} disabled={snapLoading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${snapLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <AdminActionRequired path="/admin/reconcile-purchases" />

      {/* Current exposure */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Pending rows" value={snapshot ? snapshot.count : "—"} accent="amber"
          info="Academy purchases still in 'pending'. These are the rows this tool inspects."
        />
        <KpiCard
          label="Unreconciled value" value={snapshot ? money(snapshot.value) : "—"}
          info="Total value of pending rows. Any part of this that Stripe confirms as paid is unrecognised revenue today."
        />
        <KpiCard
          label="With Stripe session" value={snapshot ? snapshot.withSession : "—"} accent="blue"
          sub={snapshot ? `${snapshot.withoutSession} without a session ID` : undefined}
          info="Only rows carrying a Stripe checkout session ID can be reconciled automatically. Rows without one need manual review."
        />
        <KpiCard
          label="Oldest pending"
          value={snapshot?.oldestDays != null ? `${snapshot.oldestDays}d` : "—"}
          accent={snapshot?.oldestDays != null && snapshot.oldestDays > 7 ? "rose" : undefined}
          info="Age of the oldest pending checkout. Anything beyond a week signals a reconciliation or webhook gap."
        />
      </div>

      {/* Actions */}
      <Card className="p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => run(true)} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Dry run (read-only)
          </Button>
          {!confirmLive ? (
            <Button onClick={() => setConfirmLive(true)} disabled={loading} variant="destructive">
              <AlertTriangle className="h-4 w-4" /> Run live (writes to DB)
            </Button>
          ) : (
            <>
              <Button onClick={() => run(false)} disabled={loading} variant="destructive">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirm: write changes
              </Button>
              <Button onClick={() => setConfirmLive(false)} disabled={loading} variant="ghost">
                Cancel
              </Button>
            </>
          )}
        </div>
        {confirmLive && (
          <p className="text-xs text-destructive">
            A live run marks matching rows as paid, grants course access and triggers purchase
            notification emails. This cannot be undone from this screen.
          </p>
        )}
      </Card>

      {/* Result */}
      {result && outcome && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant={result.dryRun ? "outline" : "destructive"}>
                {result.dryRun ? "Dry run — nothing written" : "Live run — database updated"}
              </Badge>
              <MetricInfo text="Sessions checked = pending rows with a Stripe session ID that were queried. Rows marked paid = rows actually updated (always 0 in a dry run)." />
            </div>
            <Button variant="outline" size="sm" onClick={exportDetails}>
              <Download className="w-3.5 h-3.5 mr-1" /> Export result
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Stat label="Sessions checked" value={result.sessions_checked} />
            <Stat label="Pending rows seen" value={result.rows_pending} />
            <Stat
              label={result.dryRun ? "Would flip to paid" : "Marked paid"}
              value={result.dryRun ? outcome.flip : result.rows_marked_paid}
              accent={(result.dryRun ? outcome.flip : result.rows_marked_paid) > 0}
            />
            <Stat label="Errors" value={outcome.errors} />
          </div>

          <div className="flex gap-2 flex-wrap">
            {([
              ["all", `All (${result.details.length})`],
              ["flip", `Flip to paid (${outcome.flip})`],
              ["skip", `Not paid in Stripe (${outcome.unpaid})`],
              ["error", `Errors (${outcome.errors})`],
            ] as const).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={detailFilter === key ? "default" : "outline"}
                onClick={() => setDetailFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 pr-2">Session</th>
                  <th className="text-left py-2 pr-2">Stripe payment status</th>
                  <th className="text-left py-2 pr-2">Session status</th>
                  <th className="text-right py-2 pr-2">Rows</th>
                  <th className="text-left py-2">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {visibleDetails.map((d) => (
                  <tr key={d.sessionId} className="border-b border-border/50">
                    <td className="py-2 pr-2 font-mono" title={d.sessionId}>{d.sessionId.slice(0, 24)}…</td>
                    <td className="py-2 pr-2">
                      <span className={d.payment_status === "paid" ? "text-emerald-600 font-semibold" : "text-muted-foreground"}>
                        {d.payment_status ?? "—"}
                      </span>
                    </td>
                    <td className="py-2 pr-2">{d.status ?? "—"}</td>
                    <td className="py-2 pr-2 text-right">{d.rows ?? "—"}</td>
                    <td className="py-2">
                      {d.error ? (
                        <span className="text-destructive inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> {d.error}</span>
                      ) : d.update_error ? (
                        <span className="text-destructive inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> update failed: {d.update_error}</span>
                      ) : d.will_update ? (
                        <span className="text-emerald-600 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {result.dryRun ? "would flip → paid" : "flipped → paid"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="w-3 h-3" /> not paid in Stripe — left pending</span>
                      )}
                    </td>
                  </tr>
                ))}
                {visibleDetails.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No sessions in this category.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">Raw JSON</summary>
            <pre className="mt-2 p-3 bg-muted rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </Card>
      )}

      {/* Session run log */}
      {runLog.length > 0 && (
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Runs this session</div>
          <div className="space-y-1 text-xs">
            {runLog.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 border-b border-border/50 py-1 last:border-0">
                <span className="text-muted-foreground">{r.at.toLocaleTimeString()}</span>
                <Badge variant={r.dryRun ? "outline" : "destructive"} className="text-[10px]">{r.dryRun ? "dry run" : "live"}</Badge>
                <span>{r.sessions} sessions</span>
                <span className="text-emerald-600">{r.flipped} paid</span>
                <span className={r.errors ? "text-destructive" : "text-muted-foreground"}>{r.errors} errors</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className={`text-lg font-semibold ${accent ? "text-emerald-600" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
