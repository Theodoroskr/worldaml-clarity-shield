import { useState, useEffect } from "react";
import { User, Building2, Plus, ChevronRight, ArrowLeft, Search, Eye, Pencil, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

const emptyKYC: KYCForm = {
  firstName: "", lastName: "", email: "", dateOfBirth: "", nationality: "", country: "",
  address: "", city: "", postalCode: "", idType: "passport", idNumber: "",
  occupation: "", sourceOfFunds: "", pep: "no",
};

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
  uboName: string;
  uboNationality: string;
  uboOwnership: string;
}

const emptyKYB: KYBForm = {
  companyName: "", registrationNumber: "", country: "", incorporationDate: "",
  legalStructure: "limited", industry: "", website: "", registeredAddress: "",
  city: "", postalCode: "", contactName: "", contactEmail: "", contactPhone: "",
  annualTurnover: "", numberOfEmployees: "", sourceOfFunds: "",
  uboName: "", uboNationality: "", uboOwnership: "",
};

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

  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("suite_customers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCustomers((data || []) as Customer[]);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const startOnboarding = (type: "kyc-form" | "kyb-form") => {
    setStep(type);
    if (type === "kyc-form") setKycForm(emptyKYC);
    else setKybForm(emptyKYB);
  };

  const cancelOnboarding = () => {
    setStep("select");
    setShowForm(false);
  };

  const submitKYC = async () => {
    if (!kycForm.firstName.trim() || !kycForm.lastName.trim()) {
      toast.error("First name and last name are required"); return;
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
    });

    if (error) { toast.error(error.message); setSaving(false); return; }

    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `KYC onboarding: ${fullName}`,
      entity_type: "customer",
      details: {
        type: "individual",
        nationality: kycForm.nationality,
        country: kycForm.country,
        id_type: kycForm.idType,
        occupation: kycForm.occupation,
        pep: kycForm.pep,
        source_of_funds: kycForm.sourceOfFunds,
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
    if (kybForm.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kybForm.contactEmail)) {
      toast.error("Invalid contact email"); return;
    }
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
    }).select("id").single();

    if (error) { toast.error(error.message); setSaving(false); return; }

    // Add UBO if provided
    if (kybForm.uboName.trim() && customer) {
      await supabase.from("suite_ubo").insert({
        user_id: user.id,
        customer_id: customer.id,
        name: kybForm.uboName.trim(),
        nationality: kybForm.uboNationality || null,
        ownership_pct: parseFloat(kybForm.uboOwnership) || 0,
      });
    }

    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `KYB onboarding: ${kybForm.companyName}`,
      entity_type: "customer",
      details: {
        type: "business",
        country: kybForm.country,
        legal_structure: kybForm.legalStructure,
        industry: kybForm.industry,
        registration_number: kybForm.registrationNumber,
        annual_turnover: kybForm.annualTurnover,
        ubo_provided: !!kybForm.uboName.trim(),
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

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="outline" size="sm" onClick={cancelOnboarding}>Cancel</Button>
        <Button size="sm" onClick={submitKYC} disabled={saving}>
          {saving ? "Saving…" : "Submit KYC Application"}
        </Button>
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

      {/* Section: UBO */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ultimate Beneficial Owner (UBO)</h3>
        <p className="text-xs text-muted-foreground mb-3">Any individual holding ≥ 25% ownership or exercising significant control</p>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Full Name">
            <FormInput value={kybForm.uboName} onChange={v => setKybForm(f => ({ ...f, uboName: v }))} placeholder="John Doe" />
          </FormField>
          <FormField label="Nationality">
            <Select value={kybForm.uboNationality} onValueChange={v => setKybForm(f => ({ ...f, uboNationality: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Ownership %">
            <FormInput value={kybForm.uboOwnership} onChange={v => setKybForm(f => ({ ...f, uboOwnership: v }))} placeholder="51" type="number" />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="outline" size="sm" onClick={cancelOnboarding}>Cancel</Button>
        <Button size="sm" onClick={submitKYB} disabled={saving}>
          {saving ? "Saving…" : "Submit KYB Application"}
        </Button>
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

      {/* New customer flow */}
      {showForm && step === "select" && renderTypeSelector()}
      {step === "kyc-form" && renderKYCForm()}
      {step === "kyb-form" && renderKYBForm()}

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
                    {["Customer", "Type", "Country", "Risk", "KYC Status", "Started", ""].map(h => (
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
