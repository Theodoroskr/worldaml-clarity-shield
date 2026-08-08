import { ReactNode, useState } from "react";
import { Outlet, Link, Navigate, useNavigate } from "react-router-dom";
import { Menu, PanelLeftClose, PanelLeft, LifeBuoy, LogOut, User, CreditCard, Loader2, ShoppingCart, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlements } from "@/hooks/useEntitlements";
import AppSidebarNav, { SidebarBrand } from "./AppSidebarNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

export function AppPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

/**
 * AcademyUserLayout — the authenticated WorldAML Academy learner shell.
 * Deliberately contains no admin, Suite or RCM navigation.
 */
export default function AppShellLayout() {
  const { user, profile, isLoading, signOut } = useAuth();
  const { planLabel } = useEntitlements();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const cart = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const displayName = profile?.full_name || user.email || "";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const UserFooter = ({ mini }: { mini?: boolean }) => (
    <div className="border-t border-border p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn(
            "w-full flex items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted transition-colors",
            mini && "justify-center px-0",
          )}>
            <span className="h-7 w-7 shrink-0 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center">
              {initials || "U"}
            </span>
            {!mini && (
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-foreground truncate">{displayName}</span>
                <span className="block text-[11px] text-muted-foreground truncate">{user.email}</span>
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56 bg-popover z-50">
          <DropdownMenuLabel className="font-normal">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/account/profile"><User className="h-4 w-4 mr-2" /> Profile</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/account/billing"><CreditCard className="h-4 w-4 mr-2" /> Purchases & Billing</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/account/security"><ShieldCheck className="h-4 w-4 mr-2" /> Security</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><a href="/support"><LifeBuoy className="h-4 w-4 mr-2" /> Help & Support</a></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card shrink-0 transition-all duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarBrand collapsed={collapsed} />
        <AppSidebarNav collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mx-2 mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? <PanelLeft className="h-4 w-4 mx-auto" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse</>}
        </button>
        <UserFooter mini={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 flex flex-col">
          <SidebarBrand />
          <AppSidebarNav onNavigate={() => setMobileOpen(false)} />
          <UserFooter />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30 flex items-center gap-2 px-3 sm:px-5">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold text-foreground">WorldAML Academy</span>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-medium">{planLabel}</Badge>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild aria-label={`Basket (${cart.count} items)`} className="relative">
              <Link to="/dashboard/cart">
                <ShoppingCart className="h-4 w-4" />
                {cart.count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
                    {cart.count}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Help and support">
              <a href="/support"><LifeBuoy className="h-4 w-4" /></a>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center hover:bg-primary/20 transition-colors"
                  aria-label="Account menu"
                >
                  {initials || "U"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium truncate">{displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/account/profile"><User className="h-4 w-4 mr-2" /> Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/account/billing"><CreditCard className="h-4 w-4 mr-2" /> Purchases & Billing</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/account/security"><ShieldCheck className="h-4 w-4 mr-2" /> Security</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><a href="/support"><LifeBuoy className="h-4 w-4 mr-2" /> Help & Support</a></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
