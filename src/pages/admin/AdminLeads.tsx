import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Inbox, Filter } from "lucide-react";
import { toast } from "sonner";

interface LeadRow {
  id: string;
  form_type: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  job_title: string | null;
  products: string[] | null;
  country: string | null;
  industry: string | null;
  region: string | null;
  message: string | null;
  lead_status: string;
  created_at: string;
}

const LEAD_STATUSES = ["new", "contacted", "qualified", "closed"] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

const FORM_TYPE_LABELS: Record<string, string> = {
  all: "All Types",
  "contact-sales": "Contact Sales",
  "free-trial": "Free Trial",
  demo: "Demo Request",
  "get-started": "Get Started",
  "world-compliance-demo": "WorldCompliance Demo",
};

const leadStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 border-blue-200",
    contacted: "bg-amber-100 text-amber-800 border-amber-200",
    qualified: "bg-purple-100 text-purple-800 border-purple-200",
    closed: "bg-green-100 text-green-800 border-green-200",
  };
  return <Badge className={map[status] || "bg-gray-100 text-gray-800 border-gray-200"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTypeFilter, setFormTypeFilter] = useState("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingLead, setUpdatingLead] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("form_submissions").select("*").order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load leads"); console.error(error); }
    else setLeads((data as LeadRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingLead(leadId);
    const { error } = await supabase.from("form_submissions").update({ lead_status: newStatus } as any).eq("id", leadId);
    if (error) { toast.error("Failed to update lead status"); }
    else { toast.success("Lead status updated"); setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, lead_status: newStatus } : l))); }
    setUpdatingLead(null);
  };

  const filteredLeads = leads.filter((l) => {
    const matchType = formTypeFilter === "all" || l.form_type === formTypeFilter;
    const matchStatus = leadStatusFilter === "all" || l.lead_status === leadStatusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.company || "").toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  const formTypes = ["all", ...Array.from(new Set(leads.map((l) => l.form_type)))];
  const newLeads = leads.filter((l) => l.lead_status === "new");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads & CRM</h1>
        <p className="text-sm text-muted-foreground mt-1">Form submissions and lead management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Inbox className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{leads.length}</p>
              <p className="text-muted-foreground text-xs">Total Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Filter className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{newLeads.length}</p>
              <p className="text-muted-foreground text-xs">New Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Search className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{filteredLeads.length}</p>
              <p className="text-muted-foreground text-xs">Filtered Results</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Form type" /></SelectTrigger>
          <SelectContent>
            {formTypes.map((ft) => (<SelectItem key={ft} value={ft}>{FORM_TYPE_LABELS[ft] || ft}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filteredLeads.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No leads match your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left bg-muted/30">
                    <th className="p-3 font-semibold text-foreground">Name</th>
                    <th className="p-3 font-semibold text-foreground">Email</th>
                    <th className="p-3 font-semibold text-foreground">Company</th>
                    <th className="p-3 font-semibold text-foreground">Type</th>
                    <th className="p-3 font-semibold text-foreground">Products</th>
                    <th className="p-3 font-semibold text-foreground">Region</th>
                    <th className="p-3 font-semibold text-foreground">Date</th>
                    <th className="p-3 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((l) => (
                    <tr key={l.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium text-foreground">
                        {l.first_name} {l.last_name}
                        {l.job_title && <span className="block text-xs text-muted-foreground">{l.job_title}</span>}
                      </td>
                      <td className="p-3 text-muted-foreground">{l.email}</td>
                      <td className="p-3 text-muted-foreground">{l.company || "—"}</td>
                      <td className="p-3"><Badge variant="outline" className="text-xs">{FORM_TYPE_LABELS[l.form_type] || l.form_type}</Badge></td>
                      <td className="p-3 text-muted-foreground text-xs">{l.products?.join(", ") || "—"}</td>
                      <td className="p-3 text-muted-foreground text-xs">{l.region || l.country || "—"}</td>
                      <td className="p-3 text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="p-3">
                        <Select value={l.lead_status} onValueChange={(val) => updateLeadStatus(l.id, val as LeadStatus)} disabled={updatingLead === l.id}>
                          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {LEAD_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
