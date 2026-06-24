import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import AcademyLogo from "@/components/AcademyLogo";
import AcademyCartButton from "@/components/academy/AcademyCartDrawer";

const navLinks = [
  { href: "/", label: "Courses" },
  { href: "/?tab=annual", label: "Annual Pass" },
  { href: "/templates", label: "Templates" },
];

/**
 * Slim, learner-focused header rendered on the academy.* subdomain.
 * Intentionally omits the main site's Platform / Data Sources / Markets
 * navigation so the experience feels like a standalone Academy site.
 */
export const AcademyHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const headerRef = useRef<HTMLElement>(null);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

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
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="container-enterprise">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex-none flex items-center" aria-label="WorldAML Academy home">
            <AcademyLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-6 mr-4 min-w-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3 py-2 text-body-sm font-medium rounded-md transition-colors whitespace-nowrap",
                  location.pathname === link.href
                    ? "text-navy bg-secondary"
                    : "text-text-secondary hover:text-navy hover:bg-secondary/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            <AcademyCartButton />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[140px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-caption text-text-tertiary truncate">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/">
                      <GraduationCap className="h-4 w-4 mr-2" /> My Courses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Create account</Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-md text-text-secondary hover:bg-secondary/50"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-divider pt-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-body-sm font-medium rounded-md text-text-secondary hover:bg-secondary/50"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-divider mt-2 flex flex-col gap-2">
              {user ? (
                <Button variant="outline" size="sm" onClick={handleSignOut} className="justify-start">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">Create account</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AcademyHeader;
