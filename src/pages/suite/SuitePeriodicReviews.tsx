import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  CalendarClock, CheckCircle2, AlertTriangle, Loader2, Filter, RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  customer_id: string;
  organisation_id: string;
  risk_level_at_scheduling: string;
  cadence_months: number;
  scheduled_for: string;
  status: string;
  completed_at: string | null;
  outcome: string | null;
  notes: string | null;
  auto_generated: boolean;
  created_at: string;
  customer?: { id: string; name: string; company_name: string | null; risk_level: string | null };
}

const STATUS_TABS = [
  { v: "due", label: "Due & Overdue" },
  { v: "upcoming", label: "Upcoming" },
  { v: "completed", label: "Completed" },
  { v: "all", label: "All" },
];

const OUTCOMES = [
  { v: "unchanged", label: "Risk unchanged" },
  { v: "risk_increased", label: "Risk increased" },
  { v: "risk_decreased", label: "Risk decreased" },
  { v: "edd_triggered", label: "EDD triggered" },
  { v: "offboarded", label: "Customer offboarded" },
];

const riskTone = (r?: string | null) => {
  switch ((r ?? "").toLowerCase()) {
    case "critical": return "bg-red-500/15 text-red-500 border-red-500/30";
    case "high":     return "bg-orange-500/15 text-orange-500 border-orange-500/30";
    case "medium":   return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "low":      return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    default:         return "bg-muted text-muted-foreground";
  }
};

const statusTone = (s: string) => {
  switch (s) {
    case "overdue":     return "bg-red-500/15 text-red-500 border-red-500/30";
    case "in_progress": return "bg-blue-500/15 text-blue-500 border-blue-500/30";
    case "completed":   return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    case "cancelled":   return "bg-muted text-muted-foreground";
    default:            return "bg-accent/15 text-accent-foreground border-accent/30";
  }
};

const daysUntil = (dateStr: string) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

