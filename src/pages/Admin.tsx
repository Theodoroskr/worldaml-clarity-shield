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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Clock, Users, ShieldAlert, Inbox, Search, Filter, Handshake, Globe, Plus, Trash2, GraduationCap, Mail, Send } from "lucide-react";
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

interface AcademyStats {
  user_id: string;
  courses_completed: number;
  certificates_earned: number;
  course_names: string[];
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

const UPSELL_TEMPLATES = [
  {
    label: "Upgrade to WorldAML Suite",
    subject: "Unlock the Full WorldAML Suite",
    message: "You've been making great progress on the WorldAML Academy! Ready to take the next step?\n\nThe WorldAML Suite gives you access to real-time AML screening, KYC/KYB onboarding, transaction monitoring, and more — all in one platform.\n\nBook a quick demo to see how it can streamline your compliance workflow.",
    cta_text: "Book a Demo",
    cta_url: "https://worldaml-clarity-shield.lovable.app/contact-sales",
  },
  {
    label: "Try WorldAML API",
    subject: "Integrate Compliance Into Your Workflow",
    message: "Now that you understand the fundamentals of AML compliance, you can automate screening directly in your applications.\n\nThe WorldAML API provides real-time sanctions screening, KYC/KYB verification, and risk assessment — all via a simple REST API.\n\nStart your free trial today.",
    cta_text: "Explore the API",
    cta_url: "https://worldaml.com/platform/api",
  },
  {
    label: "WorldID Verification",
    subject: "Add Identity Verification to Your Stack",
    message: "Complete your compliance toolkit with WorldID — our white-label identity verification solution.\n\nWorldID provides document verification, liveness detection, and biometric matching to help you onboard customers securely.\n\nLearn more about how WorldID fits into your compliance workflow.",
    cta_text: "Learn About WorldID",
    cta_url: "https://worldaml-clarity-shield.lovable.app/world-id",
  },
  {
    label: "Custom message",
    subject: "",
    message: "",
    cta_text: "",
    cta_url: "",
  },
];

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
  const [academyStats, setAcademyStats] = useState<Map<string, AcademyStats>>(new Map());

