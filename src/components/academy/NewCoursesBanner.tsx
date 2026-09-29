import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isNewCoursePromoActive } from "@/data/academyPricing";

const STORAGE_KEY = "academy-new-courses-2026-09";

export default function NewCoursesBanner({ to = "/academy#catalogue", className = "" }: { to?: string; className?: string }) {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });
  if (hidden || !isNewCoursePromoActive()) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setHidden(true);
  };

  return (
    <div role="region" aria-label="New courses" className={`relative rounded-xl border border-accent/40 bg-accent/10 p-4 pr-10 ${className}`}>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-start gap-2 min-w-0">
          <Sparkles className="h-4 w-4 mt-0.5 text-accent shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold text-accent">New:</span> Trade-Based Money Laundering &amp; Export Controls, AML for Fintechs &amp; Payments, Source of Funds &amp; Wealth
          </p>
        </div>
        <Button asChild size="sm">
          <Link to={to}>Browse new courses <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link>
        </Button>
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
