import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Handshake } from "lucide-react";
import { toast } from "sonner";

export default function AdminPartners() {
  const { user } = useAuth();
  const [partnerApps, setPartnerApps] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPartnerData = useCallback(async () => {
    setLoading(true);
    const [{ data: apps }, { data: pts }] = await Promise.all([
      supabase.from("partner_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("partners").select("*").order("created_at", { ascending: false }),
    ]);
    setPartnerApps((apps as any[]) || []);
    setPartners((pts as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPartnerData(); }, [fetchPartnerData]);

  const approvePartnerApp = async (app: any) => {
    setActionLoading(app.id);
    const { error: updateErr } = await supabase
      .from("partner_applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any)
      .eq("id", app.id);
    if (updateErr) { toast.error("Failed to approve"); setActionLoading(null); return; }

    const { error: insertErr } = await supabase.from("partners").insert({
      user_id: app.user_id,
      partner_type: app.partner_type,
    } as any);
    if (insertErr) { toast.error("Failed to create partner record"); console.error(insertErr); }
    else { toast.success("Partner approved!"); fetchPartnerData(); }
    setActionLoading(null);
  };

  const rejectPartnerApp = async (appId: string) => {
    setActionLoading(appId);
    const { error } = await supabase
      .from("partner_applications")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any)
      .eq("id", appId);
    if (error) toast.error("Failed to reject");
    else { toast.success("Application rejected"); fetchPartnerData(); }
    setActionLoading(null);
  };

  const pendingCount = partnerApps.filter((a) => a.status === "pending").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Handshake className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partner Applications</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage partner program applications and active partners.
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="ml-auto bg-amber-100 text-amber-800 border-amber-200">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-teal" />
            </div>
          ) : partnerApps.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No partner applications yet.</p>
          ) : (
            <div className="overflow-x-auto">
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
                              disabled={actionLoading === app.id} onClick={() => approvePartnerApp(app)}>
                              {actionLoading === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50"
                              disabled={actionLoading === app.id} onClick={() => rejectPartnerApp(app.id)}>
                              {actionLoading === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Active Partners</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-teal" />
            </div>
          ) : partners.length === 0 ? (
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
        </CardContent>
      </Card>
    </div>
  );
}
