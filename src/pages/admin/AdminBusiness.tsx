import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, Search } from "lucide-react";

const QUOTE_STATUSES = ["new", "in_review", "quoted", "won", "closed"];

export default function AdminBusiness() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

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
                    <TableRow><TableHead>Company</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead>Country</TableHead><TableHead>Industry</TableHead><TableHead>Registered</TableHead></TableRow>
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
                      </TableRow>
                    ))}
                    {!filteredAccounts.length && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No business accounts yet.</TableCell></TableRow>
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
    </div>
  );
}
