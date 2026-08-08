import { useState } from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { GraduationCap, Handshake, Building2 } from "lucide-react";

/**
 * Public sign-in selector. Admin is intentionally NOT listed.
 */
export default function SignInSelector({
  trigger,
  onNavigate,
}: {
  trigger: (open: () => void) => React.ReactNode;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const close = () => { setOpen(false); onNavigate?.(); };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger(() => setOpen(true))}</PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
            Sign in to WorldAML
          </p>
        </div>

        <div className="p-3 pt-1 space-y-2">
          <div className="rounded-lg border border-border bg-surface-subtle p-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-md bg-teal/10 text-teal flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-navy">WorldAML Academy</div>
                <p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">
                  Access your courses, progress and certificates.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="mt-2.5 w-full text-[13px]" onClick={close}>
              <Link to="/academy/login">Academy Sign In</Link>
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-surface-subtle p-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-md bg-navy/10 text-navy flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-navy">Business Account</div>
                <p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">
                  Manage your products, subscriptions, invoices and quotes.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-2.5 w-full text-[13px]" onClick={close}>
              <Link to="/business/login">Business Sign In</Link>
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-surface-subtle p-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-md bg-navy/10 text-navy flex items-center justify-center">
                <Handshake className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-navy">WorldAML Partner Portal</div>
                <p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">
                  Access your partner resources and account.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-2.5 w-full text-[13px]" onClick={close}>
              <Link to="/partner/login">Partner Sign In</Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
