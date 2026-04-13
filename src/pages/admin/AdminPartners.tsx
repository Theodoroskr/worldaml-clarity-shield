import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Handshake } from "lucide-react";
import { toast } from "sonner";

export default function AdminPartners() {
  const { user } = useAuth();
  const [partnerApps, setPartnerApps] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: apps }, { data: pts }] = await Promise.all([
      supabase.from("partner_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("partners").select("*").order("created_at", { ascending: false }),
    ]);
    setPartnerApps((apps as any[]) || []);
    setPartners((pts as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const approveApp = async (app: any) => {
    setActionLoading(app.id);
    const { error: updateErr } = await supabase.from("partner_applications").update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any).eq("id", app.id);
    if (updateErr) { toast.error("Failed to approve"); setActionLoading(null); return; }
    const { error: insertErr } = await supabase.from("partners").insert({ user_id: app.user_id, partner_type: app.partner_type } as any);
    if (insertErr) { toast.error("Failed to create partner record"); console.error(insertErr); }
    else { toast.success("Partner approved!"); fetchData(); }
    setActionLoading(null);
  };

  const rejectApp = async (appId: string) => {
    setActionLoading(appId);
    const { error } = await supabase.from("partner_applications").update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user!.id } as any).eq("id", appId);
    if (error) toast.error("Failed to reject");
    else { toast.success("Application rejected"); fetchData(); }
    setActionLoading(null);
  };

  const pendingCount = partnerApps.filter((a) => a.status === "pending").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partners</h1>
          <p className="text-sm text-muted-foreground mt-1">Partner applications & active partners</p>
        </div>
        {pendingCount > 0 && <Badge className="bg-amber-100 text-amber-800 border-amber-200">{pendingCount} pending</Badge>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Applications */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Handshake className="w-4 h-4 text-primary" /> Applications ({partnerApps.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {partnerApps.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No partner applications yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left bg-muted/30">
                        <th className="p-3 font-semibold text-foreground">Company</th>
                        <th className="p-3 font-semibold text-foreground">Website</th>
                        <th className="p-3 font-semibold text-foreground">Type</th>
                        <th className="p-3 font-semibold text-foreground">Date</th>
                        <th className="p-3 font-semibold text-foreground">Status</th>
                        <th className="p-3 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnerApps.map((app: any) => (
                        <tr key={app.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium text-foreground">{app.company_name}</td>
                          <td className="p-3 text-muted-foreground">{app.website || "—"}</td>
                          <td className="p-3"><Badge variant="secondary">{app.partner_type}</Badge></td>
                          <td className="p-3 text-muted-foreground">{new Date(app.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                          <td className="p-3">
                            <Badge className={app.status === "approved" ? "bg-green-100 text-green-800 border-green-200" : app.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                              {app.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {app.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50" disabled={actionLoading === app.id} onClick={() => approveApp(app)}>
                                  {actionLoading === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />} Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50" disabled={actionLoading === app.id} onClick={() => rejectApp(app.id)}>
                                  {actionLoading === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />} Reject
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

          {/* Active Partners */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Active Partners ({partners.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {partners.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">No active partners yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left bg-muted/30">
                        <th className="p-3 font-semibold text-foreground">Referral Code</th>
                        <th className="p-3 font-semibold text-foreground">Type</th>
                        <th className="p-3 font-semibold text-foreground">Commission</th>
                        <th className="p-3 font-semibold text-foreground">Active</th>
                        <th className="p-3 font-semibold text-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.map((p: any) => (
                        <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-mono text-foreground">{p.referral_code}</td>
                          <td className="p-3"><Badge variant="secondary">{p.partner_type}</Badge></td>
                          <td className="p-3 text-muted-foreground">{(p.commission_rate * 100).toFixed(0)}%</td>
                          <td className="p-3">{p.is_active ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-500" />}</td>
                          <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
