import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, Handshake } from "lucide-react";

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
    <>
      {trigger(() => setOpen(true))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Where would you like to sign in?</DialogTitle>
            <DialogDescription>Choose the WorldAML environment you need.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-teal/10 text-teal flex items-center justify-center">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-navy">WorldAML Academy</div>
                  <p className="text-sm text-text-secondary">Courses, certificates &amp; learning</p>
                </div>
              </div>
              <Button asChild className="mt-3 w-full" onClick={close}>
                <Link to="/academy/login">Academy Sign In</Link>
              </Button>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
                  <Handshake className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-navy">WorldAML Partner Portal</div>
                  <p className="text-sm text-text-secondary">Partner resources &amp; account</p>
                </div>
              </div>
              <Button asChild variant="outline" className="mt-3 w-full" onClick={close}>
                <Link to="/partner/login">Partner Sign In</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
