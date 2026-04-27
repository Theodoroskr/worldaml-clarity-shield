import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, ChevronRight, Download, Loader2, Activity,
  CircleDot, FileCheck2, MessageSquare, Sparkles, Send, AlarmClock,
} from "lucide-react";

export type SofAuditEvent = {
  id: string;
  declaration_id: string;
  organisation_id: string | null;
  actor_user_id: string | null;
  event_type: string;
  summary: string;
  details: Record<string, any>;
  created_at: string;
};

const TYPE_META: Record<string, { label: string; icon: any; cls: string }> = {
  status_change: { label: "Status", icon: CircleDot, cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  notes_update: { label: "Notes", icon: MessageSquare, cls: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300" },
  document_verification: { label: "Document", icon: FileCheck2, cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  ai_reconciliation: { label: "AI Run", icon: Sparkles, cls: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
  submission: { label: "Submission", icon: Send, cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  expiry: { label: "Expiry", icon: AlarmClock, cls: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function SofAuditTrail({ declarationId, refreshKey }: { declarationId: string; refreshKey?: number }) {
  const [events, setEvents] = useState<SofAuditEvent[]>([]);
  const [actors, setActors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("suite_sof_audit_events" as any)
        .select("*")
        .eq("declaration_id", declarationId)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) { setEvents([]); setLoading(false); return; }
      const evts = (data || []) as unknown as SofAuditEvent[];
      setEvents(evts);
      const ids = Array.from(new Set(evts.map(e => e.actor_user_id).filter(Boolean))) as string[];
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", ids);
        const map: Record<string, string> = {};
        (profs || []).forEach((p: any) => { map[p.user_id] = p.full_name || p.email || "User"; });
        if (!cancelled) setActors(map);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [declarationId, refreshKey]);

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const exportCsv = () => {
    const rows = [
      ["Timestamp", "Type", "Summary", "Actor", "Details (JSON)"],
      ...events.map(e => [
        new Date(e.created_at).toISOString(),
        e.event_type,
        e.summary,
        e.actor_user_id ? (actors[e.actor_user_id] || e.actor_user_id) : "system",
        JSON.stringify(e.details || {}),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sof-audit-${declarationId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Audit Trail</span>
          {!loading && <Badge variant="outline" className="text-[10px]">{events.length}</Badge>}
        </div>
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={exportCsv} disabled={events.length === 0}>
          <Download className="w-3 h-3 mr-1" /> CSV
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading events…
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No events recorded yet. The audit trail captures all future status changes, reviewer notes, document verifications and AI runs.
        </p>
      ) : (
        <ol className="relative border-l border-border ml-2 space-y-1">
          {events.map(e => {
            const meta = TYPE_META[e.event_type] || { label: e.event_type, icon: CircleDot, cls: "bg-muted text-foreground" };
            const Icon = meta.icon;
            const isOpen = openIds.has(e.id);
            const actor = e.actor_user_id ? (actors[e.actor_user_id] || "User") : "system";
            return (
              <li key={e.id} className="ml-4 pb-1">
                <span className="absolute -left-[7px] flex items-center justify-center w-3.5 h-3.5 rounded-full bg-background border border-border">
                  <Icon className="w-2.5 h-2.5 text-muted-foreground" />
                </span>
                <button
                  type="button"
                  onClick={() => toggle(e.id)}
                  className="w-full text-left rounded px-2 py-1.5 hover:bg-muted/50 transition-colors flex items-start gap-2"
                >
                  {isOpen ? <ChevronDown className="w-3 h-3 mt-1 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 mt-1 shrink-0 text-muted-foreground" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className={`text-[10px] ${meta.cls}`}>{meta.label}</Badge>
                      <span className="text-sm">{e.summary}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {fmtDate(e.created_at)} · {actor}
                    </div>
                    {isOpen && (
                      <pre className="mt-2 text-[11px] bg-muted/60 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
{JSON.stringify(e.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
