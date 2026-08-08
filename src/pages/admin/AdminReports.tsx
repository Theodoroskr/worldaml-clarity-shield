import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Send, Trash2, Mail, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { RANGE_LABELS, RangeKey } from "@/lib/adminAnalytics";

const REPORT_TYPES: Record<string, string> = {
  executive: "Executive summary",
  academy: "Academy performance",
  business: "Business portal",
  partners: "Partner programme",
  marketing: "Marketing & leads",
  full: "Full ecosystem",
};

const FREQUENCIES: Record<string, string> = {
  none: "Manual only",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

interface ReportRow {
  id: string;
  name: string;
  report_type: string;
  range_key: string;
  portal_filter: string;
  recipients: string[];
  frequency: string;
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
}

const EMPTY = {
  name: "",
  report_type: "executive",
  range_key: "last_30_days" as RangeKey,
  recipients: "",
  frequency: "weekly",
};

export default function AdminReports() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });

  const reports = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_reports").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReportRow[];
    },
  });

  const runs = useQuery({
    queryKey: ["admin-report-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_report_runs")
        .select("id, report_name, report_type, status, error_message, recipients, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
    qc.invalidateQueries({ queryKey: ["admin-report-runs"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const recipients = form.recipients.split(/[,\s;]+/).map((s) => s.trim()).filter(Boolean);
      if (!form.name.trim()) throw new Error("Give the report a name");
      if (!recipients.length) throw new Error("Add at least one recipient email");
      const invalid = recipients.find((e) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
      if (invalid) throw new Error(`"${invalid}" is not a valid email address`);
      const { error } = await supabase.from("admin_reports").insert({
        name: form.name.trim().slice(0, 120),
        report_type: form.report_type,
        range_key: form.range_key,
        recipients,
        frequency: form.frequency,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ ...EMPTY });
      invalidate();
      toast({ title: "Report saved" });
    },
    onError: (e: Error) => toast({ title: "Could not save report", description: e.message, variant: "destructive" }),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("admin_reports").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast({ title: "Report deleted" }); },
  });

  const runNow = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke("send-admin-report", { body: { report_id: id } });
      if (error) throw error;
      const failed = (data?.results ?? []).find((r: any) => r.status === "failed");
      if (failed) throw new Error(failed.error ?? "Send failed");
    },
    onSuccess: () => { invalidate(); toast({ title: "Report sent" }); },
    onError: (e: Error) => toast({ title: "Send failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated internal reports emailed on a schedule. Figures only — no customer personal data is sent.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New report</Button>
          </DialogTrigger>
          <DialogContent className="bg-background">
            <DialogHeader><DialogTitle>New scheduled report</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} maxLength={120} placeholder="Weekly leadership summary"
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Content</Label>
                  <Select value={form.report_type} onValueChange={(v) => setForm({ ...form, report_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {Object.entries(REPORT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Period</Label>
                  <Select value={form.range_key} onValueChange={(v) => setForm({ ...form, range_key: v as RangeKey })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {(Object.keys(RANGE_LABELS) as RangeKey[]).filter((k) => k !== "custom").map((k) => (
                        <SelectItem key={k} value={k}>{RANGE_LABELS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {Object.entries(FREQUENCIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Recipients</Label>
                <Input value={form.recipients} placeholder="team@worldaml.com, ceo@worldaml.com"
                  onChange={(e) => setForm({ ...form, recipients: e.target.value })} />
                <p className="text-[11px] text-muted-foreground">Comma separated. Internal addresses only.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>Save report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {reports.isLoading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !reports.data?.length ? (
            <p className="p-6 text-sm text-muted-foreground text-center">
              No reports yet. Create one to email the team a recurring summary.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {reports.data.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{r.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{REPORT_TYPES[r.report_type] ?? r.report_type}</Badge>
                      <Badge variant="outline" className="text-[10px]">{FREQUENCIES[r.frequency] ?? r.frequency}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {RANGE_LABELS[(r.range_key as RangeKey)] ?? r.range_key} · {r.recipients.join(", ")}
                      {r.last_run_at ? ` · last sent ${format(new Date(r.last_run_at), "d MMM HH:mm")}` : " · never sent"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={r.is_active} onCheckedChange={(v) => toggle.mutate({ id: r.id, is_active: v })} />
                    <Button size="sm" variant="outline" onClick={() => runNow.mutate(r.id)} disabled={runNow.isPending}>
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Send now
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(r.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" /> Delivery history
        </h2>
        <Card className="border-border">
          <CardContent className="p-0">
            {runs.isLoading ? (
              <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
            ) : !runs.data?.length ? (
              <p className="p-6 text-sm text-muted-foreground text-center">No reports have been sent yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {runs.data.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <span className="text-sm text-foreground">{r.report_name}</span>
                      <span className="text-[11px] text-muted-foreground ml-2 inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {r.recipients?.length ?? 0}
                      </span>
                      {r.error_message && <p className="text-[11px] text-destructive truncate">{r.error_message}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={r.status === "sent" ? "default" : "destructive"} className="text-[10px]">{r.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(r.created_at), "d MMM HH:mm")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
