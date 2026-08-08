import { Link } from "react-router-dom";
import { ArrowRight, Building2, Scale, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ECOSYSTEM_PRODUCTS,
  productForCourse,
  promoHeadline,
  trackEcosystemClick,
  type EcosystemProduct,
} from "@/lib/ecosystemPromos";
import type { AcademyOverview } from "@/hooks/useAcademyOverview";

/* ── Compact product discovery card ──────────────────────────── */
export function ProductDiscoveryCard({
  product,
  surface,
}: {
  product: EcosystemProduct;
  surface: string;
}) {
  const href = product.exploreHref;
  const label = product.exploreLabel;
  const Icon = product.icon;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10">
        <Icon className="h-4 w-4 text-accent" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{product.name}</div>
        <p className="text-xs text-muted-foreground mt-1">{product.blurb}</p>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mt-2 -ml-2 h-auto px-2 py-1 text-xs text-accent hover:text-accent"
        >
          <Link to={href} onClick={() => trackEcosystemClick(product.id, surface)}>
            {label} <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ── Explore WorldAML (dashboard home, lower section) ────────── */
export function ExploreWorldAML() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">Explore WorldAML</h2>
      <p className="text-xs text-muted-foreground mt-0.5 mb-2">
        Discover more tools to support your compliance work.
      </p>
      <div className="grid gap-2 md:grid-cols-3">
        <ProductDiscoveryCard product={ECOSYSTEM_PRODUCTS.suite} surface="explore" />
        <ProductDiscoveryCard product={ECOSYSTEM_PRODUCTS.rcm} surface="explore" />
        <ProductDiscoveryCard product={ECOSYSTEM_PRODUCTS.quickcheck} surface="explore" />
      </div>
    </div>
  );
}

/* ── Compliance in Practice (course-context bridge) ──────────── */
export function ComplianceInPractice({ data }: { data: AcademyOverview }) {
  const source =
    data.current?.course ??
    data.completed[0]?.course ??
    data.inProgress[0]?.course ??
    null;

  const product = productForCourse(source) ?? ECOSYSTEM_PRODUCTS.quickcheck;

  const context = source
    ? `Based on your work in “${source.title}”.`
    : "A practical next step alongside your learning.";

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">Compliance in Practice</h2>
      <p className="text-xs text-muted-foreground mt-0.5 mb-2">{context}</p>
      <div className="rounded-lg border border-border bg-accent/5 p-4">
        <div className="text-sm font-medium text-foreground">{promoHeadline(product)}</div>
        <ProductDiscoveryCard product={product} surface="practice" />
      </div>
    </div>
  );
}

/* ── Course-level cross-sell (shown after completion only) ───── */
export function CourseCrossSell({
  category,
  title,
  surface = "course",
}: {
  category?: string | null;
  title?: string | null;
  surface?: string;
}) {
  const product = productForCourse({ category, title });
  if (!product) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-2">{promoHeadline(product)}</div>
      <ProductDiscoveryCard product={product} surface={surface} />
    </div>
  );
}

/* ── WorldAML Tools (discovery navigation under Resources) ───── */
const TOOLS = [
  { label: "Sanctions Quick Check", href: "/sanctions-check", icon: Search },
  { label: "WorldAML Suite", href: "/platform/suite", icon: Shield },
  { label: "Regulatory Compliance Management", href: "/platform/regulatory-reporting", icon: Scale },
];

export function WorldAMLTools() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-2">WorldAML Tools</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            to={t.href}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <t.icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{t.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── For Organisations (profile / resources, subtle) ─────────── */
export function ForOrganisations() {
  return (
    <Link
      to="/contact-sales"
      onClick={() => trackEcosystemClick("suite", "for_organisations")}
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 hover:border-accent/50 transition-colors"
    >
      <Building2 className="h-4 w-4 text-accent shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">For Organisations</span>
        <span className="block text-xs text-muted-foreground">
          Looking for compliance tools for your company?
        </span>
      </span>
      <span className="text-xs font-medium text-accent shrink-0">Explore WorldAML Solutions →</span>
    </Link>
  );
}
