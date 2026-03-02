/**
 * CrossSellCard — reusable cross-sell module used across worldaml.com
 *
 * Builds UTM-tagged external links and can carry optional entity context
 * (companyName, entityId) as URL params so the destination can pre-fill.
 */

import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrossSellCardProps {
  /** Destination hostname (no protocol) */
  domain: string;
  /** UTM source tag */
  utmSource: string;
  /** UTM medium tag */
  utmMedium: string;
  /** UTM campaign tag */
  utmCampaign: string;
  /** Accent color swatch — must be a valid CSS color string */
  accentColor?: string;
  /** Icon element rendered in the colour swatch */
  icon: React.ReactNode;
  /** Small eyebrow label */
  eyebrow: string;
  /** Main headline */
  headline: string;
  /** Supporting body copy */
  body: string;
  /** Bullet points (max 3 recommended) */
  bullets?: string[];
  /** CTA label */
  ctaLabel: string;
  /** Optional entity context forwarded to destination as query params */
  context?: {
    companyName?: string;
    entityId?: string;
  };
  /** Optional destination path after the hostname */
  destPath?: string;
  /** Visual variant */
  variant?: "default" | "inline" | "compact";
  className?: string;
}

/** Convert "hsl(H S% L%)" → "hsl(H S% L% / alpha)" */
function withAlpha(color: string, alpha: number) {
  // handles both "hsl(H S% L%)" and "hsl(H, S%, L%)" forms
  return color.replace(/\)$/, ` / ${alpha})`);
}

function buildUrl({
  domain,
  destPath = "",
  utmSource,
  utmMedium,
  utmCampaign,
  context,
}: Pick<
  CrossSellCardProps,
  "domain" | "destPath" | "utmSource" | "utmMedium" | "utmCampaign" | "context"
>) {
  const params = new URLSearchParams({
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
  });
  if (context?.companyName) params.set("company", context.companyName);
  if (context?.entityId) params.set("entity_id", context.entityId);
  return `https://${domain}${destPath}?${params.toString()}`;
}

export function CrossSellCard({
  domain,
  utmSource,
  utmMedium,
  utmCampaign,
  accentColor = "hsl(184 40% 40%)",
  icon,
  eyebrow,
  headline,
  body,
  bullets,
  ctaLabel,
  context,
  destPath,
  variant = "default",
  className,
}: CrossSellCardProps) {
  const href = buildUrl({ domain, destPath, utmSource, utmMedium, utmCampaign, context });

  if (variant === "compact") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-4 rounded-xl border border-[hsl(215_20%_90%)] bg-white px-5 py-4 hover:border-[hsl(215_20%_80%)] hover:shadow-sm transition-all group",
          className
        )}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
          style={{ background: accentColor }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[hsl(222_47%_11%)] leading-tight">{headline}</p>
          <p className="text-[12px] text-[hsl(215_20%_50%)] mt-0.5 truncate">{body}</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[hsl(215_20%_55%)] group-hover:text-[hsl(222_47%_11%)] transition-colors flex-shrink-0" />
      </a>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border bg-[hsl(215_20%_98%)] px-5 py-4",
          className
        )}
        style={{
          borderColor: withAlpha(accentColor, 0.2),
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
          style={{ background: accentColor }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: accentColor }}
          >
            {eyebrow}
          </p>
          <p className="text-[13px] font-semibold text-[hsl(222_47%_11%)]">{headline}</p>
          <p className="text-[12px] text-[hsl(215_20%_50%)] mt-0.5 leading-relaxed">{body}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 flex-shrink-0 text-[12px] font-semibold px-3.5 py-2 rounded-lg border transition-all hover:opacity-90"
          style={{
            color: accentColor,
            borderColor: withAlpha(accentColor, 0.25),
            background: withAlpha(accentColor, 0.06),
          }}
        >
          {ctaLabel}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // default card
  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden",
        className
      )}
      style={{
        borderColor: withAlpha(accentColor, 0.2),
      }}
    >
      {/* Thin colour stripe */}
      <div className="h-1 w-full" style={{ background: accentColor }} />

      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
            style={{ background: accentColor }}
          >
            {icon}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: accentColor }}
            >
              {eyebrow}
            </p>
            <p className="text-[15px] font-bold text-[hsl(222_47%_11%)] leading-tight">{headline}</p>
          </div>
        </div>

        <p className="text-[13px] text-[hsl(215_20%_45%)] leading-relaxed mb-4">{body}</p>

        {bullets && bullets.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-[12px] text-[hsl(215_20%_40%)]">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: accentColor }}
                />
                {b}
              </li>
            ))}
          </ul>
        )}

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: accentColor }}
        >
          {ctaLabel}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>

        <p className="mt-3 text-[11px] font-mono text-[hsl(215_20%_60%)]">{domain}</p>
      </div>
    </div>
  );
}
