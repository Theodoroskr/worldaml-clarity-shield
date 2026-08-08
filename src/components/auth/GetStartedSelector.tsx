import { useState } from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { GraduationCap, Handshake, Building2 } from "lucide-react";

type Option = {
  key: string;
  icon: typeof GraduationCap;
  title: string;
  body: string;
  cta: string;
  to: string;
  primary?: boolean;
};

const options: Option[] = [
  {
    key: "academy",
    icon: GraduationCap,
    title: "WorldAML Academy",
    body: "Learn AML and compliance, earn CPD hours and certificates.",
    cta: "Create Academy Account",
    to: "/signup",
    primary: true,
  },
  {
    key: "business",
    icon: Building2,
    title: "Business Account",
    body: "Buy WorldAML products, manage subscriptions, invoices and quotes.",
    cta: "Create Business Account",
    to: "/business/signup",
  },
  {
    key: "partner",
    icon: Handshake,
    title: "Partner Programme",
    body: "Refer or resell WorldAML and earn commission.",
    cta: "Apply as a Partner",
    to: "/partner/signup",
  },
];

/**
 * Public "Get Started" selector — pick the account type before signing up.
 */
export default function GetStartedSelector({
  trigger,
  onNavigate,
}: {
  trigger: (open: () => void) => React.ReactNode;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger(() => setOpen(true))}</PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
            Create your account
          </p>
        </div>

        <div className="p-3 pt-1 space-y-2">
          {options.map(({ key, icon: Icon, title, body, cta, to, primary }) => (
            <div key={key} className="rounded-lg border border-border bg-surface-subtle p-3">
              <div className="flex items-start gap-3">
                <div
                  className={
                    primary
                      ? "h-8 w-8 shrink-0 rounded-md bg-teal/10 text-teal flex items-center justify-center"
                      : "h-8 w-8 shrink-0 rounded-md bg-navy/10 text-navy flex items-center justify-center"
                  }
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-navy">{title}</div>
                  <p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">{body}</p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                variant={primary ? "default" : "outline"}
                className="mt-2.5 w-full text-[13px]"
                onClick={close}
              >
                <Link to={to}>{cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
