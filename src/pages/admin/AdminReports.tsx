import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Send, Trash2, Mail, Clock, Eye, Copy, Pencil, MoreHorizontal, X,
  AlertTriangle, CheckCircle2, Loader2, CalendarClock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { RANGE_LABELS, RangeKey } from "@/lib/adminAnalytics";
import AdminActionRequired from "@/components/admin/AdminActionRequired";
import AdminPageAttention from "@/components/admin/AdminPageAttention";

const REPORT_TYPES: Record<string, string> = {
  executive: "Executive summary",
  finance: "Finance & revenue",
  sales: "Sales pipeline",
  academy: "Academy performance",
  business: "Business portal",
  partners: "Partner programme",
  marketing: "Marketing & leads",
  full: "Full ecosystem",
};

const REPORT_TYPE_HINTS: Record<string, string> = {
  executive: "Headline growth, revenue and lifetime totals for leadership.",
  finance: "Revenue, paid orders, average order value and partner commission.",
  sales: "Leads, business accounts, registered deals and conversion.",
  academy: "Enrolments, completions, certificates and top courses.",
  business: "Business accounts, entitlements and checkout funnel.",
  partners: "Active partners, pipeline, won value and top performers.",
  marketing: "Lead volume by form type and traffic source.",
  full: "Every section in one email.",
};

const FREQUENCIES: Record<string, string> = {
  none: "Manual only",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ReportRow {
  id: string;
  name: string;
  description: string | null;
  report_type: string;
  range_key: string;
  recipients: string[];
  frequency: string;
  is_active: boolean;
  last_run_at: string | null;
  last_test_at: string | null;
  day_of_week: number | null;
  day_of_month: number | null;
  send_hour_utc: number | null;
  created_at: string;
}

const EMPTY = {
  id: null as string | null,
  name: "",
  description: "",
  report_type: "executive",
  range_key: "last_30_days" as RangeKey,
  recipients: [] as string[],
  frequency: "weekly",
  day_of_week: 1,
  day_of_month: 1,
  send_hour_utc: 7,
};

const isEmail = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

function scheduleLabel(r: ReportRow) {
  const hour = `${String(r.send_hour_utc ?? 7).padStart(2, "0")}:00 UTC`;
  if (r.frequency === "none") return "Manual only";
  if (r.frequency === "daily") return `Daily at ${hour}`;
  if (r.frequency === "weekly") return `Every ${WEEKDAYS[r.day_of_week ?? 1]} at ${hour}`;
  if (r.frequency === "monthly") return `Day ${r.day_of_month ?? 1} of each month at ${hour}`;
  return r.frequency;
}

function nextSend(r: ReportRow): string {
  if (!r.is_active || r.frequency === "none") return "Not scheduled";
  const hour = r.send_hour_utc ?? 7;
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0));
  if (r.frequency === "daily") {
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  } else if (r.frequency === "weekly") {
    const target = r.day_of_week ?? 1;
    let add = (target - next.getUTCDay() + 7) % 7;
    if (add === 0 && next <= now) add = 7;
    next.setUTCDate(next.getUTCDate() + add);
  } else if (r.frequency === "monthly") {
    const target = r.day_of_month ?? 1;
    next.setUTCDate(target);
    if (next <= now) next.setUTCMonth(next.getUTCMonth() + 1);
  }
  return format(next, "d MMM yyyy · HH:mm 'UTC'");
}

