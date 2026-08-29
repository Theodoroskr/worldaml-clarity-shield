import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2, Search, ShieldCheck, Activity, FileText, ChevronRight,
  ArrowLeft, Copy, Check, X, Filter, Tag, MoreHorizontal,
  AlertTriangle, User, Building2, Ship, Plane, RefreshCw, ExternalLink, Users, Lock,
  ArrowDownUp, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useScreeningModules } from "@/hooks/useScreeningModules";
import { UsageWidget } from "@/components/screening/UsageWidget";
import { useScreeningQuota } from "@/hooks/useScreeningQuota";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  inferMatchBasis,
  matchBasisDescription,
  matchBasisLabel,
  matchBasisTone,
  MATCH_BASIS_LEGEND,
  type MatchBasis,
} from "@/lib/screeningMatch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ALL_SOURCE_TYPES,
  ASSESSMENT_LABELS,
  assessmentTone,
  CASE_STATUS_LABELS,
  CATEGORY_LABELS,
  DECISIONS,
  FALSE_POSITIVE_REASONS,
  fetchFullProfile,
  prefetchFullProfile,
  MATCH_STATUS_LABELS,
  recordDecision,
  riskTone,
  runScreeningV2,
  isQuotaCode,
  ScreeningError,
  SOURCE_GROUPS,
  SUBJECT_TYPE_LABELS,
  type FullEntityProfile,
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

interface CaseDetail extends CaseRow {
  search?: {
    reference: string;
    screened_at: string;
    search_parameters: Record<string, unknown>;
    categories_screened: ScreeningCategory[];
    adverse_media_requested: boolean;
    monitoring_requested: boolean;
  } | null;
  subject?: {
    subject_type: SubjectType;
    full_name: string;
    date_of_birth?: string | null;
    year_of_birth?: number | null;
    country_of_residence?: string | null;
    nationality?: string | null;
    country_of_incorporation?: string | null;
    incorporation_date?: string | null;
    registration_number?: string | null;
  } | null;
}

interface MatchRow {
  id: string;
  matched_name: string;
  entity_type: string | null;
  categories: string[];
  category_labels: string[];
  name_similarity: number | null;
  match_basis?: string | null;
  match_types?: string[] | null;
  match_type_labels?: string[] | null;
  provider_relevance?: number | null;
  winning_name?: string | null;
  winning_name_kind?: string | null;
  country: string | null;
  year_of_birth: number | null;
  status: string;
  matched_attribute_count: number;
  conflicting_attribute_count: number;
  last_data_update: string | null;
  profile?: Record<string, unknown>;
}

interface MatchExtra {
  sourceCounts: Record<string, number>;
  adverseMediaCount: number;
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
  category: ScreeningCategory | null;
}

const emptySubject: SubjectInput = { subject_type: "person", full_name: "" };

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  person: <User className="h-3.5 w-3.5" />,
  company: <Building2 className="h-3.5 w-3.5" />,
  organisation: <Building2 className="h-3.5 w-3.5" />,
  vessel: <Ship className="h-3.5 w-3.5" />,
  aircraft: <Plane className="h-3.5 w-3.5" />,
};

function categoryCountKey(c: string): ScreeningCategory | null {
  const key = c.toLowerCase();
  if (key.includes("sanction")) return "sanctions";
  if (key.includes("pep")) return "pep_rca";
  if (key.includes("warning") || key.includes("fitness") || key.includes("probity")) return "warnings";
  if (key.includes("adverse") || key.includes("media")) return "adverse_media";
  return null;
}

function categoryFromSourceType(t: string): ScreeningCategory | null {
  const key = t.toLowerCase();
  if (key.startsWith("sanction")) return "sanctions";
  if (key.startsWith("pep") || key === "rca") return "pep_rca";
  if (key.startsWith("warning") || key.startsWith("fitness")) return "warnings";
  if (key.startsWith("adverse-media")) return "adverse_media";
  return null;
}

