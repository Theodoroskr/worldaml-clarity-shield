import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { RegionSelector } from "./RegionSelector";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  {
    label: "Platform",
    href: "/platform",
    children: [
      { href: "/platform", label: "Overview" },
      { href: "/platform/suite", label: "WorldAML Suite" },
      { href: "/platform/api", label: "WorldAML API" },
      { href: "/platform/security", label: "Security" },
    ],
  },
  {
    label: "Data Sources",
    href: "/data-sources",
    children: [
      { href: "/data-sources", label: "Overview" },
      { href: "/data-sources/worldcompliance", label: "WorldCompliance®" },
      { href: "/data-sources/bridger-xg", label: "Bridger Insight XG®" },
    ],
  },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-enterprise">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <DropdownMenu key={link.href}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "px-4 py-2 text-body-sm font-medium transition-colors rounded-md flex items-center gap-1",
                        location.pathname.startsWith(link.href)
                          ? "text-navy bg-secondary"
                          : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                      )}
                    >
                      {link.label}
                      <ChevronDown className="h-4 w-4" />
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
                  to={link.href}
                  className={cn(
                    "px-4 py-2 text-body-sm font-medium transition-colors rounded-md",
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
          <div className="hidden md:flex items-center gap-3">
            <RegionSelector />
            <Button variant="ghost" size="sm" asChild>
              <a href="https://suite.worldaml.com/login" target="_blank" rel="noopener noreferrer">
                Log In
              </a>
            </Button>
            <Button size="sm" asChild>
              <Link to="/get-started">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-divider animate-slide-down">
            <div className="mb-4">
              <RegionSelector />
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.href} className="space-y-1">
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
                    to={link.href}
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
                <Button variant="outline" asChild>
                  <a 
                    href="https://suite.worldaml.com/login" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </a>
                </Button>
                <Button asChild>
                  <Link to="/get-started" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
