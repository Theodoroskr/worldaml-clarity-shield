import { Link, useLocation } from "react-router-dom";
import {
  GraduationCap, Building2, Handshake, ShieldCheck, Shield, User, Lock, LogOut, Check,
} from "lucide-react";
import {
  DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { usePortalAccess, PortalKey, PORTAL_HOME } from "@/hooks/usePortalAccess";
import { cn } from "@/lib/utils";


type WorkspaceDef = {
  key: PortalKey;
  label: string;
  description: string;
  icon: typeof User;
  match: (path: string) => boolean;
};

export const WORKSPACES: WorkspaceDef[] = [
  {
    key: "academy",
    label: "WorldAML Academy",
    description: "Courses, certificates & learning",
    icon: GraduationCap,
    match: (p) => p.startsWith("/dashboard") || p.startsWith("/academy") || p.startsWith("/courses"),
  },
  {
    key: "business",
    label: "Business Portal",
    description: "Products, team & billing",
    icon: Building2,
    match: (p) => p.startsWith("/business"),
  },
  {
    key: "partner",
    label: "Partner Portal",
    description: "Deals, commissions & resources",
    icon: Handshake,
    match: (p) => p.startsWith("/partner"),
  },
  {
    key: "admin",
    label: "Admin",
    description: "Internal administration",
    icon: ShieldCheck,
    match: (p) => p.startsWith("/admin"),
  },
];

/** Account / workspace switcher shown in the header when signed in. */
export default function AccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user, profile, signOut } = useAuth();
  const { has } = usePortalAccess();
  const location = useLocation();

  const available = WORKSPACES.filter((w) => has(w.key));
  const current = available.find((w) => w.match(location.pathname))?.key;

  return (
    <DropdownMenuContent align="end" className="w-72 p-1.5">
      <DropdownMenuLabel className="px-2 py-1.5">
        <div className="text-sm font-semibold text-foreground truncate">
          {profile?.full_name || "My account"}
        </div>
        <div className="text-xs font-normal text-muted-foreground truncate">{user?.email}</div>
      </DropdownMenuLabel>

      {available.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="px-2 pt-1 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Workspaces
          </DropdownMenuLabel>
          {available.map(({ key, label, description, icon: Icon }) => {
            const active = key === current;
            return (
              <DropdownMenuItem key={key} asChild className={cn("px-2 py-2", active && "bg-secondary")}>
                <Link to={PORTAL_HOME[key]} onClick={onNavigate} className="flex items-start gap-2.5">
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", active ? "text-teal" : "text-muted-foreground")} />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-teal shrink-0" />}
                    </span>
                    <span className="block text-[11px] leading-tight text-muted-foreground truncate">
                      {description}
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </>
      )}

      <DropdownMenuSeparator />
      <DropdownMenuItem asChild className="px-2">
        <Link to="/account/profile" onClick={onNavigate}>
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">My Profile</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="px-2">
        <Link to="/account/security" onClick={onNavigate}>
          <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">Security</span>
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="px-2 text-destructive focus:text-destructive"
        onClick={() => { onNavigate?.(); void signOut(); }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Sign Out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
