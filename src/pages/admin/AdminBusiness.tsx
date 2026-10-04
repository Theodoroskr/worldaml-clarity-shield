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
  const [priceQuote, setPriceQuote] = useState<any | null>(null);
  const [qProduct, setQProduct] = useState("suite");
  const [qAmount, setQAmount] = useState("");
  const [qInterval, setQInterval] = useState("year");
  const [qValid, setQValid] = useState("");
  const [qNotes, setQNotes] = useState("");
  const [savingQuote, setSavingQuote] = useState(false);

  const guessKey = (name: string) => /suite/i.test(name) ? "suite" : /academy/i.test(name) ? "academy" : /screen|api|worldaml/i.test(name) ? "screening" : "suite";
  const openPricing = (qr: any) => {
    setPriceQuote(qr);
    setQProduct(qr.quoted_product_key || guessKey(qr.product || ""));
    setQAmount(qr.quoted_amount_cents != null ? String(qr.quoted_amount_cents / 100) : "");
    setQInterval(qr.quoted_interval || "year");
    setQValid(qr.quote_valid_until ? String(qr.quote_valid_until).slice(0, 10) : "");
    setQNotes(qr.quote_notes || "");
  };
  const saveQuote = async () => {
    const amount = Math.round(parseFloat(qAmount) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Enter a price above zero", variant: "destructive" });
      return;
    }
    setSavingQuote(true);
    const { error } = await supabase.from("business_quote_requests").update({
      quoted_product_key: qProduct,
      quoted_amount_cents: amount,
      quoted_currency: "eur",
      quoted_interval: qInterval,
      quote_valid_until: qValid ? new Date(qValid + "T23:59:59Z").toISOString() : null,
      quote_notes: qNotes.trim().slice(0, 1000) || null,
      quoted_at: new Date().toISOString(),
      status: "quoted",
    } as any).eq("id", priceQuote.id);
    setSavingQuote(false);
    if (error) {
      toast({ title: "Could not send quote", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-business-quotes"] });
    setPriceQuote(null);
    toast({ title: "Quote sent", description: "The customer can now accept and pay it in their Business portal." });
  };

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
                    <TableRow><TableHead>Company</TableHead><TableHead>Product</TableHead><TableHead>Plan</TableHead><TableHead>Volume</TableHead><TableHead>Details</TableHead><TableHead>Raised</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead></TableRow>
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
                        <TableCell className="whitespace-nowrap">
                          <span className="mr-2">{money(qr.quoted_amount_cents, qr.quoted_currency)}</span>
                          {!["won", "closed"].includes(qr.status) && (
                            <Button size="sm" variant="outline" onClick={() => openPricing(qr)}>
                              {qr.quoted_amount_cents != null ? "Edit quote" : "Send quote"}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select value={qr.status} onValueChange={(v) => updateStatus(qr.id, v)}>
                            <SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>{QUOTE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!quotes?.length && (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No quote requests yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!priceQuote} onOpenChange={(open) => !open && setPriceQuote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send quote — {priceQuote?.product}{priceQuote?.plan ? ` (${priceQuote.plan})` : ""}</DialogTitle>
            <DialogDescription>The customer sees this price in their Business portal and can accept and pay by card. Payment switches the product on automatically.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Product to switch on after payment</Label>
              <Select value={qProduct} onValueChange={setQProduct}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="suite">WorldAML Suite</SelectItem>
                  <SelectItem value="screening">WorldAML Screening</SelectItem>
                  <SelectItem value="academy">Academy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price (EUR)</Label>
                <Input type="number" min={1} step="0.01" value={qAmount} onChange={(e) => setQAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Billing</Label>
                <Select value={qInterval} onValueChange={setQInterval}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year">Per year</SelectItem>
                    <SelectItem value="month">Per month</SelectItem>
                    <SelectItem value="one_time">One-off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valid until (optional)</Label>
              <Input type="date" value={qValid} onChange={(e) => setQValid(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes for the customer (optional)</Label>
              <Input value={qNotes} maxLength={1000} onChange={(e) => setQNotes(e.target.value)} placeholder="e.g. Screening + KYC/KYB modules, 5 seats" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceQuote(null)}>Cancel</Button>
            <Button disabled={savingQuote} onClick={saveQuote}>
              {savingQuote && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Send quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <SelectItem value="suite">WorldAML Suite</SelectItem>
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
