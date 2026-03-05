import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, ExternalLink, BookOpen, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  sortedGlossaryTerms,
  glossaryLetters,
} from "@/data/glossaryTerms";

/* ─── Highlight matched text ─── */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-teal/20 text-teal-dark rounded px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/* ─── useCountUp hook ─── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.round(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { value, ref };
}

/* ─── useInView hook for card fade-in ─── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated term card ─── */
function TermCard({ term, query, delay }: { term: typeof sortedGlossaryTerms[0]; query: string; delay: number }) {
  const { ref, visible } = useInView(0.05);
  const anchor = term.term.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      id={anchor}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "rounded-xl border border-divider bg-background p-6 scroll-mt-32 transition-all duration-500",
        "hover:border-teal/40 hover:shadow-[0_0_24px_hsl(var(--teal)/0.12)] hover:-translate-y-0.5",
        "relative overflow-hidden group",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Teal left-border accent */}
      <span className="absolute left-0 top-0 h-full w-0.5 bg-teal/0 group-hover:bg-teal/60 transition-all duration-300 rounded-l-xl" />

      {/* Term heading */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-heading-sm font-bold text-navy leading-tight">
            <Highlight text={term.term} query={query} />
          </h2>
          {term.abbreviation && (
            <span className="inline-block mt-1 text-caption font-semibold text-teal bg-teal/10 rounded-full px-2.5 py-0.5">
              {term.abbreviation}
            </span>
          )}
        </div>
        <a
          href={`#${anchor}`}
          className="text-text-tertiary hover:text-navy transition-colors flex-shrink-0 mt-1"
          aria-label={`Link to ${term.term}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Definition */}
      <p className="text-body-sm text-text-secondary leading-relaxed mb-4">
        <Highlight text={term.definition} query={query} />
      </p>

      {/* Related terms */}
      {term.relatedTerms && term.relatedTerms.length > 0 && (
        <div className="mb-3">
          <span className="text-caption text-text-tertiary font-medium mr-2">Related:</span>
          {term.relatedTerms.map((rt, i) => {
            const match = sortedGlossaryTerms.find((t) => t.abbreviation === rt || t.term === rt);
            const matchAnchor = match
              ? match.term.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
              : null;
            return (
              <span key={rt}>
                {matchAnchor ? (
                  <a href={`#${matchAnchor}`} className="text-caption text-teal hover:underline">
                    {rt}
                  </a>
                ) : (
                  <span className="text-caption text-text-tertiary">{rt}</span>
                )}
                {i < (term.relatedTerms?.length ?? 0) - 1 && (
                  <span className="text-text-tertiary mx-1">,</span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Related links */}
      {term.relatedLinks && term.relatedLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-divider">
          {term.relatedLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="inline-flex items-center gap-1 text-caption text-navy font-medium hover:text-teal transition-colors py-1"
            >
              <ArrowRight className="h-3 w-3" />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

/* ─── Stat counter chip ─── */
function StatChip({ target, label, suffix = "+" }: { target: number; label: string; suffix?: string }) {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className="text-2xl font-bold text-white tabular-nums">
        {value}{suffix}
      </span>
      <span className="text-xs text-white/60 mt-0.5 whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const Glossary = () => {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const azNavRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return sortedGlossaryTerms.filter((t) => {
      const matchesSearch =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.abbreviation?.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q);
      const matchesLetter = !activeLetter || t.term[0].toUpperCase() === activeLetter;
      return matchesSearch && matchesLetter;
    });
  }, [query, activeLetter]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach((t) => {
      const letter = t.term[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(t);
    });
    return map;
  }, [filtered]);

  const presentLetters = Object.keys(grouped).sort();

  // Scroll active letter button into view in the AZ nav
  const scrollLetterIntoView = useCallback((letter: string) => {
    const nav = azNavRef.current;
    if (!nav) return;
    const btn = nav.querySelector(`[data-letter="${letter}"]`) as HTMLElement | null;
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "AML & Compliance Glossary",
    description:
      "Definitions of key terms used in anti-money laundering, KYC/KYB, sanctions screening, and financial crime compliance.",
    url: "https://www.worldaml.com/resources/glossary",
    hasDefinedTerm: sortedGlossaryTerms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.abbreviation ? `${t.term} (${t.abbreviation})` : t.term,
      description: t.definition,
      inDefinedTermSet: "https://www.worldaml.com/resources/glossary",
      url: `https://www.worldaml.com/resources/glossary#${t.term.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="AML & Compliance Glossary"
        description="Definitions of 40+ key compliance terms — AML, KYC, KYB, PEP, SAR, CDD, EDD, UBO, FATF, OFAC, and more. A reference guide for compliance professionals."
        canonical="/resources/glossary"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/glossary" },
          { name: "Compliance Glossary", url: "/resources/glossary" },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative bg-navy overflow-hidden py-16 md:py-24">
          {/* Dot pattern background */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Teal gradient glow */}
          <div
            aria-hidden="true"
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(var(--teal)/0.18) 0%, transparent 70%)" }}
          />

          <div className="container-enterprise relative z-10">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal/80 bg-teal/10 border border-teal/20 rounded-full px-3 py-1 mb-5">
                Resources
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                AML & Compliance<br className="hidden sm:block" /> Glossary
              </h1>
              <p className="text-white/60 text-lg mb-8 max-w-xl">
                Plain-English definitions of the key terms used in anti-money laundering, KYC/KYB, sanctions screening, and financial crime compliance.
              </p>

              {/* Search */}
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search terms or definitions…"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActiveLetter(null); }}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal/60 focus:border-teal/40 backdrop-blur-sm transition-all text-sm"
                />
                {query && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/50 tabular-nums pointer-events-none">
                    {filtered.length} of {sortedGlossaryTerms.length}
                  </span>
                )}
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/10">
              <StatChip target={sortedGlossaryTerms.length} label="Terms Defined" />
              <div className="w-px h-8 bg-white/10" />
              <StatChip target={10} label="Jurisdictions" />
              <div className="w-px h-8 bg-white/10" />
              <StatChip target={100} label="Free Access" suffix="%" />
              <div className="hidden sm:block w-px h-8 bg-white/10" />
              <span className="hidden sm:block text-xs text-white/40">Updated {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </section>

        {/* ── A–Z Nav (horizontal scroll on mobile) ── */}
        <nav
          className="border-b border-divider bg-background sticky top-16 z-30"
          aria-label="Alphabet filter"
        >
          <div className="container-enterprise py-2">
            {/* overflow-x-auto for mobile horizontal scroll */}
            <div
              ref={azNavRef}
              className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <button
                onClick={() => { setActiveLetter(null); setQuery(""); }}
                className={cn(
                  "flex-shrink-0 px-3 h-9 rounded text-sm font-medium transition-colors whitespace-nowrap",
                  !activeLetter && !query
                    ? "bg-navy text-white"
                    : "text-text-secondary hover:text-navy hover:bg-secondary/60"
                )}
              >
                All
              </button>
              {glossaryLetters.map((letter) => (
                <button
                  key={letter}
                  data-letter={letter}
                  onClick={() => {
                    setActiveLetter(letter);
                    setQuery("");
                    scrollLetterIntoView(letter);
                    const el = document.getElementById(`letter-${letter}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={cn(
                    "flex-shrink-0 w-9 h-9 rounded text-sm font-medium transition-colors",
                    activeLetter === letter
                      ? "bg-navy text-white"
                      : "text-text-secondary hover:text-navy hover:bg-secondary/60"
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* ── Terms ── */}
        <section className="py-12 md:py-16">
          <div className="container-enterprise">
            {/* Result count (when filtering) */}
            {(query || activeLetter) && filtered.length > 0 && (
              <p className="text-sm text-text-tertiary mb-6">
                Showing <span className="font-semibold text-navy">{filtered.length}</span> of {sortedGlossaryTerms.length} terms
              </p>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <BookOpen className="h-10 w-10 text-text-tertiary mx-auto mb-4" />
                <p className="text-lg text-text-secondary">No terms matched your search.</p>
                <button
                  onClick={() => { setQuery(""); setActiveLetter(null); }}
                  className="mt-4 text-teal text-sm font-medium hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {presentLetters.map((letter) => (
                  <div key={letter} id={`letter-${letter}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-5xl font-bold text-navy/10 leading-none w-12 flex-shrink-0">
                        {letter}
                      </span>
                      <div className="flex-1 border-t border-divider" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pl-4 sm:pl-16">
                      {grouped[letter].map((term, i) => (
                        <TermCard
                          key={term.term}
                          term={term}
                          query={query}
                          delay={Math.min(i * 60, 300)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="border-t border-divider bg-surface-subtle py-12">
          <div className="container-enterprise text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-navy mb-3">
              Put compliance knowledge into practice
            </h2>
            <p className="text-text-secondary mb-6">
              WorldAML automates the controls behind these concepts — from KYC/KYB onboarding and PEP screening to transaction monitoring and regulatory reporting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy text-white font-medium px-6 py-2.5 hover:bg-navy/90 transition-colors"
              >
                Request a Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/sanctions-check"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-divider text-navy font-medium px-6 py-2.5 hover:bg-background transition-colors"
              >
                Free Sanctions Check
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Glossary;
