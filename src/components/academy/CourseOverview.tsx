import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Award } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ACADEMY_COURSE_SEO } from "@/data/academyCourseSeo";
import { ACADEMY_PRICING, FREE_ACADEMY_COURSES, isPaidCourse } from "@/data/academyPricing";

export interface CourseOverviewCourse {
  slug: string;
  title: string;
  description: string;
  difficulty?: string | null;
  duration_minutes?: number | null;
  cpd_hours?: number | string | null;
  image_url?: string | null;
  price_eur_cents?: number | null;
  learning_outcomes?: unknown;
}

const outcomesOf = (course: CourseOverviewCourse): string[] =>
  Array.isArray(course.learning_outcomes)
    ? (course.learning_outcomes as unknown[]).filter((o): o is string => typeof o === "string" && o.trim() !== "")
    : [];

/** Price in EUR for structured data: pricing map first, then the course row. */
const eurPriceOf = (course: CourseOverviewCourse): number => {
  if (FREE_ACADEMY_COURSES.has(course.slug)) return 0;
  const cents = ACADEMY_PRICING[course.slug]?.eurCents ?? course.price_eur_cents ?? 0;
  return cents / 100;
};

/**
 * Title, description, canonical, breadcrumbs and Course structured data for a
 * course page. Shared by the public overview (signed-out / not purchased) and
 * the full course view, so every visitor and crawler sees the same snippet as
 * the build-time HTML (see src/data/academyCourseSeo.ts).
 */
export const buildCourseSeo = (course: CourseOverviewCourse) => {
  const snippet = ACADEMY_COURSE_SEO[course.slug];
  const outcomes = outcomesOf(course);
  const price = eurPriceOf(course);
  const paid = isPaidCourse(course.slug) || price > 0;
  return {
    title: snippet?.title ?? course.title,
    description: snippet?.description ?? course.description.slice(0, 158),
    canonical: `/academy/${course.slug}`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Academy", url: "/academy" },
      { name: course.title, url: `/academy/${course.slug}` },
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.description,
      provider: {
        "@type": "Organization",
        name: "WorldAML Academy",
        sameAs: "https://academy.worldaml.com",
      },
      url: `https://worldaml.com/academy/${course.slug}`,
      ...(course.image_url ? { image: course.image_url } : {}),
      inLanguage: "en",
      ...(course.duration_minutes ? { timeRequired: `PT${course.duration_minutes}M` } : {}),
      ...(course.difficulty ? { educationalLevel: course.difficulty } : {}),
      ...(outcomes.length ? { teaches: outcomes } : {}),
      educationalCredentialAwarded: "WorldAML Academy CPD certificate",
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        ...(course.duration_minutes ? { courseWorkload: `PT${course.duration_minutes}M` } : {}),
      },
      offers: {
        "@type": "Offer",
        category: paid ? "Paid" : "Free",
        price: paid ? price.toFixed(2) : "0",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: `https://worldaml.com/academy/${course.slug}`,
      },
    } as Record<string, unknown>,
  };
};

interface CourseOverviewProps {
  course: CourseOverviewCourse;
  /** Module titles, when the visitor is allowed to read them. */
  moduleTitles?: string[];
  /** Short label shown above the title, e.g. "Free" or "€29". */
  priceLabel?: ReactNode;
  embedded?: boolean;
  /** The sign-in or purchase card. */
  children: ReactNode;
  /** Rendered after the footer (e.g. the basket drawer). */
  after?: ReactNode;
}

/**
 * Public, indexable overview of a course for visitors who can't open the
 * modules yet. Shows what the course covers and keeps the sign-in or
 * purchase card alongside it.
 */
const CourseOverview = ({ course, moduleTitles = [], priceLabel, embedded = false, children, after }: CourseOverviewProps) => {
  const seo = buildCourseSeo(course);
  const outcomes = outcomesOf(course);
  const cpd = course.cpd_hours != null ? Number(course.cpd_hours) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={seo.title}
        description={seo.description}
        canonical={seo.canonical}
        ogType="article"
        breadcrumbs={seo.breadcrumbs}
        structuredData={seo.structuredData}
      />
      {!embedded && <Header />}
      <main className="flex-1 bg-background">
        <section className="relative bg-navy overflow-hidden border-b border-border">
          <div className="container-enterprise relative py-10 sm:py-14">
            <Link
              to="/academy"
              className="text-slate-light/70 text-body-sm hover:text-white inline-flex items-center gap-1 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> All Academy courses
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-block py-1 px-3 rounded-full border border-teal-light/30 bg-teal-light/5 text-teal-light text-[11px] font-medium tracking-[0.22em] uppercase">
                WorldAML Academy · Course
              </span>
              {priceLabel && (
                <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-teal-light">{priceLabel}</span>
              )}
            </div>
            <h1 className="text-white font-bold leading-[0.95] tracking-tighter mb-5 text-3xl sm:text-5xl max-w-4xl">
              {course.title}
            </h1>
            <p className="text-body-lg text-slate-light/80 max-w-2xl leading-relaxed mb-6">{course.description}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-slate-light/75">
              {course.duration_minutes ? (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-light" /> {course.duration_minutes} min
                </span>
              ) : null}
              {moduleTitles.length > 0 && (
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-light" /> {moduleTitles.length} modules
                </span>
              )}
              {cpd && cpd > 0 ? (
                <span className="inline-flex items-center gap-2">
                  <Award className="h-4 w-4 text-teal-light" /> {cpd} CPD {cpd === 1 ? "hour" : "hours"} · verifiable certificate
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Award className="h-4 w-4 text-teal-light" /> Verifiable certificate
                </span>
              )}
              {course.difficulty && (
                <span className="uppercase tracking-widest text-[11px] font-semibold">{course.difficulty}</span>
              )}
            </div>
          </div>
        </section>

        <div className="container-enterprise py-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px] items-start">
            <div className="space-y-10">
              {outcomes.length > 0 && (
                <section>
                  <h2 className="text-subtitle font-semibold text-foreground mb-4">What you'll learn</h2>
                  <ul className="space-y-3">
                    {outcomes.map((o) => (
                      <li key={o} className="flex gap-3 text-body text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {moduleTitles.length > 0 && (
                <section>
                  <h2 className="text-subtitle font-semibold text-foreground mb-4">Course modules</h2>
                  <ol className="divide-y divide-border rounded-xl border border-border">
                    {moduleTitles.map((t, i) => (
                      <li key={`${i}-${t}`} className="flex items-center gap-4 px-5 py-3 text-body-sm text-foreground">
                        <span className="tabular-nums text-muted-foreground w-6">{String(i + 1).padStart(2, "0")}</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <section>
                <h2 className="text-subtitle font-semibold text-foreground mb-3">How the certificate works</h2>
                <p className="text-body text-muted-foreground max-w-2xl">
                  Read each module, then take the end-of-course quiz. Pass it and you get a CPD certificate with its own
                  verification link that employers and regulators can check online.
                </p>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24">{children}</aside>
          </div>
        </div>
      </main>
      {!embedded && <Footer />}
      {after}
    </div>
  );
};

export default CourseOverview;
