import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Search, Plus, Ban } from "lucide-react";

const QUOTE_STATUSES = ["new", "in_review", "quoted", "won", "closed"];
const PROVISION_PLANS: Record<string, string[]> = {
  screening: ["demo", "essentials", "starter", "professional", "compliance", "enterprise"],
  academy: ["business_starter", "business_growth"],
  suite: ["pilot", "annual"],
};

const money = (cents: number | null, currency: string | null) =>
  cents == null ? "—" : new Intl.NumberFormat("en", { style: "currency", currency: currency ?? "EUR" }).format(cents / 100);

export default function AdminBusiness() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [grantAccount, setGrantAccount] = useState<any | null>(null);
  const [grantProduct, setGrantProduct] = useState("screening");
  const [grantPlan, setGrantPlan] = useState("starter");
  const [grantSeats, setGrantSeats] = useState("1");
  const [granting, setGranting] = useState(false);

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["admin-business-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("business_accounts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["admin-business-quotes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("business_quote_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ["admin-business-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("business_subscriptions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const provision = async (payload: Record<string, unknown>, successMsg: string) => {
    setGranting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-provision-plan", { body: payload });
      if (error || data?.error) throw new Error(data?.error || error?.message || "Action failed");
      toast({ title: successMsg });
      queryClient.invalidateQueries({ queryKey: ["admin-business-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-business-accounts"] });
      setGrantAccount(null);
    } catch (e) {
      toast({ title: "Action failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setGranting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("business_quote_requests").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-business-quotes"] });
    toast({ title: "Status updated" });
  };

  const q = search.trim().toLowerCase();
  const filteredAccounts = (accounts || []).filter((a: any) =>
    !q || [a.company_name, a.work_email, a.country, a.industry].some((v: string | null) => v?.toLowerCase().includes(q))
  );
  const accountById = new Map((accounts || []).map((a: any) => [a.id, a]));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Business Buyers</h1>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardDescription>Business accounts</CardDescription><CardTitle className="text-2xl">{accounts?.length ?? 0}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Open quote requests</CardDescription><CardTitle className="text-2xl">{(quotes || []).filter((x: any) => !["won", "closed"].includes(x.status)).length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Won quotes</CardDescription><CardTitle className="text-2xl">{(quotes || []).filter((x: any) => x.status === "won").length}</CardTitle></CardHeader></Card>
      </div>

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search company, email, country…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Card>
            <CardContent className="pt-6">
              {accountsLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Company</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead>Country</TableHead><TableHead>Industry</TableHead><TableHead>Registered</TableHead><TableHead /></TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.company_name}</TableCell>
                        <TableCell>{a.contact_name || "—"}</TableCell>
                        <TableCell>{a.work_email}</TableCell>
                        <TableCell>{a.country || "—"}</TableCell>
                        <TableCell>{a.industry || "—"}</TableCell>
                        <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setGrantAccount(a)}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Grant plan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!filteredAccounts.length && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No business accounts yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer subscriptions</CardTitle>
              <CardDescription>Plans granted or purchased per business account. Manual grants take effect immediately.</CardDescription>
            </CardHeader>
            <CardContent>
              {subsLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Company</TableHead><TableHead>Product</TableHead><TableHead>Plan</TableHead><TableHead>Seats</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Renews</TableHead><TableHead /></TableRow>
                  </TableHeader>
                  <TableBody>
                    {(subscriptions || []).map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{(accountById.get(s.business_account_id) as any)?.company_name || "—"}</TableCell>
                        <TableCell>{s.product}</TableCell>
                        <TableCell>{s.plan_code}</TableCell>
                        <TableCell>{s.seats}</TableCell>
                        <TableCell>{money(s.amount_cents, s.currency)}{s.interval && s.interval !== "one_time" ? `/${s.interval}` : ""}</TableCell>
                        <TableCell><Badge variant={s.status === "active" || s.status === "trialing" ? "default" : s.status === "past_due" ? "destructive" : "secondary"}>{s.status}</Badge></TableCell>
                        <TableCell>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}</TableCell>
                        <TableCell className="text-right">
                          {["active", "trialing", "past_due"].includes(s.status) && (
                            <Button
                              size="sm" variant="ghost" className="text-destructive"
                              disabled={granting}
                              onClick={() => provision({ action: "cancel", business_account_id: s.business_account_id, subscription_id: s.id }, "Subscription canceled")}
                            >
                              <Ban className="h-3.5 w-3.5 mr-1" /> Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!subscriptions?.length && (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No subscriptions yet. Use Grant plan on an account.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <Card>
            <CardContent className="pt-6">
              {quotesLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Company</TableHead><TableHead>Product</TableHead><TableHead>Plan</TableHead><TableHead>Volume</TableHead><TableHead>Details</TableHead><TableHead>Raised</TableHead><TableHead>Status</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {(quotes || []).map((qr: any) => (
                      <TableRow key={qr.id}>
                        <TableCell className="font-medium">{(accountById.get(qr.business_account_id) as any)?.company_name || "—"}</TableCell>
                        <TableCell>{qr.product}</TableCell>
                        <TableCell>{qr.plan || "—"}</TableCell>
                        <TableCell>{qr.seats ?? "—"}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{qr.message || "—"}</TableCell>
                        <TableCell>{new Date(qr.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select value={qr.status} onValueChange={(v) => updateStatus(qr.id, v)}>
                            <SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>{QUOTE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!quotes?.length && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No quote requests yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!grantAccount} onOpenChange={(open) => !open && setGrantAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant plan — {grantAccount?.company_name}</DialogTitle>
            <DialogDescription>Creates an active subscription and provisions product access immediately. Use for offline deals or goodwill access.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={grantProduct} onValueChange={(v) => { setGrantProduct(v); setGrantPlan(PROVISION_PLANS[v][0]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="screening">WorldAML Screening</SelectItem>
                  <SelectItem value="academy">Academy</SelectItem>
                  <SelectItem value="suite">Compliance Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={grantPlan} onValueChange={setGrantPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROVISION_PLANS[grantProduct].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Seats</Label>
              <Input type="number" min={1} max={1000} value={grantSeats} onChange={(e) => setGrantSeats(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantAccount(null)}>Cancel</Button>
            <Button
              disabled={granting}
              onClick={() => provision({
                action: "grant_plan",
                business_account_id: grantAccount.id,
                product: grantProduct,
                plan_code: grantPlan,
                seats: Math.max(1, parseInt(grantSeats, 10) || 1),
                interval: "year",
              }, "Plan granted")}
            >
              {granting && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Grant plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
