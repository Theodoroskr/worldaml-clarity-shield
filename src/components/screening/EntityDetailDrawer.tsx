import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, ShieldCheck, FileSearch, History, Radio, FolderOpen,
  CheckCheck, ExternalLink, Newspaper,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { deriveRiskLevel, RISK_LEVEL_META } from "@/lib/riskLevels";

export interface DrawerEntity {
  id: string; // monitoring_subjects.id
  subject_id?: string | null;
  case_id?: string | null;
  status: string;
  frequency: string;
  started_at: string;
  last_checked_at: string | null;
  last_change_at?: string | null;
  risk_level?: string | null;
  assigned_to?: string | null;
  categories?: string[];
  subject?: { full_name: string; subject_type: string; country_of_residence: string | null } | null;
  case?: {
    case_reference: string;
    priority: string;
    status?: string;
    sanctions_matches: number;
    pep_matches: number;
    warning_matches: number;
    adverse_media_matches: number;
  } | null;
}

interface SearchRow {
  id: string;
  reference: string;
  screened_at: string;
  status: string;
  categories_screened: string[];
}

interface AlertRow {
  id: string;
  change_type: string;
  change_description: string;
  detected_at: string;
  status: string;
  acknowledged_at: string | null;
}

interface AuditRow {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
}

interface MediaRow {
  id: string;
  headline: string;
  publication: string | null;
  published_at: string | null;
  media_category: string | null;
}

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

const CHANGE_LABELS: Record<string, string> = {
  risk_threshold: "Risk threshold crossed",
};

