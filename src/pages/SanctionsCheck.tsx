import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Shield, AlertTriangle, CheckCircle2, Loader2, Globe, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface SanctionsHit {
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
  confidence: string;
}

interface SearchResponse {
  results?: SanctionsHit[];
  session_id?: string;
  remaining?: number;
  total_searched?: number;
  disclaimer?: string;
  error?: string;
}

const SESSION_KEY = "waml_sanctions_session";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Free Sanctions Check",
  url: "https://worldaml.com/sanctions-check",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Free sanctions screening tool. Check names and companies against global sanctions, PEP and watchlists covering 1,900+ lists worldwide.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  provider: { "@type": "Organization", name: "WorldAML", url: "https://worldaml.com" },
};

const confidenceStyle = (confidence: string) => {
  const c = confidence.toLowerCase();
  if (c.includes("high") || c.includes("exact")) return "bg-red-100 text-red-700 border-red-200";
  if (c.includes("medium")) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-secondary text-secondary-foreground border-border";
};

const SanctionsCheck = () => {
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedName, setSearchedName] = useState("");

  const runCheck = useCallback(async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Enter at least 2 characters to search.");
      return;
    }
    setLoading(true);
    setError(null);
    setQuotaExceeded(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("sanctions-search", {
        body: { name: trimmed, type: entityType, session_id: getSessionId() },
      });
      if (fnError) {
        // Surface the function's own error body (e.g. quota_exceeded on 429)
        let body: SearchResponse | null = data as SearchResponse | null;
        if (!body?.error) {
          const ctx = (fnError as { context?: Response }).context;
          if (ctx && typeof ctx.json === "function") {
            try {
              body = (await ctx.json()) as SearchResponse;
            } catch {
              body = null;
            }
          }
        }
        if (body?.error === "quota_exceeded") {
          setQuotaExceeded(true);
        } else {
          setError("The check could not be completed. Please try again in a moment.");
        }
        setResponse(null);
      } else {
        const res = data as SearchResponse;
        if (res.error === "quota_exceeded") {
          setQuotaExceeded(true);
          setResponse(null);
        } else {
          setResponse(res);
          setSearchedName(trimmed);
        }
      }
    } catch {
      setError("The check could not be completed. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [name, entityType]);

  const hits = response?.results ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Free Sanctions Check — Screen Names & Companies | WorldAML"
        description="Run a free sanctions check on any person or company. Screen against global sanctions, PEP and watchlist data covering 1,900+ lists. Instant results, no signup required."
        canonical="/sanctions-check"
        structuredData={jsonLd}
      />
      <Header />

      <main>
        {/* Hero + tool */}
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
              <Shield className="h-3.5 w-3.5" />
              Free tool — no signup required
            </span>
            <h1 className="mt-6 text-3xl md:text-5xl font-bold leading-tight">
              Free Sanctions Check
            </h1>
            <p className="mt-4 text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Screen any person or company against global sanctions, PEP and watchlist data.
              WorldAML's full platform screens across <strong className="text-accent">1,900+ global lists</strong> with
              fuzzy name matching and continuous monitoring.
            </p>

            {/* Search box */}
            <div className="mt-10 rounded-xl bg-card p-4 md:p-6 text-card-foreground shadow-xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runCheck()}
                    placeholder="Enter a person or company name, e.g. Rosneft"
                    className="pl-9 h-11"
                    aria-label="Name to screen"
                  />
                </div>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger className="h-11 md:w-44" aria-label="Entity type">
                    <SelectValue placeholder="Entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={runCheck}
                  disabled={loading}
                  className="h-11 bg-accent text-accent-foreground hover:bg-accent/90 px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…
                    </>
                  ) : (
                    "Run check"
                  )}
                </Button>
              </div>

              {error && (
                <p className="mt-4 text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </p>
              )}

              {/* Quota exceeded */}
              {quotaExceeded && (
                <div className="mt-6 rounded-lg border border-accent/40 bg-accent/10 p-5 text-left">
                  <p className="font-semibold text-foreground">You've used your free checks.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a free account for more checks, or see full screening plans for unlimited
                    screening across 1,900+ lists with monitoring and audit trails.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <Link to="/business/signup">Create free account</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/screening-monitoring">See screening plans</Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Results */}
              {response && !quotaExceeded && (
                <div className="mt-6 text-left">
                  {hits.length === 0 ? (
                    <div className="rounded-lg border border-border bg-secondary/50 p-5 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">
                          No matches found for “{searchedName}”
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          No entries in the sample open-source dataset matched above the 0.70 fuzzy-match
                          threshold. This is not a guarantee — production screening covers 1,900+ lists.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground mb-3">
                        {hits.length} potential match{hits.length > 1 ? "es" : ""} for “{searchedName}”
                      </p>
                      <div className="space-y-3">
                        {hits.map((hit) => (
                          <div key={hit.id} className="rounded-lg border border-border p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-foreground">{hit.name}</p>
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${confidenceStyle(hit.confidence)}`}
                              >
                                {hit.confidence} · {Math.round(hit.match_score * 100)}% match
                              </span>
                            </div>
                            <dl className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <div>
                                <dt className="font-medium text-foreground/70">List</dt>
                                <dd>{hit.list_source}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-foreground/70">Type</dt>
                                <dd className="capitalize">{hit.entity_type}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-foreground/70">Programmes</dt>
                                <dd>{hit.programs.join(", ")}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-foreground/70">Designated</dt>
                                <dd>{hit.designation_date}</dd>
                              </div>
                            </dl>
                            {hit.aliases.length > 0 && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Also known as: {hit.aliases.slice(0, 4).join(", ")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <p className="mt-4 text-xs text-muted-foreground">
                    {response.disclaimer} For production-grade screening across 1,900+ lists with
                    ongoing monitoring,{" "}
                    <Link to="/screening-monitoring" className="text-accent underline underline-offset-2">
                      see WorldAML Screening
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
            How the free sanctions check works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "1. Enter a name",
                text: "Type any person, company, organisation or country. Fuzzy Jaro-Winkler matching catches spelling variations, aliases and transliterations.",
              },
              {
                icon: Globe,
                title: "2. We screen the lists",
                text: "Your query is checked against representative OFAC, EU, UN and UK open-source sanctions data — the same matching engine behind the full platform's 1,900+ lists.",
              },
              {
                icon: Shield,
                title: "3. Review the matches",
                text: "Each hit shows the list source, designation date, programmes and a confidence score so you can decide whether further due diligence is needed.",
              },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-border bg-card p-6">
                <s.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upsell CTA */}
        <section className="bg-secondary/40">
          <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Need more than a one-off check?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              WorldAML Screening monitors your customers and counterparties continuously across
              1,900+ global sanctions, PEP and adverse-media lists — with automated alerts,
              case management and regulator-ready audit trails.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/business/signup">
                  Start free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/screening-monitoring">Explore screening plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SanctionsCheck;
