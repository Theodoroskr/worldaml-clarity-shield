import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Shield, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SanctionsSearchForm } from "@/components/sanctions/SanctionsSearchForm";
import { SanctionsResultCard } from "@/components/sanctions/SanctionsResultCard";
import { SanctionsQuotaBanner } from "@/components/sanctions/SanctionsQuotaBanner";
import { SanctionsDisclaimerBanner } from "@/components/sanctions/SanctionsDisclaimerBanner";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SESSION_KEY = "worldaml_sc_session";

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
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [searchedName, setSearchedName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => {
    return sessionStorage.getItem(SESSION_KEY) || "";
  });

  // Quota gating: anon users get 1 visible result, then must sign up
  const [anonSearchCount, setAnonSearchCount] = useState<number>(() => {
    return parseInt(sessionStorage.getItem("worldaml_sc_count") || "0");
  });

  const isAnonymous = !user;
  const isGated = isAnonymous && anonSearchCount >= 1;

  const handleSearch = async (params: { name: string; country: string; type: string }) => {
    if (isGated) return; // blocked
    setLoading(true);
    setError(null);
    setSearchedName(params.name);

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
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Sanctions Quick Check | WorldAML"
        description="Free open-source sanctions screening tool. Check names against OFAC, EU, UN, and HMT sanctions lists instantly."
      />

      {/* Hero */}
      <section className="bg-navy section-padding-sm">
        <div className="container-enterprise max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-body-sm font-medium mb-6">
            <Shield className="w-3.5 h-3.5" />
            Free Sanctions Tool
          </div>
          <h1 className="text-display text-primary-foreground mb-4">
            Sanctions Quick Check
          </h1>
          <p className="text-body-lg text-slate-light max-w-xl mx-auto">
            Instantly search OFAC SDN, EU Consolidated, UN Security Council, and HMT Asset Freeze lists.
            Open-source data, no signup required for your first search.
          </p>
        </div>
      </section>

      {/* Search area */}
      <section className="section-padding bg-background">
        <div className="container-enterprise max-w-3xl mx-auto space-y-6">

          <SanctionsDisclaimerBanner />

          {/* Search form — gated after 1 anon search */}
          {!isGated ? (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <SanctionsSearchForm onSearch={handleSearch} loading={loading} />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm opacity-60 pointer-events-none select-none">
              <SanctionsSearchForm onSearch={() => {}} loading={false} />
            </div>
          )}

          {/* Quota banner */}
          {(results !== null || isGated) && (
            <SanctionsQuotaBanner
              remaining={remaining ?? (isAnonymous ? (isGated ? 0 : 1) : 5)}
              isAuthenticated={!isAnonymous}
            />
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-body-sm">{error}</span>
            </div>
          )}

          {/* Results */}
          {results !== null && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-body font-semibold text-foreground">
                  {results.length === 0
                    ? `No matches found for "${searchedName}"`
                    : `${results.length} match${results.length !== 1 ? "es" : ""} found for "${searchedName}"`}
                </h2>
                {results.length === 0 && (
                  <div className="flex items-center gap-1.5 text-body-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4" />
                    Clear
                  </div>
                )}
              </div>

              {results.length === 0 ? (
                <div className="border border-border bg-muted/40 rounded-xl p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">No matches on open-source lists</p>
                    <p className="text-body-sm text-muted-foreground mt-1">
                      This search returned no hits on OFAC SDN, EU Consolidated, UN Security Council, or HMT Asset Freeze lists.
                      For comprehensive screening including 1,900+ global lists, monitoring alerts, and audit trail, upgrade to WorldAML.
                    </p>
                  </div>
                </div>
              ) : (
                results.map((r, i) => <SanctionsResultCard key={r.id} result={r} index={i} />)
              )}

              {/* Bottom CTA */}
              <div className="border border-border rounded-xl p-5 bg-muted/30 flex items-start gap-3">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-body-sm text-foreground font-medium">This is open-source coverage only.</p>
                  <p className="text-body-sm text-muted-foreground">
                    WorldAML screens against 1,900+ global risk lists with real-time monitoring, 
                    audit trail, adverse media, API access and enterprise-grade match quality.
                  </p>
                  <div className="flex gap-2 flex-wrap pt-1">
                    <Button size="sm" asChild>
                      <Link to="/contact-sales">Talk to Sales</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/platform/api">Explore WorldAML API</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-surface-subtle">
        <div className="container-enterprise max-w-3xl mx-auto">
          <h2 className="text-headline text-navy text-center mb-10">What's covered in this free check?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { source: "OFAC SDN", desc: "US Treasury's Specially Designated Nationals list", flag: "🇺🇸", updated: "Jan 2025" },
              { source: "EU Consolidated List", desc: "European Union consolidated sanctions list", flag: "🇪🇺", updated: "Jan 2025" },
              { source: "UN Security Council", desc: "United Nations ISIL/Al-Qaida and Taliban lists", flag: "🇺🇳", updated: "Jan 2025" },
              { source: "HMT Asset Freeze", desc: "UK His Majesty's Treasury financial sanctions", flag: "🇬🇧", updated: "Jan 2025" },
            ].map((s) => (
              <div key={s.source} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">{s.flag}</span>
                <div>
                  <p className="font-semibold text-foreground text-body-sm">{s.source}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">Updated: {s.updated}</p>
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
