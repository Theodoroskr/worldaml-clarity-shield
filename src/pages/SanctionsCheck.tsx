import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Shield, Info, ChevronDown, Lock } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SanctionsSearchForm } from "@/components/sanctions/SanctionsSearchForm";
import { SanctionsResultCard } from "@/components/sanctions/SanctionsResultCard";
import { SanctionsDisclaimerBanner } from "@/components/sanctions/SanctionsDisclaimerBanner";
import SEO from "@/components/SEO";
import { LogoIcon } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SESSION_KEY = "worldaml_sc_session";
// Anonymous: show 2 full results, then fade+lock remaining
const ANON_FREE_VISIBLE = 2;

interface SearchResult {
  id: string;
  name: string;
  aliases: string[];
  entity_type: string;
  nationality: string;
  list_source: string;
  list_updated: string;
  designation_date: string;
  programs: string[];
  match_score: number;
  matched_on: string;
  confidence: "Exact" | "High" | "Possible";
}

interface SearchResponse {
  results: SearchResult[];
  session_id: string;
  remaining: number;
  total_searched: number;
  disclaimer: string;
  error?: string;
}

export default function SanctionsCheck() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [searchedName, setSearchedName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    return sessionStorage.getItem(SESSION_KEY) || "";
  });
  const [anonSearchCount, setAnonSearchCount] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("worldaml_sc_count") || "0");
  });

  const isAnonymous = !user;
  const isGated = isAnonymous && anonSearchCount >= 1;

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !results && !loading) {
      handleSearch({ name: q, country: "", type: "" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (params: { name: string; country: string; type: string }) => {
    if (isGated) return;
    setLoading(true);
    setError(null);
    setSearchedName(params.name);
    setResults(null);
    setShowAll(false);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/sanctions-search`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };

      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...params, session_id: sessionId }),
      });

      const data: SearchResponse = await res.json();

      if (data.error === "quota_exceeded") {
        setRemaining(0);
        setResults([]);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Search failed. Please try again.");
        return;
      }

      setResults(data.results);
      setRemaining(data.remaining);

      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
        sessionStorage.setItem(SESSION_KEY, data.session_id);
      }

      if (isAnonymous) {
        const newCount = anonSearchCount + 1;
        setAnonSearchCount(newCount);
        sessionStorage.setItem("worldaml_sc_count", String(newCount));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Which results to render
  const visibleFull = results ? (
    isAnonymous ? results.slice(0, ANON_FREE_VISIBLE) : (showAll ? results : results.slice(0, 5))
  ) : [];
  const lockedResults = results && isAnonymous ? results.slice(ANON_FREE_VISIBLE) : [];
  const hiddenAuthResults = results && !isAnonymous && !showAll ? results.slice(5) : [];

  const hasMore = results && results.length > (isAnonymous ? ANON_FREE_VISIBLE : 5);
  const lockedCount = isAnonymous ? lockedResults.length : 0;

  return (
    <>
      <SEO
        title="Sanctions Quick Check | WorldAML"
        description="Free open-source sanctions screening tool. Check names against OFAC, EU, UN, and HMT sanctions lists instantly."
      />

      {/* Hero */}
      <section className="bg-navy section-padding-sm">
        <div className="container-enterprise max-w-4xl mx-auto text-center">
          {/* Mini brand header */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <LogoIcon size="sm" className="text-white/90 group-hover:text-white transition-colors" />
              <div className="flex items-baseline gap-0.5">
                <span className="font-normal tracking-tight text-white/90 group-hover:text-white text-lg transition-colors">World</span>
                <span className="font-semibold tracking-tight text-white/90 group-hover:text-white text-lg transition-colors">AML</span>
              </div>
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-body-sm font-medium mb-5">
            <Shield className="w-3.5 h-3.5" />
            Free Open-Source Sanctions Tool
          </div>
          <h1 className="text-display text-primary-foreground mb-3">
            Sanctions Quick Check
          </h1>
          <p className="text-body-lg text-slate-light max-w-xl mx-auto mb-6">
            Screen against OFAC SDN, EU Consolidated, UN Security Council, and HMT Asset Freeze.
          </p>
          {/* Source pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "OFAC SDN", flag: "🇺🇸" },
              { label: "EU Consolidated", flag: "🇪🇺" },
              { label: "UN Security Council", flag: "🇺🇳" },
              { label: "HMT Asset Freeze", flag: "🇬🇧" },
            ].map((s) => (
              <span key={s.label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-slate-light">
                {s.flag} {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="section-padding bg-background">
        <div className="container-enterprise max-w-4xl mx-auto space-y-6">

          <SanctionsDisclaimerBanner />

          {/* Search form */}
          <div className={cn(
            "bg-card border border-border rounded-xl p-6 shadow-sm",
            isGated && "opacity-60 pointer-events-none select-none"
          )}>
            <SanctionsSearchForm onSearch={isGated ? () => {} : handleSearch} loading={loading} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-body-sm">{error}</span>
            </div>
          )}

          {/* ─── Results ─────────────────────────────────────────────── */}
          {results !== null && (
            <div className="space-y-3">

              {/* Results header bar */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <h2 className="text-body font-semibold text-foreground">
                    {results.length === 0
                      ? `No matches — "${searchedName}"`
                      : `${results.length} match${results.length !== 1 ? "es" : ""} found`}
                  </h2>
                  {results.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      for "{searchedName}"
                    </span>
                  )}
                </div>
                {results.length === 0 && (
                  <div className="flex items-center gap-1.5 text-body-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4" />
                    Clear
                  </div>
                )}
                {results.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {isAnonymous && lockedCount > 0 && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        {lockedCount} hidden — sign up to view
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* No results */}
              {results.length === 0 ? (
                <div className="border border-border bg-muted/30 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">No matches on open-source lists</p>
                    <p className="text-body-sm text-muted-foreground mt-1">
                      No hits on OFAC SDN, EU Consolidated, UN Security Council, or HMT Asset Freeze lists.
                      For comprehensive screening across 1,900+ global lists, upgrade to WorldAML.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Visible results */}
                  {visibleFull.map((r, i) => (
                    <SanctionsResultCard key={r.id} result={r} index={i} />
                  ))}

                  {/* ── Locked/faded rows for anonymous ── */}
                  {isAnonymous && lockedCount > 0 && (
                    <div className="relative">
                      {/* Show 1-2 faded locked cards */}
                      <div className="space-y-3">
                        {lockedResults.slice(0, 2).map((r, i) => (
                          <SanctionsResultCard
                            key={r.id}
                            result={r}
                            index={visibleFull.length + i}
                            locked
                          />
                        ))}
                      </div>

                      {/* If more than 2 locked, stack a blur pile */}
                      {lockedCount > 2 && (
                        <div className="relative mt-3 h-28 overflow-hidden rounded-xl">
                          <div className="absolute inset-0 bg-card border border-border rounded-xl opacity-40 scale-[0.98]" />
                          <div className="absolute inset-0 bg-card border border-border rounded-xl opacity-20 scale-[0.96]" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">
                              +{lockedCount - 2} more results hidden
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Registration gate overlay */}
                      <div className="mt-4 bg-card border border-primary/20 rounded-2xl p-6 text-center shadow-md space-y-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-navy/10 border border-navy/20 mx-auto">
                          <Lock className="w-5 h-5 text-navy" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-body">
                            {lockedCount} more result{lockedCount !== 1 ? "s" : ""} found
                          </p>
                          <p className="text-body-sm text-muted-foreground mt-1">
                            Create a free account to view all matches, save results, and run 5 free searches.
                          </p>
                        </div>
                        <div className="flex gap-3 justify-center flex-wrap">
                          <Button size="default" asChild>
                            <Link to="/signup">Create Free Account</Link>
                          </Button>
                          <Button variant="ghost" size="default" asChild>
                            <Link to="/login">Log in</Link>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No credit card required · 30-second setup
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Show more for authenticated users ── */}
                  {!isAnonymous && hasMore && !showAll && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-xl text-body-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Show {hiddenAuthResults.length} more result{hiddenAuthResults.length !== 1 ? "s" : ""}
                    </button>
                  )}

                  {!isAnonymous && showAll && hiddenAuthResults.length > 0 && (
                    hiddenAuthResults.map((r, i) => (
                      <SanctionsResultCard
                        key={r.id}
                        result={r}
                        index={visibleFull.length + i}
                      />
                    ))
                  )}
                </>
              )}

              {/* Free search remaining (authenticated) */}
              {!isAnonymous && remaining !== null && remaining >= 0 && (
                <div className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-body-sm">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{remaining}</strong> free search{remaining !== 1 ? "es" : ""} remaining
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/contact-sales">Upgrade for unlimited</Link>
                  </Button>
                </div>
              )}

              {/* Bottom upgrade CTA */}
              <div className="border border-border rounded-xl p-5 bg-muted/20 flex items-start gap-3">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="text-body-sm font-semibold text-foreground">Open-source data only.</p>
                  <p className="text-body-sm text-muted-foreground">
                    WorldAML screens 1,900+ global risk lists with real-time monitoring, audit trail, adverse media, and API access.
                  </p>
                  <div className="flex gap-2 flex-wrap pt-1">
                    <Button size="sm" asChild><Link to="/contact-sales">Talk to Sales</Link></Button>
                    <Button variant="outline" size="sm" asChild><Link to="/platform/api">Explore API</Link></Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gated state (anonymous, used their 1 search) */}
          {isGated && results === null && (
            <div className="border border-primary/20 bg-card rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-navy/10 border border-navy/20 mx-auto">
                <Lock className="w-5 h-5 text-navy" />
              </div>
              <div>
                <p className="font-bold text-foreground">You've used your free search</p>
                <p className="text-body-sm text-muted-foreground mt-1">
                  Create a free account for 5 searches, result history, and saved reports.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button asChild><Link to="/signup">Create Free Account</Link></Button>
                <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Coverage section */}
      <section className="section-padding bg-surface-subtle">
        <div className="container-enterprise max-w-4xl mx-auto">
          <h2 className="text-headline text-navy text-center mb-10">Lists covered in this free check</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { source: "OFAC SDN", desc: "US Treasury Specially Designated Nationals", flag: "🇺🇸", updated: "Jan 2025", count: "~15k entries" },
              { source: "EU Consolidated", desc: "European Union consolidated sanctions", flag: "🇪🇺", updated: "Jan 2025", count: "~2.1k entries" },
              { source: "UN Security Council", desc: "ISIL/Al-Qaida and Taliban lists", flag: "🇺🇳", updated: "Jan 2025", count: "~900 entries" },
              { source: "HMT Asset Freeze", desc: "UK financial sanctions register", flag: "🇬🇧", updated: "Jan 2025", count: "~3.5k entries" },
            ].map((s) => (
              <div key={s.source} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.flag}</span>
                  <p className="font-semibold text-foreground text-body-sm">{s.source}</p>
                </div>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">{s.count}</span>
                  <span className="text-xs text-muted-foreground">Updated {s.updated}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-body-sm text-muted-foreground mt-6">
            Need 1,900+ lists, real-time monitoring, and audit trail?{" "}
            <Link to="/contact-sales" className="text-accent hover:underline font-medium">Talk to Sales →</Link>
          </p>
        </div>
      </section>
    </>
  );
}
