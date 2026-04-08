/**
 * Custom Vite plugin for build-time SEO prerendering.
 *
 * Generates per-route HTML files with proper <title>, <meta description>,
 * <h1>, and <link rel="canonical"> so that search-engine crawlers
 * (Bing, Google) see route-specific content in the raw HTML before
 * JavaScript executes.
 *
 * The SPA still boots normally – this just ensures the initial HTML
 * is SEO-friendly for every indexed route.
 */

import type { Plugin } from "vite";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://www.worldaml.com";
const SITE_NAME = "WorldAML";

interface RouteMeta {
  title: string;
  description: string;
  h1: string;
}

/* ------------------------------------------------------------------ */
/*  Route SEO metadata map – static routes only                       */
/* ------------------------------------------------------------------ */
const routes: Record<string, RouteMeta> = {
  "/": {
    title: "AML Sanctions, PEP & Adverse Media Screening Platform",
    description:
      "Enterprise-grade financial crime screening infrastructure. KYC, KYB, AML sanctions screening, PEP checks, adverse media monitoring for regulated organisations.",
    h1: "WorldAML — AML Sanctions, PEP & Adverse Media Screening Platform",
  },
  "/pricing": {
    title: "Pricing — Transparent Plans for Every Organisation",
    description:
      "Choose the right plan for your compliance needs. WorldAML API, WorldID identity verification, and WorldCompliance® screening — all with transparent pricing.",
    h1: "WorldAML Pricing — Plans for Every Organisation",
  },
  "/about": {
    title: "About WorldAML",
    description:
      "WorldAML is a financial crime screening platform operated by Infocredit Group, an authorised regional partner of LexisNexis Risk Solutions.",
    h1: "About WorldAML",
  },
  "/platform": {
    title: "Compliance Platform Overview",
    description:
      "Unified compliance platform for AML sanctions screening, PEP checks, adverse media monitoring, KYC/KYB verification, transaction monitoring and regulatory reporting.",
    h1: "WorldAML Compliance Platform",
  },
  "/platform/suite": {
    title: "Compliance Suite — End-to-End Compliance Workspace",
    description:
      "All-in-one compliance workspace: customer onboarding, screening, risk assessment, case management and regulatory reporting in a single interface.",
    h1: "WorldAML Compliance Suite",
  },
  "/platform/api": {
    title: "Compliance API — Programmatic Screening & Verification",
    description:
      "RESTful API for automated AML sanctions, PEP, adverse media screening, KYC/KYB verification with real-time results and ongoing monitoring.",
    h1: "WorldAML Compliance API",
  },
  "/platform/security": {
    title: "Platform Security & Certifications",
    description:
      "Enterprise-grade security: ISO 27001, ISO 9001, SOC 2 certified infrastructure with end-to-end encryption and GDPR compliance.",
    h1: "WorldAML Platform Security",
  },
  "/platform/transaction-monitoring": {
    title: "Transaction Monitoring",
    description:
      "Real-time transaction monitoring with configurable rules, pattern detection, and automated suspicious activity reporting.",
    h1: "Transaction Monitoring",
  },
  "/platform/regulatory-reporting": {
    title: "Regulatory Reporting",
    description:
      "Automated regulatory reporting for STR/SAR filings across multiple jurisdictions with full audit trail and compliance evidence.",
    h1: "Regulatory Reporting",
  },
  "/platform/kyc-kyb": {
    title: "KYC & KYB Verification",
    description:
      "End-to-end KYC and KYB verification: identity checks, document verification, beneficial ownership screening and ongoing monitoring.",
    h1: "KYC & KYB Verification",
  },
  "/platform/aml-screening": {
    title: "AML Screening — Sanctions, PEP & Adverse Media",
    description:
      "Screen individuals and entities against global sanctions lists, PEP databases, and adverse media sources with real-time results.",
    h1: "AML Screening — Sanctions, PEP & Adverse Media",
  },
  "/platform/risk-assessment": {
    title: "Risk Assessment",
    description:
      "Automated risk scoring and assessment with configurable risk models, country risk indices, and dynamic risk profiling.",
    h1: "Risk Assessment",
  },
  "/data-sources": {
    title: "Data Sources & Coverage",
    description:
      "Access 1,400+ sanctions lists, PEP databases, adverse media sources and corporate registries across 200+ jurisdictions.",
    h1: "Data Sources & Coverage",
  },
  "/data-sources/worldcompliance": {
    title: "WorldCompliance® by LexisNexis",
    description:
      "WorldCompliance® data platform by LexisNexis Risk Solutions — comprehensive sanctions, PEP, and adverse media screening data.",
    h1: "WorldCompliance® by LexisNexis",
  },
  "/data-sources/bridger-xg": {
    title: "Bridger Insight® XG by LexisNexis",
    description:
      "Bridger Insight® XG screening engine by LexisNexis Risk Solutions — real-time AML screening with configurable matching.",
    h1: "Bridger Insight® XG by LexisNexis",
  },
  "/products/worldid": {
    title: "WorldID — Identity Verification",
    description:
      "WorldID identity verification: document authentication, biometric matching, liveness detection and AML screening in one API call.",
    h1: "WorldID — Identity Verification",
  },
  "/industries": {
    title: "Industries We Serve",
    description:
      "Compliance solutions for banking, fintech, crypto, gaming, legal services, and payment providers across global jurisdictions.",
    h1: "Industries We Serve",
  },
  "/industries/banking": {
    title: "Banking Compliance Solutions",
    description:
      "AML compliance infrastructure for banks: sanctions screening, KYC/KYB, transaction monitoring and regulatory reporting.",
    h1: "Banking Compliance Solutions",
  },
  "/industries/fintech": {
    title: "Fintech Compliance Solutions",
    description:
      "Scalable compliance APIs for fintech companies: automated KYC, AML screening, and risk assessment built for growth.",
    h1: "Fintech Compliance Solutions",
  },
  "/industries/crypto": {
    title: "Crypto & Digital Asset Compliance",
    description:
      "Travel Rule compliance, wallet screening, and AML solutions for cryptocurrency exchanges and digital asset platforms.",
    h1: "Crypto & Digital Asset Compliance",
  },
  "/industries/gaming": {
    title: "Gaming & Gambling Compliance",
    description:
      "Player verification, AML screening, and responsible gambling compliance for licensed gaming operators.",
    h1: "Gaming & Gambling Compliance",
  },
  "/industries/legal": {
    title: "Legal Sector Compliance",
    description:
      "Client due diligence and AML screening solutions for law firms, notaries, and legal service providers.",
    h1: "Legal Sector Compliance",
  },
  "/industries/payments": {
    title: "Payment Provider Compliance",
    description:
      "Transaction monitoring, merchant screening, and AML compliance for payment service providers and EMIs.",
    h1: "Payment Provider Compliance",
  },
  "/support": {
    title: "Support & Help Centre",
    description:
      "Get help with WorldAML products: documentation, API guides, FAQs and contact our support team.",
    h1: "Support & Help Centre",
  },
  "/get-started": {
    title: "Get Started with WorldAML",
    description:
      "Start your free trial of WorldAML — AML screening, KYC verification, and compliance automation in minutes.",
    h1: "Get Started with WorldAML",
  },
  "/contact-sales": {
    title: "Contact Sales",
    description:
      "Speak with our compliance specialists about enterprise AML screening, KYC/KYB, and regulatory reporting solutions.",
    h1: "Contact Sales",
  },
  "/faq": {
    title: "Frequently Asked Questions",
    description:
      "Answers to common questions about WorldAML products, pricing, API integration, data coverage and compliance support.",
    h1: "Frequently Asked Questions",
  },
  "/news": {
    title: "Compliance News & Updates",
    description:
      "Latest AML, sanctions, and financial crime compliance news, regulatory updates and industry insights.",
    h1: "Compliance News & Updates",
  },
  "/demo": {
    title: "Request a Demo",
    description:
      "See WorldAML in action — book a personalised demo of our AML screening, KYC/KYB, and compliance platform.",
    h1: "Request a Demo",
  },
  "/blog": {
    title: "Compliance Blog",
    description:
      "Expert insights on AML compliance, sanctions screening, KYC best practices, and financial crime prevention.",
    h1: "WorldAML Compliance Blog",
  },
  "/academy": {
    title: "Compliance Academy — Free CPD Courses",
    description:
      "Free online AML compliance courses with CPD certification. Learn sanctions screening, KYC, risk assessment and more.",
    h1: "WorldAML Compliance Academy",
  },
  "/partners": {
    title: "Partner Programme",
    description:
      "Join the WorldAML partner programme: referral, affiliate, and reseller opportunities for compliance professionals.",
    h1: "WorldAML Partner Programme",
  },
  "/sanctions-check": {
    title: "Free Sanctions Check",
    description:
      "Screen individuals and entities against global sanctions lists for free. Instant results from OFAC, EU, UN, HMT and more.",
    h1: "Free Sanctions Check",
  },
  "/free-aml-check": {
    title: "Free AML Check",
    description:
      "Run a free AML screening check against global sanctions, PEP, and adverse media databases. Instant results.",
    h1: "Free AML Check",
  },
  "/resources/best-practices": {
    title: "AML Best Practices",
    description:
      "Industry best practices for AML compliance, sanctions screening, customer due diligence, and financial crime prevention.",
    h1: "AML Compliance Best Practices",
  },
  "/resources/sanctions-lists": {
    title: "Global Sanctions Lists Directory",
    description:
      "Comprehensive directory of global sanctions lists: OFAC SDN, EU Consolidated, UN Security Council, HMT, and 1,400+ more.",
    h1: "Global Sanctions Lists Directory",
  },
  "/resources/glossary": {
    title: "AML & Compliance Glossary",
    description:
      "Definitions of key AML, KYC, sanctions screening, and financial crime compliance terms and acronyms.",
    h1: "AML & Compliance Glossary",
  },
  "/resources/aml-regulations": {
    title: "AML Regulations by Country",
    description:
      "Country-by-country guide to AML regulations, supervisory authorities, and compliance requirements worldwide.",
    h1: "AML Regulations by Country",
  },
  "/data-coverage": {
    title: "Data Coverage Index",
    description:
      "Explore WorldAML data coverage across 200+ countries and territories. Sanctions, PEP, corporate registry and adverse media sources.",
    h1: "Data Coverage Index",
  },
  "/aml-api": {
    title: "AML Screening API",
    description:
      "RESTful API for automated AML sanctions, PEP, and adverse media screening with real-time results and ongoing monitoring.",
    h1: "AML Screening API",
  },
  "/sanctions-screening-api": {
    title: "Sanctions Screening API",
    description:
      "Real-time sanctions list screening API covering OFAC, EU, UN, HMT and 1,400+ global sanctions lists with sub-second response times.",
    h1: "Sanctions Screening API",
  },
  "/kyc-kyb-api": {
    title: "KYC/KYB Verification API",
    description:
      "Programmatic KYC and KYB verification API for identity verification, company due diligence, and beneficial ownership screening.",
    h1: "KYC/KYB Verification API",
  },
  "/eu-sanctions-map": {
    title: "EU Sanctions Map",
    description:
      "Interactive map of EU sanctions regimes by country. Explore restrictive measures, asset freezes, and travel bans.",
    h1: "EU Sanctions Map",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "WorldAML privacy policy: how we collect, use, and protect your personal data in compliance with GDPR.",
    h1: "Privacy Policy",
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "WorldAML terms of service governing use of our compliance platform, APIs, and screening tools.",
    h1: "Terms of Service",
  },
  "/cookies": {
    title: "Cookie Policy",
    description:
      "WorldAML cookie policy: what cookies we use, why, and how to manage your preferences.",
    h1: "Cookie Policy",
  },
  "/access-your-data": {
    title: "Access Your Data — GDPR Rights",
    description:
      "Exercise your GDPR data rights: access, rectification, erasure, and portability of your personal data held by WorldAML.",
    h1: "Access Your Data",
  },
  "/about-us/why-worldaml": {
    title: "Why WorldAML",
    description:
      "Discover why regulated organisations choose WorldAML for AML screening, KYC/KYB, and compliance automation.",
    h1: "Why WorldAML",
  },
};

