import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
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

type NavChild = { href: string; label: string };
type NavGroup = { groupLabel: string; items: NavChild[] };

type NavLink =
  | { label: string; href?: string; children: NavChild[]; groups?: never }
  | { label: string; href?: string; groups: NavGroup[]; children?: never }
  | { label: string; href: string; children?: never; groups?: never };

const navLinks: NavLink[] = [
  {
    label: "WorldAML Suite",
    href: "/platform",
    groups: [
      {
        groupLabel: "Compliance Modules",
        items: [
          { href: "/platform/suite", label: "Suite Overview" },
          { href: "/platform/kyc-kyb", label: "KYC & KYB" },
          { href: "/platform/aml-screening", label: "AML Screening" },
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
      {
        groupLabel: "Data Sources",
        items: [
          { href: "/data-sources", label: "Overview" },
          { href: "/data-sources/worldcompliance", label: "WorldCompliance®" },
          { href: "/data-sources/bridger-xg", label: "Bridger Insight XG®" },
        ],
      },
    ],
  },
  { href: "/platform/api", label: "WorldAML API" },
  
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
        ],
      },
    ],
  },
  { href: "/pricing", label: "Pricing" },
  { href: "/academy", label: "Academy" },
  { href: "/partners", label: "Partners" },
  {
    label: "Resources",
    children: [
      { href: "/free-aml-check", label: "Free AML Check" },
      { href: "/industries", label: "Industries" },
      { href: "/news", label: "News" },
      { href: "/resources/best-practices", label: "Best Practices" },
      { href: "/resources/sanctions-lists", label: "Sanctions Lists" },
      { href: "/blog", label: "Blog" },
      { href: "/resources/glossary", label: "Compliance Glossary" },
      { href: "/resources/aml-regulations", label: "AML Regulations" },
      { href: "/data-coverage", label: "Data Coverage" },
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
  const { user, signOut } = useAuth();
  const headerRef = useRef<HTMLElement>(null);

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

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full border-b border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-enterprise">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-none flex items-center" aria-label="WorldAML home">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden 2xl:flex items-center gap-0.5 flex-1 justify-end min-w-0 ml-8">
            {navLinks.map((link) =>
              link.groups ? (
                /* Grouped two-column dropdown (WorldAML Suite) */
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "px-2.5 py-2 text-body-sm font-medium transition-colors rounded-md flex items-center gap-0.5 whitespace-nowrap",
                        link.href && location.pathname.startsWith(link.href)
                          ? "text-navy bg-secondary"
                          : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                      )}
                    >
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5" />
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
                        "px-2.5 py-2 text-body-sm font-medium transition-colors rounded-md flex items-center gap-0.5 whitespace-nowrap",
                        link.href && location.pathname.startsWith(link.href)
                          ? "text-navy bg-secondary"
                          : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                      )}
                    >
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5" />
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
                    "px-2.5 py-2 text-body-sm font-medium transition-colors rounded-md whitespace-nowrap",
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
          <div className="hidden 2xl:flex items-center gap-2 shrink-0">
            <RegionSelector />
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="2xl:hidden p-2 text-text-secondary hover:text-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="2xl:hidden py-4 border-t border-divider animate-slide-down max-h-[calc(100vh-4rem)] overflow-y-auto">
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
                {user ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        Log In
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
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
