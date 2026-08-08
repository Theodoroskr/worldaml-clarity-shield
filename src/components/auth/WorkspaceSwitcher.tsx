import { Link } from "react-router-dom";
import { Check, GraduationCap, Handshake, Building2 } from "lucide-react";
import {
  DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePortalAccess, PortalKey } from "@/hooks/usePortalAccess";

/**
 * Subtle workspace switcher — only rendered when the user genuinely holds more
 * than one customer-facing entitlement. Admin is never advertised here.
 */
export default function WorkspaceSwitcher({ current }: { current: PortalKey }) {
  const { academyAccess, partnerAccess, businessAccess } = usePortalAccess();
  const count = [academyAccess, partnerAccess, businessAccess].filter(Boolean).length;
  if (count < 2) return null;

  const Row = ({ to, active, label, icon: Icon }: { to: string; active: boolean; label: string; icon: typeof Check }) => (
    <DropdownMenuItem asChild>
      <Link to={to} className="flex items-center gap-2">
        {active ? <Check className="h-4 w-4 text-teal" /> : <Icon className="h-4 w-4 opacity-60" />}
        <span>{label}</span>
      </Link>
    </DropdownMenuItem>
  );

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
        Switch Workspace
      </DropdownMenuLabel>
      {businessAccess && <Row to="/business/dashboard" active={current === "business"} label="WorldAML Business" icon={Building2} />}
      {academyAccess && <Row to="/dashboard" active={current === "academy"} label="WorldAML Academy" icon={GraduationCap} />}
      {partnerAccess && <Row to="/partner/dashboard" active={current === "partner"} label="WorldAML Partner Portal" icon={Handshake} />}
    </>
  );
}
