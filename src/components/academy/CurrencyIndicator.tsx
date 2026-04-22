import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRegion } from "@/contexts/RegionContext";
import { REGION_TO_CURRENCY, currencyCode } from "@/lib/academyFx";

interface CurrencyIndicatorProps {
  variant?: "compact" | "full";
  showTooltip?: boolean;
  className?: string;
}

const TOOLTIP_TEXT =
  "Prices are converted from EUR using fixed reference rates (USD ×1.08, GBP ×0.86). The final charge is processed in your selected currency at Stripe Checkout, where VAT or sales tax is added based on your billing address.";

/**
 * Small muted indicator showing which currency/region the displayed Academy
 * price is derived from. `compact` shows just the ISO code; `full` shows
 * "EUR · EU & Middle East" with an optional ⓘ tooltip.
 */
export const CurrencyIndicator = ({
  variant = "compact",
  showTooltip = false,
  className = "",
}: CurrencyIndicatorProps) => {
  const { region, regionConfig } = useRegion();
  const currency = REGION_TO_CURRENCY[region] ?? "eur";
  const code = currencyCode(currency);

  if (variant === "compact") {
    return (
      <span
        className={`text-[10px] font-medium uppercase tracking-wide text-muted-foreground ${className}`}
        title={`${code} · ${regionConfig.name}`}
      >
        {code}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-caption text-muted-foreground ${className}`}>
      <span>
        {code} · {regionConfig.name}
      </span>
      {showTooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="How prices are calculated"
              className="inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Info className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-caption leading-relaxed">
            {TOOLTIP_TEXT}
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
};

export default CurrencyIndicator;
