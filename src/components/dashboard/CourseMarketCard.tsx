import { Link } from "react-router-dom";
import { Clock, Award, CheckCircle2, ShoppingCart, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { CatalogueCourse, categoryLabel, difficultyLabel } from "@/hooks/useAcademyCatalogue";
import { AcademyCurrency, convertEurCents, formatPrice } from "@/lib/academyFx";
import { isPaidCourse } from "@/data/academyPricing";

export function statusBadge(c: CatalogueCourse) {
  if (c.status === "completed") return { label: "Completed", cls: "bg-accent/10 text-accent border-accent/20" };
  if (c.status === "in-progress") return { label: "In Progress", cls: "bg-primary/10 text-primary border-primary/20" };
  if (c.owned && c.ownedVia === "free") return { label: "Free", cls: "bg-muted text-muted-foreground border-border" };
  if (c.owned && c.ownedVia === "annual-pass") return { label: "Included in your pass", cls: "bg-accent/10 text-accent border-accent/20" };
  if (c.owned) return { label: "Purchased", cls: "bg-accent/10 text-accent border-accent/20" };
  return null;
}

/** Single source of truth for the learner-facing CTA of a catalogue course. */
export function primaryCta(c: CatalogueCourse): { label: string; to: string } {
  const to = `/dashboard/courses/${c.slug}`;
  if (!c.owned) return { label: "View Course", to };
  if (c.status === "completed") return { label: "Review Course", to };
  if (c.status === "in-progress") return { label: "Continue", to };
  return { label: c.ownedVia === "free" ? "Start Free Course" : "Start Course", to };
}

interface Props {
  course: CatalogueCourse;
  currency: AcademyCurrency;
  inCart: boolean;
  onToggleCart: (slug: string) => void;
  onBuyNow: (slug: string) => void;
  buying?: boolean;
  /** Names of specialisation badges this course counts toward. */
  badgeNames?: string[];
}

export default function CourseMarketCard({ course, currency, inCart, onToggleCart, onBuyNow, buying, badgeNames = [] }: Props) {
  const badge = statusBadge(course);
  const cta = primaryCta(course);
  const canAddToCart = !course.owned && !course.isFree && isPaidCourse(course.slug);

  return (
    <Card className="border-border flex flex-col overflow-hidden hover:border-accent/40 transition-colors">
      <div className="p-4 flex-1 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {categoryLabel(course.category)}
          </span>
          {badge && <Badge variant="outline" className={`text-[10px] ${badge.cls}`}>{badge.label}</Badge>}
        </div>

        <Link to={cta.to} className="font-semibold text-foreground leading-snug hover:text-accent transition-colors">
          {course.title}
        </Link>

        {course.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span>{difficultyLabel(course.difficulty)}</span>
          {course.durationMinutes ? (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {course.durationMinutes} min</span>
          ) : null}
          {course.cpdHours ? (
            <span className="inline-flex items-center gap-1"><Award className="h-3 w-3" /> {course.cpdHours} CPD</span>
          ) : null}
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Certificate</span>
        </div>

        {badgeNames.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            Counts toward <span className="text-foreground">{badgeNames.join(", ")}</span>
          </p>
        )}

        {course.owned && course.totalModules > 0 && course.status !== "not-started" && (
          <div className="space-y-1">
            <Progress value={course.percent} className="h-1.5" />
            <div className="text-[11px] text-muted-foreground">
              {course.percent}% · {course.completedModules}/{course.totalModules} modules
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          {course.isFree ? "Free" : formatPrice(convertEurCents(course.priceEurCents, currency), currency)}
        </span>
        <div className="flex items-center gap-1.5">
          {canAddToCart && (
            <>
              <Button size="sm" variant="outline" onClick={() => onToggleCart(course.slug)} aria-label={inCart ? "Remove from cart" : "Add to cart"}>
                {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" onClick={() => onBuyNow(course.slug)} disabled={buying}>
                {buying && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />} Buy Now
              </Button>
            </>
          )}
          {!canAddToCart && (
            <Button size="sm" asChild><Link to={cta.to}>{cta.label}</Link></Button>
          )}
        </div>
      </div>
    </Card>
  );
}
