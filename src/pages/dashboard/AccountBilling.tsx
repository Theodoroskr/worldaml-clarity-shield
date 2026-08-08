import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CreditCard, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useAcademyPurchases } from "@/hooks/useAcademyPurchases";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademyCatalogue } from "@/hooks/useAcademyCatalogue";

interface PurchaseRow {
  id: string;
  course_slug: string;
  amount_cents: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  expires_at: string | null;
}

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: (currency || "eur").toUpperCase() }).format(cents / 100);

export default function AccountBilling() {
  const { user } = useAuth();
  const { planLabel } = useEntitlements();
  const { hasAnnualPass, isLoading } = useAcademyPurchases();
  const { courses } = useAcademyCatalogue();
  const { toast } = useToast();
  const [opening, setOpening] = useState(false);

  const titleFor = (slug: string) =>
    courses.find((c) => c.slug === slug)?.title ?? slug.replace(/-/g, " ");

  const { data: purchases = [], isLoading: loadingPurchases } = useQuery({
    queryKey: ["academy-purchase-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_course_purchases")
        .select("id, course_slug, amount_cents, currency, status, paid_at, created_at, expires_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PurchaseRow[];
    },
  });

  const openPortal = async () => {
    setOpening(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("No billing portal URL returned");
    } catch (e: any) {
      console.error("[billing] portal", e);
      const msg = String(e?.message ?? "");
      const noSub = msg.toLowerCase().includes("no active subscription") || msg.includes("404");
      toast({
        title: noSub ? "Nothing to manage yet" : "Could not open the billing portal",
        description: noSub
          ? "Academy access is sold as one-off purchases, so there is no recurring subscription to manage. Your purchases are listed below."
          : "Please try again in a moment.",
        variant: noSub ? "default" : "destructive",
      });
    } finally {
      setOpening(false);
    }
  };

  return (
    <>
      <Helmet><title>Purchases & Billing | WorldAML Academy</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader title="Purchases & Billing" description="Your access, purchase history and billing details." />

      <div className="space-y-4 max-w-3xl">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" /> Current access
              <Badge variant="outline" className="text-[10px]">{planLabel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <p>
                {hasAnnualPass
                  ? "Annual All-Access Pass — every paid course is unlocked while your pass is active."
                  : purchases.some((p) => p.status === "paid")
                    ? "You own individual Academy courses. They stay available in My Courses."
                    : "You're on free access. Free courses, certificates and CPD tracking are included."}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm"><Link to="/dashboard/plans">View plans</Link></Button>
              <Button size="sm" variant="outline" onClick={openPortal} disabled={opening}>
                {opening && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Manage billing
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Receipt className="h-4 w-4 text-accent" /> Purchase history</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {loadingPurchases ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : purchases.length === 0 ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">No purchases yet.</p>
                <Button asChild size="sm" variant="outline"><Link to="/dashboard/courses">Browse courses</Link></Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {purchases.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <Link to={`/dashboard/courses/${p.course_slug}`} className="font-medium text-foreground hover:text-accent capitalize truncate block">
                        {titleFor(p.course_slug)}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {new Date(p.paid_at ?? p.created_at).toLocaleDateString()}
                        {p.expires_at && ` · access until ${new Date(p.expires_at).toLocaleDateString()}`}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${p.status === "paid" ? "bg-accent/10 text-accent border-accent/20" : "text-muted-foreground"}`}
                    >
                      {p.status === "paid" ? "Paid" : p.status}
                    </Badge>
                    <span className="text-sm font-medium shrink-0">{money(p.amount_cents, p.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
