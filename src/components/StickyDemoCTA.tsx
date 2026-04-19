import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyDemoCTAProps {
  product?: string; // 'aml' | 'kyc' | 'tm' | 'reporting' (passed via ?product= to prefill form)
  label?: string;
}

/**
 * Floating "Book a Demo" pill that appears on product pages after 25% scroll.
 * Pre-fills the qualifying form via ?source= and ?product= params.
 */
const StickyDemoCTA = ({ product, label = "Book a Suite Demo" }: StickyDemoCTAProps) => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? window.scrollY / total : 0;
      setVisible(pct > 0.25);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  const params = new URLSearchParams();
  params.set("source", location.pathname.replace(/^\//, "") || "home");
  if (product) params.set("product", product);

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Button
        variant="accent"
        size="lg"
        asChild
        className="group shadow-2xl shadow-navy/30 rounded-full pl-5 pr-6"
      >
        <Link to={`/book-demo?${params.toString()}`}>
          {label}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="h-8 w-8 rounded-full bg-white border border-divider text-text-secondary hover:text-navy shadow flex items-center justify-center"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default StickyDemoCTA;
