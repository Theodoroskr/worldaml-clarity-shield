import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, ShieldCheck, Users, Settings2, Building2, Sparkles, Rocket } from "lucide-react";

type StepId = "profile" | "regulator" | "thresholds" | "team" | "provision" | "done";
const STEPS: { id: StepId; title: string; icon: any }[] = [
  { id: "profile",    title: "Organisation profile", icon: Building2 },
  { id: "regulator",  title: "Regulator & risk appetite", icon: ShieldCheck },
  { id: "thresholds", title: "Default thresholds", icon: Settings2 },
  { id: "team",       title: "Invite your team", icon: Users },
  { id: "provision",  title: "Baseline rules", icon: Sparkles },
  { id: "done",       title: "You're all set", icon: Rocket },
];

const INDUSTRIES = ["Banking", "Payments / EMI", "Crypto / VASP", "iGaming", "Insurance", "Fintech", "Real estate", "Legal / Corporate services", "Other"];
const REGULATORS = ["FinCEN (US)", "FCA (UK)", "FINTRAC (CA)", "MAS (SG)", "MFSA (MT)", "MGA (MT)", "FIAU (MT)", "DNB (NL)", "BaFin (DE)", "AMF (FR)", "MOKAS (CY)", "Other"];
const RISK_APPETITE = [
  { v: "conservative", label: "Conservative — low tolerance, escalate early" },
  { v: "moderate",     label: "Moderate — balanced controls" },
  { v: "aggressive",   label: "Aggressive — growth first, remediate reactively" },
];

type State = {
  name: string; industry: string; country: string; website: string; registration_number: string;
  regulator: string; risk_appetite: string;
  thresholds: { high_value_eur: number; daily_velocity_count: number; cash_ratio: number };
  invites: { email: string; role: string }[];
};

const DEFAULT_STATE: State = {
  name: "", industry: "", country: "", website: "", registration_number: "",
  regulator: "", risk_appetite: "moderate",
  thresholds: { high_value_eur: 10000, daily_velocity_count: 5, cash_ratio: 0.7 },
  invites: [{ email: "", role: "analyst" }],
};

