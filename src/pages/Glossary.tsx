import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, ExternalLink, BookOpen, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  sortedGlossaryTerms,
  glossaryLetters,
} from "@/data/glossaryTerms";

const Glossary = () => {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return sortedGlossaryTerms.filter((t) => {
      const matchesSearch =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.abbreviation?.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q);
      const matchesLetter =
        !activeLetter || t.term[0].toUpperCase() === activeLetter;
      return matchesSearch && matchesLetter;
    });
  }, [query, activeLetter]);

  // Group by first letter for rendering
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
        {/* Hero */}
        <section className="bg-surface-subtle border-b border-divider py-16 md:py-20">
          <div className="container-enterprise">
            <div className="max-w-2xl" ref={topRef}>
              <Badge variant="secondary" className="mb-4">Resources</Badge>
              <h1 className="text-display-sm md:text-display font-bold text-navy mb-4">
                AML & Compliance Glossary
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                Plain-English definitions of the key terms used in anti-money laundering, KYC/KYB, sanctions screening, and financial crime compliance.
              </p>
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search terms or definitions…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveLetter(null);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </section>

        {/* A–Z Nav */}
        <nav
          className="border-b border-divider bg-background sticky top-16 z-30"
          aria-label="Alphabet filter"
        >
          <div className="container-enterprise py-2">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => { setActiveLetter(null); setQuery(""); }}
                className={cn(
                  "px-3 py-1 rounded text-body-sm font-medium transition-colors",
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
                  onClick={() => {
                    setActiveLetter(letter);
                    setQuery("");
                    // scroll to section
                    const el = document.getElementById(`letter-${letter}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={cn(
                    "w-8 h-8 rounded text-body-sm font-medium transition-colors",
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

        {/* Terms */}
        <section className="py-12 md:py-16">
          <div className="container-enterprise">
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <BookOpen className="h-10 w-10 text-text-tertiary mx-auto mb-4" />
                <p className="text-body-lg text-text-secondary">No terms matched your search.</p>
                <button
                  onClick={() => { setQuery(""); setActiveLetter(null); }}
                  className="mt-4 text-brand-teal text-body-sm font-medium hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {presentLetters.map((letter) => (
                  <div key={letter} id={`letter-${letter}`}>
                    {/* Letter header */}
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-display-sm font-bold text-navy/10 leading-none w-12 flex-shrink-0">
                        {letter}
                      </span>
                      <div className="flex-1 border-t border-divider" />
                    </div>

                    {/* Terms in this letter */}
                    <div className="grid md:grid-cols-2 gap-4 pl-16">
                      {grouped[letter].map((term) => {
                        const anchor = term.term
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "");
                        return (
                          <article
                            key={term.term}
                            id={anchor}
                            className="rounded-xl border border-divider bg-background p-6 scroll-mt-32 hover:border-navy/30 hover:shadow-sm transition-all"
                          >
                            {/* Term heading */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <h2 className="text-heading-sm font-bold text-navy leading-tight">
                                  {term.term}
                                </h2>
                                {term.abbreviation && (
                                  <span className="inline-block mt-1 text-caption font-semibold text-brand-teal bg-brand-teal/10 rounded px-2 py-0.5">
                                    {term.abbreviation}
                                  </span>
                                )}
                              </div>
                              {/* Anchor copy */}
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
                              {term.definition}
                            </p>

                            {/* Related terms */}
                            {term.relatedTerms && term.relatedTerms.length > 0 && (
                              <div className="mb-3">
                                <span className="text-caption text-text-tertiary font-medium mr-2">
                                  Related:
                                </span>
                                {term.relatedTerms.map((rt, i) => {
                                  // Try to find a matching term to link to
                                  const match = sortedGlossaryTerms.find(
                                    (t) => t.abbreviation === rt || t.term === rt
                                  );
                                  const matchAnchor = match
                                    ? match.term.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                                    : null;
                                  return (
                                    <span key={rt}>
                                      {matchAnchor ? (
                                        <a
                                          href={`#${matchAnchor}`}
                                          className="text-caption text-brand-teal hover:underline"
                                        >
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
                                    className="inline-flex items-center gap-1 text-caption text-navy font-medium hover:text-brand-teal transition-colors"
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                    {link.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-divider bg-surface-subtle py-12">
          <div className="container-enterprise text-center max-w-2xl mx-auto">
            <h2 className="text-heading-lg font-bold text-navy mb-3">
              Put compliance knowledge into practice
            </h2>
            <p className="text-body text-text-secondary mb-6">
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
