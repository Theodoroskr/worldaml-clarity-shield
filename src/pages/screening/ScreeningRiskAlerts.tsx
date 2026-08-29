import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, BellPlus, HelpCircle, Loader2, Pencil, Plus, Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";
import { riskAlertHelp } from "@/lib/riskAlertHelp";
import { RISK_LEVEL_META, type RiskLevel } from "@/lib/riskLevels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Rule {
  id: string;
  name: string;
  threshold: RiskLevel;
  categories: string[];
  assigned_to: string | null;
  notify_in_app: boolean;
  notify_email: boolean;
  email_recipients: string[];
  enabled: boolean;
  last_triggered_at: string | null;
}

interface Member {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const CATEGORIES = [
  { value: "sanctions", label: "Sanctions" },
  { value: "pep_rca", label: "PEP / RCA" },
  { value: "warnings", label: "Warnings" },
  { value: "adverse_media", label: "Adverse media" },
];

const EMPTY_FORM = {
  name: "",
  threshold: "medium" as RiskLevel,
  categories: [] as string[],
  assigned_to: "",
  notify_in_app: true,
  notify_email: false,
  email_recipients: "",
  enabled: true,
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never";

export default function ScreeningRiskAlerts() {
  const { isLoading: accessLoading, hasAccess, isAdmin } = useScreeningAccess();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [orgRes, membersRes] = await Promise.all([
      supabase.rpc("current_user_screening_org"),
      supabase.rpc("screening_team_members"),
    ]);
    if (orgRes.error) {
      toast.error("Could not resolve your organisation");
      setLoading(false);
      return;
    }
    setOrgId(orgRes.data ?? null);

    const team = (membersRes.data as unknown as { user_id: string | null; email: string | null; full_name: string | null }[] | null) ?? [];
    setMembers(team.filter((m) => m.user_id).map((m) => ({ user_id: m.user_id as string, full_name: m.full_name, email: m.email })));

    if (orgRes.data) {
      const { data } = await supabase.from("screening_risk_alert_rules")
        .select("*")
        .eq("organisation_id", orgRes.data)
        .order("created_at", { ascending: false }) as { data: Rule[] | null };
      setRules(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!accessLoading && hasAccess) void load();
    if (!accessLoading && !hasAccess) setLoading(false);
  }, [accessLoading, hasAccess, load]);


  const memberName = (id: string | null) => {
    if (!id) return "Any assignee";
    return members.find((m) => m.user_id === id)?.full_name ?? members.find((m) => m.user_id === id)?.email ?? "Team member";
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (rule: Rule) => {
    setEditing(rule);
    setForm({
      name: rule.name,
      threshold: rule.threshold,
      categories: rule.categories ?? [],
      assigned_to: rule.assigned_to ?? "",
      notify_in_app: rule.notify_in_app,
      notify_email: rule.notify_email,
      email_recipients: rule.email_recipients.join(", "),
      enabled: rule.enabled,
    });
    setDialogOpen(true);
  };

  const toggleCategory = (value: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(value)
        ? f.categories.filter((c) => c !== value)
        : [...f.categories, value],
    }));
  };

  const save = async () => {
    if (!orgId) return;
    if (!form.name.trim()) { toast.error("Give the rule a name"); return; }
    const emails = form.email_recipients.split(",").map((e) => e.trim()).filter(Boolean);
    if (form.notify_email && !emails.length) { toast.error("Add at least one email recipient"); return; }
    if (emails.some((e) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))) { toast.error("One or more email addresses are invalid"); return; }

    setSaving(true);
    const payload = {
      organisation_id: orgId,
      name: form.name.trim(),
      threshold: form.threshold,
      categories: form.categories,
      assigned_to: form.assigned_to || null,
      notify_in_app: form.notify_in_app,
      notify_email: form.notify_email,
      email_recipients: emails,
      enabled: form.enabled,
    };
    const { error } = editing
      ? await supabase.from("screening_risk_alert_rules").update(payload).eq("id", editing.id)
      : await supabase.from("screening_risk_alert_rules").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Rule updated" : "Rule created");
    setDialogOpen(false);
    void load();
  };

  const toggleEnabled = async (rule: Rule, enabled: boolean) => {
    const { error } = await supabase.from("screening_risk_alert_rules").update({ enabled }).eq("id", rule.id);
    if (error) { toast.error(error.message); return; }
    setRules((rs) => rs.map((r) => (r.id === rule.id ? { ...r, enabled } : r)));
  };

  const remove = async (rule: Rule) => {
    if (!confirm(`Delete rule "${rule.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("screening_risk_alert_rules").delete().eq("id", rule.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Rule deleted");
    void load();
  };

  if (accessLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading risk alerts…
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <p className="text-muted-foreground">You need Screening access to manage risk alerts.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/screening/monitored"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Monitored entities</Link>
      </Button>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Risk alerts
            <Popover>
              <PopoverTrigger asChild>
                <button aria-label="How risk alerts work" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 text-sm space-y-3" align="start">
                <p className="font-medium">{riskAlertHelp.summary}</p>
                {riskAlertHelp.articles.map((a) => (
                  <div key={a.title}>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-muted-foreground">{a.body}</p>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {riskAlertHelp.summary} Risk is re-evaluated on every screening and every monitoring check.
          </p>
        </div>
        {isAdmin && (
          <Button variant="accent" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> New rule
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BellPlus className="h-4 w-4 text-teal" /> Alert rules
          </CardTitle>
          <CardDescription>
            Rules are evaluated in order on every risk change. Duplicate alerts are suppressed until an entity's level changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground text-sm">
                No risk rules yet. Create your first rule to get notified when a monitored entity crosses a risk threshold.
              </p>
              {isAdmin && (
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="mr-1.5 h-4 w-4" /> Create a rule
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Last triggered</TableHead>
                  <TableHead>Enabled</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => {
                  const meta = RISK_LEVEL_META[rule.threshold] ?? RISK_LEVEL_META.low;
                  return (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={meta.badgeClass}>
                          {meta.label}+
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>{rule.categories?.length ? rule.categories.map((c) => CATEGORIES.find((x) => x.value === c)?.label ?? c).join(", ") : "All categories"}</div>
                        <div>{memberName(rule.assigned_to)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rule.notify_in_app && <Badge variant="secondary" className="text-[10px]">In-app</Badge>}
                          {rule.notify_email && <Badge variant="secondary" className="text-[10px]">Email ×{rule.email_recipients.length}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(rule.last_triggered_at)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(v) => void toggleEnabled(rule, v)}
                          disabled={!isAdmin}
                          aria-label={`Enable ${rule.name}`}
                        />
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(rule)} aria-label={`Edit ${rule.name}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => void remove(rule)} aria-label={`Delete ${rule.name}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit risk rule" : "New risk rule"}</DialogTitle>
            <DialogDescription>
              The rule fires when a monitored entity's risk level increases to or above the threshold.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-name">Rule name</Label>
              <Input id="rule-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Escalate on sanctions hits" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Threshold</Label>
                <Select value={form.threshold} onValueChange={(v) => setForm((f) => ({ ...f, threshold: v as RiskLevel }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevated">Elevated or above</SelectItem>
                    <SelectItem value="medium">Medium or above</SelectItem>
                    <SelectItem value="high">High only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned to</Label>
                <Select value={form.assigned_to || "any"} onValueChange={(v) => setForm((f) => ({ ...f, assigned_to: v === "any" ? "" : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any assignee</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>{m.full_name ?? m.email ?? "Team member"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Categories (optional — leave empty for all)</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {CATEGORIES.map((c) => (
                  <label key={c.value} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.categories.includes(c.value)} onCheckedChange={() => toggleCategory(c.value)} />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <Label htmlFor="notify-in-app">In-app alert</Label>
              <Switch id="notify-in-app" checked={form.notify_in_app} onCheckedChange={(v) => setForm((f) => ({ ...f, notify_in_app: v }))} />
            </div>
            <div className="rounded-md border border-border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-email">Email notification</Label>
                <Switch id="notify-email" checked={form.notify_email} onCheckedChange={(v) => setForm((f) => ({ ...f, notify_email: v }))} />
              </div>
              {form.notify_email && (
                <div>
                  <Label htmlFor="recipients" className="text-xs text-muted-foreground">Recipients (comma-separated)</Label>
                  <Input id="recipients" value={form.email_recipients} onChange={(e) => setForm((f) => ({ ...f, email_recipients: e.target.value }))} placeholder="mlro@company.com, compliance@company.com" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="accent" onClick={() => void save()} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Create rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
