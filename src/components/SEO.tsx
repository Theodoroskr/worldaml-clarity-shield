import { Helmet } from "react-helmet-async";
import { isAcademyHost } from "@/lib/academyHost";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface AlternateLocale {
  hreflang: string;
  path: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  ogType?: string;
  ogLocale?: string;
  breadcrumbs?: BreadcrumbItem[];
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  /** Extra hreflang alternates for localized variants of this page (adds to default English targets). */
  alternateLocales?: AlternateLocale[];
}

const MAIN_SITE_NAME = "WorldAML";
const MAIN_BASE_URL = "https://worldaml.com";
const ACADEMY_SITE_NAME = "WorldAML Academy";
const ACADEMY_BASE_URL = "https://academy.worldaml.com";

/**
 * hreflang targets: same content, one URL, but signal Google which
 * English-speaking markets the page is relevant for.
 */
const HREFLANG_TARGETS = [
  { hreflang: "en-US", region: "United States" },
  { hreflang: "en-GB", region: "United Kingdom" },
  { hreflang: "en-AE", region: "United Arab Emirates" },
  { hreflang: "en", region: "International (English)" },
  { hreflang: "x-default", region: "Default" },
];

/**
 * On the Academy subdomain, strip a leading `/academy` from canonical/breadcrumb
 * paths so URLs resolve at the subdomain root (academy.worldaml.com/<slug>).
 */
const stripAcademyPrefix = (path: string): string => {
  const cleaned = path.replace(/^\/academy(?=\/|$)/, "");
  return cleaned === "" ? "/" : cleaned;
};

const SEO = ({ title, description, canonical, noindex = false, ogType = "website", breadcrumbs, structuredData }: SEOProps) => {
  const onAcademy = isAcademyHost();
  const SITE_NAME = onAcademy ? ACADEMY_SITE_NAME : MAIN_SITE_NAME;
  const BASE_URL = onAcademy ? ACADEMY_BASE_URL : MAIN_BASE_URL;
  const OG_IMAGE = `${BASE_URL}/og-image.png`;

  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonicalPath = canonical ? (onAcademy ? stripAcademyPrefix(canonical) : canonical) : undefined;
  const canonicalUrl = canonicalPath ? `${BASE_URL}${canonicalPath}` : undefined;

  // On the academy subdomain, the main marketing home is not the
  // hierarchical parent. Drop the "Home → /" crumb and rewrite
  // any "/academy*" links to live at the subdomain root.
  const effectiveBreadcrumbs = breadcrumbs && onAcademy
    ? breadcrumbs
        .filter((b) => b.url !== "/")
        .map((b) => ({ name: b.name, url: stripAcademyPrefix(b.url) }))
    : breadcrumbs;

  const breadcrumbLD = effectiveBreadcrumbs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: effectiveBreadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${BASE_URL}${item.url}`,
        })),
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} data-rh="true" />
      {noindex && <meta name="robots" content="noindex, nofollow" data-rh="true" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} data-rh="true" />}

      {/* hreflang — signal target English-speaking markets */}
      {canonicalUrl && HREFLANG_TARGETS.map(({ hreflang }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={canonicalUrl} data-rh="true" />
      ))}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} data-rh="true" />
      <meta property="og:description" content={description} data-rh="true" />
      <meta property="og:image" content={OG_IMAGE} data-rh="true" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} data-rh="true" />}
      <meta property="og:type" content={ogType} data-rh="true" />
      <meta property="og:site_name" content={SITE_NAME} data-rh="true" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" data-rh="true" />
      <meta name="twitter:title" content={fullTitle} data-rh="true" />
      <meta name="twitter:description" content={description} data-rh="true" />
      <meta name="twitter:image" content={OG_IMAGE} data-rh="true" />

      {/* Breadcrumb JSON-LD */}
      {breadcrumbLD && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbLD)}
        </script>
      )}

      {/* Custom Structured Data — supports single object or array */}
      {structuredData && (Array.isArray(structuredData) ? structuredData : [structuredData]).map((sd, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(sd)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
