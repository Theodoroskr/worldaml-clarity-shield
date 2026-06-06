import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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

export default function AdminReconcilePurchases() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [confirmLive, setConfirmLive] = useState(false);

  const run = async (dryRun: boolean) => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        `reconcile-academy-purchases?dryRun=${dryRun}`,
        { method: "POST" },
      );
      if (error) throw error;
      setResult(data as ReconcileResult);
      toast.success(
        dryRun
          ? `Dry run: ${data.sessions_checked} sessions checked`
          : `Live: ${data.rows_marked_paid} rows marked paid`,
      );
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
      setConfirmLive(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reconcile Academy Purchases</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cross-checks every <code className="text-xs">pending</code> Academy purchase against its
          Stripe Checkout Session and flips truly-paid rows to <code className="text-xs">paid</code>.
          Use dry-run first to see what would change.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => run(true)} disabled={loading} variant="outline">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Dry run
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

      {result && (
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Stat label="Mode" value={result.dryRun ? "Dry run" : "Live"} />
            <Stat label="Sessions checked" value={result.sessions_checked} />
            <Stat label="Pending rows" value={result.rows_pending} />
            <Stat
              label="Marked paid"
              value={result.rows_marked_paid}
              accent={result.rows_marked_paid > 0}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 pr-2">Session</th>
                  <th className="text-left py-2 pr-2">payment_status</th>
                  <th className="text-left py-2 pr-2">status</th>
                  <th className="text-right py-2 pr-2">rows</th>
                  <th className="text-left py-2">action</th>
                </tr>
              </thead>
              <tbody>
                {result.details.map((d) => (
                  <tr key={d.sessionId} className="border-b border-border/50">
                    <td className="py-2 pr-2 font-mono">{d.sessionId.slice(0, 24)}…</td>
                    <td className="py-2 pr-2">
                      <span
                        className={
                          d.payment_status === "paid"
                            ? "text-accent font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        {d.payment_status ?? "—"}
                      </span>
                    </td>
                    <td className="py-2 pr-2">{d.status ?? "—"}</td>
                    <td className="py-2 pr-2 text-right">{d.rows ?? "—"}</td>
                    <td className="py-2">
                      {d.error ? (
                        <span className="text-destructive">error: {d.error}</span>
                      ) : d.update_error ? (
                        <span className="text-destructive">update error: {d.update_error}</span>
                      ) : d.will_update ? (
                        <span className="text-accent">would flip → paid</span>
                      ) : (
                        <span className="text-muted-foreground">skip</span>
                      )}
                    </td>
                  </tr>
                ))}
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
      <div className={`text-lg font-semibold ${accent ? "text-accent" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
