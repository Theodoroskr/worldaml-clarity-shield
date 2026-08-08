import { useState } from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LayoutGrid, GraduationCap } from "lucide-react";

/**
 * Public "Get Started" selector.
 * Presents a choice between the WorldAML Platform and the Academy
 * without assuming every visitor is a learner.
 */
export default function GetStartedSelector({
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
            Get Started
          </p>
        </div>

        <div className="p-3 pt-1 space-y-2">
          <div className="rounded-lg border border-border bg-surface-subtle p-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-md bg-navy text-white flex items-center justify-center">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-navy">Explore WorldAML Platform</div>
                <p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">
                  Compliance, screening, monitoring and reporting.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="mt-2.5 w-full text-[13px]" onClick={close}>
              <Link to="/platform/suite">Explore Platform</Link>
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-surface-subtle p-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-md bg-teal/10 text-teal flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-navy">Explore Academy</div>
                <p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">
                  Courses, certificates and compliance training.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-2.5 w-full text-[13px]" onClick={close}>
              <Link to="/academy">Explore Academy</Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