export default function AdminReports() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [recipientInput, setRecipientInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<ReportRow | null>(null);
  const [preview, setPreview] = useState<{ name: string; html: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState("all");

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
        .select("id, report_name, report_type, status, error_message, recipients, created_at, trigger_type, duration_ms, period_start, period_end")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const staff = useQuery({
    queryKey: ["admin-internal-access"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_internal_access");
      if (error) throw error;
      return (data ?? []) as { email: string; full_name: string | null; department: string | null }[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
    qc.invalidateQueries({ queryKey: ["admin-report-runs"] });
  };

  const openNew = () => { setForm({ ...EMPTY }); setRecipientInput(""); setOpen(true); };
  const openEdit = (r: ReportRow) => {
    setForm({
      id: r.id,
      name: r.name,
      description: r.description ?? "",
      report_type: r.report_type,
      range_key: r.range_key as RangeKey,
      recipients: r.recipients ?? [],
      frequency: r.frequency,
      day_of_week: r.day_of_week ?? 1,
      day_of_month: r.day_of_month ?? 1,
      send_hour_utc: r.send_hour_utc ?? 7,
    });
    setRecipientInput("");
    setOpen(true);
  };

  const addRecipient = (value: string) => {
    const parts = value.split(/[,\s;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    const invalid = parts.find((p) => !isEmail(p));
    if (invalid) { toast({ title: `"${invalid}" is not a valid email address`, variant: "destructive" }); return; }
    setForm((f) => ({ ...f, recipients: Array.from(new Set([...f.recipients, ...parts])) }));
    setRecipientInput("");
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Give the report a name");
      if (!form.recipients.length) throw new Error("Add at least one recipient email");
      const payload = {
        name: form.name.trim().slice(0, 120),
        description: form.description.trim().slice(0, 300) || null,
        report_type: form.report_type,
        range_key: form.range_key,
        recipients: form.recipients,
        frequency: form.frequency,
        day_of_week: form.frequency === "weekly" ? form.day_of_week : null,
        day_of_month: form.frequency === "monthly" ? form.day_of_month : null,
        send_hour_utc: form.send_hour_utc,
      };
      if (form.id) {
        const { error } = await supabase.from("admin_reports").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("admin_reports").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setOpen(false); setForm({ ...EMPTY }); invalidate();
      toast({ title: form.id ? "Report updated" : "Report saved" });
    },
    onError: (e: Error) => toast({ title: "Could not save report", description: e.message, variant: "destructive" }),
  });

  const duplicate = useMutation({
    mutationFn: async (r: ReportRow) => {
      const { error } = await supabase.from("admin_reports").insert({
        name: `${r.name} (copy)`.slice(0, 120),
        description: r.description,
        report_type: r.report_type,
        range_key: r.range_key,
        recipients: r.recipients,
        frequency: r.frequency,
        day_of_week: r.day_of_week,
        day_of_month: r.day_of_month,
        send_hour_utc: r.send_hour_utc,
        is_active: false,
      });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast({ title: "Report duplicated (paused)" }); },
    onError: (e: Error) => toast({ title: "Could not duplicate", description: e.message, variant: "destructive" }),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("admin_reports").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => { invalidate(); toast({ title: v.is_active ? "Schedule resumed" : "Schedule paused" }); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setConfirmDelete(null); toast({ title: "Report deleted" }); },
  });

  const dispatch = useMutation({
    mutationFn: async ({ id, mode }: { id: string; mode: "send" | "test" }) => {
      const { data, error } = await supabase.functions.invoke("send-admin-report", { body: { report_id: id, mode } });
      if (error) throw error;
      const failed = (data?.results ?? []).find((r: any) => r.status === "failed");
      if (failed) throw new Error(failed.error ?? "Send failed");
    },
    onSuccess: (_d, v) => { invalidate(); toast({ title: v.mode === "test" ? "Test email sent to you" : "Report sent" }); },
    onError: (e: Error) => toast({ title: "Send failed", description: e.message, variant: "destructive" }),
  });

  const runPreview = async (r: ReportRow) => {
    setPreviewLoading(r.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-admin-report", {
        body: { report_id: r.id, mode: "preview" },
      });
      if (error) throw error;
      if (!data?.html) throw new Error(data?.error ?? "No preview returned");
      setPreview({ name: r.name, html: data.html });
    } catch (e) {
      toast({ title: "Preview failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setPreviewLoading(null);
    }
  };

  const list = reports.data ?? [];
  const stats = useMemo(() => {
    const since = Date.now() - 30 * 86_400_000;
    const recent = (runs.data ?? []).filter((r: any) => new Date(r.created_at).getTime() >= since);
    return {
      active: list.filter((r) => r.is_active && r.frequency !== "none").length,
      paused: list.filter((r) => !r.is_active).length,
      sent30: recent.filter((r: any) => r.status === "sent").length,
      failed30: recent.filter((r: any) => r.status !== "sent").length,
    };
  }, [list, runs.data]);

  const filteredRuns = useMemo(() => {
    const all = (runs.data ?? []) as any[];
    if (historyFilter === "all") return all;
    if (historyFilter === "failed") return all.filter((r) => r.status !== "sent");
    return all.filter((r) => (r.trigger_type ?? "scheduled") === historyFilter);
  }, [runs.data, historyFilter]);

  const staffSuggestions = (staff.data ?? []).filter((s) => !form.recipients.includes(s.email));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <AdminPageAttention path="/admin/reports" className="ml-2" />
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Aggregated internal reports emailed to the team on a schedule. Figures only — no customer personal data
            is included. All times are UTC.
          </p>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New report</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Active schedules</div>
          <div className="text-xl font-semibold text-foreground">{stats.active}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Paused</div>
          <div className="text-xl font-semibold text-muted-foreground">{stats.paused}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Delivered (30 days)</div>
          <div className="text-xl font-semibold text-emerald-600">{stats.sent30}</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Failed (30 days)</div>
          <div className={`text-xl font-semibold ${stats.failed30 ? "text-destructive" : "text-foreground"}`}>{stats.failed30}</div>
        </CardContent></Card>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {reports.isLoading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !list.length ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                No reports yet. Create one to email the team a recurring summary of growth, revenue, Academy,
                partners and marketing performance.
              </p>
              <Button size="sm" variant="outline" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Create your first report</Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {list.map((r) => (
                <div key={r.id} className="flex flex-wrap items-start gap-3 p-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{r.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{REPORT_TYPES[r.report_type] ?? r.report_type}</Badge>
                      {!r.is_active && <Badge variant="outline" className="text-[10px]">Paused</Badge>}
                    </div>
                    {r.description && <p className="text-[11px] text-muted-foreground">{r.description}</p>}
                    <p className="text-[11px] text-muted-foreground">
                      {RANGE_LABELS[(r.range_key as RangeKey)] ?? r.range_key} · {scheduleLabel(r)}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {r.recipients?.length ?? 0} recipient{(r.recipients?.length ?? 0) === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" /> Next: {nextSend(r)}
                      </span>
                      <span>{r.last_run_at ? `Last sent ${format(new Date(r.last_run_at), "d MMM HH:mm")}` : "Never sent"}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{(r.recipients ?? []).join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={r.is_active}
                      aria-label={r.is_active ? "Pause schedule" : "Resume schedule"}
                      onCheckedChange={(v) => toggle.mutate({ id: r.id, is_active: v })}
                    />
                    <Button size="sm" variant="outline" onClick={() => runPreview(r)} disabled={previewLoading === r.id}>
                      {previewLoading === r.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 mr-1.5" />}
                      Preview
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" aria-label={`Actions for ${r.name}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover z-50 w-48">
                        <DropdownMenuItem onClick={() => dispatch.mutate({ id: r.id, mode: "send" })}>
                          <Send className="w-3.5 h-3.5 mr-2" /> Send now
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => dispatch.mutate({ id: r.id, mode: "test" })}>
                          <Mail className="w-3.5 h-3.5 mr-2" /> Send test to me
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicate.mutate(r)}><Copy className="w-3.5 h-3.5 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmDelete(r)}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery history */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Delivery history
          </h2>
          <Select value={historyFilter} onValueChange={setHistoryFilter}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All deliveries</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="test">Tests</SelectItem>
              <SelectItem value="failed">Failures only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="border-border">
          <CardContent className="p-0">
            {runs.isLoading ? (
              <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
            ) : !filteredRuns.length ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                {runs.data?.length ? "No deliveries match this filter." : "No reports have been sent yet."}
              </p>
            ) : (
              <div className="divide-y divide-border">
                {filteredRuns.map((r: any) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-foreground">{r.report_name}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">{r.trigger_type ?? "scheduled"}</Badge>
                        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {r.recipients?.length ?? 0}
                        </span>
                        {r.duration_ms ? <span className="text-[11px] text-muted-foreground">{Math.round(r.duration_ms / 100) / 10}s</span> : null}
                      </div>
                      {r.error_message && (
                        <p className="text-[11px] text-destructive flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 shrink-0" /> {r.error_message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={r.status === "sent" ? "default" : "destructive"} className="text-[10px] inline-flex items-center gap-1">
                        {r.status === "sent" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />} {r.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(r.created_at), "d MMM HH:mm")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit report" : "New scheduled report"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} maxLength={120} placeholder="Weekly leadership summary"
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Purpose (optional)</Label>
              <Textarea rows={2} maxLength={300} value={form.description}
                placeholder="Shared with the leadership team every Monday morning."
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Content</Label>
                <Select value={form.report_type} onValueChange={(v) => setForm({ ...form, report_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {Object.entries(REPORT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">{REPORT_TYPE_HINTS[form.report_type]}</p>
              </div>
              <div className="space-y-1.5">
                <Label>Period covered</Label>
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

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {Object.entries(FREQUENCIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {form.frequency === "weekly" && (
                <div className="space-y-1.5">
                  <Label>Day of week</Label>
                  <Select value={String(form.day_of_week)} onValueChange={(v) => setForm({ ...form, day_of_week: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {WEEKDAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.frequency === "monthly" && (
                <div className="space-y-1.5">
                  <Label>Day of month</Label>
                  <Select value={String(form.day_of_month)} onValueChange={(v) => setForm({ ...form, day_of_month: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-60">
                      {Array.from({ length: 28 }).map((_, i) => <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.frequency !== "none" && (
                <div className="space-y-1.5">
                  <Label>Send time (UTC)</Label>
                  <Select value={String(form.send_hour_utc)} onValueChange={(v) => setForm({ ...form, send_hour_utc: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-60">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={String(i)}>{String(i).padStart(2, "0")}:00 UTC</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Recipients</Label>
              {form.recipients.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.recipients.map((e) => (
                    <Badge key={e} variant="secondary" className="text-[11px] gap-1">
                      {e}
                      <button type="button" aria-label={`Remove ${e}`}
                        onClick={() => setForm((f) => ({ ...f, recipients: f.recipients.filter((x) => x !== e) }))}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={recipientInput}
                  placeholder="name@worldaml.com"
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); if (recipientInput.trim()) addRecipient(recipientInput); }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => recipientInput.trim() && addRecipient(recipientInput)}>Add</Button>
              </div>
              {staffSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground">Internal staff:</span>
                  {staffSuggestions.slice(0, 8).map((s) => (
                    <button
                      key={s.email} type="button"
                      className="text-[11px] rounded border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-primary"
                      onClick={() => setForm((f) => ({ ...f, recipients: Array.from(new Set([...f.recipients, s.email])) }))}
                    >
                      + {s.full_name || s.email}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">Internal addresses only. Reports contain aggregated figures, never customer data.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {form.id ? "Save changes" : "Save report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="bg-background max-w-3xl">
          <DialogHeader><DialogTitle>Preview — {preview?.name}</DialogTitle></DialogHeader>
          <iframe
            title="Report preview"
            srcDoc={preview?.html ?? ""}
            className="w-full h-[60vh] rounded border border-border bg-white"
          />
          <p className="text-[11px] text-muted-foreground">
            Preview uses live data for the configured period. Nothing was emailed and no delivery was logged.
          </p>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{confirmDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The schedule stops immediately and the report can no longer be sent. Past delivery history is kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && remove.mutate(confirmDelete.id)}
            >
              Delete report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
