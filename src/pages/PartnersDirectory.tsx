import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, ExternalLink, Handshake, ArrowRight } from "lucide-react";

interface FeaturedPartner {
  id: string;
  display_name: string | null;
  logo_url: string | null;
  tagline: string | null;
  bio: string | null;
  verticals: string[];
  website_url: string | null;
  partner_type: string;
  certification_level: "none" | "bronze" | "silver" | "gold";
}

const CERT_STYLES: Record<string, string> = {
  bronze: "bg-gradient-to-br from-amber-700 to-amber-500 text-white",
  silver: "bg-gradient-to-br from-slate-400 to-slate-200 text-navy",
  gold: "bg-gradient-to-br from-yellow-500 to-yellow-300 text-navy",
};

const TYPE_LABEL: Record<string, string> = {
  referral: "Referral Partner",
  affiliate: "Affiliate Partner",
  reseller: "Reseller Partner",
  technology: "Technology Partner",
};

const VERTICALS = ["banking", "fintech", "crypto", "igaming", "payments", "legal"];

const PartnersDirectory = () => {
  const [partners, setPartners] = useState<FeaturedPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("featured_partners")
        .select("id,display_name,logo_url,tagline,bio,verticals,website_url,partner_type,certification_level")
        .order("certification_level", { ascending: false });
      setPartners((data as any as FeaturedPartner[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = filter === "all" ? partners : partners.filter((p) => p.verticals?.includes(filter));

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Partner Directory | WorldAML"
        description="Find WorldAML certified partners — compliance consultancies, RegTech integrators, and resellers across every major market. Verified Bronze, Silver, and Gold badges."
        canonical="/partners/directory"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Partner Program", url: "/partners" },
          { name: "Directory", url: "/partners/directory" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-br from-navy via-navy to-navy-light">
          <div className="container-enterprise text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/15 text-teal text-sm font-medium mb-6 border border-teal/20">
              <Handshake className="h-4 w-4" />
              Certified Partner Directory
            </div>
            <h1 className="text-white mb-6 text-4xl md:text-5xl font-bold">
              Find a <span className="text-teal">WorldAML Certified Partner</span>
            </h1>
            <p className="text-white/80 text-lg">
              Verified consultancies, RegTech integrators, and resellers ready to help you deploy compliance faster.
            </p>
          </div>
        </section>

        {/* Filters + Grid */}
        <section className="py-16 md:py-20 bg-surface-subtle">
          <div className="container-enterprise">
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                All
              </Button>
              {VERTICALS.map((v) => (
                <Button
                  key={v}
                  variant={filter === v ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(v)}
                  className="capitalize"
                >
                  {v === "igaming" ? "iGaming" : v}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-teal" />
              </div>
            ) : filtered.length === 0 ? (
              <Card className="max-w-xl mx-auto border-divider">
                <CardContent className="pt-12 pb-12 text-center">
                  <Handshake className="h-10 w-10 text-teal mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-navy mb-2">Directory launching soon</h3>
                  <p className="text-text-secondary text-sm mb-6">
                    Our first certified partners will appear here shortly. Want to be featured?
                  </p>
                  <Button asChild variant="accent">
                    <Link to="/partners/apply">Apply to the Programme</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p) => (
                  <Card key={p.id} className="border-divider hover:shadow-lg transition-all">
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        {p.logo_url ? (
                          <img
                            src={p.logo_url}
                            alt={`${p.display_name ?? "Partner"} logo`}
                            className="h-10 w-auto object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-teal/10 flex items-center justify-center">
                            <Handshake className="h-5 w-5 text-teal" />
                          </div>
                        )}
                        {p.certification_level !== "none" && (
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${CERT_STYLES[p.certification_level]}`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {p.certification_level}
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-navy text-lg mb-1">
                        {p.display_name ?? "WorldAML Partner"}
                      </h3>
                      {p.tagline && <p className="text-text-secondary text-sm italic mb-3">{p.tagline}</p>}
                      {p.bio && <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">{p.bio}</p>}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {TYPE_LABEL[p.partner_type] ?? p.partner_type}
                        </Badge>
                        {p.verticals?.map((v) => (
                          <Badge key={v} variant="outline" className="text-[10px] capitalize">
                            {v === "igaming" ? "iGaming" : v}
                          </Badge>
                        ))}
                      </div>
                      {p.website_url && (
                        <a
                          href={p.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-teal text-sm font-medium hover:underline"
                        >
                          Visit site <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-navy">
          <div className="container-enterprise text-center max-w-2xl mx-auto">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">Want to be listed here?</h2>
            <p className="text-white/70 mb-6">
              Approved partners can request a directory listing. Earn certification badges through our Academy to feature at the top.
            </p>
            <Button asChild variant="accent" size="lg">
              <Link to="/partners/apply">
                Apply to the Programme <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PartnersDirectory;
