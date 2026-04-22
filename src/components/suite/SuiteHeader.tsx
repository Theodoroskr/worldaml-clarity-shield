import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  Search,
  Zap,
  FileText,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Configuration ─────────────────────────────────────────────────────────────

export type SuiteProduct = "worldaml" | "worldkycsearch" | "duediligenceworld";

interface SuiteHeaderProps {
  /** Which site is this header rendered on */
  currentProduct: SuiteProduct;
  /** Optional override login URL */
  loginHref?: string;
}

const products: {
  id: SuiteProduct;
  name: string;
  tagline: string;
  domain: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "worldaml",
    name: "WorldAML API",
    tagline: "AML screening & risk decisioning via REST API",
    domain: "worldaml.com",
    icon: <Zap className="w-4 h-4" />,
    color: "hsl(184 40% 40%)",
  },
  {
    id: "worldkycsearch",
    name: "WorldKYC Search",
    tagline: "Self-serve identity and PEP/sanctions lookup",
    domain: "worldkycsearch.com",
    icon: <Search className="w-4 h-4" />,
    color: "hsl(222 47% 40%)",
  },
  {
    id: "duediligenceworld",
    name: "Due Diligence World",
    tagline: "Enhanced due diligence reports on demand",
    domain: "duediligenceworld.com",
    icon: <FileText className="w-4 h-4" />,
    color: "hsl(260 40% 45%)",
  },
];

const solutions = [
  {
    href: "/platform/api",
    label: "WorldAML API",
    description: "Embed AML screening into any workflow via REST",
    icon: <Zap className="w-4 h-4 text-[hsl(184_40%_40%)]" />,
  },
  {
    href: "/sanctions-check",
    label: "WorldKYC Search",
    description: "Instant PEP, sanctions & adverse media lookup",
    icon: <Search className="w-4 h-4 text-[hsl(222_47%_40%)]" />,
  },
  {
    href: "/platform/suite",
    label: "Due Diligence Reports",
    description: "On-demand enhanced due diligence for high-risk entities",
    icon: <FileText className="w-4 h-4 text-[hsl(260_40%_45%)]" />,
  },
];

