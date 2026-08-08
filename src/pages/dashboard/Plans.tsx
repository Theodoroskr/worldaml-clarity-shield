import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Check, Loader2, Sparkles } from "lucide-react";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAcademyCatalogue } from "@/hooks/useAcademyCatalogue";
import { useAcademyCheckout } from "@/hooks/useAcademyCheckout";
import { useRegion } from "@/contexts/RegionContext";
import { AcademyCurrency, REGION_TO_CURRENCY, convertEurCents, formatPrice } from "@/lib/academyFx";

const ANNUAL_PASS_EUR_CENTS = 19900;

export default function Plans() {
  const { courses, hasAnnualPass, isLoading } = useAcademyCatalogue();
  const { buyAnnualPass, busy } = useAcademyCheckout();
  const { region } = useRegion();
  const currency: AcademyCurrency = REGION_TO_CURRENCY[region] ?? "eur";

  const freeCount = courses.filter((c) => c.isFree).length;
  const paidCount = courses.filter((c) => !c.isFree).length;
  const ownedPaid = courses.filter((c) => !c.isFree && c.owned).length;
  const cheapest = Math.min(...courses.filter((c) => !c.isFree).map((c) => c.priceEurCents), 2900);

  const current = hasAnnualPass ? "pass" : ownedPaid > 0 ? "courses" : "free";

  const PlanCard = ({
    id, name, price, cadence, benefits, cta,
  }: { id: string; name: string; price: string; cadence: string; benefits: string[]; cta: React.ReactNode }) => (
    <Card className={`border-border flex flex-col ${current === id ? "ring-1 ring-accent" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{name}</CardTitle>
          {current === id && <Badge className="text-[10px] bg-accent text-accent-foreground">Current</Badge>}
        </div>
        <div className="pt-1">
          <span className="text-2xl font-bold text-foreground">{price}</span>
          <span className="text-xs text-muted-foreground ml-1.5">{cadence}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <ul className="space-y-1.5 text-sm text-muted-foreground flex-1">
          {benefits.map((b) => (
            <li key={b} className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0 mt-0.5" /> <span>{b}</span></li>
          ))}
        </ul>
        {cta}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet><title>Academy Plans | WorldAML</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader title="Academy Plans" description="Choose how you want to access WorldAML Academy." />

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <PlanCard
              id="free"
              name="Free Access"
              price="Free"
              cadence="with your account"
              benefits={[
                `${freeCount} free courses included`,
                "Full modules, quiz and certificate",
                "Progress and CPD tracking",
              ]}
              cta={<Button asChild variant="outline" className="w-full"><Link to="/dashboard/courses">Browse free courses</Link></Button>}
            />

            <PlanCard
              id="courses"
              name="Individual Courses"
              price={`${formatPrice(convertEurCents(cheapest, currency), currency)}+`}
              cadence="one-off, per course"
              benefits={[
                "Buy only the courses you need",
                "Lifetime access to purchased courses",
                "Bundle discount when buying several at once",
                "Certificate on completion",
              ]}
              cta={<Button asChild className="w-full"><Link to="/dashboard/courses">Choose courses</Link></Button>}
            />

            <PlanCard
              id="pass"
              name="Annual All-Access Pass"
              price={formatPrice(convertEurCents(ANNUAL_PASS_EUR_CENTS, currency), currency)}
              cadence="one-off, 12 months"
              benefits={[
                `All ${paidCount} paid courses unlocked for 12 months`,
                "Every new course released during your pass",
                "All certificates and CPD hours included",
              ]}
              cta={
                hasAnnualPass ? (
                  <Button asChild variant="outline" className="w-full"><Link to="/dashboard/courses">Explore included courses</Link></Button>
                ) : (
                  <Button className="w-full" onClick={buyAnnualPass} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />} Get the Annual Pass
                  </Button>
                )
              }
            />
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Academy access is sold as one-off purchases — there is no recurring subscription to cancel.
            Your Annual Pass simply expires 12 months after purchase.
          </p>
        </>
      )}
    </>
  );
}
