import { useState } from "react";
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
import { Loader2, Plus } from "lucide-react";

const PRODUCTS = ["WorldAML API", "WorldID", "LexisNexis Data", "WorldAML Suite", "Other"];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  new: "default", in_review: "secondary", quoted: "secondary", won: "default", closed: "outline",
};

export default function BusinessQuotes() {
  const { user } = useAuth();
  const { account } = useBusinessAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState(searchParams.get("product") || "");
  const [plan, setPlan] = useState(searchParams.get("plan") || "");
  const [seats, setSeats] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["business-quotes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_quote_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not send request", description: error.message, variant: "destructive" });
      return;
    }
    setPlan(""); setSeats(""); setMessage("");
    queryClient.invalidateQueries({ queryKey: ["business-quotes", user?.id] });
    toast({ title: "Request sent", description: "Our team will get back to you shortly." });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quotes & Sales Requests</h1>
        <p className="text-muted-foreground">Ask for custom pricing, volume discounts or enterprise terms.</p>
      </div>

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
                <TableRow><TableHead>Product</TableHead><TableHead>Plan</TableHead><TableHead>Volume</TableHead><TableHead>Status</TableHead><TableHead>Raised</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((q: any) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.product}</TableCell>
                    <TableCell>{q.plan || "—"}</TableCell>
                    <TableCell>{q.seats ?? "—"}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[q.status] || "secondary"}>{q.status}</Badge></TableCell>
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
