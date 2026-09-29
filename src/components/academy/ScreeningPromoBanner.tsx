import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "academy-screening-promo";

export default function ScreeningPromoBanner({ className = "" }: { className?: string }) {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });
  if (hidden) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setHidden(true);
  };

  return (
    <div
      role="region"
      aria-label="WorldAML Screening & Monitoring"
      className={`relative rounded-xl border border-border bg-card p-4 pr-10 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-start gap-2 min-w-0">
          <ShieldCheck className="h-4 w-4 mt-0.5 text-accent shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Put your training into practice</span> — screen customers
            against 1,900+ sanctions, PEP and adverse media lists with WorldAML Screening &amp; Monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="accent">
            <Link to="/screening-monitoring">
              See screening plans <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
          <Link
            to="/sanctions-check"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Try the free sanctions check
          </Link>
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