  // Notification modal state
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<ProfileRow | null>(null);
  const [notifySubject, setNotifySubject] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyCtaText, setNotifyCtaText] = useState("");
  const [notifyCtaUrl, setNotifyCtaUrl] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

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

  const fetchAcademyStats = async () => {
    // Fetch progress (completed courses)
    const { data: progressData } = await supabase
      .from("academy_progress")
      .select("user_id, course_id, quiz_passed, completed_at");

    // Fetch certificates
    const { data: certData } = await supabase
      .from("academy_certificates")
      .select("user_id, course_id");

    // Fetch course names
    const { data: courses } = await supabase
      .from("academy_courses")
      .select("id, title");

    const courseNameMap = new Map<string, string>();
    (courses || []).forEach((c: any) => courseNameMap.set(c.id, c.title));

    const statsMap = new Map<string, AcademyStats>();

    // Count completed courses per user
    (progressData || []).forEach((p: any) => {
      if (!p.quiz_passed) return;
      const existing = statsMap.get(p.user_id) || {
        user_id: p.user_id,
        courses_completed: 0,
        certificates_earned: 0,
        course_names: [],
      };
      existing.courses_completed++;
      const name = courseNameMap.get(p.course_id);
      if (name) existing.course_names.push(name);
      statsMap.set(p.user_id, existing);
    });

    // Count certificates per user
    (certData || []).forEach((c: any) => {
      const existing = statsMap.get(c.user_id) || {
        user_id: c.user_id,
        courses_completed: 0,
        certificates_earned: 0,
        course_names: [],
      };
      existing.certificates_earned++;
      statsMap.set(c.user_id, existing);
    });

    setAcademyStats(statsMap);
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

  const fetchTrustedDomains = useCallback(async () => {
    setLoadingDomains(true);
    const { data, error } = await supabase
      .from("auto_approve_domains")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load trusted domains"); console.error(error); }
    else setTrustedDomains((data as any[]) || []);
    setLoadingDomains(false);
  }, []);

  useEffect(() => {
    if (isAdmin) { fetchProfiles(); fetchAcademyStats(); fetchLeads(); fetchPartnerData(); fetchTrustedDomains(); }
  }, [isAdmin, fetchLeads, fetchPartnerData, fetchTrustedDomains]);

  const updateProfileStatus = async (profileId: string, newStatus: "approved" | "rejected") => {
    setActionLoading(profileId);
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", profileId);
    if (error) { toast.error(`Failed to update user`); console.error(error); }
    else {
      toast.success(`User ${newStatus}`);
      setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, status: newStatus } : p)));

      // Send approval notification email (fire-and-forget)
      if (newStatus === "approved") {
        const profile = profiles.find((p) => p.id === profileId);
        if (profile?.email) {
          supabase.functions.invoke("notify-user-approved", {
            body: { email: profile.email, full_name: profile.full_name },
          }).catch((err) => console.error("Approval email failed:", err));
        }
      }
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
    const { error: updateErr } = await supabase
      .from("partner_applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any)
      .eq("id", app.id);
    if (updateErr) { toast.error("Failed to approve"); setPartnerActionLoading(null); return; }

    const { error: insertErr } = await supabase.from("partners").insert({
      user_id: app.user_id,
      partner_type: app.partner_type,
    } as any);
    if (insertErr) { toast.error("Failed to create partner record"); console.error(insertErr); }
    else { toast.success("Partner approved!"); fetchPartnerData(); }
    setPartnerActionLoading(null);
  };

  const addTrustedDomain = async () => {
    const domain = newDomain.trim().toLowerCase();
    if (!domain || !domain.includes(".")) { toast.error("Enter a valid domain"); return; }
    setAddingDomain(true);
    const { error } = await supabase.from("auto_approve_domains").insert({ domain } as any);
    if (error) {
      if (error.code === "23505") toast.error("Domain already exists");
      else toast.error("Failed to add domain");
    } else {
      toast.success(`${domain} added`);
      setNewDomain("");
      fetchTrustedDomains();
    }
    setAddingDomain(false);
  };

  const removeTrustedDomain = async (id: string) => {
    setDeletingDomain(id);
    const { error } = await supabase.from("auto_approve_domains").delete().eq("id", id);
    if (error) toast.error("Failed to remove domain");
    else {
      toast.success("Domain removed");
      setTrustedDomains((prev) => prev.filter((d) => d.id !== id));
    }
    setDeletingDomain(null);
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

  const openNotifyModal = (profile: ProfileRow) => {
    setNotifyTarget(profile);
    setNotifySubject("");
    setNotifyMessage("");
    setNotifyCtaText("");
    setNotifyCtaUrl("");
    setSelectedTemplate("");
    setNotifyModalOpen(true);
  };

  const applyTemplate = (templateLabel: string) => {
    const template = UPSELL_TEMPLATES.find((t) => t.label === templateLabel);
    if (template) {
      setNotifySubject(template.subject);
      setNotifyMessage(template.message);
      setNotifyCtaText(template.cta_text);
      setNotifyCtaUrl(template.cta_url);
      setSelectedTemplate(templateLabel);
    }
  };

  const sendNotification = async () => {
    if (!notifyTarget?.email || !notifySubject.trim() || !notifyMessage.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    setSendingNotification(true);
    try {
      const { error } = await supabase.functions.invoke("send-admin-notification", {
        body: {
          email: notifyTarget.email,
          full_name: notifyTarget.full_name,
          subject: notifySubject,
          message: notifyMessage,
          cta_text: notifyCtaText || undefined,
          cta_url: notifyCtaUrl || undefined,
        },
      });
      if (error) throw error;
      toast.success(`Email sent to ${notifyTarget.email}`);
      setNotifyModalOpen(false);
    } catch (err) {
      console.error("Notification failed:", err);
      toast.error("Failed to send notification");
    }
    setSendingNotification(false);
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
              <th className="pb-3 pr-4 font-semibold text-navy">Academy</th>
              <th className="pb-3 pr-4 font-semibold text-navy">Registered</th>
              <th className="pb-3 pr-4 font-semibold text-navy">Status</th>
              <th className="pb-3 font-semibold text-navy">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const stats = academyStats.get(p.user_id);
              return (
                <tr key={p.id} className="border-b border-divider/50 hover:bg-surface-subtle transition-colors">
                  <td className="py-3 pr-4 font-medium text-navy">{p.full_name || "—"}</td>
                  <td className="py-3 pr-4 text-text-secondary">{p.email || "—"}</td>
                  <td className="py-3 pr-4 text-text-secondary">{p.company_name || "—"}</td>
                  <td className="py-3 pr-4">
                    {stats ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-teal" />
                          <span className="text-xs text-navy font-medium">
                            {stats.courses_completed} course{stats.courses_completed !== 1 ? "s" : ""} completed
                          </span>
                        </div>
                        {stats.certificates_earned > 0 && (
                          <span className="text-xs text-teal font-medium">
                            🎓 {stats.certificates_earned} certificate{stats.certificates_earned !== 1 ? "s" : ""}
                          </span>
                        )}
                        {stats.course_names.length > 0 && (
                          <span className="text-xs text-text-secondary truncate max-w-[200px]" title={stats.course_names.join(", ")}>
                            {stats.course_names.join(", ")}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary">No activity</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 pr-4">{profileStatusBadge(p.status)}</td>
                  <td className="py-3">
                    <div className="flex gap-2 flex-wrap">
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
                      {p.email && (
                        <Button size="sm" variant="outline" className="text-teal border-teal/30 hover:bg-teal/5"
                          onClick={() => openNotifyModal(p)}>
                          <Mail className="h-3 w-3 mr-1" />
                          Notify
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* ── LEADS TAB ── */}
            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <CardTitle className="text-navy">Form Submissions & Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                      <Input
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Form type" />
                      </SelectTrigger>
                      <SelectContent>
                        {formTypes.map((ft) => (
                          <SelectItem key={ft} value={ft}>
                            {FORM_TYPE_LABELS[ft] || ft}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
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
                            <th className="pb-3 pr-4 font-semibold text-navy">Type</th>
                            <th className="pb-3 pr-4 font-semibold text-navy">Products</th>
                            <th className="pb-3 pr-4 font-semibold text-navy">Region</th>
                            <th className="pb-3 pr-4 font-semibold text-navy">Date</th>
                            <th className="pb-3 pr-4 font-semibold text-navy">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeads.map((l) => (
                            <tr key={l.id} className="border-b border-divider/50 hover:bg-surface-subtle transition-colors">
                              <td className="py-3 pr-4 font-medium text-navy">
                                {l.first_name} {l.last_name}
                                {l.job_title && <span className="block text-xs text-text-secondary">{l.job_title}</span>}
                              </td>
                              <td className="py-3 pr-4 text-text-secondary">{l.email}</td>
                              <td className="py-3 pr-4 text-text-secondary">{l.company || "—"}</td>
                              <td className="py-3 pr-4">
                                <Badge variant="outline" className="text-xs">
                                  {FORM_TYPE_LABELS[l.form_type] || l.form_type}
                                </Badge>
                              </td>
                              <td className="py-3 pr-4 text-text-secondary text-xs">
                                {l.products?.join(", ") || "—"}
                              </td>
                              <td className="py-3 pr-4 text-text-secondary text-xs">
                                {l.region || l.country || "—"}
                              </td>
                              <td className="py-3 pr-4 text-text-secondary">
                                {new Date(l.created_at).toLocaleDateString("en-GB", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })}
                              </td>
                              <td className="py-3 pr-4">
                                <Select
                                  value={l.lead_status}
                                  onValueChange={(val) => updateLeadStatus(l.id, val as LeadStatus)}
                                  disabled={updatingLead === l.id}
                                >
                                  <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {LEAD_STATUSES.map((s) => (
                                      <SelectItem key={s} value={s}>
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

            {/* ── SETTINGS TAB ── */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="text-navy">Auto-Approve Trusted Domains</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary text-sm mb-4">
                    Users registering with email addresses from these domains will be automatically approved without manual review.
                  </p>
                  <div className="flex gap-2 mb-6">
                    <Input
                      placeholder="e.g. company.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTrustedDomain()}
                      className="max-w-xs"
                    />
                    <Button onClick={addTrustedDomain} disabled={addingDomain} size="sm">
                      {addingDomain ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                      Add Domain
                    </Button>
                  </div>
                  {loadingDomains ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-teal" />
                    </div>
                  ) : trustedDomains.length === 0 ? (
                    <p className="text-text-secondary text-sm py-4 text-center">No trusted domains configured.</p>
                  ) : (
                    <div className="space-y-2">
                      {trustedDomains.map((d) => (
                        <div key={d.id} className="flex items-center justify-between py-2 px-3 bg-surface-subtle rounded-md">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-teal" />
                            <span className="font-mono text-sm text-navy">@{d.domain}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            disabled={deletingDomain === d.id}
                            onClick={() => removeTrustedDomain(d.id)}
                          >
                            {deletingDomain === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Notification Modal */}
      <Dialog open={notifyModalOpen} onOpenChange={setNotifyModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-navy flex items-center gap-2">
              <Send className="h-5 w-5 text-teal" />
              Send Notification to {notifyTarget?.full_name || notifyTarget?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-navy mb-1.5 block">Quick Templates</label>
              <Select value={selectedTemplate} onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or write custom..." />
                </SelectTrigger>
                <SelectContent>
                  {UPSELL_TEMPLATES.map((t) => (
                    <SelectItem key={t.label} value={t.label}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-navy mb-1.5 block">Subject *</label>
              <Input
                placeholder="Email subject line"
                value={notifySubject}
                onChange={(e) => setNotifySubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy mb-1.5 block">Message *</label>
              <Textarea
                placeholder="Write your message..."
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-navy mb-1.5 block">CTA Button Text</label>
                <Input
                  placeholder="e.g. Book a Demo"
                  value={notifyCtaText}
                  onChange={(e) => setNotifyCtaText(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-navy mb-1.5 block">CTA Button URL</label>
                <Input
                  placeholder="https://..."
                  value={notifyCtaUrl}
                  onChange={(e) => setNotifyCtaUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyModalOpen(false)}>Cancel</Button>
            <Button
              onClick={sendNotification}
              disabled={sendingNotification || !notifySubject.trim() || !notifyMessage.trim()}
              className="bg-teal hover:bg-teal/90 text-white"
            >
              {sendingNotification ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
