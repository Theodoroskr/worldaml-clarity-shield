import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseMarketCard from "@/components/dashboard/CourseMarketCard";
import { ProductDiscoveryCard } from "@/components/dashboard/EcosystemSections";
import { useAcademyCatalogue, type CatalogueCourse } from "@/hooks/useAcademyCatalogue";
import { useAcademyCheckout } from "@/hooks/useAcademyCheckout";
import { useCart } from "@/contexts/CartContext";
import { useRegion } from "@/contexts/RegionContext";
import { AcademyCurrency, REGION_TO_CURRENCY } from "@/lib/academyFx";
import { getInterestSignals } from "@/lib/interestSignals";
import { ECOSYSTEM_PRODUCTS, productForCourse, type EcosystemProduct } from "@/lib/ecosystemPromos";

function scoreCourse(c: CatalogueCourse, terms: string[], categories: Set<string>): number {
  const haystack = `${c.title} ${c.description ?? ""} ${c.category ?? ""}`.toLowerCase();
  let score = 0;
  terms.forEach((t, i) => {
    if (!t) return;
    const weight = 6 - Math.min(i, 4);
    if (haystack.includes(t)) score += weight;
    else {
      const words = t.split(/\s+/).filter((w) => w.length > 3);
      if (words.length && words.every((w) => haystack.includes(w))) score += weight - 1;
    }
  });
  if (c.category && categories.has(c.category)) score += 3;
  return score;
}

/**
 * "Suggested for you" — courses ranked from the learner's own search terms and
 * the courses they have opened, plus the WorldAML products those topics map to.
 */
export default function SuggestedForYou() {
  const { courses, isLoading } = useAcademyCatalogue();
  const cart = useCart();
  const { region } = useRegion();
  const currency: AcademyCurrency = REGION_TO_CURRENCY[region] ?? "eur";
  const { startCheckout, busy } = useAcademyCheckout();

  const { suggested, products, basedOn } = useMemo(() => {
    const { terms, viewedSlugs } = getInterestSignals();
    const bySlug = new Map(courses.map((c) => [c.slug, c]));

    const categories = new Set<string>();
    viewedSlugs.forEach((s) => {
      const cat = bySlug.get(s)?.category;
      if (cat) categories.add(cat);
    });
    courses.forEach((c) => {
      if (c.owned && c.status !== "not-started" && c.category) categories.add(c.category);
    });

    const candidates = courses.filter((c) => !c.owned && !viewedSlugs.includes(c.slug));
    const ranked = candidates
      .map((c) => ({ c, score: scoreCourse(c, terms, categories) }))
      .sort((a, b) => b.score - a.score || a.c.sortOrder - b.c.sortOrder);

    const hasSignal = ranked.some((r) => r.score > 0);
    const picks = (hasSignal ? ranked.filter((r) => r.score > 0) : ranked).slice(0, 3).map((r) => r.c);

    const seen = new Set<string>();
    const prods: EcosystemProduct[] = [];
    [...picks, ...viewedSlugs.map((s) => bySlug.get(s)).filter(Boolean)].forEach((c: any) => {
      const p = c && productForCourse({ category: c.category, title: c.title });
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        prods.push(p);
      }
    });
    [ECOSYSTEM_PRODUCTS.suite, ECOSYSTEM_PRODUCTS.quickcheck].forEach((p) => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        prods.push(p);
      }
    });

    return {
      suggested: picks,
      products: prods.slice(0, 2),
      basedOn: hasSignal
        ? terms.length
          ? `Based on what you searched for${terms[0] ? ` — “${terms[0]}”` : ""}.`
          : "Based on the courses you have been exploring."
        : "Popular next steps for compliance professionals.",
    };
  }, [courses]);

  if (isLoading || suggested.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-card/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-accent" /> Suggested for you
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{basedOn}</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-accent hover:text-accent">
          <Link to="/dashboard/courses">
            Browse all courses <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {suggested.map((c) => (
          <CourseMarketCard
            key={c.id}
            course={c}
            currency={currency}
            inCart={cart.has(c.slug)}
            onToggleCart={cart.toggle}
            onBuyNow={(slug) => startCheckout([slug], "/dashboard/my-courses?purchase=success")}
            buying={busy}
          />
        ))}
      </div>

      {products.length > 0 && (
        <>
          <p className="text-xs font-medium text-muted-foreground mt-4 mb-2">
            Products that match these topics
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {products.map((p) => (
              <ProductDiscoveryCard key={p.id} product={p} surface="suggested" />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
