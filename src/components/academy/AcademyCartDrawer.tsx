import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, X, Loader2, Trash2, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useRegion } from "@/contexts/RegionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ACADEMY_PRICING } from "@/data/academyPricing";
import {
  AcademyCurrency,
  convertEurCents,
  formatPrice,
  REGION_TO_CURRENCY,
  currencyCode,
} from "@/lib/academyFx";
import { computeDiscount } from "@/lib/academyDiscount";
import { Region, REGIONS } from "@/types/regions";
import { toast } from "sonner";

const FX_TOOLTIP =
  "Prices are converted from EUR using fixed reference rates (USD ×1.08, GBP ×0.86). The final charge is processed in your selected currency at Stripe Checkout, where VAT or sales tax is added based on your billing address.";

interface CartItemRowProps {
  slug: string;
  title: string | undefined;
  currency: AcademyCurrency;
  onRemove: () => void;
}

const CartItemRow = ({ slug, title, currency, onRemove }: CartItemRowProps) => {
  const eurCents = ACADEMY_PRICING[slug]?.eurCents ?? 0;
  const cents = convertEurCents(eurCents, currency);
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium text-foreground truncate">{title ?? slug}</p>
        <p className="text-caption text-muted-foreground">1-month access</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-body-sm font-semibold text-foreground">{formatPrice(cents, currency)}</span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove from basket"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export function AcademyCartButton() {
  const { count, isOpen, open, close } = useCart();
  return (
    <Sheet open={isOpen} onOpenChange={(v) => (v ? open() : close())}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <ShoppingBag className="h-4 w-4" />
          <span>Basket</span>
          {count > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
              {count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <AcademyCartDrawerContent />
    </Sheet>
  );
}

function AcademyCartDrawerContent() {
  const { items, remove, clear, close, computeTotals } = useCart();
  const { region, setRegion, regionConfig } = useRegion();
  const { user } = useAuth();
  const currency: AcademyCurrency = REGION_TO_CURRENCY[region] ?? "eur";
  const [loading, setLoading] = useState(false);

  const { data: courseTitles } = useQuery({
    queryKey: ["academy-cart-titles", items.join(",")],
    enabled: items.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("slug, title")
        .in("slug", items);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((c) => { map[c.slug] = c.title; });
      return map;
    },
  });

  const totals = computeTotals(currency);
  const discount = computeDiscount(items.length);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to complete your purchase.");
      close();
      return;
    }
    if (items.length === 0) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-academy-checkout", {
        body: { courseSlugs: items, currency },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error(err instanceof Error ? err.message : "Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Your basket
          {items.length > 0 && <span className="text-muted-foreground font-normal">({items.length})</span>}
        </SheetTitle>
      </SheetHeader>

      {/* Currency / region indicator */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 mt-4">
          <span className="text-caption text-muted-foreground">Prices shown in</span>
          <Select value={region} onValueChange={(v) => setRegion(v as Region)}>
            <SelectTrigger className="h-8 w-auto min-w-[180px] text-caption">
              <SelectValue>
                {currencyCode(currency)} — {regionConfig.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(REGIONS).map((r) => {
                const c = REGION_TO_CURRENCY[r.id] ?? "eur";
                return (
                  <SelectItem key={r.id} value={r.id} className="text-caption">
                    {currencyCode(c)} — {r.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="How prices are calculated"
                className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-caption leading-relaxed">
              {FX_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-body-sm font-medium text-foreground mb-1">Your basket is empty</p>
            <p className="text-caption text-muted-foreground mb-4">Add courses to get bundle discounts.</p>
            <Button asChild variant="outline" size="sm" onClick={() => close()}>
              <Link to="/academy">Browse courses</Link>
            </Button>
          </div>
        ) : (
          <div>
            {items.map((slug) => (
              <CartItemRow
                key={slug}
                slug={slug}
                title={courseTitles?.[slug]}
                currency={currency}
                onRemove={() => remove(slug)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals + checkout */}
      {items.length > 0 && (
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">
              Subtotal ({items.length} {items.length === 1 ? "course" : "courses"})
            </span>
            <span className="text-foreground">{formatPrice(totals.subtotal, currency)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex items-center justify-between text-body-sm text-accent">
              <span>{discount.label}</span>
              <span>−{formatPrice(totals.discountAmount, currency)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-subtitle font-semibold text-foreground">Total</span>
            <span className="text-subtitle font-bold text-foreground">{formatPrice(totals.total, currency)}</span>
          </div>
          <p className="text-caption text-muted-foreground">
            VAT / sales tax will be calculated at checkout based on your billing location.
          </p>
          <p className="text-caption text-muted-foreground">
            Each course includes 1 month of access from purchase date. Certificates earned remain yours forever.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => clear()}
              disabled={loading}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="flex-1"
              size="lg"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</>
              ) : (
                <>Checkout — {formatPrice(totals.total, currency)}</>
              )}
            </Button>
          </div>
        </div>
      )}
    </SheetContent>
  );
}

export default AcademyCartButton;
