import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Lock } from "lucide-react";

interface Props {
  remaining: number;
  isAuthenticated: boolean;
  onSignupClick?: () => void;
}

export const SanctionsQuotaBanner = ({ remaining, isAuthenticated, onSignupClick }: Props) => {
  if (isAuthenticated && remaining > 0) {
    return (
      <div className="flex items-center justify-between bg-muted/60 border border-border rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-body-sm text-foreground">
            <strong>{remaining}</strong> free search{remaining !== 1 ? "es" : ""} remaining
          </span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/contact-sales">Upgrade for unlimited</Link>
        </Button>
      </div>
    );
  }

  if (isAuthenticated && remaining === 0) {
    return (
      <div className="border border-primary/30 bg-primary/5 rounded-xl p-5 text-center space-y-3">
        <Lock className="w-6 h-6 text-primary mx-auto" />
        <p className="font-semibold text-foreground">You've used all 5 free searches</p>
        <p className="text-body-sm text-muted-foreground">
          Upgrade to WorldAML for unlimited screening, monitoring alerts, audit trail, and API access.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button asChild>
            <Link to="/contact-sales">Talk to Sales</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Anonymous — CTA to sign up for 5 free searches
  return (
    <div className="border border-accent/30 bg-accent/5 rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground">Create a free account for 5 searches + save results</p>
          <p className="text-body-sm text-muted-foreground mt-1">
            Sign up in 30 seconds — no credit card required.
          </p>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Button asChild onClick={onSignupClick}>
          <Link to="/signup">Create Free Account</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Already have an account?</Link>
        </Button>
      </div>
    </div>
  );
};
