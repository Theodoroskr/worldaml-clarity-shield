import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, XCircle, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QueueRow {
  id: string;
  user_id: string;
  recipient_email: string;
  trigger_type: string;
  template_id: string;
  status: string;
  scheduled_at: string;
  sent_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancel_reason: string | null;
  skip_reason: string | null;
  promo_code: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  aml_signal: "AML activity signal",
  seminar_discount: "Seminar completion (20% off)",
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  skipped: "bg-slate-100 text-slate-600 border-slate-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

function timeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "due now";
  const h = Math.floor(ms / 36e5);
  const m = Math.floor((ms % 36e5) / 6e4);
  if (h >= 1) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

export default function AdminOutreachQueue() {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("outreach_queue")
      .select("*")
      .order("scheduled_at", { ascending: true });
    if (error) toast.error(error.message);
    else setRows((data as QueueRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const cancel = async (row: QueueRow) => {
    setActionId(row.id);
    const { error } = await supabase.from("outreach_queue").update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: "Manually cancelled by admin",
    }).eq("id", row.id).eq("status", "scheduled");
    if (error) toast.error(error.message);
    else {
      toast.success("Cancelled — email will not be sent");
      setRows(prev => prev.map(r => r.id === row.id
        ? { ...r, status: "cancelled", cancelled_at: new Date().toISOString(), cancel_reason: "Manually cancelled by admin" }
        : r));
    }
    setActionId(null);
  };

  const runNow = async () => {
    setRunning(true);
    const { error } = await supabase.functions.invoke("process-outreach-queue", {
      body: { manual: true },
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Queue processed");
      await load();
    }
    setRunning(false);
  };

  const scheduled = rows.filter(r => r.status === "scheduled");
  const sent = rows.filter(r => r.status === "sent");
  const other = rows.filter(r => !["scheduled", "sent"].includes(r.status));

  const renderTable = (list: QueueRow[]) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {["Recipient", "Trigger", "Template", "Status", "Scheduled", "Promo", "Actions"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {list.map(r => (
            <tr key={r.id} className="hover:bg-muted/20">
              <td className="px-4 py-3">
                <div className="text-xs text-foreground">{r.recipient_email}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{r.user_id.slice(0, 8)}…</div>
              </td>
              <td className="px-4 py-3 text-xs">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {TRIGGER_LABELS[r.trigger_type] || r.trigger_type}
                </Badge>
                {r.metadata?.hit && <div className="text-[10px] text-muted-foreground mt-1">Signal: {String(r.metadata.hit)}</div>}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{r.template_id}</td>
              <td className="px-4 py-3">
                <Badge className={STATUS_STYLES[r.status] || "bg-slate-50"}>
                  {r.status}
                </Badge>
                {r.skip_reason && <div className="text-[10px] text-red-600 mt-1">{r.skip_reason}</div>}
                {r.cancel_reason && <div className="text-[10px] text-slate-600 mt-1">{r.cancel_reason}</div>}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                <div>{new Date(r.scheduled_at).toLocaleString()}</div>
                {r.status === "scheduled" && (
                  <div className="text-[10px] text-amber-600 mt-0.5 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeUntil(r.scheduled_at)}
                  </div>
                )}
                {r.sent_at && <div className="text-[10px] text-emerald-600 mt-0.5">sent {new Date(r.sent_at).toLocaleString()}</div>}
              </td>
              <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.promo_code || "—"}</td>
              <td className="px-4 py-3">
                {r.status === "scheduled" && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => cancel(r)} disabled={actionId === r.id}>
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <div className="text-center py-8 text-sm text-muted-foreground">Nothing here.</div>}
    </div>
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5 text-teal-600" />
            Outreach Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Triggered one-to-one emails auto-send 24 hours after being queued. Cancel any item to stop it from going out. Cron runs every 10 minutes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={runNow} disabled={running}>
            {running ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
            Process due items now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Scheduled" value={scheduled.length} icon={Clock} tint="text-amber-600" />
        <StatCard label="Sent" value={sent.length} icon={CheckCircle2} tint="text-emerald-600" />
        <StatCard label="Cancelled / Skipped" value={rows.filter(r => ["cancelled", "skipped"].includes(r.status)).length} icon={XCircle} tint="text-slate-600" />
        <StatCard label="Failed" value={rows.filter(r => r.status === "failed").length} icon={AlertCircle} tint="text-red-600" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="scheduled" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sent.length})</TabsTrigger>
            <TabsTrigger value="other">Cancelled / Skipped / Failed ({other.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="scheduled">{renderTable(scheduled)}</TabsContent>
          <TabsContent value="sent">{renderTable(sent)}</TabsContent>
          <TabsContent value="other">{renderTable(other)}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tint }: { label: string; value: number; icon: any; tint: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
        <Icon className={`w-4 h-4 ${tint}`} />
      </div>
      <div className="text-2xl font-bold text-foreground mt-2">{value}</div>
    </div>
  );
}
