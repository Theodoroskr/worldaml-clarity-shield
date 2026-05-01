import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Search,
  FileBarChart,
  Users,
  Activity,
  Lock,
} from "lucide-react";
import type { FeatureKey, UpgradeContext } from "@/hooks/useFeatureLimits";

/* ── Tailored messaging per feature ─────────────────────────── */

interface FeatureMeta {
  icon: React.ElementType;
  headline: string;
  description: string;
  benefits: string[];
}

const FEATURE_META: Record<FeatureKey, FeatureMeta> = {
  screeningsPerMonth: {
    icon: Search,
    headline: "Unlock Unlimited AML Screening",
    description:
      "You've reached your monthly screening limit. Upgrade to run more checks against 1,900+ global watchlists, sanctions lists, and PEP databases.",
    benefits: [
      "Higher monthly screening quota",
      "Batch screening capabilities",
      "Ongoing monitoring for rescreened entities",
      "Full match-detail reports with audit trail",
    ],
  },
  casesTotal: {
    icon: FileBarChart,
    headline: "Manage More Investigation Cases",
    description:
      "Your current plan's case limit has been reached. Upgrade to open unlimited investigation cases with full STR/SAR workflow support.",
    benefits: [
      "Unlimited active cases",
      "FINTRAC, FinCEN & MOKAS report generation",
      "Version-tracked amendments with 20-day workflow",
      "Cross-case entity linking",
    ],
  },
  monitoringRules: {
    icon: Activity,
    headline: "Expand Your Monitoring Coverage",
    description:
      "You've hit the rule limit for your plan. Upgrade to deploy more monitoring rules and catch suspicious patterns automatically.",
    benefits: [
      "More active monitoring rules",
      "Regulator-specific rule packs",
      "AI-assisted rule suggestions",
      "Real-time alert triggers",
    ],
  },
  customersTotal: {
    icon: Users,
    headline: "Onboard More Customers",
    description:
      "Your customer limit has been reached. Upgrade to onboard more customers with full KYC/KYB due diligence workflows.",
    benefits: [
      "Higher customer capacity",
      "Automated risk scoring per customer",
      "Ongoing due diligence scheduling",
      "Bulk customer import",
    ],
  },
  transactionEval: {
    icon: TrendingUp,
    headline: "Enable Transaction Evaluation",
    description:
      "Transaction evaluation is a premium feature that automatically flags high-risk transactions above €10,000 using pattern analysis.",
    benefits: [
      "Automated transaction risk scoring",
      "Threshold-based alerting",
      "Historical transaction analysis",
      "Regulator-ready transaction reports",
    ],
  },
  riskScoring: {
    icon: ShieldCheck,
    headline: "Activate the Risk Scoring Engine",
    description:
      "Get composite risk scores (0–100) across 5 weighted dimensions — geography, product, channel, customer, and transaction.",
    benefits: [
      "Multi-dimensional risk assessment",
      "Configurable scoring weights",
      "Risk heat-maps and trend analysis",
      "Automated risk tier assignment",
    ],
  },
  regulatoryExports: {
    icon: FileBarChart,
    headline: "Export Regulatory Reports",
    description:
      "Generate FinCEN, FINTRAC, and MOKAS-compliant reports directly from your cases. Available on Suite and Enterprise plans.",
    benefits: [
      "One-click STR/SAR generation",
      "FINTRAC FWR-ready structured payloads",
      "Automated periodic reporting",
      "Full audit trail for every export",
    ],
  },
  apiAccess: {
    icon: Zap,
    headline: "Unlock API Access",
    description:
      "Integrate WorldAML screening and monitoring into your own systems with our REST API. Available on Suite and Enterprise plans.",
    benefits: [
      "RESTful API with OpenAPI docs",
      "Webhook event notifications",
      "Batch screening endpoints",
      "Dedicated API rate limits",
    ],
  },
};

/* ── Component ──────────────────────────────────────────────── */

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: UpgradeContext | null;
  currentTier?: string;
}

export default function UpgradeModal({
  open,
  onOpenChange,
  context,
  currentTier = "free",
}: UpgradeModalProps) {
  if (!context) return null;

  const meta = FEATURE_META[context.feature];
  const Icon = meta.icon;
  const nextTierLabel = context.nextTier
    ? context.nextTier.charAt(0).toUpperCase() + context.nextTier.slice(1)
    : "Enterprise";

  const limitDisplay =
    typeof context.limit === "number" && context.limit < Infinity
      ? `${context.current} / ${context.limit}`
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal/10 text-teal">
              <Icon className="w-5 h-5" />
            </div>
            <Badge
              variant="outline"
              className="text-xs uppercase tracking-wider border-teal/30 text-teal"
            >
              {currentTier} plan
            </Badge>
          </div>
          <DialogTitle className="text-xl text-navy">
            {meta.headline}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {meta.description}
          </DialogDescription>
        </DialogHeader>

        {limitDisplay && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 mb-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-amber-800">
                Current usage
              </span>
              <span className="font-bold text-amber-900">{limitDisplay}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-amber-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{
                  width: `${Math.min(100, (Number(context.current) / Number(context.limit)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2 my-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What you get with {nextTierLabel}
          </p>
          <ul className="space-y-2">
            {meta.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-teal mt-0.5 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {typeof context.nextLimit === "number" && context.nextLimit < Infinity && (
          <p className="text-xs text-muted-foreground">
            {nextTierLabel} plan includes up to{" "}
            <strong>{context.nextLimit.toLocaleString()}</strong>{" "}
            {context.label.toLowerCase()}.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild className="flex-1 bg-teal hover:bg-teal/90">
            <Link to="/contact-sales?product=suite">
              Upgrade to {nextTierLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            asChild
          >
            <Link to="/pricing">Compare Plans</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Inline banner variant (non-blocking) ───────────────────── */

interface UpgradeBannerProps {
  context: UpgradeContext;
  currentTier?: string;
  onUpgradeClick?: () => void;
}

export function UpgradeBanner({
  context,
  currentTier = "free",
  onUpgradeClick,
}: UpgradeBannerProps) {
  const meta = FEATURE_META[context.feature];
  const Icon = meta.icon;
  const nextTierLabel = context.nextTier
    ? context.nextTier.charAt(0).toUpperCase() + context.nextTier.slice(1)
    : "Enterprise";

  const usagePercent =
    typeof context.limit === "number" && context.limit < Infinity
      ? Math.round((Number(context.current) / Number(context.limit)) * 100)
      : null;

  // Only show when usage ≥ 80%
  if (typeof context.limit === "boolean" && context.limit) return null;
  if (usagePercent !== null && usagePercent < 80) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
        {context.isAtLimit ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">
          {context.isAtLimit
            ? `${context.label} limit reached`
            : `${usagePercent}% of ${context.label.toLowerCase()} used`}
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          {context.isAtLimit
            ? `Upgrade to ${nextTierLabel} to continue.`
            : `You're approaching your ${currentTier} plan limit.`}
        </p>
      </div>
      <Button
        size="sm"
        className="bg-teal hover:bg-teal/90 flex-shrink-0"
        onClick={onUpgradeClick}
      >
        Upgrade
      </Button>
    </div>
  );
}