export default function EntityDetailDrawer({
  entity,
  onClose,
  onPauseResume,
  onTransfer,
  memberName,
}: {
  entity: DrawerEntity | null;
  onClose: () => void;
  onPauseResume?: (entity: DrawerEntity) => void;
  onTransfer?: (entity: DrawerEntity) => void;
  memberName?: (id: string | null) => string;
}) {
  const [searches, setSearches] = useState<SearchRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [ackBusy, setAckBusy] = useState(false);

  const entityId = entity?.id;
  const subjectId = entity?.subject_id ?? null;
  const caseId = entity?.case_id ?? null;

  const load = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    const [alertRes, auditRes, mediaRes, searchRes] = await Promise.all([
      supabase
        .from("monitoring_alerts")
        .select("id,change_type,change_description,detected_at,status,acknowledged_at")
        .eq("monitoring_subject_id", entityId)
        .order("detected_at", { ascending: false })
        .limit(30),
      caseId
        ? supabase
            .from("screening_audit_events")
            .select("id,event_type,description,created_at")
            .eq("case_id", caseId)
            .order("created_at", { ascending: false })
            .limit(30)
        : Promise.resolve({ data: [] as AuditRow[] }),
      caseId
        ? supabase
            .from("adverse_media_items")
            .select("id,headline,publication,published_at,media_category")
            .eq("case_id", caseId)
            .order("published_at", { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [] as MediaRow[] }),
      subjectId
        ? supabase
            .from("screening_searches")
            .select("id,reference,screened_at,status,categories_screened")
            .eq("subject_id", subjectId)
            .order("screened_at", { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [] as SearchRow[] }),
    ]);
    setAlerts((alertRes.data as AlertRow[] | null) ?? []);
    setAudit((auditRes.data as AuditRow[] | null) ?? []);
    setMedia((mediaRes.data as MediaRow[] | null) ?? []);
    setSearches((searchRes.data as SearchRow[] | null) ?? []);
    setLoading(false);
  }, [entityId, caseId, subjectId]);

  useEffect(() => {
    if (entity) void load();
  }, [entity, load]);

  const risk = useMemo(() => {
    if (!entity) return RISK_LEVEL_META.low;
    const stored = entity.risk_level as keyof typeof RISK_LEVEL_META | null;
    if (stored && RISK_LEVEL_META[stored]) return RISK_LEVEL_META[stored];
    return RISK_LEVEL_META[deriveRiskLevel(entity.case ?? {})];
  }, [entity]);

  const unacked = alerts.filter((a) => !a.acknowledged_at);

  const acknowledgeAll = async () => {
    if (!entityId || !unacked.length) return;
    setAckBusy(true);
    await supabase
      .from("monitoring_alerts")
      .update({ status: "acknowledged", acknowledged_at: new Date().toISOString() })
      .eq("monitoring_subject_id", entityId)
      .is("acknowledged_at", null);
    setAckBusy(false);
    void load();
  };

  const c = entity?.case;
  const signals = [
    { label: "Sanctions", count: c?.sanctions_matches ?? 0, danger: (c?.sanctions_matches ?? 0) > 0 },
    { label: "PEP / RCA", count: c?.pep_matches ?? 0, danger: (c?.pep_matches ?? 0) > 0 },
    { label: "Warnings", count: c?.warning_matches ?? 0, danger: (c?.warning_matches ?? 0) > 0 },
    { label: "Adverse media", count: c?.adverse_media_matches ?? 0, danger: false },
  ];

  // Merge alerts + audit into one timeline
  const timeline = useMemo(() => {
    const items = [
      ...alerts.map((a) => ({
        id: `a-${a.id}`,
        at: a.detected_at,
        label: CHANGE_LABELS[a.change_type] ?? a.change_type.replace(/_/g, " "),
        text: a.change_description,
        acked: !!a.acknowledged_at,
      })),
      ...audit.map((e) => ({
        id: `e-${e.id}`,
        at: e.created_at,
        label: e.event_type.replace(/_/g, " "),
        text: e.description,
        acked: true,
      })),
    ];
    return items.sort((x, y) => +new Date(y.at) - +new Date(x.at)).slice(0, 40);
  }, [alerts, audit]);

  return (
    <Sheet open={!!entity} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {entity && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={risk.badgeClass}>{risk.label} risk</Badge>
                <Badge variant="outline" className="capitalize">{entity.status}</Badge>
                <Badge variant="secondary" className="capitalize">{entity.subject?.subject_type ?? "entity"}</Badge>
              </div>
              <SheetTitle className="text-xl">{entity.subject?.full_name ?? "Monitored entity"}</SheetTitle>
              <SheetDescription>
                {entity.subject?.country_of_residence ? `${entity.subject.country_of_residence} · ` : ""}
                {entity.frequency} monitoring since {fmtDate(entity.started_at)}
                {" · Owner: "}{memberName ? memberName(entity.assigned_to ?? null) : "Unassigned"}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 flex gap-2 flex-wrap">
              {onPauseResume && entity.status !== "stopped" && (
                <Button size="sm" variant="outline" onClick={() => onPauseResume(entity)}>
                  {entity.status === "active" ? "Pause monitoring" : "Resume monitoring"}
                </Button>
              )}
              {onTransfer && (
                <Button size="sm" variant="outline" onClick={() => onTransfer(entity)}>
                  Transfer access
                </Button>
              )}
              {unacked.length > 0 && (
                <Button size="sm" variant="accent" onClick={() => void acknowledgeAll()} disabled={ackBusy}>
                  <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                  Acknowledge {unacked.length} alert{unacked.length === 1 ? "" : "s"}
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-10 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading entity history…
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {/* Signals */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Radio className="h-4 w-4 text-teal" /> Signals
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {signals.map((s) => (
                      <div
                        key={s.label}
                        className={`rounded-lg border p-3 ${s.danger ? "border-destructive/40 bg-destructive/5" : "border-border"}`}
                      >
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className={`text-lg font-semibold ${s.danger ? "text-destructive" : ""}`}>{s.count}</p>
                      </div>
                    ))}
                  </div>
                  {media.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {media.map((m) => (
                        <div key={m.id} className="flex items-start gap-2 rounded-md border border-border p-2.5">
                          <Newspaper className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-snug">{m.headline}</p>
                            <p className="text-xs text-muted-foreground">
                              {[m.publication, fmtDate(m.published_at), m.media_category].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <Separator />

                {/* Case link */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <FolderOpen className="h-4 w-4 text-teal" /> Linked case
                  </h3>
                  {c ? (
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">{c.case_reference}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          Priority: {c.priority}{c.status ? ` · ${c.status.replace(/_/g, " ")}` : ""}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/screening?case=${entity.case_id ?? ""}`}>
                          Open <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No case is linked to this entity.</p>
                  )}
                </section>

                <Separator />

                {/* Screening history */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <FileSearch className="h-4 w-4 text-teal" /> Screening history
                  </h3>
                  {searches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No screenings recorded for this subject.</p>
                  ) : (
                    <ul className="space-y-2">
                      {searches.map((s) => (
                        <li key={s.id} className="rounded-md border border-border p-2.5 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{s.reference}</span>
                            <span className="text-xs text-muted-foreground">{fmtDate(s.screened_at)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {s.status.replace(/_/g, " ")} · {s.categories_screened.join(", ").replace(/_/g, " ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <Separator />

                {/* Monitoring history */}
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <History className="h-4 w-4 text-teal" /> Monitoring history
                  </h3>
                  {timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> No monitoring events yet.
                    </p>
                  ) : (
                    <ol className="relative border-l border-border ml-2 space-y-4">
                      {timeline.map((t) => (
                        <li key={t.id} className="ml-4">
                          <span className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background ${t.acked ? "bg-muted-foreground/40" : "bg-teal"}`} />
                          <p className="text-xs text-muted-foreground">
                            {fmtDate(t.at)} · <span className="capitalize font-medium text-foreground">{t.label}</span>
                          </p>
                          <p className="text-sm leading-snug">{t.text}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
