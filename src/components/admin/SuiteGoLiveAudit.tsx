// Live Suite security audit + go-live gate. Runs suite_security_audit_run()
// (admin only) and shows the latest recorded run.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldX, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Finding = { area: string; target: string; severity: "high" | "medium" | "info"; issue: string };
type Run = { id: string; passed: boolean; high_count: number; results: Finding[]; created_at: string };

const SEV: Record<Finding["severity"], "destructive" | "secondary" | "outline"> = {
  high: "destructive", medium: "secondary", info: "outline",
};

export default function SuiteGoLiveAudit() {
  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);

  const loadLatest = async () => {
    const { data } = await supabase.from("security_audit_runs").select("*")
      .eq("kind", "suite_audit").order("created_at", { ascending: false }).limit(1).maybeSingle();
    setRun((data as unknown as Run) ?? null);
  };
  useEffect(() => { loadLatest(); }, []);

  const runNow = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("suite_security_audit_run");
    setBusy(false);
    if (error) toast.error(error.message);
    else { setRun(data as unknown as Run); toast.success("Suite security audit finished"); }
  };

  const findings = (run?.results ?? []).filter((f) => f.severity !== "info");

  return (
    <section className="rounded-lg border border-border p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {run?.passed ? <ShieldCheck className="h-6 w-6 text-primary" /> : <ShieldX className="h-6 w-6 text-destructive" />}
          <div>
            <h2 className="font-semibold text-foreground">WorldAML Suite go-live check</h2>
            <p className="text-xs text-muted-foreground">
              Client separation, private file areas and admin sign-in. {run ? `Last run ${new Date(run.created_at).toLocaleString()}.` : "Not run yet."}
            </p>
          </div>
          {run && (
            <Badge variant={run.passed ? "default" : "destructive"}>
              {run.passed ? "Ready for go-live" : `${run.high_count} high-risk issue${run.high_count === 1 ? "" : "s"}`}
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={runNow} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}Run audit now
        </Button>
      </div>
      {run && (findings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No issues found.</p>
      ) : (
        <ul className="divide-y divide-border rounded border border-border">
          {findings.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-3 p-2 text-sm">
              <span><span className="text-muted-foreground mr-2 capitalize">{f.area}</span><code className="text-xs">{f.target}</code></span>
              <span className="flex items-center gap-2 text-muted-foreground">{f.issue}<Badge variant={SEV[f.severity]}>{f.severity}</Badge></span>
            </li>
          ))}
        </ul>
      ))}
    </section>
  );
}
