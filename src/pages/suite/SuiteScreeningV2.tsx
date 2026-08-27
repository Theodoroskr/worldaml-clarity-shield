import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search, ShieldCheck, Activity, FileText, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ASSESSMENT_LABELS,
  assessmentTone,
  CASE_STATUS_LABELS,
  CATEGORY_LABELS,
  DECISIONS,
  FALSE_POSITIVE_REASONS,
  MATCH_STATUS_LABELS,
  recordDecision,
  riskTone,
  runScreeningV2,
  type ScreeningCategory,
  type SubjectInput,
  type SubjectType,
} from "@/lib/suite/screeningV2";

interface CaseRow {
  id: string;
  case_reference: string;
  status: string;
  priority: string;
  monitoring_status: string | null;
  sanctions_matches: number;
  pep_matches: number;
  warning_matches: number;
  adverse_media_matches: number;
  created_at: string;
  subject_id: string;
  search_id: string;
}

interface MatchRow {
  id: string;
  matched_name: string;
  entity_type: string | null;
  categories: string[];
  category_labels: string[];
  name_similarity: number | null;
  country: string | null;
  year_of_birth: number | null;
  status: string;
  matched_attribute_count: number;
  conflicting_attribute_count: number;
  last_data_update: string | null;
}

const emptySubject: SubjectInput = { subject_type: "person", full_name: "" };

