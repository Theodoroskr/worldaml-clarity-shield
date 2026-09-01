import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessAccount } from "@/hooks/useBusinessAccount";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ExternalLink, Receipt } from "lucide-react";
import { Link } from "react-router-dom";

interface LocalSubscription {
  id: string;
  product: string;
  plan_code: string;
  status: string;
  amount_cents: number | null;
  currency: string | null;
  interval: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

interface LocalInvoice {
  id: string;
  number: string | null;
  status: string;
  amount_due_cents: number;
  amount_paid_cents: number;
  currency: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  created_at: string;
  paid_at: string | null;
}

interface StripeBillingData {
  subscriptions: { id: string; product: string; status: string; amount: string; interval: string | null; current_period_end: string | null; cancel_at_period_end: boolean }[];
  invoices: { id: string; number: string | null; status: string; amount: string; created: string; pdf: string | null }[];
}

const money = (cents: number, currency: string | null) =>
  new Intl.NumberFormat("en", { style: "currency", currency: currency ?? "EUR" }).format(cents / 100);

const PRODUCT_LABEL: Record<string, string> = {
  screening: "WorldAML Screening",
  academy: "Academy",
  suite: "Compliance Suite",
};

const statusVariant = (status: string) =>
  status === "active" || status === "paid" || status === "trialing" ? "default" :
  status === "past_due" || status === "open" ? "destructive" : "secondary";

export default function BusinessBilling() {
  const { account } = useBusinessAccount();
  const accountId = account?.id;

  // Local commercial tables first: fast, works when Stripe is slow.
  const local = useQuery({
    queryKey: ["business-billing-local", accountId],
    enabled: !!accountId,
    staleTime: 30_000,
    queryFn: async () => {
      const [subs, invoices] = await Promise.all([
        supabase
          .from("business_subscriptions")
          .select("id, product, plan_code, status, amount_cents, currency, interval, current_period_end, cancel_at_period_end")
          .eq("business_account_id", accountId!)
          .order("created_at", { ascending: false }),
        supabase
          .from("business_invoices")
          .select("id, number, status, amount_due_cents, amount_paid_cents, currency, hosted_invoice_url, invoice_pdf_url, created_at, paid_at")
          .eq("business_account_id", accountId!)
          .order("created_at", { ascending: false }),
      ]);
      if (subs.error) throw subs.error;
      if (invoices.error) throw invoices.error;
      return {
        subscriptions: (subs.data ?? []) as unknown as LocalSubscription[],
        invoices: (invoices.data ?? []) as unknown as LocalInvoice[],
      };
    },
  });

  const hasLocalData = (local.data?.subscriptions.length ?? 0) > 0 || (local.data?.invoices.length ?? 0) > 0;

  // Fall back to the live Stripe lookup only while the local mirror is empty.
  const stripeFallback = useQuery({
    queryKey: ["business-billing"],
    enabled: local.isSuccess && !hasLocalData,
    staleTime: 60_000,
    queryFn: async (): Promise<StripeBillingData> => {
      const { data, error } = await supabase.functions.invoke("business-billing");
      if (error) throw error;
      return data as StripeBillingData;
    },
  });

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (!error && data?.url) window.open(data.url, "_blank");
  };

  const isLoading = local.isLoading || (local.isSuccess && !hasLocalData && stripeFallback.isLoading);
  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const subscriptions = hasLocalData
    ? local.data!.subscriptions.map((s) => ({
        id: s.id,
        product: `${PRODUCT_LABEL[s.product] ?? s.product} — ${s.plan_code}`,
        status: s.status,
        amount: s.amount_cents != null ? money(s.amount_cents, s.currency) : "—",
        interval: s.interval === "one_time" ? null : s.interval,
        current_period_end: s.current_period_end,
        cancel_at_period_end: s.cancel_at_period_end ?? false,
      }))
    : stripeFallback.data?.subscriptions ?? [];

  const invoices = hasLocalData
    ? local.data!.invoices.map((i) => ({
        id: i.id,
        number: i.number,
        status: i.status,
        amount: money(i.amount_paid_cents || i.amount_due_cents, i.currency),
        created: i.paid_at ?? i.created_at,
        pdf: i.invoice_pdf_url ?? i.hosted_invoice_url,
      }))
    : stripeFallback.data?.invoices ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions & Invoices</h1>
          <p className="text-muted-foreground">Your active WorldAML plans and billing history.</p>
        </div>
        <Button variant="outline" onClick={openPortal}>Manage billing <ExternalLink className="ml-2 h-4 w-4" /></Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active subscriptions</CardTitle>
          <CardDescription>Plans currently billed to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {!subscriptions.length ? (
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
                {subscriptions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.product}</TableCell>
                    <TableCell><Badge variant={statusVariant(s.status)}>{s.status}</Badge></TableCell>
                    <TableCell>{s.amount}{s.interval ? ` / ${s.interval}` : ""}</TableCell>
                    <TableCell>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}{s.cancel_at_period_end ? " (cancels)" : ""}</TableCell>
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
          {!invoices.length ? (
            <p className="text-sm text-muted-foreground py-4">No invoices yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead /></TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.number || i.id}</TableCell>
                    <TableCell>{new Date(i.created).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={statusVariant(i.status)}>{i.status}</Badge></TableCell>
                    <TableCell>{i.amount}</TableCell>
                    <TableCell className="text-right">
                      {i.pdf && <a href={i.pdf} target="_blank" rel="noreferrer" className="text-teal text-sm hover:underline">View</a>}
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