/* ------------------------------------------------------------------ */
/*  All sitemap URLs (static routes + dynamic pages)                  */
/* ------------------------------------------------------------------ */
interface SitemapEntry {
  loc: string;
  priority: string;
  changefreq: string;
}

function buildSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  // Static routes from the prerender map
  for (const route of Object.keys(routes)) {
    const priority =
      route === "/" ? "1.0" :
      route.startsWith("/platform") || route === "/pricing" ? "0.9" :
      route.startsWith("/industries") || route.startsWith("/products") ? "0.8" :
      route.startsWith("/resources") || route.startsWith("/data-sources") || route.startsWith("/blog") ? "0.7" :
      "0.6";
    entries.push({ loc: `${BASE_URL}${route}`, priority, changefreq: "weekly" });
  }

  // Blog posts
  const blogSlugs = [
    "aml-compliance-checklist-2025", "kyc-vs-kyb-differences", "sanctions-screening-best-practices",
    "risk-based-approach-aml", "beneficial-ownership-guide", "pep-screening-guide",
    "aml-compliance-crypto-vasp", "igaming-aml-obligations", "mlro-responsibilities-obligations",
    "edd-vs-sdd-enhanced-simplified-due-diligence", "fatf-travel-rule-explained",
    "transaction-monitoring-red-flags", "adverse-media-screening-guide", "fatca-crs-reporting-guide",
    "aml-real-estate-property-transactions", "psd2-open-banking-aml-obligations",
    "dora-regulation-compliance-financial-institutions",
  ];
  for (const slug of blogSlugs) {
    entries.push({ loc: `${BASE_URL}/blog/${slug}`, priority: "0.7", changefreq: "monthly" });
  }

  // EU Sanctions country pages
  const euSanctionsSlugs = [
    "afghanistan", "belarus", "bosnia-herzegovina", "burundi", "central-african-republic",
    "chemical-weapons", "china", "cyber-attacks", "democratic-republic-congo", "guatemala",
    "guinea", "guinea-bissau", "haiti", "human-rights", "iran", "iraq", "lebanon", "libya",
    "mali", "moldova", "montenegro", "myanmar", "nicaragua", "niger", "north-korea", "russia",
    "serbia", "somalia", "south-sudan", "sudan", "syria", "terrorism", "tunisia", "turkiye",
    "ukraine", "united-states", "venezuela", "yemen", "zimbabwe",
  ];
  for (const slug of euSanctionsSlugs) {
    entries.push({ loc: `${BASE_URL}/eu-sanctions/${slug}`, priority: "0.6", changefreq: "monthly" });
  }

  // Market pages
  const marketSlugs = [
    "cyprus", "germany", "greece", "ireland", "malta", "netherlands", "nigeria",
    "romania", "singapore", "south-africa", "uae", "uk", "usa",
  ];
  for (const slug of marketSlugs) {
    entries.push({ loc: `${BASE_URL}/markets/${slug}`, priority: "0.7", changefreq: "monthly" });
  }

  // Data source regional pages
  for (const ds of ["worldcompliance", "bridger-xg"]) {
    for (const region of ["eu-me", "uk-ie", "na"]) {
      if (!entries.some(e => e.loc === `${BASE_URL}/data-sources/${ds}/${region}`)) {
        entries.push({ loc: `${BASE_URL}/data-sources/${ds}/${region}`, priority: "0.6", changefreq: "monthly" });
      }
    }
  }
  if (!entries.some(e => e.loc === `${BASE_URL}/data-sources/worldcompliance/demo`)) {
    entries.push({ loc: `${BASE_URL}/data-sources/worldcompliance/demo`, priority: "0.5", changefreq: "monthly" });
  }
  if (!entries.some(e => e.loc === `${BASE_URL}/data-sources/worldcompliance/pricing`)) {
    entries.push({ loc: `${BASE_URL}/data-sources/worldcompliance/pricing`, priority: "0.6", changefreq: "monthly" });
  }
  if (!entries.some(e => e.loc === `${BASE_URL}/data-sources/resources`)) {
    entries.push({ loc: `${BASE_URL}/data-sources/resources`, priority: "0.6", changefreq: "monthly" });
  }

  // Deduplicate
  const seen = new Set<string>();
  return entries.filter(e => {
    if (seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });
}

