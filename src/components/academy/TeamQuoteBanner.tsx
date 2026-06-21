import { Link } from "react-router-dom";
import { Users, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeamSignupCount } from "@/hooks/useTeamSignupCount";

interface Props {
  minCount?: number;
  className?: string;
  compact?: boolean;
}

/**
 * Inline banner shown when ≥N teammates from the same company domain have
 * signed up. Routes to /contact-sales with a prefilled team-quote topic so
 * procurement-led buyers get an invoice flow instead of self-serve Stripe.
 */
export function TeamQuoteBanner({ minCount = 3, className = "", compact = false }: Props) {
  const { domain, count, isLoading } = useTeamSignupCount();

  if (isLoading || !domain || count < minCount) return null;

  const href = `/contact-sales?topic=academy-team-quote&seats=${count}&domain=${encodeURIComponent(domain)}`;

  if (compact) {
    return (
      <div
        className={`rounded-md border border-teal/30 bg-teal/5 px-3 py-2 flex items-center gap-2 ${className}`}
      >
        <Users className="h-4 w-4 text-teal flex-shrink-0" />
        <p className="text-caption text-foreground flex-1">
          <span className="font-semibold">{count} people from {domain}</span> already
          here — get 20% off for 5+ seats with invoice billing.
        </p>
        <Button asChild size="sm" variant="accent" className="h-7 px-2 text-caption">
          <Link to={href}>Team quote</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-teal/30 bg-gradient-to-br from-teal/5 via-navy/[0.03] to-transparent p-5 ${className}`}
      role="region"
      aria-label="Team quote available"
    >
      <div className="flex items-start gap-4">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-teal/10 text-teal flex-shrink-0">
          <Users className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-body font-semibold text-navy">
              {count} colleagues from <span className="text-teal">{domain}</span> are already on WorldAML Academy
            </h3>
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed mb-3">
            Buying for the team? Get a <strong>20% bulk discount on 5+ seats</strong>, single invoice with PO support,
            consolidated certificates and an admin dashboard for your L&amp;D lead — no per-seat Stripe checkout required.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="accent" size="sm">
              <Link to={href}>
                Request team quote <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={href}>
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Invoice / PO flow
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamQuoteBanner;
