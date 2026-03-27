import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const StickyBottomCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-navy/95 backdrop-blur-sm border-t border-white/10 py-3 px-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="container-enterprise flex items-center justify-between gap-4">
        <p className="text-primary-foreground text-body-sm sm:text-body hidden sm:block">
          See how WorldAML can streamline your compliance — <span className="text-teal-light font-semibold">no commitment required</span>
        </p>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button size="sm" variant="accent" asChild className="group flex-1 sm:flex-none">
            <Link to="/contact-sales">
              Request a Demo
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="sm" variant="outline-light" asChild className="flex-1 sm:flex-none">
            <Link to="/free-aml-check">
              Try Free Check
            </Link>
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyBottomCTA;