function generateSitemapXml(): string {
  const today = new Date().toISOString().split("T")[0];
  const entries = buildSitemapEntries();

  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/* ------------------------------------------------------------------ */
/*  Plugin                                                            */
/* ------------------------------------------------------------------ */
export function seoPrerender(): Plugin {
  return {
    name: "seo-prerender",
    apply: "build",
    enforce: "post",

    closeBundle() {
      const distDir = path.resolve(process.cwd(), "dist");
      const indexHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

      // --- Generate per-route HTML files ---
      for (const [route, meta] of Object.entries(routes)) {
        if (route === "/") continue;

        const fullTitle =
          meta.title === SITE_NAME ? meta.title : `${meta.title} | ${SITE_NAME}`;
        const canonicalUrl = `${BASE_URL}${route}`;

        let html = indexHtml;

        html = html.replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`);
        html = html.replace(
          /<meta name="description" content="[^"]*"/,
          `<meta name="description" content="${meta.description}"`
        );
        html = html.replace("</head>", `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
        html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${fullTitle}"`);
        html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${meta.description}"`);
        html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonicalUrl}"`);
        html = html.replace(
          /<h1 style="position:absolute;left:-9999px">[^<]*<\/h1>/,
          `<h1 style="position:absolute;left:-9999px">${meta.h1}</h1>`
        );

        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
      }

      // Update root index.html
      const rootMeta = routes["/"];
      let rootHtml = indexHtml;
      const rootTitle = `${rootMeta.title} | ${SITE_NAME}`;
      rootHtml = rootHtml.replace(/<title>[^<]*<\/title>/, `<title>${rootTitle}</title>`);
      rootHtml = rootHtml.replace(
        /<meta name="description" content="[^"]*"/,
        `<meta name="description" content="${rootMeta.description}"`
      );
      rootHtml = rootHtml.replace("</head>", `  <link rel="canonical" href="${BASE_URL}/" />\n  </head>`);
      fs.writeFileSync(path.join(distDir, "index.html"), rootHtml, "utf-8");

      // --- Generate fresh sitemap.xml ---
      const sitemapXml = generateSitemapXml();
      fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf-8");

      const entryCount = buildSitemapEntries().length;
      console.log(
        `[seo-prerender] Generated ${Object.keys(routes).length} pre-rendered HTML files + sitemap.xml (${entryCount} URLs)`
      );
    },
  };
}
