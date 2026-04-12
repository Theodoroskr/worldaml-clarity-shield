import { useState, useEffect, useCallback } from "react";
import { User, Building2, Plus, ChevronRight, ArrowLeft, Search, Eye, Pencil, Save, X, Settings2, Shield, FileText, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import FormFieldBuilder, { type CustomField } from "@/components/suite/FormFieldBuilder";
import { REGULATORY_PROFILES, REGULATOR_OPTIONS, type RegulatoryProfile } from "@/data/regulatoryProfiles";
import {
  scoreCountry, scoreScreening, scoreTransactions, scoreCustomerType, scoreKycStatus,
  computeComposite, riskColor, riskBg, riskLabel, riskBadgeClass, WEIGHTS,
  type RiskBreakdown,
} from "@/lib/riskScoring";

interface Customer {
  id: string;
  name: string;
  type: string;
  email: string | null;
  country: string | null;
  risk_level: string;
  kyc_status: string;
  status: string;
  company_name: string | null;
  registration_number: string | null;
  date_of_birth: string | null;
  regulator: string | null;
  created_at: string;
}

type OnboardingStep = "select" | "kyc-form" | "kyb-form";

const kycStatusLabel: Record<string, string> = {
  pending: "Lead Captured",
  in_review: "KYC Initiated",
  verified: "Verified",
  rejected: "Rejected",
};

const riskBadge = (r: string) => {
  const m: Record<string, string> = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-red-50 text-red-700 border-red-200",
    critical: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return m[r] ?? "bg-muted text-muted-foreground border-border";
};

const statusColor = (s: string) => {
  const m: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    in_review: "bg-blue-50 text-blue-700 border-blue-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return m[s] ?? "bg-muted text-muted-foreground border-border";
};

const COUNTRIES = [
  "CY", "GB", "US", "DE", "FR", "GR", "IT", "ES", "NL", "CH", "AE", "SG", "HK", "JP",
  "AU", "CA", "IE", "AT", "BE", "LU", "MT", "PT", "SE", "NO", "DK", "FI", "PL", "CZ",
  "BG", "RO", "HR", "LT", "LV", "EE", "SK", "SI", "HU", "IN", "BR", "MX", "ZA", "NG",
  "KE", "EG", "SA", "QA", "BH", "KW", "OM", "JO", "LB", "TR", "IL", "RU", "UA", "KZ",
  "IR", "KP", "SY", "CU", "VE", "MM",
];

// KYC form state
interface KYCForm {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  idType: string;
  idNumber: string;
  occupation: string;
  sourceOfFunds: string;
  pep: string;
  regulator: string;
}

const emptyKYC: KYCForm = {
  firstName: "", lastName: "", email: "", dateOfBirth: "", nationality: "", country: "",
  address: "", city: "", postalCode: "", idType: "passport", idNumber: "",
  occupation: "", sourceOfFunds: "", pep: "no", regulator: "",
};

// Director entry
interface DirectorEntry {
  id: string;
  name: string;
  nationality: string;
  dateOfBirth: string;
  role: string;
  pep: string;
}

const emptyDirector = (): DirectorEntry => ({
  id: crypto.randomUUID(),
  name: "", nationality: "", dateOfBirth: "", role: "director", pep: "no",
});

// UBO entry
interface UBOEntry {
  id: string;
  name: string;
  nationality: string;
  ownershipPct: string;
  dateOfBirth: string;
  pep: string;
}

const emptyUBO = (): UBOEntry => ({
  id: crypto.randomUUID(),
  name: "", nationality: "", ownershipPct: "", dateOfBirth: "", pep: "no",
});

// KYB form state
interface KYBForm {
  companyName: string;
  registrationNumber: string;
  country: string;
  incorporationDate: string;
  legalStructure: string;
  industry: string;
  website: string;
  registeredAddress: string;
  city: string;
  postalCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  annualTurnover: string;
  numberOfEmployees: string;
  sourceOfFunds: string;
  directors: DirectorEntry[];
  ubos: UBOEntry[];
  regulator: string;
}

const emptyKYB: KYBForm = {
  companyName: "", registrationNumber: "", country: "", incorporationDate: "",
  legalStructure: "limited", industry: "", website: "", registeredAddress: "",
  city: "", postalCode: "", contactName: "", contactEmail: "", contactPhone: "",
  annualTurnover: "", numberOfEmployees: "", sourceOfFunds: "",
  directors: [emptyDirector()], ubos: [emptyUBO()], regulator: "",
};

// Auto-provision baseline alert rules for the selected regulator
async function provisionRegulatoryRules(userId: string, regulatorId: string, customerName: string) {
  const profile = REGULATORY_PROFILES[regulatorId];
  if (!profile) return;

  // Check which rules already exist for this user to avoid duplicates
  const { data: existing } = await supabase.from("suite_alert_rules")
    .select("name")
    .eq("user_id", userId);
  const existingNames = new Set((existing || []).map(r => r.name));

  const newRules = profile.baselineRules.filter(r => !existingNames.has(r.name));
  if (newRules.length === 0) return;

  const inserts = newRules.map(rule => ({
    user_id: userId,
    name: rule.name,
    severity: rule.severity,
    conditions: rule.conditions,
    is_active: true,
  }));

  const { error } = await supabase.from("suite_alert_rules").insert(inserts);
  if (error) {
    console.error("Failed to provision rules:", error);
  } else {
    toast.success(`${newRules.length} ${profile.shortName} alert rules auto-configured`);
    // Audit log
    await supabase.from("suite_audit_log").insert({
      user_id: userId,
      action: `Auto-provisioned ${newRules.length} ${profile.shortName} rules for ${customerName}`,
      entity_type: "alert_rule",
      details: { regulator: regulatorId, rules_added: newRules.map(r => r.name) },
    });
  }
}

// Regulator picker component
function RegulatorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = value ? REGULATORY_PROFILES[value] : null;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5" /> Regulatory Jurisdiction
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <FormField label="Reporting Regulator" required>
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select regulator…" /></SelectTrigger>
              <SelectContent>
                {REGULATOR_OPTIONS.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    <span className="font-medium">{r.label}</span>
                    <span className="text-muted-foreground ml-1.5">({r.country})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {selected && (
        <div className="mt-3 p-3 bg-muted/30 border border-border rounded-lg space-y-2 animate-fade-in">
          <p className="text-xs font-medium text-foreground">{selected.name}</p>
          <p className="text-[10px] text-muted-foreground">{selected.legislation}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selected.reportingObligations.map(ob => (
              <span key={ob.code} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                <FileText className="w-2.5 h-2.5" /> {ob.code}
                {ob.threshold && <span className="text-muted-foreground">({ob.threshold})</span>}
              </span>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-[10px] font-medium text-muted-foreground mb-1">Auto-configured on submit:</p>
            <ul className="text-[10px] text-muted-foreground space-y-0.5">
              <li className="flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5 text-amber-500" /> {selected.baselineRules.length} monitoring rules</li>
              <li className="flex items-center gap-1"><Shield className="w-2.5 h-2.5 text-primary" /> Risk weights: Country {selected.riskWeights.countryRisk}%, Screening {selected.riskWeights.screeningMatches}%, Transactions {selected.riskWeights.transactions}%</li>
              <li className="flex items-center gap-1"><FileText className="w-2.5 h-2.5 text-emerald-500" /> {selected.reportingObligations.length} reporting obligations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const KYC_STATUSES = ["pending", "in_review", "verified", "rejected"];
const RISK_LEVELS = ["low", "medium", "high", "critical"];

function CustomerDetailPanel({ customer, onClose, onUpdated }: {
  customer: Customer;
  onClose: () => void;
  onUpdated: (c: Customer) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [riskBreakdown, setRiskBreakdown] = useState<RiskBreakdown | null>(null);
  const [riskLoading, setRiskLoading] = useState(true);
  const [edit, setEdit] = useState({
    name: customer.name,
    email: customer.email || "",
    country: customer.country || "",
    company_name: customer.company_name || "",
    registration_number: customer.registration_number || "",
    risk_level: customer.risk_level,
    kyc_status: customer.kyc_status,
  });

  // Fetch screening + transaction data for risk scoring
  const fetchRiskData = useCallback(async () => {
    setRiskLoading(true);
    const [screenings, transactions] = await Promise.all([
      supabase.from("suite_screenings").select("match_count").eq("customer_id", customer.id),
      supabase.from("suite_transactions").select("risk_flag, amount").eq("customer_id", customer.id),
    ]);
    const totalMatches = (screenings.data || []).reduce((s, r: any) => s + (r.match_count || 0), 0);
    const hasMatches = totalMatches > 0;
    const txData = transactions.data || [];
    const flaggedCount = txData.filter((t: any) => t.risk_flag).length;
    const totalVolume = txData.reduce((s, t: any) => s + (Number(t.amount) || 0), 0);

    const b = {
      country: scoreCountry(customer.country),
      screening: scoreScreening(totalMatches, hasMatches),
      transaction: scoreTransactions(flaggedCount, txData.length, totalVolume),
      customerType: scoreCustomerType(customer.type),
      kycStatus: scoreKycStatus(customer.kyc_status),
      composite: 0,
    };
    b.composite = computeComposite(b);
    setRiskBreakdown(b);
    setRiskLoading(false);
  }, [customer.id, customer.country, customer.type, customer.kyc_status]);

  useEffect(() => { fetchRiskData(); }, [fetchRiskData]);

  // Sync when customer changes
  useEffect(() => {
    setEdit({
      name: customer.name,
      email: customer.email || "",
      country: customer.country || "",
      company_name: customer.company_name || "",
      registration_number: customer.registration_number || "",
      risk_level: customer.risk_level,
      kyc_status: customer.kyc_status,
    });
    setEditing(false);
  }, [customer.id]);

  const saveChanges = async () => {
    if (!edit.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const updates: Record<string, any> = {
      name: edit.name.trim(),
      email: edit.email.trim() || null,
      country: edit.country || null,
      risk_level: edit.risk_level,
      kyc_status: edit.kyc_status,
    };
    if (customer.type === "business") {
      updates.company_name = edit.company_name.trim() || null;
      updates.registration_number = edit.registration_number.trim() || null;
    }

    const { error } = await supabase.from("suite_customers").update(updates).eq("id", customer.id);
    if (error) { toast.error(error.message); setSaving(false); return; }

    // Build change summary for audit
    const changes: string[] = [];
    if (edit.name !== customer.name) changes.push(`name → ${edit.name}`);
    if (edit.risk_level !== customer.risk_level) changes.push(`risk ${customer.risk_level} → ${edit.risk_level}`);
    if (edit.kyc_status !== customer.kyc_status) changes.push(`status ${customer.kyc_status} → ${edit.kyc_status}`);
    if (edit.country !== (customer.country || "")) changes.push(`country → ${edit.country}`);

    if (changes.length > 0) {
      await supabase.from("suite_audit_log").insert({
        user_id: user.id,
        action: `Customer updated: ${customer.name}`,
        entity_type: "customer",
        entity_id: customer.id,
        details: { changes },
      });
    }

    toast.success("Customer updated");
    onUpdated({ ...customer, ...updates });
    setEditing(false);
    setSaving(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-card border-l border-border shadow-xl z-50 overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-5 py-3 flex items-center justify-between z-10">
        <h2 className="font-semibold text-foreground text-sm">Customer Details</h2>
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <Button variant="default" size="sm" className="h-7 text-xs" onClick={saveChanges} disabled={saving}>
                <Save className="w-3.5 h-3.5 mr-1" />{saving ? "Saving…" : "Save"}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(false); setEdit({ name: customer.name, email: customer.email || "", country: customer.country || "", company_name: customer.company_name || "", registration_number: customer.registration_number || "", risk_level: customer.risk_level, kyc_status: customer.kyc_status }); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5 mr-1" />Edit
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Identity */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Identity</h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Name</span>
              {editing ? <Input value={edit.name} onChange={e => setEdit(f => ({ ...f, name: e.target.value }))} className="h-8 text-sm" /> : <p className="text-sm font-medium">{customer.name}</p>}
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Type</span>
              <p className="text-sm capitalize">{customer.type}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Email</span>
              {editing ? <Input value={edit.email} onChange={e => setEdit(f => ({ ...f, email: e.target.value }))} className="h-8 text-sm" /> : <p className="text-sm">{customer.email || "—"}</p>}
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Country</span>
              {editing ? (
                <Select value={edit.country} onValueChange={v => setEdit(f => ({ ...f, country: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              ) : <p className="text-sm font-mono">{customer.country || "—"}</p>}
            </div>
            {customer.date_of_birth && (
              <div><span className="text-xs text-muted-foreground block mb-0.5">Date of Birth</span><p className="text-sm">{customer.date_of_birth}</p></div>
            )}
          </div>
        </div>

        {/* Business fields */}
        {customer.type === "business" && (
          <div>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Business Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Company Name</span>
                {editing ? <Input value={edit.company_name} onChange={e => setEdit(f => ({ ...f, company_name: e.target.value }))} className="h-8 text-sm" /> : <p className="text-sm">{customer.company_name || "—"}</p>}
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Registration Number</span>
                {editing ? <Input value={edit.registration_number} onChange={e => setEdit(f => ({ ...f, registration_number: e.target.value }))} className="h-8 text-sm" /> : <p className="text-sm font-mono">{customer.registration_number || "—"}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Compliance Status */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Compliance Status</h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Reporting Regulator</span>
              {customer.regulator ? (
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                  {REGULATORY_PROFILES[customer.regulator]?.shortName || customer.regulator}
                </Badge>
              ) : <p className="text-sm text-muted-foreground">—</p>}
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">KYC/KYB Status</span>
              {editing ? (
                <Select value={edit.kyc_status} onValueChange={v => setEdit(f => ({ ...f, kyc_status: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KYC_STATUSES.map(s => <SelectItem key={s} value={s}>{kycStatusLabel[s] || s}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : <Badge className={cn("text-xs", statusColor(customer.kyc_status))}>{kycStatusLabel[customer.kyc_status] || customer.kyc_status}</Badge>}
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Risk Level</span>
              {editing ? (
                <Select value={edit.risk_level} onValueChange={v => setEdit(f => ({ ...f, risk_level: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RISK_LEVELS.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : <Badge className={cn("text-xs capitalize", riskBadge(customer.risk_level))}>{customer.risk_level}</Badge>}
            </div>
          </div>
        </div>

        {/* Risk Scorecard */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Composite Risk Score</h3>
          {riskLoading ? (
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" />Calculating…</div>
          ) : riskBreakdown ? (
            <div className="space-y-3">
              {/* Score header */}
              <div className="flex items-center gap-3">
                <div className={cn("text-2xl font-bold tabular-nums", riskColor(riskBreakdown.composite))}>
                  {riskBreakdown.composite}
                </div>
                <div className="flex-1">
                  <Badge className={cn("text-xs capitalize", riskBadgeClass(riskBreakdown.composite))}>
                    {riskLabel(riskBreakdown.composite)}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-0.5">out of 100</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", riskBg(riskBreakdown.composite))} style={{ width: `${riskBreakdown.composite}%` }} />
              </div>

              {/* Breakdown */}
              <div className="space-y-2">
                {[
                  { label: "Country", score: riskBreakdown.country, weight: WEIGHTS.country },
                  { label: "Screening", score: riskBreakdown.screening, weight: WEIGHTS.screening },
                  { label: "Transactions", score: riskBreakdown.transaction, weight: WEIGHTS.transaction },
                  { label: "Entity Type", score: riskBreakdown.customerType, weight: WEIGHTS.customerType },
                  { label: "KYC Status", score: riskBreakdown.kycStatus, weight: WEIGHTS.kycStatus },
                ].map(d => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-20 shrink-0">{d.label}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", riskBg(d.score))} style={{ width: `${d.score}%` }} />
                    </div>
                    <span className={cn("text-[10px] font-mono font-semibold w-7 text-right tabular-nums", riskColor(d.score))}>{d.score}</span>
                    <span className="text-[10px] text-muted-foreground w-12">{d.weight}% · {Math.round(d.score * d.weight / 100)}</span>
                  </div>
                ))}
              </div>

              {/* Summary badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className={cn("inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-medium", statusColor(customer.kyc_status))}>
                  KYC: {kycStatusLabel[customer.kyc_status] || customer.kyc_status}
                </span>
                <span className={cn("inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize", riskBadge(customer.risk_level))}>
                  Stored Risk: {customer.risk_level}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Metadata */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Record Info</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {new Date(customer.created_at).toLocaleString()}</p>
            <p className="font-mono text-[10px] break-all">ID: {customer.id}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => {
              sessionStorage.setItem("screenCustomerId", customer.id);
              sessionStorage.setItem("screenCustomerName", customer.name);
              window.location.href = "/suite/screening";
            }}>Screen Customer</Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => {
              window.location.href = "/suite/cases";
            }}>Open Case</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function FormInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} className="h-9 text-sm" />
  );
}

export default function SuiteOnboarding() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<OnboardingStep>("select");
  const [showForm, setShowForm] = useState(false);
  const [kycForm, setKycForm] = useState<KYCForm>(emptyKYC);
  const [kybForm, setKybForm] = useState<KYBForm>(emptyKYB);
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Custom field builder state
  const [kycCustomFields, setKycCustomFields] = useState<CustomField[]>([]);
  const [kybCustomFields, setKybCustomFields] = useState<CustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [showBuilder, setShowBuilder] = useState<"kyc" | "kyb" | null>(null);
  const [builderSaving, setBuilderSaving] = useState(false);
  const [kycTemplateId, setKycTemplateId] = useState<string | null>(null);
  const [kybTemplateId, setKybTemplateId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("suite_customers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCustomers((data || []) as Customer[]);
    setLoading(false);
  };

  const fetchCustomFieldTemplates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("admin_form_templates")
      .select("*")
      .eq("created_by", user.id)
      .in("form_type", ["kyc_onboarding", "kyb_onboarding"]);

    (data || []).forEach((tpl: any) => {
      const fields = (tpl.fields || []) as CustomField[];
      if (tpl.form_type === "kyc_onboarding") {
        setKycCustomFields(fields);
        setKycTemplateId(tpl.id);
      } else {
        setKybCustomFields(fields);
        setKybTemplateId(tpl.id);
      }
    });
  };

  useEffect(() => { fetchCustomers(); fetchCustomFieldTemplates(); }, []);

  const startOnboarding = (type: "kyc-form" | "kyb-form") => {
    setStep(type);
    setCustomFieldValues({});
    if (type === "kyc-form") setKycForm(emptyKYC);
    else setKybForm(emptyKYB);
  };

  const cancelOnboarding = () => {
    setStep("select");
    setShowForm(false);
    setShowBuilder(null);
  };

  const saveFieldTemplate = async (formType: "kyc" | "kyb") => {
    setBuilderSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBuilderSaving(false); return; }

    const fields = formType === "kyc" ? kycCustomFields : kybCustomFields;
    const templateId = formType === "kyc" ? kycTemplateId : kybTemplateId;
    const dbFormType = formType === "kyc" ? "kyc_onboarding" : "kyb_onboarding";

    if (templateId) {
      await supabase.from("admin_form_templates").update({
        fields: fields as any,
        updated_at: new Date().toISOString(),
      }).eq("id", templateId);
    } else {
      const { data } = await supabase.from("admin_form_templates").insert({
        name: `${formType.toUpperCase()} Onboarding Template`,
        form_type: dbFormType,
        fields: fields as any,
        created_by: user.id,
        is_active: true,
      }).select("id").single();
      if (data) {
        if (formType === "kyc") setKycTemplateId(data.id);
        else setKybTemplateId(data.id);
      }
    }

    toast.success("Form template saved");
    setBuilderSaving(false);
    setShowBuilder(null);
  };

  // Render a dynamic custom field
  const renderCustomField = (field: CustomField) => {
    const value = customFieldValues[field.key] || "";
    const setValue = (v: string) => setCustomFieldValues(prev => ({ ...prev, [field.key]: v }));

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <FormField label={field.label} required={field.required} key={field.id}>
            <FormInput value={value} onChange={setValue} placeholder={field.placeholder} type={field.type} />
          </FormField>
        );
      case "textarea":
        return (
          <FormField label={field.label} required={field.required} key={field.id}>
            <Textarea value={value} onChange={e => setValue(e.target.value)} placeholder={field.placeholder}
              className="text-sm min-h-[60px]" />
          </FormField>
        );
      case "select":
        return (
          <FormField label={field.label} required={field.required} key={field.id}>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {(field.options || []).map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        );
      case "country":
        return (
          <FormField label={field.label} required={field.required} key={field.id}>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        );
      case "checkbox":
        return (
          <div key={field.id} className="flex items-center gap-2 col-span-3">
            <Checkbox checked={value === "true"} onCheckedChange={v => setValue(v ? "true" : "false")} id={field.key} />
            <label htmlFor={field.key} className="text-xs font-medium text-foreground cursor-pointer">
              {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  // Group custom fields by section
  const renderCustomFieldsSection = (fields: CustomField[]) => {
    if (fields.length === 0) return null;
    const sections = new Map<string, CustomField[]>();
    fields.forEach(f => {
      const sec = f.section || "Custom Fields";
      if (!sections.has(sec)) sections.set(sec, []);
      sections.get(sec)!.push(f);
    });

    return Array.from(sections.entries()).map(([section, sectionFields]) => (
      <div key={section} className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{section}</h3>
        <div className="grid grid-cols-3 gap-4">
          {sectionFields.map(f => renderCustomField(f))}
        </div>
      </div>
    ));
  };

  const submitKYC = async () => {
    if (!kycForm.firstName.trim() || !kycForm.lastName.trim()) {
      toast.error("First name and last name are required"); return;
    }
    if (!kycForm.regulator) {
      toast.error("Please select a reporting regulator"); return;
    }
    if (kycForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kycForm.email)) {
      toast.error("Invalid email address"); return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const fullName = `${kycForm.firstName.trim()} ${kycForm.lastName.trim()}`;
    const { error } = await supabase.from("suite_customers").insert({
      user_id: user.id,
      name: fullName,
      type: "individual",
      email: kycForm.email.trim() || null,
      country: kycForm.country || null,
      date_of_birth: kycForm.dateOfBirth || null,
      regulator: kycForm.regulator || null,
    });

    if (error) { toast.error(error.message); setSaving(false); return; }

    // Auto-provision regulatory baseline rules
    if (kycForm.regulator) {
      await provisionRegulatoryRules(user.id, kycForm.regulator, fullName);
    }

    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `KYC onboarding: ${fullName}`,
      entity_type: "customer",
      details: {
        type: "individual",
        regulator: kycForm.regulator,
        nationality: kycForm.nationality,
        country: kycForm.country,
        id_type: kycForm.idType,
        occupation: kycForm.occupation,
        pep: kycForm.pep,
        source_of_funds: kycForm.sourceOfFunds,
        ...(Object.keys(customFieldValues).length > 0 && { custom_fields: customFieldValues }),
      },
    });

    toast.success("Individual onboarded successfully");
    setSaving(false);
    cancelOnboarding();
    fetchCustomers();
  };

  const submitKYB = async () => {
    if (!kybForm.companyName.trim()) { toast.error("Company name is required"); return; }
    if (!kybForm.country) { toast.error("Country of incorporation is required"); return; }
    if (!kybForm.regulator) { toast.error("Please select a reporting regulator"); return; }
    if (kybForm.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kybForm.contactEmail)) {
      toast.error("Invalid contact email"); return;
    }

    // Validate UBO ownership totals
    const filledUbos = kybForm.ubos.filter(u => u.name.trim());
    const totalOwnership = filledUbos.reduce((sum, u) => sum + (parseFloat(u.ownershipPct) || 0), 0);
    if (totalOwnership > 100) {
      toast.error(`Total UBO ownership is ${totalOwnership}% — cannot exceed 100%`); return;
    }
    for (const u of filledUbos) {
      const pct = parseFloat(u.ownershipPct);
      if (isNaN(pct) || pct <= 0 || pct > 100) {
        toast.error(`UBO "${u.name}" has invalid ownership percentage`); return;
      }
    }

    // Validate directors
    const filledDirectors = kybForm.directors.filter(d => d.name.trim());

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { data: customer, error } = await supabase.from("suite_customers").insert({
      user_id: user.id,
      name: kybForm.companyName.trim(),
      type: "business",
      email: kybForm.contactEmail.trim() || null,
      country: kybForm.country || null,
      company_name: kybForm.companyName.trim(),
      registration_number: kybForm.registrationNumber.trim() || null,
      regulator: kybForm.regulator || null,
    }).select("id").single();

    if (error) { toast.error(error.message); setSaving(false); return; }

    // Add UBOs
    if (filledUbos.length > 0 && customer) {
      const uboInserts = filledUbos.map(u => ({
        user_id: user.id,
        customer_id: customer.id,
        name: u.name.trim(),
        nationality: u.nationality || null,
        ownership_pct: parseFloat(u.ownershipPct) || 0,
      }));
      await supabase.from("suite_ubo").insert(uboInserts);
    }

    // Auto-provision regulatory baseline rules
    if (kybForm.regulator) {
      await provisionRegulatoryRules(user.id, kybForm.regulator, kybForm.companyName);
    }

    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `KYB onboarding: ${kybForm.companyName}`,
      entity_type: "customer",
      details: {
        type: "business",
        regulator: kybForm.regulator,
        country: kybForm.country,
        legal_structure: kybForm.legalStructure,
        industry: kybForm.industry,
        registration_number: kybForm.registrationNumber,
        annual_turnover: kybForm.annualTurnover,
        directors: filledDirectors.map(d => ({ name: d.name, role: d.role, pep: d.pep })),
        ubos: filledUbos.map(u => ({ name: u.name, ownership_pct: u.ownershipPct, pep: u.pep })),
        ...(Object.keys(customFieldValues).length > 0 && { custom_fields: customFieldValues }),
      },
    });

    toast.success("Business onboarded successfully");
    setSaving(false);
    cancelOnboarding();
    fetchCustomers();
  };

  const filtered = customers.filter(c => {
    const matchStatus = filter === "All" || c.kyc_status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.company_name || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const statuses = ["All", "pending", "in_review", "verified", "rejected"];

  // KYC Form
  const renderKYCForm = () => (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={cancelOnboarding}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">KYC — Individual Onboarding</h2>
          <p className="text-xs text-muted-foreground">Collect personal identification and verification data</p>
        </div>
      </div>

      {/* Section: Personal Details */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Personal Details</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="First Name" required>
            <FormInput value={kycForm.firstName} onChange={v => setKycForm(f => ({ ...f, firstName: v }))} placeholder="John" />
          </FormField>
          <FormField label="Last Name" required>
            <FormInput value={kycForm.lastName} onChange={v => setKycForm(f => ({ ...f, lastName: v }))} placeholder="Smith" />
          </FormField>
          <FormField label="Email">
            <FormInput value={kycForm.email} onChange={v => setKycForm(f => ({ ...f, email: v }))} placeholder="john@example.com" type="email" />
          </FormField>
          <FormField label="Date of Birth">
            <FormInput value={kycForm.dateOfBirth} onChange={v => setKycForm(f => ({ ...f, dateOfBirth: v }))} type="date" />
          </FormField>
          <FormField label="Nationality">
            <Select value={kycForm.nationality} onValueChange={v => setKycForm(f => ({ ...f, nationality: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Occupation">
            <FormInput value={kycForm.occupation} onChange={v => setKycForm(f => ({ ...f, occupation: v }))} placeholder="Software Engineer" />
          </FormField>
        </div>
      </div>

      {/* Section: Address */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Residential Address</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <FormField label="Street Address">
              <FormInput value={kycForm.address} onChange={v => setKycForm(f => ({ ...f, address: v }))} placeholder="123 Main St" />
            </FormField>
          </div>
          <FormField label="City">
            <FormInput value={kycForm.city} onChange={v => setKycForm(f => ({ ...f, city: v }))} placeholder="Nicosia" />
          </FormField>
          <FormField label="Postal Code">
            <FormInput value={kycForm.postalCode} onChange={v => setKycForm(f => ({ ...f, postalCode: v }))} placeholder="1000" />
          </FormField>
          <FormField label="Country of Residence">
            <Select value={kycForm.country} onValueChange={v => setKycForm(f => ({ ...f, country: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Section: Identity */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Identity Document</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="ID Type">
            <Select value={kycForm.idType} onValueChange={v => setKycForm(f => ({ ...f, idType: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="national_id">National ID Card</SelectItem>
                <SelectItem value="driving_license">Driving License</SelectItem>
                <SelectItem value="residence_permit">Residence Permit</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="ID Number">
            <FormInput value={kycForm.idNumber} onChange={v => setKycForm(f => ({ ...f, idNumber: v }))} placeholder="AB1234567" />
          </FormField>
        </div>
      </div>

      {/* Section: Regulatory Jurisdiction */}
      <RegulatorPicker value={kycForm.regulator} onChange={v => setKycForm(f => ({ ...f, regulator: v }))} />

      {/* Section: Risk & Compliance */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Risk & Compliance</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Source of Funds">
            <Select value={kycForm.sourceOfFunds} onValueChange={v => setKycForm(f => ({ ...f, sourceOfFunds: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employment">Employment Income</SelectItem>
                <SelectItem value="business">Business Revenue</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="investment">Investment Returns</SelectItem>
                <SelectItem value="inheritance">Inheritance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Politically Exposed Person (PEP)">
            <Select value={kycForm.pep} onValueChange={v => setKycForm(f => ({ ...f, pep: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="rca">Related/Close Associate</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Custom fields */}
      {renderCustomFieldsSection(kycCustomFields)}

      <div className="flex justify-between items-center pt-2 border-t border-border">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => setShowBuilder("kyc")}>
          <Settings2 className="w-3.5 h-3.5 mr-1" /> Configure Fields
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={cancelOnboarding}>Cancel</Button>
          <Button size="sm" onClick={submitKYC} disabled={saving}>
            {saving ? "Saving…" : "Submit KYC Application"}
          </Button>
        </div>
      </div>
    </div>
  );

  // KYB Form
  const renderKYBForm = () => (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={cancelOnboarding}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">KYB — Business Onboarding</h2>
          <p className="text-xs text-muted-foreground">Collect corporate identification, structure, and UBO data</p>
        </div>
      </div>

      {/* Section: Company Details */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Company Details</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Company Legal Name" required>
            <FormInput value={kybForm.companyName} onChange={v => setKybForm(f => ({ ...f, companyName: v }))} placeholder="Acme Ltd" />
          </FormField>
          <FormField label="Registration Number">
            <FormInput value={kybForm.registrationNumber} onChange={v => setKybForm(f => ({ ...f, registrationNumber: v }))} placeholder="HE123456" />
          </FormField>
          <FormField label="Country of Incorporation" required>
            <Select value={kybForm.country} onValueChange={v => setKybForm(f => ({ ...f, country: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Date of Incorporation">
            <FormInput value={kybForm.incorporationDate} onChange={v => setKybForm(f => ({ ...f, incorporationDate: v }))} type="date" />
          </FormField>
          <FormField label="Legal Structure">
            <Select value={kybForm.legalStructure} onValueChange={v => setKybForm(f => ({ ...f, legalStructure: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="limited">Private Limited (Ltd)</SelectItem>
                <SelectItem value="plc">Public Limited (PLC)</SelectItem>
                <SelectItem value="llp">LLP / Partnership</SelectItem>
                <SelectItem value="sole_trader">Sole Proprietorship</SelectItem>
                <SelectItem value="trust">Trust</SelectItem>
                <SelectItem value="foundation">Foundation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Industry / Sector">
            <Select value={kybForm.industry} onValueChange={v => setKybForm(f => ({ ...f, industry: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="financial_services">Financial Services</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="real_estate">Real Estate</SelectItem>
                <SelectItem value="legal">Legal Services</SelectItem>
                <SelectItem value="gaming">Gaming & Gambling</SelectItem>
                <SelectItem value="crypto">Crypto / Digital Assets</SelectItem>
                <SelectItem value="retail">Retail & E-Commerce</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="energy">Energy & Mining</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Website">
            <FormInput value={kybForm.website} onChange={v => setKybForm(f => ({ ...f, website: v }))} placeholder="https://acme.com" />
          </FormField>
        </div>
      </div>

      {/* Section: Registered Address */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Registered Address</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <FormField label="Street Address">
              <FormInput value={kybForm.registeredAddress} onChange={v => setKybForm(f => ({ ...f, registeredAddress: v }))} placeholder="Business Park, Suite 100" />
            </FormField>
          </div>
          <FormField label="City">
            <FormInput value={kybForm.city} onChange={v => setKybForm(f => ({ ...f, city: v }))} placeholder="Limassol" />
          </FormField>
          <FormField label="Postal Code">
            <FormInput value={kybForm.postalCode} onChange={v => setKybForm(f => ({ ...f, postalCode: v }))} placeholder="3025" />
          </FormField>
        </div>
      </div>

      {/* Section: Primary Contact */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Primary Contact Person</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Full Name">
            <FormInput value={kybForm.contactName} onChange={v => setKybForm(f => ({ ...f, contactName: v }))} placeholder="Jane Doe" />
          </FormField>
          <FormField label="Email">
            <FormInput value={kybForm.contactEmail} onChange={v => setKybForm(f => ({ ...f, contactEmail: v }))} placeholder="jane@acme.com" type="email" />
          </FormField>
          <FormField label="Phone">
            <FormInput value={kybForm.contactPhone} onChange={v => setKybForm(f => ({ ...f, contactPhone: v }))} placeholder="+357 99 123456" />
          </FormField>
        </div>
      </div>

      {/* Section: Financial Info */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Financial Information</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Annual Turnover (€)">
            <Select value={kybForm.annualTurnover} onValueChange={v => setKybForm(f => ({ ...f, annualTurnover: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="<100k">&lt; €100,000</SelectItem>
                <SelectItem value="100k-500k">€100,000 – €500,000</SelectItem>
                <SelectItem value="500k-1m">€500,000 – €1,000,000</SelectItem>
                <SelectItem value="1m-5m">€1M – €5M</SelectItem>
                <SelectItem value="5m-25m">€5M – €25M</SelectItem>
                <SelectItem value=">25m">&gt; €25M</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Number of Employees">
            <Select value={kybForm.numberOfEmployees} onValueChange={v => setKybForm(f => ({ ...f, numberOfEmployees: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1–10</SelectItem>
                <SelectItem value="11-50">11–50</SelectItem>
                <SelectItem value="51-250">51–250</SelectItem>
                <SelectItem value="251-1000">251–1,000</SelectItem>
                <SelectItem value=">1000">&gt; 1,000</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Source of Funds">
            <Select value={kybForm.sourceOfFunds} onValueChange={v => setKybForm(f => ({ ...f, sourceOfFunds: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Business Revenue</SelectItem>
                <SelectItem value="investment">Investment / VC Funding</SelectItem>
                <SelectItem value="loan">Bank Loan / Credit</SelectItem>
                <SelectItem value="shareholder">Shareholder Capital</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Section: Regulatory Jurisdiction */}
      <RegulatorPicker value={kybForm.regulator} onChange={v => setKybForm(f => ({ ...f, regulator: v }))} />

      {/* Section: Directors */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Directors & Officers</h3>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setKybForm(f => ({ ...f, directors: [...f.directors, emptyDirector()] }))}>
            <Plus className="w-3 h-3 mr-1" /> Add Director
          </Button>
        </div>
        <div className="space-y-3">
          {kybForm.directors.map((dir, idx) => (
            <div key={dir.id} className="p-3 border border-border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground">Director {idx + 1}</span>
                {kybForm.directors.length > 1 && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => setKybForm(f => ({ ...f, directors: f.directors.filter(d => d.id !== dir.id) }))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Full Name" required>
                  <FormInput value={dir.name} onChange={v => setKybForm(f => ({ ...f, directors: f.directors.map(d => d.id === dir.id ? { ...d, name: v } : d) }))} placeholder="Jane Smith" />
                </FormField>
                <FormField label="Nationality">
                  <Select value={dir.nationality} onValueChange={v => setKybForm(f => ({ ...f, directors: f.directors.map(d => d.id === dir.id ? { ...d, nationality: v } : d) }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Role">
                  <Select value={dir.role} onValueChange={v => setKybForm(f => ({ ...f, directors: f.directors.map(d => d.id === dir.id ? { ...d, role: v } : d) }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="managing_director">Managing Director</SelectItem>
                      <SelectItem value="chairman">Chairman</SelectItem>
                      <SelectItem value="secretary">Company Secretary</SelectItem>
                      <SelectItem value="ceo">CEO</SelectItem>
                      <SelectItem value="cfo">CFO</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Date of Birth">
                  <FormInput value={dir.dateOfBirth} onChange={v => setKybForm(f => ({ ...f, directors: f.directors.map(d => d.id === dir.id ? { ...d, dateOfBirth: v } : d) }))} type="date" />
                </FormField>
                <FormField label="PEP Status">
                  <Select value={dir.pep} onValueChange={v => setKybForm(f => ({ ...f, directors: f.directors.map(d => d.id === dir.id ? { ...d, pep: v } : d) }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="rca">Related/Close Associate</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: UBOs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ultimate Beneficial Owners (UBO)</h3>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setKybForm(f => ({ ...f, ubos: [...f.ubos, emptyUBO()] }))}>
            <Plus className="w-3 h-3 mr-1" /> Add UBO
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Any individual holding ≥ 25% ownership or exercising significant control</p>
        {(() => {
          const totalPct = kybForm.ubos.reduce((sum, u) => sum + (parseFloat(u.ownershipPct) || 0), 0);
          return (
            <>
              {totalPct > 0 && (
                <div className={cn("text-xs font-medium mb-3 px-3 py-1.5 rounded-lg border", totalPct > 100 ? "bg-destructive/10 text-destructive border-destructive/30" : totalPct === 100 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                  Total ownership: {totalPct.toFixed(1)}%{totalPct > 100 ? " — exceeds 100%" : totalPct < 100 ? ` — ${(100 - totalPct).toFixed(1)}% unaccounted` : " ✓"}
                </div>
              )}
              <div className="space-y-3">
                {kybForm.ubos.map((ubo, idx) => (
                  <div key={ubo.id} className="p-3 border border-border rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-muted-foreground">UBO {idx + 1}</span>
                      {kybForm.ubos.length > 1 && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => setKybForm(f => ({ ...f, ubos: f.ubos.filter(u => u.id !== ubo.id) }))}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <FormField label="Full Name" required>
                        <FormInput value={ubo.name} onChange={v => setKybForm(f => ({ ...f, ubos: f.ubos.map(u => u.id === ubo.id ? { ...u, name: v } : u) }))} placeholder="John Doe" />
                      </FormField>
                      <FormField label="Nationality">
                        <Select value={ubo.nationality} onValueChange={v => setKybForm(f => ({ ...f, ubos: f.ubos.map(u => u.id === ubo.id ? { ...u, nationality: v } : u) }))}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Ownership %" required>
                        <FormInput value={ubo.ownershipPct} onChange={v => setKybForm(f => ({ ...f, ubos: f.ubos.map(u => u.id === ubo.id ? { ...u, ownershipPct: v } : u) }))} placeholder="51" type="number" />
                      </FormField>
                      <FormField label="Date of Birth">
                        <FormInput value={ubo.dateOfBirth} onChange={v => setKybForm(f => ({ ...f, ubos: f.ubos.map(u => u.id === ubo.id ? { ...u, dateOfBirth: v } : u) }))} type="date" />
                      </FormField>
                      <FormField label="PEP Status">
                        <Select value={ubo.pep} onValueChange={v => setKybForm(f => ({ ...f, ubos: f.ubos.map(u => u.id === ubo.id ? { ...u, pep: v } : u) }))}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="rca">Related/Close Associate</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>

      {/* Custom fields */}
      {renderCustomFieldsSection(kybCustomFields)}

      <div className="flex justify-between items-center pt-2 border-t border-border">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => setShowBuilder("kyb")}>
          <Settings2 className="w-3.5 h-3.5 mr-1" /> Configure Fields
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={cancelOnboarding}>Cancel</Button>
          <Button size="sm" onClick={submitKYB} disabled={saving}>
            {saving ? "Saving…" : "Submit KYB Application"}
          </Button>
        </div>
      </div>
    </div>
  );

  // Type selector
  const renderTypeSelector = () => (
    <div className="grid grid-cols-2 gap-4">
      <button onClick={() => startOnboarding("kyc-form")}
        className="group bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 hover:shadow-md transition-all">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <User className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">KYC — Individual</h3>
        <p className="text-xs text-muted-foreground mb-3">Onboard a natural person with identity verification, address, and risk screening fields.</p>
        <div className="flex items-center gap-1 text-xs font-medium text-primary">
          Start KYC <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </button>
      <button onClick={() => startOnboarding("kyb-form")}
        className="group bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 hover:shadow-md transition-all">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">KYB — Business</h3>
        <p className="text-xs text-muted-foreground mb-3">Onboard a legal entity with company registration, structure, UBO, and financial data.</p>
        <div className="flex items-center gap-1 text-xs font-medium text-primary">
          Start KYB <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Client Onboarding</h1>
          <p className="text-xs text-muted-foreground mt-0.5">KYC/KYB pipeline · {customers.length} records</p>
        </div>
        {!showForm && step === "select" && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Customer
          </Button>
        )}
      </div>

      {/* Form builder */}
      {showBuilder === "kyc" && (
        <FormFieldBuilder
          fields={kycCustomFields}
          onChange={setKycCustomFields}
          onClose={() => setShowBuilder(null)}
          onSave={() => saveFieldTemplate("kyc")}
          saving={builderSaving}
          formType="kyc"
        />
      )}
      {showBuilder === "kyb" && (
        <FormFieldBuilder
          fields={kybCustomFields}
          onChange={setKybCustomFields}
          onClose={() => setShowBuilder(null)}
          onSave={() => saveFieldTemplate("kyb")}
          saving={builderSaving}
          formType="kyb"
        />
      )}

      {/* New customer flow */}
      {!showBuilder && showForm && step === "select" && renderTypeSelector()}
      {!showBuilder && step === "kyc-form" && renderKYCForm()}
      {!showBuilder && step === "kyb-form" && renderKYBForm()}

      {/* Customer detail panel */}
      {selectedCustomer && <CustomerDetailPanel
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onUpdated={(updated) => {
          setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
          setSelectedCustomer(updated);
        }}
      />}

      {/* Stats & table (only when not in form mode) */}
      {!showForm && step === "select" && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: "Total", value: customers.length, color: "text-foreground" },
              { label: "Pending", value: customers.filter(c => c.kyc_status === "pending").length, color: "text-amber-600" },
              { label: "In Review", value: customers.filter(c => c.kyc_status === "in_review").length, color: "text-blue-600" },
              { label: "Verified", value: customers.filter(c => c.kyc_status === "verified").length, color: "text-emerald-600" },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
                <div className="text-xs font-medium text-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
                className="w-full pl-8 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {statuses.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={cn("text-[10px] px-2.5 py-1 rounded-full font-medium border transition-colors capitalize",
                    filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50"
                  )}>{s === "All" ? "All" : kycStatusLabel[s] || s}</button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No customers yet. Click "New Customer" to add one.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Customer", "Type", "Regulator", "Country", "Risk", "KYC Status", "Started", ""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {c.type === "individual" ? <User className="w-3 h-3 text-primary" /> : <Building2 className="w-3 h-3 text-primary" />}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-foreground">{c.name}</div>
                            {c.email && <div className="text-[10px] text-muted-foreground">{c.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{c.type}</td>
                      <td className="px-4 py-3">
                        {c.regulator ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                            {REGULATORY_PROFILES[c.regulator]?.shortName || c.regulator}
                          </span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.country || "—"}</td>
                      <td className="px-4 py-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize", riskBadge(c.risk_level))}>{c.risk_level}</span></td>
                      <td className="px-4 py-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold", statusColor(c.kyc_status))}>{kycStatusLabel[c.kyc_status] || c.kyc_status}</span></td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{new Date(c.created_at).toLocaleDateString("en-GB")}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={e => { e.stopPropagation(); setSelectedCustomer(c); }}>
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