export default function SuitePeriodicReviews() {
  const { orgId, userId, canEdit, isLoading: orgLoading } = useOrganisation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string>("due");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Review | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    // Flip overdue first
    await supabase.rpc("mark_overdue_periodic_reviews" as any);
    const { data } = await supabase
      .from("suite_periodic_reviews")
      .select("*, customer:suite_customers(id, name, company_name, risk_level)")
      .eq("organisation_id", orgId)
      .order("scheduled_for", { ascending: true });
    setReviews((data ?? []) as Review[]);
    setLoading(false);
  };

  useEffect(() => { if (orgId) load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter(r => {
      if (riskFilter !== "all" && r.risk_level_at_scheduling !== riskFilter) return false;
      if (tab === "due"       && !(r.status === "overdue" || (r.status === "scheduled" && daysUntil(r.scheduled_for) <= 30))) return false;
      if (tab === "upcoming"  && !(r.status === "scheduled" && daysUntil(r.scheduled_for) > 30)) return false;
      if (tab === "completed" && r.status !== "completed") return false;
      if (q) {
        const name = (r.customer?.company_name || r.customer?.name || "").toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [reviews, tab, riskFilter, search]);

  const kpis = useMemo(() => {
    const overdue   = reviews.filter(r => r.status === "overdue").length;
    const dueSoon   = reviews.filter(r => r.status === "scheduled" && daysUntil(r.scheduled_for) <= 30 && daysUntil(r.scheduled_for) >= 0).length;
    const inProg    = reviews.filter(r => r.status === "in_progress").length;
    const completed = reviews.filter(r => r.status === "completed").length;
    return { overdue, dueSoon, inProg, completed };
  }, [reviews]);

  const runOverdueSweep = async () => {
    setRefreshing(true);
    const { data, error } = await supabase.rpc("mark_overdue_periodic_reviews" as any);
    setRefreshing(false);
    if (error) { toast({ title: "Sweep failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Marked ${data ?? 0} review(s) overdue` });
    load();
  };

  if (orgLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (!orgId) return <div className="p-8 text-sm text-muted-foreground">No organisation.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-accent" />
            Periodic Reviews
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated due-diligence cadence: <b>6mo</b> critical · <b>12mo</b> high · <b>24mo</b> medium · <b>36mo</b> low. Next review is chained automatically on completion.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={runOverdueSweep} disabled={refreshing}>
          {refreshing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5 mr-1" />}
          Refresh overdue
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Overdue", v: kpis.overdue, tone: kpis.overdue ? "text-red-500" : "" },
          { label: "Due ≤ 30 days", v: kpis.dueSoon, tone: kpis.dueSoon ? "text-orange-500" : "" },
          { label: "In progress", v: kpis.inProg },
          { label: "Completed", v: kpis.completed, tone: "text-emerald-500" },
        ].map(k => (
          <Card key={k.label} className="p-3">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{k.label}</div>
            <div className={cn("text-2xl font-bold mt-1", k.tone)}>{k.v}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex rounded-lg border border-border p-0.5">
          {STATUS_TABS.map(t => (
            <button key={t.v} onClick={() => setTab(t.v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                tab === t.v ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
              )}>{t.label}</button>
          ))}
        </div>
        <div className="flex-1 min-w-[160px] max-w-xs">
          <Input placeholder="Search customer…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[160px]"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All risk tiers</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="divide-y divide-border">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          <div className="col-span-4">Customer</div>
          <div className="col-span-2">Risk at schedule</div>
          <div className="col-span-2">Cadence</div>
          <div className="col-span-2">Due</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>
        {loading && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            <Loader2 className="w-5 h-5 mx-auto animate-spin" />
          </div>
        )}
        {!loading && !filtered.length && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-50" />
            No reviews in this view.
          </div>
        )}
        {filtered.map(r => {
          const d = daysUntil(r.scheduled_for);
          return (
            <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/30 transition-colors">
              <div className="col-span-4 min-w-0">
                <div className="text-sm font-medium truncate">
                  {r.customer?.company_name || r.customer?.name || "—"}
                </div>
                {r.customer?.risk_level && r.customer.risk_level !== r.risk_level_at_scheduling && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    current risk: <span className="capitalize">{r.customer.risk_level}</span>
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className={cn("text-[10px] border capitalize", riskTone(r.risk_level_at_scheduling))}>
                  {r.risk_level_at_scheduling}
                </Badge>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground">{r.cadence_months} months</div>
              <div className="col-span-2">
                <div className="text-xs">{new Date(r.scheduled_for).toLocaleDateString()}</div>
                {r.status !== "completed" && r.status !== "cancelled" && (
                  <div className={cn("text-[10px] mt-0.5",
                    d < 0 ? "text-red-500 font-medium" : d <= 30 ? "text-orange-500" : "text-muted-foreground")}>
                    {d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "due today" : `in ${d}d`}
                  </div>
                )}
                {r.completed_at && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    done {new Date(r.completed_at).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <Badge variant="outline" className={cn("text-[10px] border capitalize", statusTone(r.status))}>
                  {r.status.replace("_"," ")}
                </Badge>
              </div>
              <div className="col-span-1 text-right">
                {canEdit && r.status !== "completed" && r.status !== "cancelled" && (
                  <Button size="sm" variant="outline" onClick={() => setSelected(r)}>Review</Button>
                )}
                {r.status === "completed" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                )}
              </div>
            </div>
          );
        })}
      </Card>

      <CompleteReviewDialog
        review={selected}
        onClose={() => setSelected(null)}
        onSaved={() => { setSelected(null); load(); }}
        userId={userId}
      />
    </div>
  );
}

function CompleteReviewDialog({
  review, onClose, onSaved, userId,
}: {
  review: Review | null;
  onClose: () => void;
  onSaved: () => void;
  userId: string | null;
}) {
  const [outcome, setOutcome] = useState<string>("unchanged");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<"start" | "complete" | "cancel">("complete");

  useEffect(() => {
    if (review) {
      setOutcome(review.outcome ?? "unchanged");
      setNotes(review.notes ?? "");
      setAction(review.status === "scheduled" || review.status === "overdue" ? "complete" : "complete");
    }
  }, [review]);

  const save = async () => {
    if (!review) return;
    setSaving(true);
    const payload: any = { notes };
    if (action === "start") {
      payload.status = "in_progress";
    } else if (action === "cancel") {
      payload.status = "cancelled";
    } else {
      payload.status = "completed";
      payload.outcome = outcome;
      payload.completed_at = new Date().toISOString();
      payload.completed_by = userId;
    }
    const { error } = await supabase.from("suite_periodic_reviews").update(payload).eq("id", review.id);
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({
      title: action === "complete" ? "Review completed" : action === "start" ? "Review started" : "Review cancelled",
      description: action === "complete" ? "Next review has been auto-scheduled at the current risk cadence." : undefined,
    });
    onSaved();
  };

  return (
    <Dialog open={!!review} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Periodic review</DialogTitle>
          <DialogDescription>
            {review?.customer?.company_name || review?.customer?.name} · scheduled {review && new Date(review.scheduled_for).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Action</Label>
            <Select value={action} onValueChange={v => setAction(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Mark in progress</SelectItem>
                <SelectItem value="complete">Complete review</SelectItem>
                <SelectItem value="cancel">Cancel review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {action === "complete" && (
            <div>
              <Label className="text-xs">Outcome</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map(o => <SelectItem key={o.v} value={o.v}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Completing chains the next review automatically based on the customer's current risk tier.
              </p>
            </div>
          )}
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Findings, evidence reviewed, escalation decisions…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