export default function SuiteScreeningV2({ initialQuery }: { initialQuery?: string } = {}) {
  const [subject, setSubject] = useState<SubjectInput>(
    initialQuery?.trim() ? { ...emptySubject, full_name: initialQuery.trim() } : emptySubject,
  );
  const [adverseMedia, setAdverseMedia] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [running, setRunning] = useState(false);
  const quota = useScreeningQuota();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [activeCase, setActiveCase] = useState<CaseDetail | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [customiseSources, setCustomiseSources] = useState(false);
  const [sourceTypes, setSourceTypes] = useState<string[]>(ALL_SOURCE_TYPES);
  const [searchProfileId, setSearchProfileId] = useState("");
  const [adverseMediaAllowed, setAdverseMediaAllowed] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("screening_policies")
        .select("config, is_default")
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      const cfg = (data?.config ?? {}) as Record<string, unknown>;
      const allowed = cfg.adverse_media === true;
      setAdverseMediaAllowed(allowed);
      if (!allowed) setAdverseMedia(false);
    })();
    return () => { cancelled = true; };
  }, []);


  const toggleSourceType = (value: string, checked: boolean) =>
    setSourceTypes((prev) =>
      checked ? Array.from(new Set([...prev, value])) : prev.filter((t) => t !== value)
    );

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
    if (quota.searchesExceeded) {
      toast.error("Annual search limit reached — upgrade your plan to keep screening.");
      return;
    }
    if (monitoring && quota.monitorsExceeded) {
      toast.error("Monitored entity limit reached — remove a monitored subject or upgrade.");
      return;
    }
    setRunning(true);
    try {
      const profileId = searchProfileId.trim();
      const result = await runScreeningV2({
        subject,
        include_adverse_media: adverseMediaAllowed &&
          (adverseMedia || (customiseSources && sourceTypes.some((t) => t.startsWith("adverse-media")))),
        start_monitoring: monitoring,
        advanced: {
          ...(profileId ? { search_profile_id: profileId } : {}),
          ...(customiseSources && !profileId ? { source_types: sourceTypes } : {}),
        },
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
      if (data) openCase(data as CaseRow);
      void quota.refresh();
    } catch (err) {
      const code = err instanceof ScreeningError ? err.code : undefined;
      const message = err instanceof Error ? err.message : "Screening could not be completed";
      if (isQuotaCode(code)) {
        void quota.refresh();
        toast.error(message, {
          description: "Your annual allowance for this plan is used up.",
          action: { label: "Upgrade", onClick: () => { window.location.href = "/screening-monitoring/pricing"; } },
          duration: 10000,
        });
      } else {
        toast.error(message);
      }
    } finally {
      setRunning(false);
    }
  };

  const openCase = async (row: CaseRow) => {
    const [{ data: caseData }, { data: searchData }, { data: subjectData }] = await Promise.all([
      supabase.from("screening_cases").select("*").eq("id", row.id).maybeSingle(),
      row.search_id
        ? supabase.from("screening_searches").select("reference, screened_at, search_parameters, categories_screened, adverse_media_requested, monitoring_requested").eq("id", row.search_id).maybeSingle()
        : Promise.resolve({ data: null }),
      row.subject_id
        ? supabase.from("screening_subjects").select("subject_type, full_name, date_of_birth, year_of_birth, country_of_residence, nationality, country_of_incorporation, incorporation_date, registration_number").eq("id", row.subject_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setActiveCase({
      ...(caseData as CaseRow),
      search: searchData as CaseDetail["search"],
      subject: subjectData as CaseDetail["subject"],
    });
  };

  const isPerson = subject.subject_type === "person";
  const nameLabel =
    subject.subject_type === "person" ? "Full name"
    : subject.subject_type === "vessel" ? "Vessel name"
    : subject.subject_type === "aircraft" ? "Aircraft name / tail number"
    : "Registered name";
  const namePlaceholder =
    subject.subject_type === "person" ? "e.g. Maria Georgiou"
    : subject.subject_type === "vessel" ? "e.g. MV Aurora Borealis"
    : subject.subject_type === "aircraft" ? "e.g. N12345"
    : "e.g. Northwind Trading Ltd";

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="rounded-md bg-primary/10 p-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h1 className="text-base font-semibold tracking-tight">Screening console</h1>
              <p className="truncate text-xs text-muted-foreground">
                Sanctions · PEP &amp; RCA · Warnings &amp; enforcement · Adverse media · Ongoing monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              <Activity className="mr-1 h-3 w-3" /> Monitoring
            </Badge>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link to="/screening/team">
                <Users className="mr-1.5 h-4 w-4" /> Team &amp; Access
              </Link>
            </Button>
          </div>
        </div>
      </header>


      {activeCase ? (
        <ResultsWorkspace
          caseDetail={activeCase}
          onBack={() => { setActiveCase(null); loadCases(); }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Tabs defaultValue="screen" className="min-w-0">
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
                    <Label>Entity type</Label>
                    <Select
                      value={subject.subject_type}
                      onValueChange={(v) => setSubject({ ...emptySubject, subject_type: v as SubjectType })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(SUBJECT_TYPE_LABELS) as SubjectType[]).map((t) => (
                          <SelectItem key={t} value={t}>{SUBJECT_TYPE_LABELS[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{nameLabel}</Label>
                    <Input
                      value={subject.full_name}
                      onChange={(e) => set("full_name", e.target.value)}
                      placeholder={namePlaceholder}
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
                    {subject.subject_type === "vessel" || subject.subject_type === "aircraft" ? (
                      <>
                        <Field label="Registration / IMO / tail number" value={subject.registration_number} onChange={(v) => set("registration_number", v)} />
                        <Field label="Country of registration" value={subject.country_of_incorporation} onChange={(v) => set("country_of_incorporation", v)} />
                        <Field label="Previous name" value={subject.previous_name} onChange={(v) => set("previous_name", v)} />
                        <Field label="Customer reference" value={subject.customer_reference} onChange={(v) => set("customer_reference", v)} />
                      </>
                    ) : (
                      <>
                        <Field label="Incorporation date" type="date" value={subject.incorporation_date} onChange={(v) => set("incorporation_date", v)} />
                        <Field label="Country of incorporation" value={subject.country_of_incorporation} onChange={(v) => set("country_of_incorporation", v)} />
                        <Field label="Registration number" value={subject.registration_number} onChange={(v) => set("registration_number", v)} />
                        <Field label="Registered address" value={subject.registered_address} onChange={(v) => set("registered_address", v)} />
                        <Field label="Previous name" value={subject.previous_name} onChange={(v) => set("previous_name", v)} />
                        <Field label="Customer reference" value={subject.customer_reference} onChange={(v) => set("customer_reference", v)} />
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-muted/30 p-4">
                  <label className="flex items-center gap-3 text-sm">
                    <Switch
                      checked={adverseMedia && adverseMediaAllowed}
                      disabled={!adverseMediaAllowed}
                      onCheckedChange={setAdverseMedia}
                    />
                    Include adverse media
                    {!adverseMediaAllowed && (
                      <span className="text-xs text-muted-foreground">Not included in your plan</span>
                    )}
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <Switch
                      checked={monitoring && !quota.monitorsExceeded}
                      disabled={quota.monitorsExceeded}
                      onCheckedChange={setMonitoring}
                    />
                    Place under ongoing monitoring
                    {quota.monitorsExceeded && (
                      <span className="text-xs text-destructive">Limit reached</span>
                    )}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    By default all sources permitted by your organisation&apos;s policy are screened.
                  </p>
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Sources</p>
                      <p className="text-xs text-muted-foreground">
                        Use your organisation&apos;s policy defaults, select categories manually, or apply a search profile.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={customiseSources}
                        onCheckedChange={setCustomiseSources}
                        disabled={!!searchProfileId.trim()}
                      />
                      Select categories manually
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search-profile">Search profile ID (optional)</Label>
                    <Input
                      id="search-profile"
                      value={searchProfileId}
                      onChange={(e) => setSearchProfileId(e.target.value)}
                      placeholder="Leave blank to use category selection below"
                    />
                    {searchProfileId.trim() && (
                      <p className="text-xs text-muted-foreground">
                        A search profile is applied — manual source categories are ignored for this screening.
                      </p>
                    )}
                  </div>

                  {customiseSources && !searchProfileId.trim() && (
                    <div className="grid gap-4 md:grid-cols-3">
                      {SOURCE_GROUPS.map((group) => (
                        <div key={group.label} className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {group.label}
                          </p>
                          {group.hint && <p className="text-xs text-muted-foreground">{group.hint}</p>}
                          {group.types.map((t) => (
                            <label key={t.value} className="flex items-start gap-2 text-sm">
                              <Checkbox
                                className="mt-0.5"
                                checked={sourceTypes.includes(t.value)}
                                onCheckedChange={(c) => toggleSourceType(t.value, c === true)}
                              />
                              <span className="leading-snug">{t.label}</span>
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {(quota.searchesExceeded || quota.monitorsExceeded) && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      {quota.searchesExceeded
                        ? "Annual search allowance used up"
                        : "Monitored entity allowance used up"}
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>
                        {quota.searchesExceeded
                          ? `You have used all ${quota.searchQuota} searches included in your ${quota.plan ?? "current"} plan for this year. New screenings are blocked until you upgrade.`
                          : `You are monitoring ${quota.monitorsUsed} of ${quota.monitorQuota} entities included in your ${quota.plan ?? "current"} plan. Stop monitoring a subject or upgrade to add more.`}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button asChild size="sm" variant="secondary">
                          <Link to="/screening-monitoring/pricing">Upgrade plan</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/contact-sales">Talk to sales</Link>
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={onRun} disabled={running || quota.searchesExceeded}>
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
                          onClick={() => openCase(c)}
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
        <aside className="space-y-4 hidden lg:block">
          <UsageWidget />
        </aside>
      </div>
      )}
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

function ResultsWorkspace({
  caseDetail, onBack,
}: { caseDetail: CaseDetail; onBack: () => void }) {
  const { hasModule } = useScreeningModules();
  const fourEyes = hasModule("four_eyes");
  const [matches, setMatches] = useState<MatchRow[]>([]);

  const [extras, setExtras] = useState<Record<string, MatchExtra>>({});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MatchRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [basisFilter, setBasisFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<string>("similarity_desc");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("screening_matches")
      .select("id, matched_name, entity_type, categories, category_labels, name_similarity, match_basis, match_types, match_type_labels, provider_relevance, winning_name, winning_name_kind, country, year_of_birth, status, matched_attribute_count, conflicting_attribute_count, last_data_update, profile")
      .eq("case_id", caseDetail.id)
      .order("name_similarity", { ascending: false });
    const rows = (data as MatchRow[]) ?? [];
    setMatches(rows);

    // Warm the highest-ranked matches in the background so the first review opens instantly.
    const warm = () => rows.slice(0, 3).forEach((r) => prefetchFullProfile(r.id));
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    if (idle) idle(warm);
    else setTimeout(warm, 400);

    if (rows.length > 0) {
      const ids = rows.map((r) => r.id);
      const [{ data: sourcesData }, { data: mediaData }] = await Promise.all([
        supabase.from("screening_sources").select("match_id, category").in("match_id", ids),
        supabase.from("adverse_media_items").select("match_id").in("match_id", ids),
      ]);
      const sourceCounts: Record<string, Record<string, number>> = {};
      (sourcesData ?? []).forEach((s: { match_id: string; category: string | null }) => {
        sourceCounts[s.match_id] ??= {};
        const cat = s.category ?? "unknown";
        sourceCounts[s.match_id][cat] = (sourceCounts[s.match_id][cat] ?? 0) + 1;
      });
      const mediaCounts: Record<string, number> = {};
      (mediaData ?? []).forEach((m: { match_id: string }) => {
        mediaCounts[m.match_id] = (mediaCounts[m.match_id] ?? 0) + 1;
      });
      const extraMap: Record<string, MatchExtra> = {};
      ids.forEach((id) => {
        extraMap[id] = {
          sourceCounts: sourceCounts[id] ?? {},
          adverseMediaCount: mediaCounts[id] ?? 0,
        };
      });
      setExtras(extraMap);
    }
    setLoading(false);
  }, [caseDetail.id]);

  useEffect(() => { load(); }, [load]);

  const filteredMatches = useMemo(() => {
    const filtered = matches.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (categoryFilter !== "all" && !m.categories.includes(categoryFilter)) return false;
      if (basisFilter !== "all") {
        const basis = inferMatchBasis(m.match_basis, m.name_similarity);
        // Group exact_name + exact_alias under the "exact" filter option.
        if (basisFilter === "exact" && basis !== "exact_name" && basis !== "exact_alias") return false;
        if (basisFilter !== "exact" && basis !== basisFilter) return false;
      }
      return true;
    });
    const sorted = [...filtered];
    switch (sortMode) {
      case "similarity_asc":
        sorted.sort((a, b) => (a.name_similarity ?? -1) - (b.name_similarity ?? -1));
        break;
      case "name_az":
        sorted.sort((a, b) => (a.matched_name ?? "").localeCompare(b.matched_name ?? ""));
        break;
      case "similarity_desc":
      default:
        sorted.sort((a, b) => (b.name_similarity ?? -1) - (a.name_similarity ?? -1));
        break;
    }
    return sorted;
  }, [matches, statusFilter, categoryFilter, basisFilter, sortMode]);

  // Headline tally used by the case header chips.
  const matchTally = useMemo(() => ({
    confirmed: matches.filter((m) => m.status === "confirmed").length,
    cleared: matches.filter((m) => m.status === "false_positive").length,
    open: matches.filter((m) => m.status !== "confirmed" && m.status !== "false_positive").length,
  }), [matches]);



  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onDecision = async (matchId: string, decision: string, reason?: string) => {
    try {
      await recordDecision({
        match_id: matchId,
        decision,
        rationale: reason || `${decision} from results workspace`,
        reason_code: decision === "false_positive" ? reason : undefined,
        reason_label: decision === "false_positive" ? reason : DECISIONS.find((d) => d.key === decision)?.label,
      });
      toast.success("Decision recorded");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Decision could not be saved");
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setTags((prev) => Array.from(new Set([...prev, t])));
    setTagInput("");
  };

  const searchParams = caseDetail.search?.search_parameters ?? {};
  const fuzziness = useMemo(() => {
    if (typeof searchParams !== "object" || searchParams === null) return undefined;
    const p = searchParams as Record<string, unknown>;
    if (typeof p.fuzziness === "number") return p.fuzziness;
    if (typeof p.name_threshold === "number") {
      const threshold = Math.max(0, Math.min(1, p.name_threshold));
      return 1 - threshold;
    }
    return undefined;
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="bg-background">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to cases
          </Button>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{caseDetail.case_reference}</h2>
            <p className="text-xs text-muted-foreground">
              {CASE_STATUS_LABELS[caseDetail.status] ?? caseDetail.status}
              {caseDetail.monitoring_status === "active" && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                  <Activity className="h-3 w-3" /> Monitored
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/30 bg-background text-primary">
            {matches.length} potential {matches.length === 1 ? "match" : "matches"}
          </Badge>
          {matchTally.confirmed > 0 && (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
              {matchTally.confirmed} confirmed
            </Badge>
          )}
          {matchTally.open > 0 && (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              {matchTally.open} to review
            </Badge>
          )}
          {matchTally.cleared > 0 && (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              {matchTally.cleared} cleared
            </Badge>
          )}
          {selectedIds.size > 0 && (
            <Badge variant="outline" className="bg-background">{selectedIds.size} selected</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" /> Filter:
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(MATCH_STATUS_LABELS).map(([k, label]) => (
                  <SelectItem key={k} value={k}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8 w-[170px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <SelectItem key={k} value={k}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={basisFilter} onValueChange={setBasisFilter}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Match type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All match types</SelectItem>
                <SelectItem value="exact">Exact name</SelectItem>
                <SelectItem value="reordered_name">Reordered name</SelectItem>
                <SelectItem value="partial_name">Partial name</SelectItem>
                <SelectItem value="fuzzy_name">Fuzzy name</SelectItem>
                <SelectItem value="provider_only">Provider only</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowDownUp className="h-4 w-4" /> Sort:
            </div>
            <Select value={sortMode} onValueChange={setSortMode}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="similarity_desc">Similarity (high → low)</SelectItem>
                <SelectItem value="similarity_asc">Similarity (low → high)</SelectItem>
                <SelectItem value="name_az">Name (A → Z)</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Legend
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Match status colours</p>
                  {MATCH_BASIS_LEGEND.map((item) => (
                    <div key={item.basis} className="flex items-start gap-2">
                      <span className={cn("mt-0.5 inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium", item.tone)}>
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {(statusFilter !== "all" || categoryFilter !== "all" || basisFilter !== "all" || sortMode !== "similarity_desc") && (
              <Button variant="ghost" size="sm" onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); setBasisFilter("all"); setSortMode("similarity_desc"); }}>
                <X className="mr-1 h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading potential matches…
            </div>
          ) : filteredMatches.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No potential matches match the current filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  extra={extras[m.id]}
                  selected={selectedIds.has(m.id)}
                  onToggleSelect={() => toggleSelect(m.id)}
                  onReview={() => setSelected(m)}
                  onPrefetch={() => prefetchFullProfile(m.id)}
                   onDecision={onDecision}
                   fourEyes={fourEyes}
                   subjectType={caseDetail.subject.subject_type}
                 />

              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Search summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <SummaryRow label="Search term" value={caseDetail.subject?.full_name ?? "—"} />
              <SummaryRow label="Fuzziness interval" value={fuzziness != null ? `${Math.round(fuzziness * 100)}%` : "—"} />
              <SummaryRow label="Search ref" value={caseDetail.search?.reference ?? "—"} copyable />
              <SummaryRow
                label="Created at"
                value={caseDetail.search?.screened_at
                  ? new Date(caseDetail.search.screened_at).toLocaleString()
                  : new Date(caseDetail.created_at).toLocaleString()}
              />
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs">Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No tags attached yet</span>
                  ) : (
                    tags.map((t) => (
                      <Badge key={t} variant="secondary" className="gap-1">
                        {t}
                        <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    size-sm
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
                    className="h-8"
                  />
                  <Button size="sm" variant="outline" onClick={addTag}>
                    <Tag className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Screened subject</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {caseDetail.subject ? (
                <>
                  <SummaryRow label="Type" value={SUBJECT_TYPE_LABELS[caseDetail.subject.subject_type] ?? caseDetail.subject.subject_type} />
                  <SummaryRow label="Name" value={caseDetail.subject.full_name} />
                  {caseDetail.subject.date_of_birth && (
                    <SummaryRow label="Date of birth" value={caseDetail.subject.date_of_birth} />
                  )}
                  {caseDetail.subject.country_of_residence && (
                    <SummaryRow label="Country of residence" value={caseDetail.subject.country_of_residence} />
                  )}
                  {caseDetail.subject.nationality && (
                    <SummaryRow label="Nationality" value={caseDetail.subject.nationality} />
                  )}
                  {caseDetail.subject.country_of_incorporation && (
                    <SummaryRow label="Country of incorporation" value={caseDetail.subject.country_of_incorporation} />
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Subject details not available.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      <MatchReview
        match={selected}
        subjectType={caseDetail.subject.subject_type}
        onClose={() => setSelected(null)}
        onSaved={async () => { setSelected(null); await load(); }}
      />
    </div>
  );
}

function SummaryRow({
  label, value, copyable,
}: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 whitespace-nowrap text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 text-right font-medium">
        <span className="break-all">{value}</span>
        {copyable && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{copied ? "Copied" : "Copy"}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  extra,
  selected,
  onToggleSelect,
  onReview,
  onPrefetch,
  onDecision,
  fourEyes,
  subjectType,
}: {
  match: MatchRow;
  extra?: MatchExtra;
  selected: boolean;
  onToggleSelect: () => void;
  onReview: () => void;
  onPrefetch: () => void;
  onDecision: (id: string, decision: string, reason?: string) => Promise<void>;
  /** Escalation & Four-Eyes Review add-on active for the organisation. */
  fourEyes: boolean;
  /** Type of the subject that was screened (drives entity-type conflict detection). */
  subjectType?: SubjectType;

}) {
  const entityType = (match.entity_type as SubjectType) ?? "person";
  const entityLabel = SUBJECT_TYPE_LABELS[entityType] ?? entityType;

  // Flag when the provider profile's entity type doesn't match the screened
  // subject (e.g. a person search hitting an organisation profile — a common
  // adverse-media indexing artefact and a strong false-positive signal).
  const entityTypeConflict = !!subjectType && !!match.entity_type && subjectType !== match.entity_type;

  const [falsePositiveOpen, setFalsePositiveOpen] = useState(false);
  const [reason, setReason] = useState(entityTypeConflict ? "Different entity type" : FALSE_POSITIVE_REASONS[0]);
  const [saving, setSaving] = useState(false);

  const relevance = useMemo(() => {
    if (match.name_similarity === 100) return "Name matched exactly";
    if (match.name_similarity && match.name_similarity >= 90) return "Name strongly matched";
    if (match.name_similarity && match.name_similarity >= 70) return "Name partially matched";
    return "Possible name match";
  }, [match.name_similarity]);

  const categoryBadges = useMemo(() => {
    const counts: Record<string, number> = {};
    if (extra) {
      Object.entries(extra.sourceCounts).forEach(([cat, count]) => {
        counts[cat] = (counts[cat] ?? 0) + count;
      });
      if (extra.adverseMediaCount > 0) {
        counts.adverse_media = (counts.adverse_media ?? 0) + extra.adverseMediaCount;
      }
    }
    // Fallback to category flags when granular source rows haven't been loaded yet.
    match.categories.forEach((c) => {
      if (!(c in counts)) counts[c] = 1;
    });
    return Object.entries(counts)
      .filter(([cat]) => cat !== "unknown")
      .map(([cat, count]) => ({ cat: cat as ScreeningCategory, count }));
  }, [match.categories, extra]);

  const handleFalsePositive = async () => {
    setSaving(true);
    await onDecision(match.id, "false_positive", reason);
    setSaving(false);
    setFalsePositiveOpen(false);
  };

  // The most severe category drives the card's accent stripe.
  const severity: "critical" | "high" | "medium" | "low" =
    match.categories.includes("sanctions") ? "critical"
    : match.categories.includes("warnings") ? "high"
    : match.categories.includes("pep_rca") ? "medium"
    : "low";
  const stripe = {
    critical: "before:bg-red-500",
    high: "before:bg-amber-500",
    medium: "before:bg-sky-500",
    low: "before:bg-slate-300",
  }[severity];
  const similarity = match.name_similarity ?? null;
  const similarityTone =
    similarity == null ? "border-border bg-muted text-muted-foreground"
    : similarity >= 95 ? "border-red-200 bg-red-50 text-red-700"
    : similarity >= 80 ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-sky-200 bg-sky-50 text-sky-700";
  const basis = inferMatchBasis((match as { match_basis?: string | null }).match_basis, similarity);
  const matchTypeLabels = ((match as { match_type_labels?: string[] | null }).match_type_labels) ?? [];

  return (
    <Card
      className={`relative overflow-hidden pl-1 transition-all duration-200 before:absolute before:inset-y-0 before:left-0 before:w-1.5 ${stripe} hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "ring-2 ring-primary/50" : ""
      }`}
      // Warm the full profile before the analyst commits to opening the match.
      onMouseEnter={onPrefetch}
      onFocusCapture={onPrefetch}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-muted-foreground">
              {ENTITY_ICONS[entityType] ?? <User className="h-3.5 w-3.5" />}
              {entityLabel}
            </span>
            {entityTypeConflict && (
              <span
                className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 font-medium text-amber-800"
                title={`You screened a ${SUBJECT_TYPE_LABELS[subjectType as SubjectType] ?? subjectType}, but this profile is an ${entityLabel.toLowerCase()}. Likely a false positive — reason pre-filled as "Different entity type".`}
              >
                <AlertTriangle className="h-3 w-3" /> Entity type conflict
              </span>
            )}
            {similarity != null && (
              <span className={`rounded-full border px-2 py-0.5 font-medium ${similarityTone}`}>
                {Math.round(similarity)}% name match
              </span>
            )}
            <span
              className={`rounded-full border px-2 py-0.5 font-medium ${matchBasisTone(basis)}`}
              title={`${matchBasisDescription(basis)}${
                matchTypeLabels.length ? ` Provider signals: ${matchTypeLabels.join(", ")}.` : ""
              }`}
            >
              {matchBasisLabel(basis)}
            </span>
          </div>

          <Checkbox checked={selected} onCheckedChange={onToggleSelect} aria-label="Select match" />
        </div>

        <h3
          className="mt-2 cursor-pointer text-base font-semibold text-foreground transition-colors hover:text-primary hover:underline"
          onClick={onReview}
        >
          {match.matched_name}
        </h3>

        {match.winning_name && match.winning_name !== match.matched_name && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Matched on{" "}
            <span className="font-medium text-foreground">{match.winning_name}</span>
            {match.winning_name_kind === "alias" ? " (alias)" : ""}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {categoryBadges.map(({ cat, count }) => (
            <Badge key={cat} variant="outline" className={riskTone([cat])}>
              {CATEGORY_LABELS[cat] ?? cat}
              {count > 1 && <span className="ml-1">{count}</span>}
            </Badge>
          ))}
        </div>

        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground min-w-[90px]">Relevance</dt>
            <dd>{relevance}</dd>
          </div>
          {match.country && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground min-w-[90px]">Countries</dt>
              <dd>{match.country}</dd>
            </div>
          )}
          {match.year_of_birth && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground min-w-[90px]">Date of birth</dt>
              <dd>{match.year_of_birth} {match.name_similarity === 100 ? `(Age ${new Date().getFullYear() - match.year_of_birth})` : ""}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-muted-foreground min-w-[90px]">Match status</dt>
            <dd>
              <Badge variant="outline" className={match.status === "confirmed" ? "bg-red-50 text-red-700 border-red-200" : match.status === "false_positive" ? "bg-slate-50 text-slate-600 border-slate-200" : "bg-blue-50 text-blue-700 border-blue-200"}>
                {MATCH_STATUS_LABELS[match.status] ?? match.status}
              </Badge>
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          <Button size="sm" onClick={onReview} className="bg-primary/90 hover:bg-primary">Review</Button>
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
            onClick={() => onDecision(match.id, "confirm_match")}
          >
            <Check className="mr-1 h-3.5 w-3.5" /> Confirm
          </Button>

          <Popover open={falsePositiveOpen} onOpenChange={setFalsePositiveOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100">
                <X className="mr-1 h-3.5 w-3.5" /> False positive
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 space-y-3">
              <p className="text-sm font-medium">Mark as false positive</p>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FALSE_POSITIVE_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="w-full" disabled={saving} onClick={handleFalsePositive}>
                {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Record
              </Button>
            </PopoverContent>
          </Popover>

          {fourEyes ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              onClick={() => onDecision(match.id, "escalate")}
            >
              <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Escalate
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              title="Escalation & Four-Eyes Review is an optional add-on module"
            >
              <Link to="/screening/modules">
                <Lock className="mr-1 h-3.5 w-3.5" /> Escalate
              </Link>
            </Button>
          )}

        </div>
      </CardContent>
    </Card>
  );
}

function KeyInfo({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value && value.trim() ? value : "—"}</dd>
    </div>
  );
}

function MatchReview({
  match, subjectType, onClose, onSaved,
}: { match: MatchRow | null; subjectType?: SubjectType; onClose: () => void; onSaved: () => void }) {
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [decision, setDecision] = useState<string>("false_positive");
  const [reason, setReason] = useState<string>(FALSE_POSITIVE_REASONS[0]);
  const [rationale, setRationale] = useState("");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<FullEntityProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = useCallback(async (matchId: string, refresh = false) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      setProfile(await fetchFullProfile(matchId, refresh));
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "The full profile could not be loaded");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!match) return;
    setRationale("");
    setProfile(null);
    setProfileError(null);
    // Pre-fill the false-positive reason when the profile's entity type
    // conflicts with the screened subject (e.g. person → organisation hit).
    setReason(
      subjectType && match.entity_type && subjectType !== match.entity_type
        ? "Different entity type"
        : FALSE_POSITIVE_REASONS[0],
    );
    (async () => {
      const [{ data: attrs }, { data: srcs }] = await Promise.all([
        supabase
          .from("match_attributes")
          .select("field_label, subject_value, match_value, assessment, sort_order")
          .eq("match_id", match.id)
          .order("sort_order"),
        supabase
          .from("screening_sources")
          .select("source_name, jurisdiction, listing_date, description, category")
          .eq("match_id", match.id),
      ]);
      setAttributes((attrs as AttributeRow[]) ?? []);
      setSources((srcs as SourceRow[]) ?? []);
    })();
    loadProfile(match.id);
  }, [match, loadProfile]);

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

  const groupedAttributes = useMemo(() => {
    const identity = ["Name", "First name", "Last name", "Middle name", "Previous name", "AKA"];
    const countries = ["Country", "Nationality", "Country of residence", "Country of incorporation", "Countries"];
    const dates = ["Date of birth", "Year of birth", "Incorporation date", "Age"];
    const identifiers = ["Identification number", "Registration number", "Passport number", "IMO number", "Tail number"];
    const groupFor = (label: string) => {
      const l = label.toLowerCase();
      if (identity.some((k) => l.includes(k.toLowerCase()))) return "Identity";
      if (countries.some((k) => l.includes(k.toLowerCase()))) return "Countries";
      if (dates.some((k) => l.includes(k.toLowerCase()))) return "Dates";
      if (identifiers.some((k) => l.includes(k.toLowerCase()))) return "Identifiers";
      return "Other";
    };
    const groups: Record<string, AttributeRow[]> = {};
    attributes.forEach((a) => {
      const g = groupFor(a.field_label);
      groups[g] ??= [];
      groups[g].push(a);
    });
    return groups;
  }, [attributes]);

  return (
    <Dialog open={!!match} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{match?.matched_name}</DialogTitle>
          <DialogDescription>
            Compare the screened subject with the listed profile, then record your decision.
          </DialogDescription>
        </DialogHeader>

        {match && subjectType && match.entity_type && subjectType !== match.entity_type && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-medium">Entity type conflict:</span> you screened a{" "}
              {SUBJECT_TYPE_LABELS[subjectType]?.toLowerCase() ?? subjectType}, but this profile is an{" "}
              {(SUBJECT_TYPE_LABELS[match.entity_type as SubjectType] ?? match.entity_type).toLowerCase()}.
              This is a common adverse-media indexing artefact — the false-positive reason has been pre-filled as
              “Different entity type”.
            </p>
          </div>
        )}


        <ScrollArea className="max-h-[55vh]">
          <div className="space-y-6 pr-2">
            <section className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Key information</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={profileLoading || !match}
                  onClick={() => match && loadProfile(match.id, true)}
                >
                  {profileLoading
                    ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
                  Refresh profile
                </Button>
              </div>
              {profileLoading && !profile && (
                <p className="text-xs text-muted-foreground">Loading the full listed profile…</p>
              )}
              {profileError && <p className="text-xs text-red-600">{profileError}</p>}
              {profile && (
                <dl className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
                  <KeyInfo label="Full name" value={profile.primary_name} />
                  <KeyInfo label="Entity type" value={profile.entity_type} />
                  <KeyInfo label="Dates of birth" value={profile.dates_of_birth.join(", ")} />
                  <KeyInfo label="Place of birth" value={profile.places_of_birth.join(", ")} />
                  <KeyInfo label="Nationalities" value={profile.nationalities.join(", ")} />
                  <KeyInfo label="Countries" value={profile.countries.join(", ")} />
                  <div className="md:col-span-2">
                    <KeyInfo label="Also known as" value={profile.aliases.join(", ")} />
                  </div>
                </dl>
              )}
            </section>

            {Object.entries(groupedAttributes).map(([group, items]) => (
              <section key={group}>
                <h4 className="mb-2 text-sm font-semibold">{group}</h4>
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
                      {items.map((a) => (
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
            ))}

            {profile && profile.associates.length > 0 && (
              <section>
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Users className="h-4 w-4" /> Associates ({profile.associates.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.associates.map((a, i) => (
                    <Badge key={i} variant="outline" className="font-normal">
                      {a.name}{a.relationship ? ` · ${a.relationship}` : ""}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {profile && profile.listings.length > 0 ? (
              <section>
                <h4 className="mb-2 text-sm font-semibold">Listings and sources ({profile.listings.length})</h4>
                <ul className="space-y-2">
                  {profile.listings.map((l) => (
                    <li key={l.source_key} className="rounded-lg border border-border p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{l.source_name}</p>
                        {l.category_label && (
                          <Badge variant="outline" className={`text-[11px] ${riskTone(l.category ? [l.category] : [])}`}>
                            {l.category_label}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[11px]">
                          {l.status === "former" ? "Removed" : l.status === "current" ? "Currently listed" : "Listed"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[
                          l.country_codes.join(", ") || null,
                          l.listed_from ? `From ${l.listed_from.slice(0, 10)}` : null,
                          l.listed_to ? `To ${l.listed_to.slice(0, 10)}` : null,
                        ].filter(Boolean).join(" · ")}
                      </p>
                      {l.details.length > 0 && (
                        <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs md:grid-cols-2">
                          {l.details.map((d) => (
                            <div key={d.label} className="flex gap-1.5">
                              <dt className="shrink-0 font-medium text-foreground">{d.label}:</dt>
                              <dd className="text-muted-foreground">{d.values.join("; ")}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      {l.urls.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {l.urls.slice(0, 6).map((u) => (
                            <a
                              key={u}
                              href={u}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-2"
                            >
                              <ExternalLink className="h-3 w-3" /> Source
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ) : sources.length > 0 && (
              <section>
                <h4 className="mb-2 text-sm font-semibold">Listings and sources</h4>
                <ul className="space-y-2">
                  {sources.map((s, i) => (
                    <li key={i} className="rounded-lg border border-border p-3 text-sm">
                      <p className="font-medium">{s.source_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[s.jurisdiction, s.listing_date ? `Listed ${s.listing_date}` : null, s.category ? CATEGORY_LABELS[s.category] ?? s.category : null].filter(Boolean).join(" · ")}
                      </p>
                      {s.description && <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {profile && profile.media.length > 0 && (
              <section>
                <h4 className="mb-2 text-sm font-semibold">Adverse media ({profile.media.length})</h4>
                <ul className="space-y-2">
                  {profile.media.slice(0, 15).map((m, i) => (
                    <li key={i} className="rounded-lg border border-border p-3 text-sm">
                      <p className="font-medium">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.date?.slice(0, 10) ?? "Date not stated"}</p>
                      {m.snippet && <p className="mt-1 text-xs text-muted-foreground">{m.snippet}</p>}
                      {m.url && (
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline underline-offset-2"
                        >
                          <ExternalLink className="h-3 w-3" /> Read article
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </ScrollArea>

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
