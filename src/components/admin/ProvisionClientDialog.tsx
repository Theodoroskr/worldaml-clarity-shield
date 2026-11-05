// Admin: invite a client user, pick their company, modules and screening limits.
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Org = { id: string; name: string };
type ModuleKey = "screening" | "kyc_kyb" | "rcm";

const MODULES: { key: ModuleKey; label: string; hint: string }[] = [
  { key: "screening", label: "Screening & Monitoring", hint: "Sanctions/PEP checks, monitored watchlists, cases" },
  { key: "kyc_kyb", label: "KYC / KYB Onboarding", hint: "Customers, document checks, risk, transactions" },
  { key: "rcm", label: "Regulatory Change Management", hint: "Regulations, obligations, controls" },
];
const ROLES = [
  { value: "admin", label: "Company admin" },
  { value: "mlro", label: "MLRO" },
  { value: "compliance_officer", label: "Compliance officer" },
  { value: "analyst", label: "Analyst" },
  { value: "viewer", label: "Viewer" },
];
const SEARCH_PRESETS = [5, 10, 25, 100, 500];
const MONITOR_PRESETS = [2, 5, 10, 25, 100];

export function ProvisionClientDialog({ orgs, onDone }: { orgs: Org[]; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgChoice, setOrgChoice] = useState<string>("new");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("admin");
  const [modules, setModules] = useState<ModuleKey[]>(["screening"]);
  const [access, setAccess] = useState<"trial" | "active">("trial");
  const [trialDays, setTrialDays] = useState("14");
  const [searchQuota, setSearchQuota] = useState("10");
  const [monitorQuota, setMonitorQuota] = useState("5");
  const [unlimited, setUnlimited] = useState(false);

  const reset = () => {
    setEmail(""); setFullName(""); setOrgChoice("new"); setCompany(""); setCountry("");
    setRole("admin"); setModules(["screening"]); setAccess("trial"); setTrialDays("14");
    setSearchQuota("10"); setMonitorQuota("5"); setUnlimited(false);
  };
  const toggle = (k: ModuleKey) =>
    setModules((m) => (m.includes(k) ? m.filter((x) => x !== k) : [...m, k]));
  const num = (v: string) => (v.trim() === "" ? null : Math.max(0, parseInt(v) || 0));

  const submit = async () => {
    if (!email.includes("@")) return toast.error("Enter the client's email");
    if (orgChoice === "new" && company.trim().length < 2) return toast.error("Enter the company name");
    if (modules.length === 0) return toast.error("Choose at least one module");
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("admin-provision-client", {
      body: {
        email, full_name: fullName || undefined,
        organisation_id: orgChoice === "new" ? undefined : orgChoice,
        company_name: orgChoice === "new" ? company : undefined,
        country: country || undefined,
        role, modules, access,
        trial_days: Math.max(1, parseInt(trialDays) || 14),
        search_quota: unlimited ? null : num(searchQuota),
        monitor_quota: unlimited ? null : num(monitorQuota),
      },
    });
    setSaving(false);
    const err = (data as any)?.error ?? (error ? await readError(error) : null);
    if (err) return toast.error(typeof err === "string" ? err : "Could not set up the client");
    toast.success((data as any)?.invited ? `Invite email sent to ${email}` : `${email} added — they can sign in now`);
    setOpen(false); reset(); onDone?.();
  };

  const hasScreening = modules.includes("screening");

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline"><UserPlus className="w-4 h-4 mr-2" /> Invite Client</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite a client or demo user</DialogTitle>
          <DialogDescription>
            Creates their login (or uses their existing one), adds them to a company, and switches on the modules and limits you pick.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">1. Who</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Work email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></div>
              <div><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            </div>
            <div>
              <Label>Company</Label>
              <Select value={orgChoice} onValueChange={setOrgChoice}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ New company</SelectItem>
                  {orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {orgChoice === "new" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Company name</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
                <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
              </div>
            )}
            <div>
              <Label>Role in the company</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">2. Modules</h3>
            {MODULES.map((m) => (
              <label key={m.key} className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer">
                <Checkbox checked={modules.includes(m.key)} onCheckedChange={() => toggle(m.key)} className="mt-0.5" />
                <span><span className="text-sm font-medium block">{m.label}</span><span className="text-xs text-muted-foreground">{m.hint}</span></span>
              </label>
            ))}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Access</Label>
                <Select value={access} onValueChange={(v) => setAccess(v as "trial" | "active")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="trial">Trial</SelectItem><SelectItem value="active">Active (paid)</SelectItem></SelectContent>
                </Select>
              </div>
              {access === "trial" && (
                <div><Label>Trial length (days)</Label><Input type="number" min={1} max={365} value={trialDays} onChange={(e) => setTrialDays(e.target.value)} /></div>
              )}
            </div>
          </section>

          {hasScreening && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">3. Screening limits</h3>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={unlimited} onCheckedChange={(v) => setUnlimited(!!v)} /> No limits
              </label>
              {!unlimited && (
                <>
                  <QuotaField label="Searches allowed" value={searchQuota} onChange={setSearchQuota} presets={SEARCH_PRESETS} />
                  <QuotaField label="Monitored people / companies" value={monitorQuota} onChange={setMonitorQuota} presets={MONITOR_PRESETS} />
                </>
              )}
            </section>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Set up & send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuotaField({ label, value, onChange, presets }: { label: string; value: string; onChange: (v: string) => void; presets: number[] }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <Button key={p} type="button" size="sm" variant={value === String(p) ? "default" : "outline"} onClick={() => onChange(String(p))}>{p}</Button>
        ))}
        <Input type="number" min={0} className="w-28 h-9" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

async function readError(error: any): Promise<string> {
  try { const b = await error?.context?.json?.(); if (b?.error) return b.error; } catch { /* ignore */ }
  return error?.message ?? "Request failed";
}