const resourceLinks = [
  { href: "/resources/best-practices", label: "Best Practices" },
  { href: "/news", label: "News & Insights" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About WorldAML" },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export const SuiteHeader = ({
  currentProduct = "worldaml",
  loginHref = "/login",
}: SuiteHeaderProps) => {
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const current = products.find((p) => p.id === currentProduct)!;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(215_20%_90%)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex h-[60px] items-center justify-between gap-6">

            {/* ── Left: Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-7 h-7 rounded-md bg-[hsl(222_47%_11%)] flex items-center justify-center">
                <LayoutGrid className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-[hsl(222_47%_11%)] text-[15px] tracking-tight">
                WorldAML <span className="font-light text-[hsl(215_20%_45%)]">Suite</span>
              </span>
            </Link>

            {/* ── Centre: Nav ── */}
            <nav className="hidden md:flex items-center gap-0.5">

              {/* Solutions dropdown */}
              <div ref={solutionsRef} className="relative">
                <button
                  onClick={() => { setSolutionsOpen(!solutionsOpen); setResourcesOpen(false); }}
                  className={cn(
                    "flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium rounded-md transition-colors",
                    solutionsOpen
                      ? "text-[hsl(222_47%_11%)] bg-[hsl(215_20%_96%)]"
                      : "text-[hsl(215_20%_45%)] hover:text-[hsl(222_47%_11%)] hover:bg-[hsl(215_20%_96%)]"
                  )}
                >
                  Solutions
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", solutionsOpen && "rotate-180")} />
                </button>

                {solutionsOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-80 rounded-xl border border-[hsl(215_20%_90%)] bg-white shadow-lg shadow-black/5 p-2 animate-in fade-in-0 zoom-in-95 duration-100">
                    {solutions.map((s) => (
                      <Link
                        key={s.href}
                        to={s.href}
                        onClick={() => setSolutionsOpen(false)}
                        className="flex items-start gap-3 rounded-lg p-3 hover:bg-[hsl(215_20%_98%)] transition-colors group"
                      >
                        <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md border border-[hsl(215_20%_90%)] flex items-center justify-center bg-white">
                          {s.icon}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[hsl(222_47%_11%)] group-hover:text-[hsl(184_40%_40%)] transition-colors">
                            {s.label}
                          </p>
                          <p className="text-[12px] text-[hsl(215_20%_45%)] leading-relaxed mt-0.5">
                            {s.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Static links */}
              {[
                { href: "/data-sources", label: "Data Sources" },
                { href: "/pricing", label: "Pricing" },
                { href: "https://worldaml.readme.io", label: "Docs", external: true },
              ].map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium rounded-md text-[hsl(215_20%_45%)] hover:text-[hsl(222_47%_11%)] hover:bg-[hsl(215_20%_96%)] transition-colors"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "px-3.5 py-2 text-[13px] font-medium rounded-md transition-colors",
                      location.pathname === link.href
                        ? "text-[hsl(222_47%_11%)] bg-[hsl(215_20%_96%)]"
                        : "text-[hsl(215_20%_45%)] hover:text-[hsl(222_47%_11%)] hover:bg-[hsl(215_20%_96%)]"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}

              {/* Resources dropdown */}
              <div ref={resourcesRef} className="relative">
                <button
                  onClick={() => { setResourcesOpen(!resourcesOpen); setSolutionsOpen(false); }}
                  className={cn(
                    "flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium rounded-md transition-colors",
                    resourcesOpen
                      ? "text-[hsl(222_47%_11%)] bg-[hsl(215_20%_96%)]"
                      : "text-[hsl(215_20%_45%)] hover:text-[hsl(222_47%_11%)] hover:bg-[hsl(215_20%_96%)]"
                  )}
                >
                  Resources
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", resourcesOpen && "rotate-180")} />
                </button>

                {resourcesOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-52 rounded-xl border border-[hsl(215_20%_90%)] bg-white shadow-lg shadow-black/5 py-1.5 animate-in fade-in-0 zoom-in-95 duration-100">
                    {resourceLinks.map((r) => (
                      <Link
                        key={r.href}
                        to={r.href}
                        onClick={() => setResourcesOpen(false)}
                        className="block px-4 py-2 text-[13px] text-[hsl(215_20%_45%)] hover:text-[hsl(222_47%_11%)] hover:bg-[hsl(215_20%_98%)] transition-colors"
                      >
                        {r.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* ── Right: Switch Product + Login ── */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {/* Switch product pill */}
              <button
                onClick={() => setSwitchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(215_20%_88%)] bg-[hsl(215_20%_98%)] hover:bg-[hsl(215_20%_94%)] transition-colors text-[12px] font-medium text-[hsl(222_47%_11%)]"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: current.color }}
                />
                {current.name}
                <ChevronDown className="w-3 h-3 text-[hsl(215_20%_55%)]" />
              </button>

              {/* Login */}
              <Button size="sm" asChild className="text-[13px] h-8 px-4">
                <Link to={loginHref}>Log In</Link>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-[hsl(215_20%_45%)] hover:text-[hsl(222_47%_11%)]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* ── Mobile nav ── */}
          {mobileOpen && (
            <div className="md:hidden py-4 border-t border-[hsl(215_20%_90%)] space-y-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-[hsl(215_20%_55%)]">Solutions</p>
              {solutions.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[hsl(215_20%_40%)] hover:bg-[hsl(215_20%_96%)] transition-colors"
                >
                  {s.icon}
                  <span className="font-medium text-[hsl(222_47%_11%)]">{s.label}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-[hsl(215_20%_92%)] mt-2 space-y-1">
                <Link to="/data-sources" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-[13px] font-medium text-[hsl(215_20%_40%)] hover:text-[hsl(222_47%_11%)]">Data Sources</Link>
                <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-[13px] font-medium text-[hsl(215_20%_40%)] hover:text-[hsl(222_47%_11%)]">Pricing</Link>
                <a href="https://worldaml.readme.io" target="_blank" rel="noopener noreferrer" className="block px-3 py-2.5 text-[13px] font-medium text-[hsl(215_20%_40%)]">Docs ↗</a>
              </div>
              <div className="pt-3 flex flex-col gap-2">
                <button
                  onClick={() => { setSwitchOpen(true); setMobileOpen(false); }}
                  className="flex items-center justify-center gap-2 py-2 rounded-lg border border-[hsl(215_20%_88%)] text-[13px] font-medium text-[hsl(222_47%_11%)]"
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: current.color }} />
                  Switch product
                </button>
                <Button asChild className="text-[13px]">
                  <Link to={loginHref} onClick={() => setMobileOpen(false)}>Log In</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Switch Product Modal ── */}
      <Dialog open={switchOpen} onOpenChange={setSwitchOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[hsl(215_20%_92%)]">
            <DialogTitle className="text-[15px] font-semibold text-[hsl(222_47%_11%)]">
              Switch product
            </DialogTitle>
            <p className="text-[13px] text-[hsl(215_20%_45%)] mt-1">
              All products share a single WorldAML login.
            </p>
          </DialogHeader>

          <div className="p-3 space-y-1">
            {products.map((p) => {
              const isCurrent = p.id === currentProduct;
              return (
                <a
                  key={p.id}
                  href={`https://${p.domain}`}
                  target={isCurrent ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  onClick={() => setSwitchOpen(false)}
                  className={cn(
                    "flex items-start gap-4 rounded-xl p-4 transition-colors border",
                    isCurrent
                      ? "border-[hsl(215_20%_88%)] bg-[hsl(215_20%_98%)] cursor-default"
                      : "border-transparent hover:border-[hsl(215_20%_88%)] hover:bg-[hsl(215_20%_98%)] cursor-pointer"
                  )}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                    style={{ background: p.color }}
                  >
                    {p.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-[hsl(222_47%_11%)]">{p.name}</p>
                      {isCurrent && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[hsl(184_40%_40%)] text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[hsl(215_20%_45%)] mt-0.5 leading-relaxed">{p.tagline}</p>
                    <p className="text-[11px] text-[hsl(215_20%_60%)] mt-1 font-mono">{p.domain}</p>
                  </div>
                  {!isCurrent && <ArrowUpRight className="w-4 h-4 text-[hsl(215_20%_55%)] flex-shrink-0 mt-1" />}
                </a>
              );
            })}
          </div>

          <div className="px-6 pb-5 pt-2">
            <p className="text-[11px] text-[hsl(215_20%_60%)] text-center">
              Need help choosing?{" "}
              <Link to="/contact-sales" onClick={() => setSwitchOpen(false)} className="text-[hsl(184_40%_40%)] hover:underline">
                Talk to our team →
              </Link>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuiteHeader;
