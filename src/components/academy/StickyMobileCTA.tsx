import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Crown, Loader2 } from "lucide-react";

interface StickyMobileCTAProps {
  onAnnualClick: () => void;
  annualLoading: boolean;
  annualPriceLabel: string;
  showAfter?: number;
}

/**
 * Mobile-only sticky bottom bar with the current Academy offer:
 *  - "Start free" → AML Fundamentals
 *  - "Annual Pass €199" → existing checkout flow
 * Appears after the user scrolls past the hero (default 480px).
 */
const StickyMobileCTA = ({
  onAnnualClick,
  annualLoading,
  annualPriceLabel,
  showAfter = 480,
}: StickyMobileCTAProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return (
    <div
      role="region"
      aria-label="Academy quick actions"
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-2 mb-2 rounded-2xl border border-white/15 bg-primary/95 backdrop-blur-md shadow-2xl">
        <div className="px-3 pt-2 text-center text-[11px] font-medium text-teal-light">
          Limited offer · Annual Pass {annualPriceLabel} — all courses
        </div>
        <div className="flex items-stretch gap-2 p-2">
          <Button asChild variant="accent" size="sm" className="flex-1 font-semibold">
            <Link to="/academy/aml-fundamentals">
              <BookOpen className="h-4 w-4" /> Start free
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold"
            onClick={onAnnualClick}
            disabled={annualLoading}
          >
            {annualLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Opening…
              </>
            ) : (
              <>
                <Crown className="h-4 w-4" /> Annual {annualPriceLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
