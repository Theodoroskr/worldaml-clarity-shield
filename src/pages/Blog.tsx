import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Tag, Rss } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { blogPosts, blogCategories } from "@/data/blogPosts";
import { cn } from "@/lib/utils";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() =>
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const [featured, ...rest] = filtered;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "WorldAML Compliance Insights",
    description:
      "Expert AML, KYC/KYB, sanctions screening, and regulatory compliance guides for financial institutions.",
    url: "https://www.worldaml.com/blog",
    publisher: {
      "@type": "Organization",
      name: "WorldAML",
      url: "https://www.worldaml.com",
    },
    blogPost: blogPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      url: `https://www.worldaml.com/blog/${p.slug}`,
      datePublished: p.date,
      author: { "@type": "Organization", name: p.author },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compliance Insights Blog"
        description="Expert guides on AML compliance, KYC/KYB, sanctions screening, risk assessment, and regulatory updates for financial institutions and compliance teams."
        canonical="/blog"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-surface-subtle border-b border-divider py-16 md:py-20">
          <div className="container-enterprise">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-4">
                Compliance Insights
              </Badge>
              <h1 className="text-display-sm md:text-display font-bold text-navy mb-4">
                AML & Compliance Blog
              </h1>
              <p className="text-body-lg text-text-secondary mb-4">
                Practical guides, regulatory updates, and expert analysis for compliance professionals — covering AML, KYC/KYB, sanctions, and risk management.
              </p>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Rss className="w-4 h-4" />
                Subscribe via RSS
              </a>
          </div>
        </section>

        {/* Category Filter */}
        <section className="border-b border-divider bg-background sticky top-16 z-30">
          <div className="container-enterprise py-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {blogCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "whitespace-nowrap px-4 py-1.5 rounded-full text-body-sm font-medium transition-colors border",
                    activeCategory === cat
                      ? "bg-navy text-white border-navy"
                      : "text-text-secondary border-divider hover:border-navy/40 hover:text-navy"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="container-enterprise py-12 md:py-16">
          {filtered.length === 0 && (
            <p className="text-text-secondary text-body-lg text-center py-16">No posts in this category yet.</p>
          )}

          {/* Featured Post */}
          {featured && (
            <div className="mb-12">
              <Link
                to={`/blog/${featured.slug}`}
                className="group grid md:grid-cols-2 gap-8 rounded-2xl border border-divider bg-surface-subtle hover:border-navy/30 hover:shadow-lg transition-all p-8"
              >
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-caption font-semibold text-brand-teal uppercase tracking-wider">
                        {featured.category}
                      </span>
                      <span className="text-caption text-text-tertiary">Featured</span>
                    </div>
                    <h2 className="text-heading-lg font-bold text-navy mb-3 group-hover:text-brand-teal transition-colors leading-snug">
                      {featured.title}
                    </h2>
                    <p className="text-body text-text-secondary mb-6 line-clamp-3">
                      {featured.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featured.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-caption text-text-tertiary bg-background rounded-full px-3 py-1 border border-divider">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(featured.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime} min read
                    </div>
                    <span className="ml-auto flex items-center gap-1 text-brand-teal text-body-sm font-medium group-hover:gap-2 transition-all">
                      Read article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                {/* Visual accent */}
                <div className="hidden md:flex items-center justify-center rounded-xl bg-gradient-to-br from-navy/5 to-brand-teal/10 min-h-[220px]">
                  <div className="text-center px-8">
                    <div className="text-display font-bold text-navy/10 leading-none select-none">
                      {featured.readTime}'
                    </div>
                    <p className="text-body-sm text-text-tertiary mt-2">read time</p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Rest of posts grid */}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-xl border border-divider bg-background hover:border-navy/30 hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-caption font-semibold text-brand-teal uppercase tracking-wider">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-caption text-text-tertiary">
                      <Clock className="h-3 w-3" />
                      {post.readTime} min
                    </div>
                  </div>
                  <h2 className="text-heading-sm font-bold text-navy mb-2 group-hover:text-brand-teal transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-body-sm text-text-secondary mb-4 line-clamp-3 flex-1">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-divider">
                    <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <span className="flex items-center gap-1 text-brand-teal text-caption font-medium group-hover:gap-1.5 transition-all">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
