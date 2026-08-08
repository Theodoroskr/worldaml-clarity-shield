import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Loader2, Trash2, ShoppingCart } from "lucide-react";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAcademyCatalogue } from "@/hooks/useAcademyCatalogue";
import { useAcademyCheckout } from "@/hooks/useAcademyCheckout";
import { useRegion } from "@/contexts/RegionContext";
import { AcademyCurrency, REGION_TO_CURRENCY, convertEurCents, formatPrice } from "@/lib/academyFx";

export default function CartPage() {
  const cart = useCart();
  const { courses, isLoading } = useAcademyCatalogue();
  const { region } = useRegion();
  const currency: AcademyCurrency = REGION_TO_CURRENCY[region] ?? "eur";
  const { startCheckout, busy } = useAcademyCheckout();

  const bySlug = new Map(courses.map((c) => [c.slug, c]));
  // Courses already owned (purchase, pass, free) can never be bought twice.
  const payable = cart.items.filter((s) => !bySlug.get(s)?.owned);
  const owned = cart.items.filter((s) => bySlug.get(s)?.owned);
  const totals = cart.computeTotals(currency);

  const payableSubtotal = payable.reduce(
    (sum, s) => sum + convertEurCents(bySlug.get(s)?.priceEurCents ?? 0, currency),
    0,
  );
  const discountAmount = Math.round(payableSubtotal * (totals.discountPct / 100));
  const total = payableSubtotal - discountAmount;

  return (
    <>
      <Helmet><title>Your Basket | WorldAML Academy</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader title="Your Basket" description="Review your selected courses before checkout." />

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : cart.items.length === 0 ? (
        <Card className="border-dashed border-border max-w-xl">
          <CardContent className="py-10 text-center space-y-3">
            <ShoppingCart className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your basket is empty.</p>
            <Button asChild size="sm"><Link to="/dashboard/courses">Browse Courses</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3 max-w-4xl">
          <div className="lg:col-span-2 space-y-2">
            {cart.items.map((slug) => {
              const c = bySlug.get(slug);
              const isOwned = !!c?.owned;
              return (
                <Card key={slug} className="border-border">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <Link to={`/dashboard/courses/${slug}`} className="text-sm font-medium text-foreground hover:text-accent truncate block">
                        {c?.title ?? slug.replace(/-/g, " ")}
                      </Link>
                      {isOwned && (
                        <Badge variant="outline" className="mt-1 text-[10px] bg-accent/10 text-accent border-accent/20">
                          Already available to you — not charged
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {formatPrice(convertEurCents(c?.priceEurCents ?? 0, currency), currency)}
                    </span>
                    <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => cart.remove(slug)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {owned.length > 0 && (
              <p className="text-xs text-muted-foreground px-1">
                Courses you already own are skipped at checkout — you are never charged twice.
              </p>
            )}
          </div>

          <Card className="border-border h-fit">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(payableSubtotal, currency)}</span>
              </div>
              {totals.discountPct > 0 && payable.length > 1 && (
                <div className="flex justify-between text-accent">
                  <span>Bundle discount ({totals.discountPct}%)</span>
                  <span>−{formatPrice(discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2">
                <span>Total</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Taxes, where applicable, are calculated at checkout.
              </p>
              <Button
                className="w-full"
                disabled={busy || payable.length === 0}
                onClick={() => startCheckout(payable, "/dashboard/my-courses?purchase=success")}
              >
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Proceed to Checkout
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full"><Link to="/dashboard/courses">Keep browsing</Link></Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