export default function SuiteSetup() {
  const nav = useNavigate();
  const { orgId, org, isAdmin, isLoading, refetch, userId } = useOrganisation();
  const [step, setStep] = useState<StepId>("profile");
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  // Hydrate from org
  useEffect(() => {
    if (!org) return;
    const saved = (org as any).onboarding_state ?? {};
    setState(s => ({
      ...s,
      name: org.name || "",
      industry: org.industry || saved.industry || "",
      country: org.country || saved.country || "",
      website: (org as any).website || saved.website || "",
      registration_number: (org as any).registration_number || saved.registration_number || "",
      regulator: org.regulator || saved.regulator || "",
      risk_appetite: (org as any).risk_appetite || saved.risk_appetite || "moderate",
      thresholds: { ...s.thresholds, ...((org as any).default_thresholds || {}), ...(saved.thresholds || {}) },
      invites: saved.invites?.length ? saved.invites : s.invites,
    }));
    const nextStep = (org as any).onboarding_completed_at ? "done" : ((org as any).onboarding_step as StepId) || "profile";
    setStep(nextStep);
  }, [org]);

  const idx = STEPS.findIndex(s => s.id === step);
  const progress = ((idx + 1) / STEPS.length) * 100;

  async function persistState(nextStep: StepId, patch: Partial<State> = {}) {
    if (!orgId) return;
    setSaving(true);
    const merged = { ...state, ...patch };
    setState(merged);
    const { error } = await supabase
      .from("suite_organizations")
      .update({
        name: merged.name || "My Organisation",
        industry: merged.industry || null,
        country: merged.country || null,
        website: merged.website || null,
        registration_number: merged.registration_number || null,
        regulator: merged.regulator || null,
        risk_appetite: merged.risk_appetite || null,
        default_thresholds: merged.thresholds as any,
        onboarding_state: merged as any,
        onboarding_step: nextStep,
      } as any)
      .eq("id", orgId);
    setSaving(false);
    if (error) { toast.error(error.message); return false; }
    setStep(nextStep);
    return true;
  }

  async function ensureOrg() {
    if (orgId) return orgId;
    const { data, error } = await supabase.rpc("suite_bootstrap_org", { _name: state.name || "My Organisation" });
    if (error) { toast.error(error.message); return null; }
    await refetch();
    return data as string;
  }

  async function saveProfile() {
    if (!state.name.trim()) return toast.error("Give your organisation a name");
    setBusy(true);
    const id = await ensureOrg();
    setBusy(false);
    if (!id) return;
    await persistState("regulator");
  }

  async function saveRegulator() {
    await persistState("thresholds");
  }

  async function saveThresholds() {
    await persistState("team");
  }

  async function saveTeam() {
    // Persist invites in state; actual sending handled by existing invite flow later.
    const clean = state.invites.filter(i => i.email.trim());
    let sent = 0;
    for (const i of clean) {
      const { error } = await supabase.from("suite_org_members").insert({
        organization_id: orgId, user_id: userId, role: i.role as any, invited_email: i.email.trim(),
      } as any);
      if (!error) sent++;
    }
    if (sent) toast.success(`${sent} invite${sent === 1 ? "" : "s"} recorded`);
    await persistState("provision", { invites: clean.length ? clean : [{ email: "", role: "analyst" }] });
  }

  async function provisionRules() {
    if (!orgId) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("suite_provision_baseline_rules", { _org: orgId });
    setBusy(false);
    if (error) return toast.error(error.message);
    if ((data as number) > 0) toast.success(`Provisioned ${data} baseline alert rules`);
    else toast.info("Baseline rules already present — skipped");
    await persistState("done");
  }

  async function finish() {
    if (!orgId) return;
    setBusy(true);
    const { error } = await supabase
      .from("suite_organizations")
      .update({ onboarding_completed_at: new Date().toISOString(), onboarding_step: "done" } as any)
      .eq("id", orgId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Setup complete");
    nav("/suite");
  }

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (orgId && !isAdmin) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <Card>
          <CardHeader><CardTitle>Setup in progress</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Your organisation admin is completing setup. You'll gain access as soon as they finish.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to WorldAML Suite</h1>
            <p className="text-sm text-muted-foreground">Let's get your organisation ready — takes about 3 minutes. Your progress is saved automatically.</p>
          </div>
          {saving && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Saving…</span>}
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex flex-wrap gap-2 pt-1">
          {STEPS.map((s, i) => {
            const done = i < idx || step === "done";
            const active = i === idx;
            const Icon = s.icon;
            return (
              <Badge key={s.id} variant={active ? "default" : done ? "secondary" : "outline"} className="gap-1">
                {done ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                {s.title}
              </Badge>
            );
          })}
        </div>
      </div>

      {step === "profile" && (
        <StepCard title="Tell us about your organisation" desc="This becomes your tenant profile — used in reports and screening records.">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Organisation name *"><Input value={state.name} onChange={e => setState({ ...state, name: e.target.value })} placeholder="Acme Compliance Ltd" /></Field>
            <Field label="Industry">
              <Select value={state.industry} onValueChange={v => setState({ ...state, industry: v })}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Country of incorporation"><Input value={state.country} onChange={e => setState({ ...state, country: e.target.value })} placeholder="Malta" /></Field>
            <Field label="Registration number"><Input value={state.registration_number} onChange={e => setState({ ...state, registration_number: e.target.value })} placeholder="C12345" /></Field>
            <Field label="Website" className="md:col-span-2"><Input value={state.website} onChange={e => setState({ ...state, website: e.target.value })} placeholder="https://acme.com" /></Field>
          </div>
          <StepFooter onNext={saveProfile} busy={busy || saving} />
        </StepCard>
      )}

      {step === "regulator" && (
        <StepCard title="Regulator & risk appetite" desc="We'll tailor screening severity and report templates to your regulator.">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Primary regulator">
              <Select value={state.regulator} onValueChange={v => setState({ ...state, regulator: v })}>
                <SelectTrigger><SelectValue placeholder="Select regulator" /></SelectTrigger>
                <SelectContent>{REGULATORS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Risk appetite">
              <Select value={state.risk_appetite} onValueChange={v => setState({ ...state, risk_appetite: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RISK_APPETITE.map(r => <SelectItem key={r.v} value={r.v}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <StepFooter onBack={() => persistState("profile")} onNext={saveRegulator} busy={saving} />
        </StepCard>
      )}

      {step === "thresholds" && (
        <StepCard title="Default monitoring thresholds" desc="Baseline values used when new alert rules are provisioned. You can fine-tune per rule later.">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="High-value single tx (EUR)">
              <Input type="number" value={state.thresholds.high_value_eur}
                onChange={e => setState({ ...state, thresholds: { ...state.thresholds, high_value_eur: Number(e.target.value) } })} />
            </Field>
            <Field label="Velocity count / 24h">
              <Input type="number" value={state.thresholds.daily_velocity_count}
                onChange={e => setState({ ...state, thresholds: { ...state.thresholds, daily_velocity_count: Number(e.target.value) } })} />
            </Field>
            <Field label="Cash ratio trigger (0-1)">
              <Input type="number" step="0.05" min="0" max="1" value={state.thresholds.cash_ratio}
                onChange={e => setState({ ...state, thresholds: { ...state.thresholds, cash_ratio: Number(e.target.value) } })} />
            </Field>
          </div>
          <StepFooter onBack={() => persistState("regulator")} onNext={saveThresholds} busy={saving} />
        </StepCard>
      )}

      {step === "team" && (
        <StepCard title="Invite your compliance team" desc="Add teammates now or skip and invite later from Settings.">
          <div className="space-y-2">
            {state.invites.map((inv, i) => (
              <div key={i} className="grid grid-cols-[1fr_180px_auto] gap-2">
                <Input placeholder="teammate@company.com" value={inv.email}
                  onChange={e => {
                    const next = [...state.invites]; next[i] = { ...inv, email: e.target.value }; setState({ ...state, invites: next });
                  }} />
                <Select value={inv.role} onValueChange={v => {
                  const next = [...state.invites]; next[i] = { ...inv, role: v }; setState({ ...state, invites: next });
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mlro">MLRO</SelectItem>
                    <SelectItem value="compliance_officer">Compliance officer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => setState({ ...state, invites: state.invites.filter((_, j) => j !== i) })}>Remove</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setState({ ...state, invites: [...state.invites, { email: "", role: "analyst" }] })}>
              + Add another
            </Button>
          </div>
          <StepFooter onBack={() => persistState("thresholds")} onNext={saveTeam} nextLabel="Continue" busy={saving} skipLabel="Skip for now" onSkip={() => persistState("provision")} />
        </StepCard>
      )}

      {step === "provision" && (
        <StepCard title="Provision baseline alert rules" desc="We'll install 8 FATF-aligned starter rules using your thresholds. Safe to skip if you'll import rules manually.">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>High-value single transaction ≥ €{state.thresholds.high_value_eur.toLocaleString()}</li>
            <li>Velocity — {state.thresholds.daily_velocity_count}+ transactions / 24h</li>
            <li>Structuring pattern (3+ txns just under threshold)</li>
            <li>High-risk jurisdiction counterparty (FATF list)</li>
            <li>PEP screening hit · Sanctions screening hit</li>
            <li>Cash-intensive activity spike · Round-number patterns</li>
          </ul>
          <StepFooter onBack={() => persistState("team")} onNext={provisionRules} nextLabel="Provision rules" busy={busy} skipLabel="Skip" onSkip={() => persistState("done")} />
        </StepCard>
      )}

      {step === "done" && (
        <StepCard title="You're all set 🎉" desc="Your organisation is ready. You can revisit any setting from Suite → Settings.">
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <SummaryRow label="Organisation" value={state.name} />
            <SummaryRow label="Regulator" value={state.regulator || "—"} />
            <SummaryRow label="Risk appetite" value={state.risk_appetite} />
            <SummaryRow label="High-value threshold" value={`€${state.thresholds.high_value_eur.toLocaleString()}`} />
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => persistState("provision")}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
            <Button onClick={finish} disabled={busy}>Enter the Suite<ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </StepCard>
      )}
    </div>
  );
}

function StepCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="text-xs text-muted-foreground">{label}</Label><div className="mt-1">{children}</div></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border rounded px-3 py-2"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}

function StepFooter({ onBack, onNext, busy, nextLabel = "Continue", onSkip, skipLabel }: {
  onBack?: () => void; onNext: () => void; busy?: boolean; nextLabel?: string; onSkip?: () => void; skipLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div>{onBack && <Button variant="ghost" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>}</div>
      <div className="flex items-center gap-2">
        {onSkip && <Button variant="ghost" onClick={onSkip}>{skipLabel || "Skip"}</Button>}
        <Button onClick={onNext} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
          {nextLabel}<ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
