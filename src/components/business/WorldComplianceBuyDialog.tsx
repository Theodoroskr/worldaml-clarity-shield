import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Mirrors the pricing in create-worldcompliance-checkout exactly.
 * Region + currency combinations must match the edge function or checkout is rejected.
 */
const BASE_PRICES: Record<string, Partial<Record<string, number>>> = {
  "Europe & Middle East": { EUR: 3000 },
  "United Kingdom & Ireland": { GBP: 2700, EUR: 3200 },
  "North America": { USD: 4900 },
};

const SYMBOL: Record<string, string> = { EUR: "€", GBP: "£", USD: "$" };

function totalFor(base: number, users: number) {
  let total = 0;
  for (let i = 1; i <= users; i++) {
    let userPrice = base;
    for (let j = 2; j <= i; j++) userPrice = userPrice * 0.9;
    total += Math.round(userPrice);
  }
  return total;
}

export function WorldComplianceBuyDialog({ label = "Configure & Buy" }: { label?: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState("Europe & Middle East");
  const [currency, setCurrency] = useState("EUR");
  const [users, setUsers] = useState("1");
  const [loading, setLoading] = useState(false);

  const currencies = useMemo(() => Object.keys(BASE_PRICES[region] ?? {}), [region]);
  const activeCurrency = currencies.includes(currency) ? currency : currencies[0];
  const base = BASE_PRICES[region]?.[activeCurrency] ?? 0;
  const total = totalFor(base, Number(users));

  const buy = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-worldcompliance-checkout", {
        body: { userCount: Number(users), currency: activeCurrency, region },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      setOpen(false);
    } catch (e) {
      toast({
        title: "Checkout failed",
        description: e instanceof Error ? e.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="accent">{label}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>WorldCompliance® Online</DialogTitle>
          <DialogDescription>
            Annual licence billed per user. Additional users receive a 10% compounding discount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Region</Label>
            <Select value={region} onValueChange={(v) => { setRegion(v); const c = Object.keys(BASE_PRICES[v] ?? {}); if (!c.includes(currency)) setCurrency(c[0]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(BASE_PRICES).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={activeCurrency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Users</Label>
              <Select value={users} onValueChange={setUsers}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">Total, billed annually</p>
            <p className="text-2xl font-bold text-foreground">
              {SYMBOL[activeCurrency] ?? ""}{total.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground"> /year</span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="accent" onClick={buy} disabled={loading || !base} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue to secure checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
