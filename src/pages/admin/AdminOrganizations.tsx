import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, Users, Search, ChevronRight, ChevronLeft, Check, Loader2, Eye, Trash2 } from "lucide-react";

const REGULATORS = [
  { value: "fintrac", label: "FINTRAC (Canada)", legislation: "PCMLTFA", reports: ["STR", "LCTR", "EFTR"] },
  { value: "fincen", label: "FinCEN (USA)", legislation: "BSA / USA PATRIOT Act", reports: ["SAR", "CTR"] },
  { value: "fca", label: "FCA (UK)", legislation: "POCA / MLR 2017", reports: ["SAR"] },
  { value: "eu_amld", label: "EU AMLD", legislation: "6th Anti-Money Laundering Directive", reports: ["STR"] },
  { value: "cysec", label: "CySEC (Cyprus)", legislation: "AML Law L.188(I)/2007", reports: ["STR"] },
  { value: "icpac", label: "ICPAC (Cyprus)", legislation: "AML Law L.188(I)/2007", reports: ["STR"] },
  { value: "cba_cyprus", label: "Cyprus Bar Association", legislation: "AML Law L.188(I)/2007", reports: ["STR"] },
];

const INDUSTRIES = [
  "Banking", "Fintech", "Insurance", "Legal", "Accounting", "Real Estate",
  "Gaming", "Crypto / Digital Assets", "Payments", "Wealth Management", "Other",
];

const TIERS = [
  { value: "suite", label: "Suite", maxUsers: 5, maxScreenings: 500, maxApi: 1000 },
  { value: "enterprise", label: "Enterprise", maxUsers: 50, maxScreenings: 5000, maxApi: 10000 },
];

const ORG_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "mlro", label: "MLRO" },
  { value: "compliance_officer", label: "Compliance Officer" },
  { value: "analyst", label: "Analyst" },
  { value: "viewer", label: "Viewer" },
];

interface OrgForm {
  name: string;
  registration_number: string;
  country: string;
  industry: string;
  website: string;
  address: string;
  regulator: string;
  subscription_tier: string;
  max_users: number;
  max_screenings_per_month: number;
  max_api_requests_per_day: number;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  members: { email: string; role: string }[];
}

const emptyForm: OrgForm = {
  name: "", registration_number: "", country: "", industry: "", website: "", address: "",
  regulator: "", subscription_tier: "suite", max_users: 5, max_screenings_per_month: 500,
  max_api_requests_per_day: 1000, primary_contact_name: "", primary_contact_email: "",
  primary_contact_phone: "", members: [{ email: "", role: "admin" }],
};

interface Org {
  id: string;
  name: string;
  regulator: string | null;
  subscription_tier: string;
  status: string;
  industry: string | null;
  country: string | null;
  primary_contact_email: string | null;
  created_at: string;
  max_users: number;
}

