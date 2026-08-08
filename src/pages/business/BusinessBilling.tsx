import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ExternalLink, Receipt } from "lucide-react";
import { Link } from "react-router-dom";

interface BillingData {
  subscriptions: { id: string; product: string; status: string; amount: string; interval: string | null; current_period_end: string | null; cancel_at_period_end: boolean }[];
  invoices: { id: string; number: string | null; status: string; amount: string; created: string; pdf: string | null }[];
}

export default function BusinessBilling() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["business-billing"],
    queryFn: async (): Promise<BillingData> => {
      const { data, error } = await supabase.functions.invoke("business-billing");
      if (error) throw error;
      return data as BillingData;
    },
  });

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (!error && data?.url) window.open(data.url, "_blank");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions & Invoices</h1>
          <p className="text-muted-foreground">Your active WorldAML plans and billing history.</p>
        </div>
        <Button variant="outline" onClick={openPortal}>Manage billing <ExternalLink className="ml-2 h-4 w-4" /></Button>
      </div>

      {error && (
        <Card><CardContent className="py-6 text-sm text-muted-foreground">We could not load your billing data right now. Please try again shortly.</CardContent></Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active subscriptions</CardTitle>
          <CardDescription>Plans currently billed to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.subscriptions?.length ? (
            <div className="text-center py-8 space-y-3">
              <Receipt className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No active subscriptions yet.</p>
              <Button asChild variant="accent"><Link to="/business/dashboard">Browse products</Link></Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Product</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead>Renews</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {data.subscriptions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.product}</TableCell>
                    <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                    <TableCell>{s.amount}{s.interval ? ` / ${s.interval}` : ""}</TableCell>
                    <TableCell>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}{s.cancel_at_period_end ? " (ends)" : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
          <CardDescription>Download receipts for your finance team.</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.invoices?.length ? (
            <p className="text-sm text-muted-foreground py-4">No invoices yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead /></TableRow>
              </TableHeader>
              <TableBody>
                {data.invoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.number || i.id}</TableCell>
                    <TableCell>{new Date(i.created).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant="secondary">{i.status}</Badge></TableCell>
                    <TableCell>{i.amount}</TableCell>
                    <TableCell className="text-right">
                      {i.pdf && <a href={i.pdf} target="_blank" rel="noreferrer" className="text-teal text-sm hover:underline">PDF</a>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
