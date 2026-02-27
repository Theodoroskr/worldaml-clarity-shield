import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewsCard, type NewsCategory } from "@/components/news/NewsCard";
import { CategoryFilter, type FilterCategory } from "@/components/news/CategoryFilter";
import { NewsCardSkeleton } from "@/components/news/NewsCardSkeleton";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { ArrowRight, Radio, RefreshCw } from "lucide-react";

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("All");
  const { items, isLoading, isLive, refresh } = useRSSFeeds();

  const filteredNews = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, items]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="News"
        description="Latest compliance news, regulatory updates, and industry insights on AML, sanctions, PEP screening, and financial crime prevention."
        canonical="/news"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "News", url: "/news" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-display-sm md:text-display font-bold text-navy">
                  News & Regulatory Updates
                </h1>
                {isLive && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse" />
                    Live
                  </Badge>
                )}
              </div>
              <p className="text-body-lg text-text-secondary">
                Curated regulatory, enforcement and financial crime updates relevant to AML, 
                compliance and risk professionals — sourced from reputable public authorities 
                globally and across the GCC region.
              </p>
            </div>
          </div>
        </section>

        {/* Filter + News Grid */}
        <section className="section-padding">
          <div className="container-enterprise">
            {/* Category Filter + Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <CategoryFilter 
                selected={selectedCategory} 
                onSelect={setSelectedCategory} 
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refresh}
                disabled={isLoading}
                className="self-start sm:self-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))
              ) : (
                filteredNews.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))
              )}
            </div>

            {/* Empty State */}
            {!isLoading && filteredNews.length === 0 && (
              <div className="text-center py-12">
                <p className="text-body text-text-secondary">
                  No updates found for this category.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-heading-lg font-bold text-navy mb-4">
                Stay Compliant with WorldAML
              </h2>
              <p className="text-body text-text-secondary mb-8">
                See how WorldAML supports ongoing monitoring, risk assessment, and regulatory compliance 
                with real-time screening and intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/platform/api">
                    Explore WorldAML API
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/get-started">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
