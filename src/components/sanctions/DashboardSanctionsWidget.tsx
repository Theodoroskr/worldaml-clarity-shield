import { useState } from "react";
import { Shield, Zap, ChevronDown, ChevronUp, ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SanctionsSearchForm } from "./SanctionsSearchForm";
import { SanctionsResultCard } from "./SanctionsResultCard";
import { SanctionsDisclaimerBanner } from "./SanctionsDisclaimerBanner";

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

const VISIBLE_DEFAULT = 5;

export const DashboardSanctionsWidget = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async ({ name, country, type }: { name: string; country: string; type: string }) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setShowAll(false);
    setLastQuery(name);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/sanctions-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": anonKey,
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ name, country, type }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setResults(data.results ?? []);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const visibleResults = results ? (showAll ? results : results.slice(0, VISIBLE_DEFAULT)) : [];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 text-teal">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Sanctions Quick Check</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Screen against OFAC, EU, UN & HMT lists</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {remaining !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20 text-sm font-medium text-teal">
                <Zap className="w-3.5 h-3.5" />
                {remaining} searches remaining
              </div>
            )}
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground gap-1.5">
              <Link to="/sanctions-check">
                Full search page
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search form */}
        <SanctionsSearchForm onSearch={handleSearch} loading={loading} />

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Results */}
        {results !== null && !error && (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium ${
              results.length === 0
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-destructive/5 border-destructive/20 text-destructive"
            }`}>
              {results.length === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  No matches found for <strong>"{lastQuery}"</strong> — not on any screened list
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {results.length} match{results.length !== 1 ? "es" : ""} found for <strong>"{lastQuery}"</strong>
                </>
              )}
            </div>

            {/* Result cards */}
            {visibleResults.length > 0 && (
              <div className="space-y-3">
                {visibleResults.map((r, i) => (
                  <SanctionsResultCard key={r.id} result={r} index={i} />
                ))}

                {results.length > VISIBLE_DEFAULT && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? (
                      <><ChevronUp className="w-4 h-4 mr-1.5" /> Show fewer results</>
                    ) : (
                      <><ChevronDown className="w-4 h-4 mr-1.5" /> Show all {results.length} results</>
                    )}
                  </Button>
                )}
              </div>
            )}

            <SanctionsDisclaimerBanner />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
