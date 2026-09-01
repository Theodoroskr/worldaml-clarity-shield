import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessAccount } from "@/hooks/useBusinessAccount";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { openExternalCheckout } from "@/lib/openExternalCheckout";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";

const PRODUCTS = ["WorldAML API", "WorldID", "LexisNexis Data", "WorldAML Suite", "Other"];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  new: "default", in_review: "secondary", quoted: "secondary", accepted: "secondary", won: "default", closed: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Received", in_review: "In review", quoted: "Quote ready", accepted: "Payment started", won: "Active", closed: "Closed",
};

interface QuoteRow {
  id: string;
  product: string;
  plan: string | null;
  seats: number | null;
  status: string;
  created_at: string;
  quoted_amount_cents: number | null;
  quoted_currency: string | null;
  quoted_interval: string | null;
  quote_notes: string | null;
  quote_valid_until: string | null;
  quoted_product_key: string | null;
}

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 0 })
    .format(cents / 100);

const intervalLabel = (i: string | null) => (i === "month" ? "per month" : i === "year" ? "per year" : "one-off");

const isLive = (q: QuoteRow) =>
  q.quoted_amount_cents != null &&
  !["won", "closed"].includes(q.status) &&
  (!q.quote_valid_until || new Date(q.quote_valid_until).getTime() > Date.now());

export default function BusinessQuotes() {
  const { user } = useAuth();
  const { account } = useBusinessAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [product, setProduct] = useState(searchParams.get("product") || "");
  const [plan, setPlan] = useState(searchParams.get("plan") || "");
  const [seats, setSeats] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["business-quotes", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<QuoteRow[]> => {
      const { data, error } = await supabase
        .from("business_quote_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as QuoteRow[];
    },
  });

  // Returning from Stripe: turn the paid quote into a live plan.
  const sessionId = searchParams.get("session_id");
  useEffect(() => {
    if (!sessionId || !user) return;
    let cancelled = false;
    setActivating(true);
    (async () => {
      const { data, error } = await supabase.functions.invoke("business-quote-activate", {
        body: { session_id: sessionId },
      });
      if (cancelled) return;
      setActivating(false);
      searchParams.delete("session_id");
      setSearchParams(searchParams, { replace: true });
      if (error || (data as any)?.error) {
        toast({
          title: "We could not activate your plan",
          description: (data as any)?.error ?? "Payment received — our team will finish activation shortly.",
          variant: "destructive",
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["business-quotes", user.id] });
      queryClient.invalidateQueries({ queryKey: ["business-entitlements"] });
      queryClient.invalidateQueries({ queryKey: ["business-billing"] });
      toast({ title: "Your plan is live", description: "The product is now available in My Products." });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) {
      toast({ title: "Select a product", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("business_quote_requests").insert({
      user_id: user!.id,
      business_account_id: account?.id ?? null,
      product,
      plan: plan.trim() || null,
      seats: seats ? Number(seats) : null,
      message: message.trim().slice(0, 2000) || null,
    });
    if (!error) {
      // Best effort: alert the sales team so the quote gets priced.
      void supabase.functions.invoke("send-admin-notification", {
        body: {
          email: user!.email,
          full_name: account?.contact_name ?? undefined,
          subject: `New quote request — ${product}`,
          message: `${account?.company_name ?? "A business account"} requested a quote for ${product}${plan ? ` (${plan})` : ""}${seats ? `, ${seats} users` : ""}.\n\n${message.trim() || "No further details."}`,
          cta_text: "Open admin portal",
          cta_url: "https://worldaml.com/admin",
        },
      });
    }
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not send request", description: error.message, variant: "destructive" });
      return;
    }
    setPlan(""); setSeats(""); setMessage("");
    queryClient.invalidateQueries({ queryKey: ["business-quotes", user?.id] });
    toast({ title: "Request sent", description: "Our team will price this and send you a quote you can accept online." });
  };

  const acceptQuote = async (quote: QuoteRow) => {
    setPayingId(quote.id);
    const { data, error } = await supabase.functions.invoke("business-quote-checkout", {
      body: { quote_id: quote.id },
    });
    setPayingId(null);
    const url = (data as any)?.url;
    if (error || !url) {
      toast({
        title: "Could not open checkout",
        description: (data as any)?.error ?? "Please try again or contact our team.",
        variant: "destructive",
      });
      return;
    }
    openExternalCheckout(url);
  };

  const liveQuotes = (quotes ?? []).filter(isLive);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quotes &amp; Sales Requests</h1>
        <p className="text-muted-foreground">Ask for custom pricing, then accept and pay online — your plan activates immediately.</p>
      </div>

      {activating && (
        <Card className="border-teal/40 bg-teal/[0.05]">
          <CardContent className="py-4 flex items-center gap-3 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-teal" /> Activating your plan…
          </CardContent>
        </Card>
      )}

      {/* LIVE OFFERS — the quote turned into something payable */}
      {liveQuotes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your quotes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {liveQuotes.map((q) => (
              <Card key={q.id} className="border-teal/40">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{q.product}{q.plan ? ` — ${q.plan}` : ""}</CardTitle>
                    <Badge variant="outline" className="border-teal/40 bg-teal/10 text-teal">
                      {STATUS_LABEL[q.status] ?? q.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {q.seats ? `${q.seats} users · ` : ""}
                    {q.quote_valid_until ? `valid until ${new Date(q.quote_valid_until).toLocaleDateString()}` : "no expiry"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-2xl font-bold text-foreground">
                    {money(q.quoted_amount_cents!, q.quoted_currency || "eur")}
                    <span className="ml-1.5 text-sm font-normal text-muted-foreground">{intervalLabel(q.quoted_interval)}</span>
                  </p>
                  {q.quote_notes && <p className="text-sm text-muted-foreground">{q.quote_notes}</p>}
                  <Button variant="accent" className="w-full" disabled={payingId === q.id} onClick={() => acceptQuote(q)}>
                    {payingId === q.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Accept &amp; pay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4" /> New request</CardTitle>
          <CardDescription>Tell us what you need and we will send a tailored quote.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select value={product} onValueChange={setProduct}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>{PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan / tier</Label>
                <Input id="plan" value={plan} onChange={(e) => setPlan(e.target.value)} maxLength={80} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">Users / volume</Label>
                <Input id="seats" type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Details</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={4} />
            </div>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send request
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Your requests</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : !quotes?.length ? (
            <p className="text-sm text-muted-foreground py-4">No requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Product</TableHead><TableHead>Plan</TableHead><TableHead>Volume</TableHead><TableHead>Quote</TableHead><TableHead>Status</TableHead><TableHead>Raised</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.product}</TableCell>
                    <TableCell>{q.plan || "—"}</TableCell>
                    <TableCell>{q.seats ?? "—"}</TableCell>
                    <TableCell>
                      {q.quoted_amount_cents != null
                        ? `${money(q.quoted_amount_cents, q.quoted_currency || "eur")} ${intervalLabel(q.quoted_interval)}`
                        : "—"}
                    </TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[q.status] || "secondary"}>{STATUS_LABEL[q.status] ?? q.status}</Badge></TableCell>
                    <TableCell>{new Date(q.created_at).toLocaleDateString()}</TableCell>
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
