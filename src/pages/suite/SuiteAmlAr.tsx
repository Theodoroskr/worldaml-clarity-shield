import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, Loader2, ShieldAlert, FlaskConical, History } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";

interface ArResponse {
  arRequestId: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskIndicators: { code: string; label: string; severity: string }[];
  evaluatedAt: string;
  environment: string;
  notice: string;
}

interface LookupRow {
  id: string;
  pan_bin: string | null;
  pan_last4: string | null;
  ar_risk_score: number | null;
  ar_risk_level: string | null;
  ar_request_id: string | null;
  environment: string;
  latency_ms: number | null;
  created_at: string;
}

const levelBadge = (level?: string | null) => {
  switch (level) {
    case "critical":
      return <Badge className="bg-red-600 text-white">Critical</Badge>;
    case "high":
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    case "medium":
      return <Badge className="bg-amber-500 text-white">Medium</Badge>;
    case "low":
      return <Badge className="bg-emerald-600 text-white">Low</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
};

export default function SuiteAmlAr() {
  const [pan, setPan] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArResponse | null>(null);
  const [history, setHistory] = useState<LookupRow[]>([]);

  async function loadHistory() {
    const { data, error } = await supabase
      .from("suite_aml_ar_lookups")
      .select(
        "id,pan_bin,pan_last4,ar_risk_score,ar_risk_level,ar_request_id,environment,latency_ms,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setHistory(data as LookupRow[]);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function runLookup() {
    setResult(null);
    const cleaned = pan.replace(/[^0-9]/g, "");
    if (cleaned.length < 12 || cleaned.length > 19) {
      toast.error("PAN must be 12–19 digits");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("aml-ar-lookup", {
        body: { pan: cleaned },
      });
      if (error) throw error;
      setResult(data.ar);
      setPan("");
      toast.success("AR lookup complete (DEMO)");
      loadHistory();
    } catch (e: any) {
      toast.error(e.message ?? "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function fillSample(level: "low" | "medium" | "high" | "critical") {
    // PANs chosen so demo hash buckets land in the right band
    const samples = {
      low: "4111111111111111",
      medium: "5500000000000004",
      high: "5105105105105100",
      critical: "4000000000000002",
    };
    setPan(samples[level]);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SEO title="AML Account Risk — Suite" noindex />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-accent" />
            Mastercard AML Account Risk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Card-level AML risk indicators for payment accounts. Adds a 7th
            factor (max 15 pts) to the customer risk score.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 border-amber-500 text-amber-500">
          <FlaskConical className="w-3.5 h-3.5" />
          DEMO MODE — synthetic data
        </Badge>
      </div>

      <Alert className="border-amber-500/40 bg-amber-500/5">
        <FlaskConical className="h-4 w-4 text-amber-500" />
        <AlertTitle>This is a clearly-labelled demo</AlertTitle>
        <AlertDescription className="text-sm">
          Results are generated locally from a deterministic hash of the PAN —{" "}
          <strong>no call is made to Mastercard.</strong> The PAN is never
          stored. To enable live Mastercard sandbox calls, add the{" "}
          <code className="text-xs">MASTERCARD_CONSUMER_KEY</code>,{" "}
          <code className="text-xs">MASTERCARD_KEYSTORE_PASSWORD</code>, and{" "}
          <code className="text-xs">MASTERCARD_KEY_ALIAS</code> secrets and
          switch the edge function to mTLS mode.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="lookup">
        <TabsList>
          <TabsTrigger value="lookup">Lookup</TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-3.5 h-3.5 mr-1.5" />
            History ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lookup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Single-PAN lookup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pan">Primary Account Number (PAN)</Label>
                <Input
                  id="pan"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  placeholder="4111 1111 1111 1111"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={23}
                />
                <p className="text-xs text-muted-foreground">
                  PAN is hashed before storage (BIN + last4 retained for audit).
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={runLookup} disabled={loading || !pan}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Run AR check
                </Button>
                <span className="text-xs text-muted-foreground self-center px-2">
                  Try sample:
                </span>
                <Button variant="outline" size="sm" onClick={() => fillSample("low")}>
                  Low risk
                </Button>
                <Button variant="outline" size="sm" onClick={() => fillSample("medium")}>
                  Medium
                </Button>
                <Button variant="outline" size="sm" onClick={() => fillSample("high")}>
                  High
                </Button>
                <Button variant="outline" size="sm" onClick={() => fillSample("critical")}>
                  Critical
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="border-accent/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-accent" />
                  AR result
                </CardTitle>
                {levelBadge(result.riskLevel)}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Metric label="Risk score" value={`${result.riskScore}/100`} />
                  <Metric label="Request ID" value={result.arRequestId} mono />
                  <Metric label="Environment" value={result.environment.toUpperCase()} />
                  <Metric
                    label="Evaluated at"
                    value={new Date(result.evaluatedAt).toLocaleTimeString()}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Risk indicators ({result.riskIndicators.length})
                  </h4>
                  {result.riskIndicators.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No indicators returned — account appears clean.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {result.riskIndicators.map((i) => (
                        <li
                          key={i.code}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50"
                        >
                          <Badge variant="outline" className="text-xs">
                            {i.code}
                          </Badge>
                          <span className="text-sm flex-1">{i.label}</span>
                          {levelBadge(i.severity)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p className="text-xs text-muted-foreground italic">
                  {result.notice}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent lookups</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No lookups yet. Run one from the Lookup tab.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="text-left p-3">When</th>
                        <th className="text-left p-3">Card</th>
                        <th className="text-left p-3">Score</th>
                        <th className="text-left p-3">Level</th>
                        <th className="text-left p-3">Env</th>
                        <th className="text-left p-3">Latency</th>
                        <th className="text-left p-3">Request ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row) => (
                        <tr key={row.id} className="border-t border-border">
                          <td className="p-3 text-muted-foreground">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="p-3 font-mono text-xs">
                            {row.pan_bin}•••• {row.pan_last4}
                          </td>
                          <td className="p-3 font-semibold">
                            {row.ar_risk_score ?? "—"}
                          </td>
                          <td className="p-3">{levelBadge(row.ar_risk_level)}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {row.environment}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {row.latency_ms ? `${row.latency_ms}ms` : "—"}
                          </td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">
                            {row.ar_request_id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-sm font-semibold mt-1 ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}
