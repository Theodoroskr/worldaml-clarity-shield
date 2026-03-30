import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle, Clock, Users, ShieldAlert, Inbox, Search, Filter, Handshake, Globe, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileRow {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  status: string;
  created_at: string;
}

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
type LeadStatus = typeof LEAD_STATUSES[number];

const leadStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 border-blue-200",
    contacted: "bg-amber-100 text-amber-800 border-amber-200",
    qualified: "bg-purple-100 text-purple-800 border-purple-200",
    closed: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <Badge className={map[status] || "bg-gray-100 text-gray-800 border-gray-200"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const profileStatusBadge = (status: string) => {
  if (status === "approved") return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
  if (status === "rejected") return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
  return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
};

const FORM_TYPE_LABELS: Record<string, string> = {
  all: "All Types",
  "contact-sales": "Contact Sales",
  "free-trial": "Free Trial",
  demo: "Demo Request",
  "get-started": "Get Started",
  "world-compliance-demo": "WorldCompliance Demo",
};

const Admin = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Users state
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Leads state
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [formTypeFilter, setFormTypeFilter] = useState("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingLead, setUpdatingLead] = useState<string | null>(null);

  // Partners state
  const [partnerApps, setPartnerApps] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [partnerActionLoading, setPartnerActionLoading] = useState<string | null>(null);

  // Trusted domains state
  const [trustedDomains, setTrustedDomains] = useState<{ id: string; domain: string; created_at: string }[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
    if (!isLoading && !isAdmin) navigate("/dashboard");
  }, [user, isLoading, isAdmin, navigate]);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load users"); console.error(error); }
    else setProfiles((data as ProfileRow[]) || []);
    setLoadingProfiles(false);
  };

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    const { data, error } = await supabase
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load leads"); console.error(error); }
    else setLeads((data as LeadRow[]) || []);
    setLoadingLeads(false);
  }, []);

  const fetchPartnerData = useCallback(async () => {
    setLoadingPartners(true);
    const [{ data: apps }, { data: pts }] = await Promise.all([
      supabase.from("partner_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("partners").select("*").order("created_at", { ascending: false }),
    ]);
    setPartnerApps((apps as any[]) || []);
    setPartners((pts as any[]) || []);
    setLoadingPartners(false);
  }, []);

  useEffect(() => {
    if (isAdmin) { fetchProfiles(); fetchLeads(); fetchPartnerData(); }
  }, [isAdmin, fetchLeads, fetchPartnerData]);

  const updateProfileStatus = async (profileId: string, newStatus: "approved" | "rejected") => {
    setActionLoading(profileId);
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", profileId);
    if (error) { toast.error(`Failed to update user`); console.error(error); }
    else {
      toast.success(`User ${newStatus}`);
      setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, status: newStatus } : p)));
    }
    setActionLoading(null);
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingLead(leadId);
    const { error } = await supabase
      .from("form_submissions")
      .update({ lead_status: newStatus } as any)
      .eq("id", leadId);
    if (error) { toast.error("Failed to update lead status"); console.error(error); }
    else {
      toast.success("Lead status updated");
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, lead_status: newStatus } : l)));
    }
    setUpdatingLead(null);
  };

  const approvePartnerApp = async (app: any) => {
    setPartnerActionLoading(app.id);
    // Update application status
    const { error: updateErr } = await supabase
      .from("partner_applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any)
      .eq("id", app.id);
    if (updateErr) { toast.error("Failed to approve"); setPartnerActionLoading(null); return; }

    // Create partner record
    const { error: insertErr } = await supabase.from("partners").insert({
      user_id: app.user_id,
      partner_type: app.partner_type,
    } as any);
    if (insertErr) { toast.error("Failed to create partner record"); console.error(insertErr); }
    else { toast.success("Partner approved!"); fetchPartnerData(); }
    setPartnerActionLoading(null);
  };

  const rejectPartnerApp = async (appId: string) => {
    setPartnerActionLoading(appId);
    const { error } = await supabase
      .from("partner_applications")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any)
      .eq("id", appId);
    if (error) { toast.error("Failed to reject"); }
    else { toast.success("Application rejected"); fetchPartnerData(); }
    setPartnerActionLoading(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }
  if (!isAdmin) return null;

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    const matchType = formTypeFilter === "all" || l.form_type === formTypeFilter;
    const matchStatus = leadStatusFilter === "all" || l.lead_status === leadStatusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company || "").toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  // Unique form types from data
  const formTypes = ["all", ...Array.from(new Set(leads.map((l) => l.form_type)))];

  const pending = profiles.filter((p) => p.status === "pending");
  const approved = profiles.filter((p) => p.status === "approved");
  const rejected = profiles.filter((p) => p.status === "rejected");

  const newLeads = leads.filter((l) => l.lead_status === "new");

  const UserTable = ({ rows }: { rows: ProfileRow[] }) =>
    rows.length === 0 ? (
      <p className="text-text-secondary text-sm py-8 text-center">No users in this category.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider text-left">
              <th className="pb-3 pr-4 font-semibold text-navy">Name</th>
              <th className="pb-3 pr-4 font-semibold text-navy">Email</th>
              <th className="pb-3 pr-4 font-semibold text-navy">Company</th>
              <th className="pb-3 pr-4 font-semibold text-navy">Registered</th>
              <th className="pb-3 pr-4 font-semibold text-navy">Status</th>
              <th className="pb-3 font-semibold text-navy">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-divider/50 hover:bg-surface-subtle transition-colors">
                <td className="py-3 pr-4 font-medium text-navy">{p.full_name || "—"}</td>
                <td className="py-3 pr-4 text-text-secondary">{p.email || "—"}</td>
                <td className="py-3 pr-4 text-text-secondary">{p.company_name || "—"}</td>
                <td className="py-3 pr-4 text-text-secondary">
                  {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="py-3 pr-4">{profileStatusBadge(p.status)}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    {p.status !== "approved" && (
                      <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50"
                        disabled={actionLoading === p.id} onClick={() => updateProfileStatus(p.id, "approved")}>
                        {actionLoading === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                        Approve
                      </Button>
                    )}
                    {p.status !== "rejected" && (
                      <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50"
                        disabled={actionLoading === p.id} onClick={() => updateProfileStatus(p.id, "rejected")}>
                        {actionLoading === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                        Reject
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Admin — Lead & User Management" description="WorldAML admin panel." noindex />
      <Header />
      <main className="flex-1 py-12">
        <div className="container-enterprise">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/10 text-navy">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy">Admin Panel</h1>
              <p className="text-text-secondary">Lead management &amp; user approvals</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Inbox className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-navy">{leads.length}</p>
                  <p className="text-text-secondary text-sm">Total Leads</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Filter className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-navy">{newLeads.length}</p>
                  <p className="text-text-secondary text-sm">New Leads</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-navy">{pending.length}</p>
                  <p className="text-text-secondary text-sm">Pending Users</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Users className="h-5 w-5 text-teal" />
                <div>
                  <p className="text-2xl font-bold text-navy">{profiles.length}</p>
                  <p className="text-text-secondary text-sm">Total Users</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="leads">
            <TabsList className="mb-6">
              <TabsTrigger value="leads">
                Leads{" "}
                {newLeads.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {newLeads.length} new
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="users">
                Users{" "}
                {pending.length > 0 && (
                  <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {pending.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="partners">
                Partners{" "}
                {partnerApps.filter((a: any) => a.status === "pending").length > 0 && (
                  <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {partnerApps.filter((a: any) => a.status === "pending").length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── LEADS TAB ── */}
            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <CardTitle className="text-navy">Form Submissions & Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                      <Input
                        placeholder="Search name, email or company…"
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Form type" />
                      </SelectTrigger>
                      <SelectContent>
                        {formTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {FORM_TYPE_LABELS[t] || t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                      <SelectTrigger className="w-full sm:w-44">
                        <SelectValue placeholder="Lead status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {LEAD_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {loadingLeads ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-teal" />
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <p className="text-text-secondary text-sm py-8 text-center">No leads match your filters.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-divider text-left">
                            <th className="pb-3 pr-4 font-semibold text-navy">Name</th>
                            <th className="pb-3 pr-4 font-semibold text-navy">Email</th>
                            <th className="pb-3 pr-4 font-semibold text-navy">Company</th>
                            <th className="pb-3 pr-4 font-semibold text-navy">Products</th>
                            <th className="pb-3 pr-4 font-semibold text-navy">Form</th>
                            <th className="pb-3 pr-4 font-semibold text-navy">Date</th>
                            <th className="pb-3 font-semibold text-navy">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeads.map((lead) => (
                            <tr key={lead.id} className="border-b border-divider/50 hover:bg-surface-subtle transition-colors">
                              <td className="py-3 pr-4 font-medium text-navy whitespace-nowrap">
                                {lead.first_name} {lead.last_name}
                              </td>
                              <td className="py-3 pr-4 text-text-secondary">
                                <a href={`mailto:${lead.email}`} className="hover:text-teal underline-offset-2 hover:underline">
                                  {lead.email}
                                </a>
                              </td>
                              <td className="py-3 pr-4 text-text-secondary">{lead.company || "—"}</td>
                              <td className="py-3 pr-4">
                                {lead.products && lead.products.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {lead.products.map((p) => (
                                      <span key={p} className="text-xs bg-navy/10 text-navy px-2 py-0.5 rounded-full whitespace-nowrap">
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-text-secondary">—</span>
                                )}
                              </td>
                              <td className="py-3 pr-4">
                                <span className="text-xs bg-surface-subtle text-text-secondary px-2 py-1 rounded-md">
                                  {FORM_TYPE_LABELS[lead.form_type] || lead.form_type}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                                {new Date(lead.created_at).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="py-3">
                                <Select
                                  value={lead.lead_status}
                                  onValueChange={(val) => updateLeadStatus(lead.id, val as LeadStatus)}
                                  disabled={updatingLead === lead.id}
                                >
                                  <SelectTrigger className="h-8 w-32 text-xs">
                                    {updatingLead === lead.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <SelectValue />
                                    )}
                                  </SelectTrigger>
                                  <SelectContent>
                                    {LEAD_STATUSES.map((s) => (
                                      <SelectItem key={s} value={s} className="text-xs">
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                      </SelectItem>
                                    ))}
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
            </TabsContent>

            {/* ── USERS TAB ── */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="text-navy">User Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingProfiles ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-teal" />
                    </div>
                  ) : (
                    <Tabs defaultValue="pending">
                      <TabsList className="mb-6">
                        <TabsTrigger value="pending">
                          Pending{" "}
                          <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {pending.length}
                          </span>
                        </TabsTrigger>
                        <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
                        <TabsTrigger value="all">All ({profiles.length})</TabsTrigger>
                      </TabsList>
                      <TabsContent value="pending"><UserTable rows={pending} /></TabsContent>
                      <TabsContent value="approved"><UserTable rows={approved} /></TabsContent>
                      <TabsContent value="rejected"><UserTable rows={rejected} /></TabsContent>
                      <TabsContent value="all"><UserTable rows={profiles} /></TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── PARTNERS TAB ── */}
            <TabsContent value="partners">
              <Card>
                <CardHeader>
                  <CardTitle className="text-navy">Partner Applications & Active Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPartners ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-teal" />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-navy mb-4">Applications</h3>
                      {partnerApps.length === 0 ? (
                        <p className="text-text-secondary text-sm py-4 text-center">No partner applications yet.</p>
                      ) : (
                        <div className="overflow-x-auto mb-8">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-divider text-left">
                                <th className="pb-3 pr-4 font-semibold text-navy">Company</th>
                                <th className="pb-3 pr-4 font-semibold text-navy">Website</th>
                                <th className="pb-3 pr-4 font-semibold text-navy">Type</th>
                                <th className="pb-3 pr-4 font-semibold text-navy">Date</th>
                                <th className="pb-3 pr-4 font-semibold text-navy">Status</th>
                                <th className="pb-3 font-semibold text-navy">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {partnerApps.map((app: any) => (
                                <tr key={app.id} className="border-b border-divider/50 hover:bg-surface-subtle transition-colors">
                                  <td className="py-3 pr-4 font-medium text-navy">{app.company_name}</td>
                                  <td className="py-3 pr-4 text-text-secondary">{app.website || "—"}</td>
                                  <td className="py-3 pr-4"><Badge className="bg-purple-100 text-purple-800 border-purple-200">{app.partner_type}</Badge></td>
                                  <td className="py-3 pr-4 text-text-secondary">{new Date(app.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                                  <td className="py-3 pr-4">
                                    <Badge className={app.status === "approved" ? "bg-green-100 text-green-800 border-green-200" : app.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                                      {app.status}
                                    </Badge>
                                  </td>
                                  <td className="py-3">
                                    {app.status === "pending" && (
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50"
                                          disabled={partnerActionLoading === app.id} onClick={() => approvePartnerApp(app)}>
                                          {partnerActionLoading === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                          Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50"
                                          disabled={partnerActionLoading === app.id} onClick={() => rejectPartnerApp(app.id)}>
                                          {partnerActionLoading === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                                          Reject
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <h3 className="font-semibold text-navy mb-4 mt-6">Active Partners</h3>
                      {partners.length === 0 ? (
                        <p className="text-text-secondary text-sm py-4 text-center">No active partners yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-divider text-left">
                                <th className="pb-3 pr-4 font-semibold text-navy">Referral Code</th>
                                <th className="pb-3 pr-4 font-semibold text-navy">Type</th>
                                <th className="pb-3 pr-4 font-semibold text-navy">Commission</th>
                                <th className="pb-3 pr-4 font-semibold text-navy">Active</th>
                                <th className="pb-3 font-semibold text-navy">Joined</th>
                              </tr>
                            </thead>
                            <tbody>
                              {partners.map((p: any) => (
                                <tr key={p.id} className="border-b border-divider/50 hover:bg-surface-subtle transition-colors">
                                  <td className="py-3 pr-4 font-mono text-navy">{p.referral_code}</td>
                                  <td className="py-3 pr-4"><Badge className="bg-purple-100 text-purple-800 border-purple-200">{p.partner_type}</Badge></td>
                                  <td className="py-3 pr-4 text-text-secondary">{(p.commission_rate * 100).toFixed(0)}%</td>
                                  <td className="py-3 pr-4">{p.is_active ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-500" />}</td>
                                  <td className="py-3 text-text-secondary">{new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
