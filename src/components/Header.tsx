import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, User, Lock } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { RegionSelector } from "./RegionSelector";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { isAcademyHost } from "@/lib/academyHost";
import AcademyHeader from "@/components/academy/AcademyHeader";
import { AcademyCartButton } from "@/components/academy/AcademyCartDrawer";
import SignInSelector from "@/components/auth/SignInSelector";
import GetStartedSelector from "@/components/auth/GetStartedSelector";
import AccountMenu, { WORKSPACES } from "@/components/auth/AccountMenu";
import { usePortalAccess, PORTAL_HOME } from "@/hooks/usePortalAccess";




type NavChild = { href: string; label: string };
type NavGroup = { groupLabel: string; items: NavChild[] };

type NavLink =
  | { label: string; href?: string; children: NavChild[]; groups?: never }
  | { label: string; href?: string; groups: NavGroup[]; children?: never }
  | { label: string; href: string; children?: never; groups?: never };

const navLinks: NavLink[] = [
  {
    label: "Platform",
    href: "/platform",
    groups: [
      {
        groupLabel: "Compliance Modules",
        items: [
          { href: "/platform/suite", label: "Suite Overview" },
          { href: "/platform/kyc-kyb", label: "KYC & KYB" },
          { href: "/screening", label: "AML Screening" },
          { href: "/platform/risk-assessment", label: "Risk Assessment" },
        ],
      },
      {
        groupLabel: "Platform",
        items: [
          { href: "/platform/transaction-monitoring", label: "Transaction Monitoring" },
          { href: "/platform/regulatory-reporting", label: "Regulatory Reporting" },
          { href: "/products/worldid", label: "WorldID" },
          { href: "/platform/security", label: "Security" },
        ],
      },
    ],
  },
  { href: "/platform/api", label: "API" },
  
  {
    label: "Markets",
    groups: [
      {
        groupLabel: "Europe",
        items: [
          { href: "/markets/uk", label: "United Kingdom" },
          { href: "/markets/germany", label: "Germany" },
          { href: "/markets/netherlands", label: "Netherlands" },
          { href: "/markets/ireland", label: "Ireland" },
          { href: "/markets/greece", label: "Greece" },
          { href: "/markets/cyprus", label: "Cyprus" },
          { href: "/markets/malta", label: "Malta" },
          { href: "/markets/romania", label: "Romania" },
        ],
      },
      {
        groupLabel: "Global",
        items: [
          { href: "/markets/usa", label: "United States" },
          { href: "/markets/singapore", label: "Singapore" },
          { href: "/markets/uae", label: "UAE" },
          { href: "/markets/south-africa", label: "South Africa" },
          { href: "/markets/nigeria", label: "Nigeria" },
          { href: "/markets/east-africa", label: "East Africa" },
        ],
      },
    ],
  },
  { href: "/pricing", label: "Pricing" },
  { href: "/academy", label: "Academy" },
  { href: "/advisory", label: "Advisory" },
  { href: "/partners", label: "Partners" },
  {
    label: "Resources",
    children: [
      { href: "/industries", label: "Industries" },
      { href: "/news", label: "News" },
      { href: "/resources/best-practices", label: "Best Practices" },
      { href: "/resources/sanctions-lists", label: "Sanctions Lists" },
      { href: "/blog", label: "Blog" },
      { href: "/resources/glossary", label: "Compliance Glossary" },
      { href: "/resources/aml-regulations", label: "AML Regulations" },
      { href: "/eu-sanctions-map", label: "EU Sanctions Map" },
      { href: "/faq", label: "FAQ" },
      { href: "/support", label: "Support" },
      { href: "/about", label: "About" },
    ],
  },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, profile } = useAuth();
  const { has } = usePortalAccess();
  const headerRef = useRef<HTMLElement>(null);
  const academyHost = isAcademyHost();



  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  // Close mobile menu on outside click/tap
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [mobileMenuOpen]);

  // Academy subdomain: render the slim learner-focused header.
  if (academyHost) return <AcademyHeader />;

  return (

    <header ref={headerRef} className="sticky top-0 z-50 w-full border-b border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-enterprise">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-none flex items-center" aria-label="WorldAML home">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0 ml-4 mr-3 min-w-0">
            {navLinks.map((link) =>
              link.groups ? (
                /* Grouped two-column dropdown (WorldAML Suite) */
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "px-1.5 py-1.5 text-xs font-medium transition-colors rounded-md flex items-center gap-0.5 whitespace-nowrap",
                        link.href && location.pathname.startsWith(link.href)
                          ? "text-navy bg-secondary"
                          : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                      )}
                    >
                      {link.label}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="p-3 w-auto">
                    <div className="grid grid-cols-3 gap-x-4">
                      {link.groups.map((group) => (
                        <div key={group.groupLabel}>
                          <DropdownMenuLabel className="text-caption font-semibold text-text-tertiary uppercase tracking-wider px-2 pb-1">
                            {group.groupLabel}
                          </DropdownMenuLabel>
                          {group.items.map((child) => (
                            <DropdownMenuItem key={child.href} asChild>
                              <Link
                                to={child.href}
                                className={cn(
                                  "w-full",
                                  location.pathname === child.href && "bg-secondary"
                                )}
                              >
                                {child.label}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : link.children ? (
                /* Standard single-column dropdown */
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "px-1.5 py-1.5 text-xs font-medium transition-colors rounded-md flex items-center gap-0.5 whitespace-nowrap",
                        link.href && location.pathname.startsWith(link.href)
                          ? "text-navy bg-secondary"
                          : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                      )}
                    >
                      {link.label}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {link.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link
                          to={child.href}
                          className={cn(
                            "w-full",
                            location.pathname === child.href && "bg-secondary"
                          )}
                        >
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.href}
                  to={link.href!}
                  className={cn(
                    "px-1.5 py-1.5 text-xs font-medium transition-colors rounded-md whitespace-nowrap",
                    location.pathname === link.href
                      ? "text-navy bg-secondary"
                      : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA & Region */}
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            <RegionSelector />
            <AcademyCartButton iconOnly />
            {user ? (

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">Account</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <AccountMenu />
              </DropdownMenu>
            ) : (
              <>
                <SignInSelector
                  trigger={(open) => (
                    <Button variant="ghost" size="sm" onClick={open}>Sign In</Button>
                  )}
                />
                <GetStartedSelector
                  trigger={(open) => (
                    <Button size="sm" onClick={open}>Get Started</Button>
                  )}
                />
              </>
            )}

          </div>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden p-2 text-text-secondary hover:text-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-divider animate-slide-down max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="mb-4">
              <RegionSelector />
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.groups ? (
                  /* Grouped mobile section (WorldAML Suite) */
                  <div key={link.label} className="space-y-1">
                    <span className="px-4 py-2 text-body-sm font-semibold text-navy block">
                      {link.label}
                    </span>
                    {link.groups.map((group, gi) => (
                      <div key={group.groupLabel}>
                        {gi > 0 && <div className="mx-4 my-1 border-t border-divider" />}
                        <span className="px-8 py-1 text-caption font-semibold text-text-tertiary uppercase tracking-wider block">
                          {group.groupLabel}
                        </span>
                        {group.items.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "px-10 py-2 text-body-sm transition-colors rounded-md block",
                              location.pathname === child.href
                                ? "text-navy bg-secondary"
                                : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : link.children ? (
                  <div key={link.label} className="space-y-1">
                    <span className="px-4 py-2 text-body-sm font-semibold text-navy block">
                      {link.label}
                    </span>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "px-8 py-2 text-body-sm transition-colors rounded-md block",
                          location.pathname === child.href
                            ? "text-navy bg-secondary"
                            : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 text-body font-medium transition-colors rounded-md",
                      location.pathname === link.href
                        ? "text-navy bg-secondary"
                        : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-divider">
                <div className="flex" onClick={() => setMobileMenuOpen(false)}>
                  <AcademyCartButton />
                </div>
                {user ? (

                  <>
                    <div className="px-1 pt-1 pb-2">
                      <div className="text-sm font-semibold text-navy truncate">{profile?.full_name || "My account"}</div>
                      <div className="text-xs text-text-tertiary truncate">{user.email}</div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold px-1">Workspaces</div>
                    {WORKSPACES.filter((w) => has(w.key)).map(({ key, label, description, icon: Icon }) => (
                      <Button key={key} variant="outline" asChild className="justify-start h-auto py-2">
                        <Link to={PORTAL_HOME[key]} onClick={() => setMobileMenuOpen(false)} className="flex items-start gap-2.5">
                          <Icon className="h-4 w-4 mt-0.5 text-teal shrink-0" />
                          <span className="text-left">
                            <span className="block text-sm font-medium">{label}</span>
                            <span className="block text-[11px] text-text-tertiary font-normal">{description}</span>
                          </span>
                        </Link>
                      </Button>
                    ))}
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/account/profile" onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2" /> My Profile
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/account/security" onClick={() => setMobileMenuOpen(false)}>
                        <Lock className="h-4 w-4 mr-2" /> Security
                      </Link>
                    </Button>
                    <Button onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <SignInSelector
                      onNavigate={() => setMobileMenuOpen(false)}
                      trigger={(open) => (
                        <Button variant="outline" onClick={open}>Sign In</Button>
                      )}
                    />
                    <GetStartedSelector
                      onNavigate={() => setMobileMenuOpen(false)}
                      trigger={(open) => (
                        <Button onClick={open}>Get Started</Button>
                      )}
                    />
                  </>
                )}

              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