export default function SuiteScreeningV2() {
  const [subject, setSubject] = useState<SubjectInput>(emptySubject);
  const [adverseMedia, setAdverseMedia] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [running, setRunning] = useState(false);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [activeCase, setActiveCase] = useState<CaseRow | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);

  const set = <K extends keyof SubjectInput>(key: K, value: SubjectInput[K]) =>
    setSubject((s) => ({ ...s, [key]: value }));

  const loadCases = useCallback(async () => {
    setLoadingCases(true);
    const { data } = await supabase
      .from("screening_cases")
      .select("id, case_reference, status, priority, monitoring_status, sanctions_matches, pep_matches, warning_matches, adverse_media_matches, created_at, subject_id, search_id")
      .order("created_at", { ascending: false })
      .limit(50);
    setCases((data as CaseRow[]) ?? []);
    setLoadingCases(false);
  }, []);

  useEffect(() => { loadCases(); }, [loadCases]);

  const onRun = async () => {
    if (!subject.full_name.trim()) {
      toast.error("Enter the name to screen");
      return;
    }
    setRunning(true);
    try {
      const result = await runScreeningV2({
        subject,
        include_adverse_media: adverseMedia,
        start_monitoring: monitoring,
      });
      toast.success(
        result.match_count === 0
          ? `${result.reference}: no potential matches`
          : `${result.reference}: ${result.match_count} potential match${result.match_count === 1 ? "" : "es"} require review`,
      );
      await loadCases();
      const { data } = await supabase
        .from("screening_cases")
        .select("id, case_reference, status, priority, monitoring_status, sanctions_matches, pep_matches, warning_matches, adverse_media_matches, created_at, subject_id, search_id")
        .eq("id", result.case_id)
        .maybeSingle();
      if (data) setActiveCase(data as CaseRow);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Screening could not be completed");
    } finally {
      setRunning(false);
    }
  };

  const isPerson = subject.subject_type === "person";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">WorldAML Screening &amp; Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Screen individuals and organisations against sanctions, PEP and RCA, warnings and regulatory
          enforcement, and adverse media — then resolve every potential match with a recorded decision.
        </p>
      </header>

      <Tabs defaultValue="screen">
        <TabsList>
          <TabsTrigger value="screen"><Search className="mr-2 h-4 w-4" />New screening</TabsTrigger>
          <TabsTrigger value="cases"><FileText className="mr-2 h-4 w-4" />Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="screen" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subject details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Subject type</Label>
                  <Select
                    value={subject.subject_type}
                    onValueChange={(v) => setSubject({ ...emptySubject, subject_type: v as SubjectType })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="person">Individual</SelectItem>
                      <SelectItem value="organisation">Organisation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{isPerson ? "Full name" : "Registered name"}</Label>
                  <Input
                    value={subject.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    placeholder={isPerson ? "e.g. Maria Georgiou" : "e.g. Northwind Trading Ltd"}
                  />
                </div>
              </div>

              {isPerson ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Date of birth" type="date" value={subject.date_of_birth} onChange={(v) => set("date_of_birth", v)} />
                  <Field label="Nationality" value={subject.nationality} onChange={(v) => set("nationality", v)} />
                  <Field label="Country of residence" value={subject.country_of_residence} onChange={(v) => set("country_of_residence", v)} />
                  <Field label="Previous name" value={subject.previous_name} onChange={(v) => set("previous_name", v)} />
                  <Field label="Identification number" value={subject.identification_number} onChange={(v) => set("identification_number", v)} />
                  <Field label="Customer reference" value={subject.customer_reference} onChange={(v) => set("customer_reference", v)} />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Incorporation date" type="date" value={subject.incorporation_date} onChange={(v) => set("incorporation_date", v)} />
                  <Field label="Country of incorporation" value={subject.country_of_incorporation} onChange={(v) => set("country_of_incorporation", v)} />
                  <Field label="Registration number" value={subject.registration_number} onChange={(v) => set("registration_number", v)} />
                  <Field label="Registered address" value={subject.registered_address} onChange={(v) => set("registered_address", v)} />
                  <Field label="Previous name" value={subject.previous_name} onChange={(v) => set("previous_name", v)} />
                  <Field label="Customer reference" value={subject.customer_reference} onChange={(v) => set("customer_reference", v)} />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-muted/30 p-4">
                <label className="flex items-center gap-3 text-sm">
                  <Switch checked={adverseMedia} onCheckedChange={setAdverseMedia} />
                  Include adverse media
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <Switch checked={monitoring} onCheckedChange={setMonitoring} />
                  Place under ongoing monitoring
                </label>
                <p className="text-xs text-muted-foreground">
                  Sanctions, PEP and RCA, and warnings are always screened under your organisation&apos;s policy.
                </p>
              </div>

              <Button onClick={onRun} disabled={running}>
                {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Run screening
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Screening cases</CardTitle></CardHeader>
            <CardContent className="p-0">
              {loadingCases ? (
                <div className="p-6 text-sm text-muted-foreground">Loading cases…</div>
              ) : cases.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No screening cases yet.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {cases.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => setActiveCase(c)}
                        className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{c.case_reference}</p>
                          <p className="text-xs text-muted-foreground">
                            {CASE_STATUS_LABELS[c.status] ?? c.status} · {new Date(c.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.sanctions_matches > 0 && <Badge variant="outline" className={riskTone(["sanctions"])}>{c.sanctions_matches} sanctions</Badge>}
                          {c.pep_matches > 0 && <Badge variant="outline" className={riskTone(["pep_rca"])}>{c.pep_matches} PEP</Badge>}
                          {c.warning_matches > 0 && <Badge variant="outline" className={riskTone(["warnings"])}>{c.warning_matches} warnings</Badge>}
                          {c.adverse_media_matches > 0 && <Badge variant="outline" className={riskTone([])}>{c.adverse_media_matches} media</Badge>}
                          {c.monitoring_status === "active" && (
                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                              <Activity className="mr-1 h-3 w-3" />Monitored
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CaseWorkspace
        caseRow={activeCase}
        onClose={() => setActiveCase(null)}
        onChanged={loadCases}
      />
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value?: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function CaseWorkspace({
  caseRow, onClose, onChanged,
}: { caseRow: CaseRow | null; onClose: () => void; onChanged: () => void }) {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selected, setSelected] = useState<MatchRow | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!caseRow) return;
    setLoading(true);
    const { data } = await supabase
      .from("screening_matches")
      .select("id, matched_name, entity_type, categories, category_labels, name_similarity, country, year_of_birth, status, matched_attribute_count, conflicting_attribute_count, last_data_update")
      .eq("case_id", caseRow.id)
      .order("name_similarity", { ascending: false });
    setMatches((data as MatchRow[]) ?? []);
    setLoading(false);
  }, [caseRow]);

  useEffect(() => { load(); }, [load]);

  return (
    <Dialog open={!!caseRow} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{caseRow?.case_reference}</DialogTitle>
          <DialogDescription>
            {caseRow ? CASE_STATUS_LABELS[caseRow.status] ?? caseRow.status : ""}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading potential matches…</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No potential matches were returned for this screening.
          </p>
        ) : (
          <ul className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
            {matches.map((m) => (
              <li key={m.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">{m.matched_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[m.entity_type === "organisation" ? "Organisation" : "Individual", m.country, m.year_of_birth]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.categories.map((c) => (
                        <Badge key={c} variant="outline" className={riskTone([c])}>
                          {CATEGORY_LABELS[c as ScreeningCategory] ?? c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">
                      {m.name_similarity != null ? `${Math.round(m.name_similarity)}% name similarity` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.matched_attribute_count} matching · {m.conflicting_attribute_count} conflicting
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {MATCH_STATUS_LABELS[m.status] ?? m.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setSelected(m)}>
                  Review match
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>

      <MatchReview
        match={selected}
        onClose={() => setSelected(null)}
        onSaved={async () => { setSelected(null); await load(); onChanged(); }}
      />
    </Dialog>
  );
}

interface AttributeRow {
  field_label: string;
  subject_value: string | null;
  match_value: string | null;
  assessment: string;
  sort_order: number;
}
interface SourceRow {
  source_name: string;
  jurisdiction: string | null;
  listing_date: string | null;
  description: string | null;
}

function MatchReview({
  match, onClose, onSaved,
}: { match: MatchRow | null; onClose: () => void; onSaved: () => void }) {
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [decision, setDecision] = useState<string>("false_positive");
  const [reason, setReason] = useState<string>(FALSE_POSITIVE_REASONS[0]);
  const [rationale, setRationale] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!match) return;
    setRationale("");
    (async () => {
      const [{ data: attrs }, { data: srcs }] = await Promise.all([
        supabase
          .from("match_attributes")
          .select("field_label, subject_value, match_value, assessment, sort_order")
          .eq("match_id", match.id)
          .order("sort_order"),
        supabase
          .from("screening_sources")
          .select("source_name, jurisdiction, listing_date, description")
          .eq("match_id", match.id),
      ]);
      setAttributes((attrs as AttributeRow[]) ?? []);
      setSources((srcs as SourceRow[]) ?? []);
    })();
  }, [match]);

  const needsReason = decision === "false_positive";
  const canSave = useMemo(() => rationale.trim().length >= 10, [rationale]);

  const save = async () => {
    if (!match) return;
    setSaving(true);
    try {
      await recordDecision({
        match_id: match.id,
        decision,
        rationale: rationale.trim(),
        reason_code: needsReason ? reason : decision,
        reason_label: needsReason ? reason : DECISIONS.find((d) => d.key === decision)?.label,
      });
      toast.success("Decision recorded");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Decision could not be saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!match} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{match?.matched_name}</DialogTitle>
          <DialogDescription>
            Compare the screened subject with the listed profile, then record your decision.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[45vh] space-y-5 overflow-y-auto pr-1">
          <section>
            <h4 className="mb-2 text-sm font-semibold">Attribute comparison</h4>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left">Attribute</th>
                    <th className="p-2 text-left">Screened subject</th>
                    <th className="p-2 text-left">Listed profile</th>
                    <th className="p-2 text-left">Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attributes.map((a) => (
                    <tr key={a.field_label}>
                      <td className="p-2 font-medium">{a.field_label}</td>
                      <td className="p-2 text-muted-foreground">{a.subject_value || "—"}</td>
                      <td className="p-2 text-muted-foreground">{a.match_value || "—"}</td>
                      <td className={`p-2 font-medium ${assessmentTone(a.assessment)}`}>
                        {ASSESSMENT_LABELS[a.assessment] ?? a.assessment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {sources.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold">Listings and sources</h4>
              <ul className="space-y-2">
                {sources.map((s, i) => (
                  <li key={i} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium">{s.source_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[s.jurisdiction, s.listing_date ? `Listed ${s.listing_date}` : null].filter(Boolean).join(" · ")}
                    </p>
                    {s.description && <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Decision</Label>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DECISIONS.map((d) => (
                    <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {needsReason && (
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FALSE_POSITIVE_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Rationale (required, minimum 10 characters)</Label>
            <Textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              placeholder="Explain the evidence supporting this decision."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!canSave || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Record decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