export default function AdminOrganizations() {
  const { toast } = useToast();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OrgForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [detailOrg, setDetailOrg] = useState<Org | null>(null);
  const [orgMembers, setOrgMembers] = useState<any[]>([]);

  const fetchOrgs = async () => {
    setLoading(true);
    const { data } = await supabase.from("suite_organizations").select("*").order("created_at", { ascending: false });
    setOrgs((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrgs(); }, []);

  const updateField = <K extends keyof OrgForm>(key: K, val: OrgForm[K]) => setForm(f => ({ ...f, [key]: val }));

  const handleTierChange = (tier: string) => {
    const t = TIERS.find(t => t.value === tier);
    if (t) updateField("subscription_tier", tier);
    if (t) {
      setForm(f => ({ ...f, subscription_tier: tier, max_users: t.maxUsers, max_screenings_per_month: t.maxScreenings, max_api_requests_per_day: t.maxApi }));
    }
  };

  const addMember = () => setForm(f => ({ ...f, members: [...f.members, { email: "", role: "analyst" }] }));
  const removeMember = (i: number) => setForm(f => ({ ...f, members: f.members.filter((_, idx) => idx !== i) }));
  const updateMember = (i: number, key: string, val: string) => setForm(f => ({
    ...f, members: f.members.map((m, idx) => idx === i ? { ...m, [key]: val } : m),
  }));

  const submit = async () => {
    if (!form.name || !form.regulator) {
      toast({ title: "Missing fields", description: "Company name and regulator are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: org, error } = await supabase.from("suite_organizations").insert({
      name: form.name,
      registration_number: form.registration_number || null,
      country: form.country || null,
      industry: form.industry || null,
      website: form.website || null,
      address: form.address || null,
      regulator: form.regulator,
      subscription_tier: form.subscription_tier,
      max_users: form.max_users,
      max_screenings_per_month: form.max_screenings_per_month,
      max_api_requests_per_day: form.max_api_requests_per_day,
      primary_contact_name: form.primary_contact_name || null,
      primary_contact_email: form.primary_contact_email || null,
      primary_contact_phone: form.primary_contact_phone || null,
    } as any).select().single();

    if (error || !org) {
      toast({ title: "Error creating organization", description: error?.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // Add members — look up user_id by email from profiles
    const validMembers = form.members.filter(m => m.email.trim());
    for (const member of validMembers) {
      const { data: profile } = await supabase.from("profiles").select("user_id").eq("email", member.email.trim()).single();
      if (profile) {
        await supabase.from("suite_org_members").insert({
          organization_id: (org as any).id,
          user_id: profile.user_id,
          role: member.role,
          invited_email: member.email.trim(),
          joined_at: new Date().toISOString(),
        } as any);
        // Also grant suite access
        await supabase.rpc("admin_grant_suite_access", {
          target_email: member.email.trim(),
          target_regulator: form.regulator,
        });
      } else {
        // Store as invited (no user_id yet) — we'll use a placeholder approach
        // For now just track the invitation
        toast({ title: `User not found: ${member.email}`, description: "They'll need to sign up first.", variant: "default" });
      }
    }

    toast({ title: "Organization created", description: `${form.name} onboarded successfully.` });
    setWizardOpen(false);
    setForm({ ...emptyForm });
    setStep(0);
    setSaving(false);
    fetchOrgs();
  };

  const viewOrg = async (org: Org) => {
    setDetailOrg(org);
    const { data } = await supabase.from("suite_org_members").select("*").eq("organization_id", org.id);
    setOrgMembers((data as any[]) ?? []);
  };

  const deleteOrg = async (orgId: string) => {
    await supabase.from("suite_organizations").delete().eq("id", orgId);
    toast({ title: "Organization deleted" });
    setDetailOrg(null);
    fetchOrgs();
  };

  const filtered = orgs.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
  const reg = REGULATORS.find(r => r.value === form.regulator);

  const steps = ["Company Details", "Regulator & Obligations", "License & Tier", "Users & Roles"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
          <p className="text-sm text-muted-foreground">Manage company-level Suite customers</p>
        </div>
        <Dialog open={wizardOpen} onOpenChange={o => { setWizardOpen(o); if (!o) { setStep(0); setForm({ ...emptyForm }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Onboard Organization</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Onboard New Organization</DialogTitle>
            </DialogHeader>

            {/* Stepper */}
            <div className="flex items-center gap-1 mb-6">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-1 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:inline ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && <div className="flex-1 h-px bg-border mx-1" />}
                </div>
              ))}
            </div>

            {/* Step 1: Company Details */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="Acme Financial Ltd" />
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Number</Label>
                    <Input value={form.registration_number} onChange={e => updateField("registration_number", e.target.value)} placeholder="HE123456" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={form.country} onChange={e => updateField("country", e.target.value)} placeholder="Cyprus" />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={form.industry} onValueChange={v => updateField("industry", v)}>
                      <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={form.website} onChange={e => updateField("website", e.target.value)} placeholder="https://acme.com" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={form.address} onChange={e => updateField("address", e.target.value)} placeholder="Full company address" rows={2} />
                </div>
              </div>
            )}

            {/* Step 2: Regulator & Obligations */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Regulator *</Label>
                  <Select value={form.regulator} onValueChange={v => updateField("regulator", v)}>
                    <SelectTrigger><SelectValue placeholder="Select regulator" /></SelectTrigger>
                    <SelectContent>{REGULATORS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {reg && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Applicable Legislation</p>
                        <p className="text-sm font-medium">{reg.legislation}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Reporting Obligations</p>
                        <div className="flex gap-1.5 mt-1">{reg.reports.map(r => <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>)}</div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Auto-configured on creation</p>
                        <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <li>• Baseline alert rules for {reg.label}</li>
                          <li>• Risk scoring weights per jurisdiction</li>
                          <li>• Reporting templates ({reg.reports.join(", ")})</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: License & Tier */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subscription Tier</Label>
                  <Select value={form.subscription_tier} onValueChange={handleTierChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Max Users</Label>
                    <Input type="number" value={form.max_users} onChange={e => updateField("max_users", parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Screenings / Month</Label>
                    <Input type="number" value={form.max_screenings_per_month} onChange={e => updateField("max_screenings_per_month", parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>API Requests / Day</Label>
                    <Input type="number" value={form.max_api_requests_per_day} onChange={e => updateField("max_api_requests_per_day", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Users & Roles */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Contact Name</Label>
                    <Input value={form.primary_contact_name} onChange={e => updateField("primary_contact_name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Contact Email</Label>
                    <Input value={form.primary_contact_email} onChange={e => updateField("primary_contact_email", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Primary Contact Phone</Label>
                  <Input value={form.primary_contact_phone} onChange={e => updateField("primary_contact_phone", e.target.value)} />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label>Organization Members</Label>
                    <Button variant="outline" size="sm" onClick={addMember}><Plus className="w-3 h-3 mr-1" /> Add Member</Button>
                  </div>
                  <div className="space-y-2">
                    {form.members.map((m, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Input className="flex-1" placeholder="user@company.com" value={m.email} onChange={e => updateMember(i, "email", e.target.value)} />
                        <Select value={m.role} onValueChange={v => updateMember(i, "role", v)}>
                          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                          <SelectContent>{ORG_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                        </Select>
                        {form.members.length > 1 && (
                          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeMember(i)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(s => s + 1)}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Create Organization
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search organizations…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Regulator</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No organizations yet</TableCell></TableRow>
              ) : filtered.map(org => (
                <TableRow key={org.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewOrg(org)}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{REGULATORS.find(r => r.value === org.regulator)?.label ?? org.regulator ?? "—"}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs capitalize">{org.subscription_tier}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{org.industry ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{org.country ?? "—"}</TableCell>
                  <TableCell><Badge variant={org.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{org.status}</Badge></TableCell>
                  <TableCell><Eye className="w-4 h-4 text-muted-foreground" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailOrg} onOpenChange={o => { if (!o) setDetailOrg(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />{detailOrg?.name}</DialogTitle>
          </DialogHeader>
          {detailOrg && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Regulator:</span> <span className="font-medium">{REGULATORS.find(r => r.value === detailOrg.regulator)?.label ?? detailOrg.regulator}</span></div>
                <div><span className="text-muted-foreground">Tier:</span> <Badge variant="secondary" className="capitalize">{detailOrg.subscription_tier}</Badge></div>
                <div><span className="text-muted-foreground">Country:</span> {detailOrg.country ?? "—"}</div>
                <div><span className="text-muted-foreground">Industry:</span> {detailOrg.industry ?? "—"}</div>
                <div><span className="text-muted-foreground">Contact:</span> {detailOrg.primary_contact_email ?? "—"}</div>
                <div><span className="text-muted-foreground">Max Users:</span> {detailOrg.max_users}</div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><Users className="w-4 h-4" /> Members ({orgMembers.length})</h4>
                {orgMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No members assigned</p>
                ) : (
                  <div className="space-y-1">
                    {orgMembers.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between text-sm py-1">
                        <span>{m.invited_email ?? m.user_id}</span>
                        <Badge variant="outline" className="text-xs capitalize">{m.role?.replace("_", " ")}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="destructive" size="sm" onClick={() => deleteOrg(detailOrg.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
