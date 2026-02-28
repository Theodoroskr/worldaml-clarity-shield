import { useEffect, useState } from "react";
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
import { Loader2, CheckCircle, XCircle, Clock, Users, ShieldAlert } from "lucide-react";
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

const statusBadge = (status: string) => {
  if (status === "approved") return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
  if (status === "rejected") return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
  return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
};

const Admin = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

    if (error) {
      toast.error("Failed to load users");
      console.error(error);
    } else {
      setProfiles((data as ProfileRow[]) || []);
    }
    setLoadingProfiles(false);
  };

  useEffect(() => {
    if (isAdmin) fetchProfiles();
  }, [isAdmin]);

  const updateStatus = async (profileId: string, newStatus: "approved" | "rejected") => {
    setActionLoading(profileId);
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", profileId);

    if (error) {
      toast.error(`Failed to ${newStatus === "approved" ? "approve" : "reject"} user`);
      console.error(error);
    } else {
      toast.success(`User ${newStatus === "approved" ? "approved" : "rejected"} successfully`);
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, status: newStatus } : p))
      );
    }
    setActionLoading(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const pending = profiles.filter((p) => p.status === "pending");
  const approved = profiles.filter((p) => p.status === "approved");
  const rejected = profiles.filter((p) => p.status === "rejected");

  const UserTable = ({ rows }: { rows: ProfileRow[] }) => (
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
                <td className="py-3 pr-4">{statusBadge(p.status)}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    {p.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-50"
                        disabled={actionLoading === p.id}
                        onClick={() => updateStatus(p.id, "approved")}
                      >
                        {actionLoading === p.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Approve
                      </Button>
                    )}
                    {p.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-300 hover:bg-red-50"
                        disabled={actionLoading === p.id}
                        onClick={() => updateStatus(p.id, "rejected")}
                      >
                        {actionLoading === p.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
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
    )
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Admin — User Management" description="WorldAML admin panel for user approvals." noindex />
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
              <p className="text-text-secondary">User account management &amp; approvals</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-navy">{pending.length}</p>
                  <p className="text-text-secondary text-sm">Pending Review</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-navy">{approved.length}</p>
                  <p className="text-text-secondary text-sm">Approved</p>
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

          {/* Users Table */}
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
                      Pending <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">{pending.length}</span>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
