import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { blogPosts, type BlogSection } from "@/data/blogPosts";
import { cn } from "@/lib/utils";

const SectionRenderer = ({ section }: { section: BlogSection }) => {
  switch (section.type) {
    case "intro":
      return (
        <p className="text-body-lg text-text-secondary leading-relaxed mb-8 border-l-4 border-brand-teal/40 pl-5">
          {section.text}
        </p>
      );
    case "h2":
      return (
        <h2 className="text-heading-lg font-bold text-navy mt-10 mb-4">
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="text-heading-sm font-semibold text-navy mt-8 mb-3">
          {section.text}
        </h3>
      );
    case "p":
      return (
        <p className="text-body text-text-secondary leading-relaxed mb-4">
          {section.text}
        </p>
      );
    case "ul":
      return (
        <ul className="mb-6 space-y-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-body text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-teal flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mb-6 space-y-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-body text-text-secondary">
              <span className="flex-shrink-0 font-semibold text-navy min-w-[1.5rem]">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div className="my-8 rounded-xl bg-brand-teal/5 border border-brand-teal/20 p-6">
          <p className="text-body text-navy font-medium leading-relaxed">{section.text}</p>
        </div>
      );
    case "table":
      return (
        <div className="my-8 overflow-x-auto rounded-xl border border-divider">
          <table className="w-full text-body-sm">
            <thead className="bg-surface-subtle">
              <tr>
                {section.headers?.map((h) => (
                  <th key={h} className="text-left font-semibold text-navy px-4 py-3 border-b border-divider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows?.map((row, ri) => (
                <tr key={ri} className={cn(ri % 2 === 1 && "bg-surface-subtle/50")}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-text-secondary border-b border-divider/50">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = useMemo(() => blogPosts.find((p) => p.slug === slug), [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter(
    (p) => post.relatedSlugs?.includes(p.slug)
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `https://www.worldaml.com/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "WorldAML",
      url: "https://www.worldaml.com",
    },
    keywords: post.tags.join(", "),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={post.title}
        description={post.description}
        canonical={`/blog/${post.slug}`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
        structuredData={structuredData}
      />
      <Header />
      <main className="flex-1">
        {/* Article Header */}
        <section className="bg-surface-subtle border-b border-divider py-12 md:py-16">
          <div className="container-enterprise">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-caption text-text-tertiary mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-navy transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/blog" className="hover:text-navy transition-colors">Blog</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-text-secondary line-clamp-1">{post.title}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
              </div>
              <h1 className="text-display-sm md:text-display-md font-bold text-navy mb-6 leading-tight">
                {post.title}
              </h1>
              <p className="text-body-lg text-text-secondary mb-6">{post.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-body-sm text-text-tertiary">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readTime} min read
                </div>
                <span className="text-text-tertiary">By {post.author}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Body */}
        <section className="py-12 md:py-16">
          <div className="container-enterprise">
            <div className="grid lg:grid-cols-[1fr_280px] gap-12">
              {/* Main content */}
              <article className="max-w-3xl">
                {post.content.map((section, i) => (
                  <SectionRenderer key={i} section={section} />
                ))}

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-divider">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-caption text-text-secondary bg-surface-subtle rounded-full px-3 py-1 border border-divider">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-6">
                  {/* CTA Card */}
                  <div className="rounded-xl border border-divider bg-surface-subtle p-6">
                    <h3 className="font-semibold text-navy mb-2">See WorldAML in Action</h3>
                    <p className="text-body-sm text-text-secondary mb-4">
                      Automate AML screening, KYC/KYB, and risk assessment in one platform.
                    </p>
                    <Link
                      to="/demo"
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-navy text-white text-body-sm font-medium py-2.5 px-4 hover:bg-navy/90 transition-colors"
                    >
                      Request Demo <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/sanctions-check"
                      className="flex items-center justify-center gap-2 w-full mt-2 rounded-lg border border-divider text-navy text-body-sm font-medium py-2.5 px-4 hover:bg-surface-subtle transition-colors"
                    >
                      Free Sanctions Check
                    </Link>
                  </div>

                  {/* Related articles */}
                  {related.length > 0 && (
                    <div className="rounded-xl border border-divider p-6">
                      <h3 className="font-semibold text-navy mb-4">Related Articles</h3>
                      <div className="space-y-4">
                        {related.map((r) => (
                          <Link
                            key={r.slug}
                            to={`/blog/${r.slug}`}
                            className="group block"
                          >
                            <p className="text-body-sm font-medium text-navy group-hover:text-brand-teal transition-colors leading-snug mb-1">
                              {r.title}
                            </p>
                            <div className="flex items-center gap-2 text-caption text-text-tertiary">
                              <Clock className="h-3 w-3" />
                              {r.readTime} min read
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Back to blog */}
        <section className="border-t border-divider py-8">
          <div className="container-enterprise">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-body-sm font-medium text-navy hover:text-brand-teal transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
