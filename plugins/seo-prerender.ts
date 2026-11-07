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
import { blogPosts } from "../src/data/blogPosts";
import { ACADEMY_COURSE_SEO } from "../src/data/academyCourseSeo";
import { ACADEMY_SEO } from "../src/data/academySeo";
import { allEUSanctionsRegimes } from "../src/data/euSanctionsRegimes";
import { coverageData } from "../src/data/worldComplianceSources";

const BASE_URL = "https://worldaml.com";
const SITE_NAME = "WorldAML";
// Supabase edge function that renders per-post OG images (1200x630 PNG)
const OG_FUNCTION_URL =
  "https://uxjjxnnyrjkhcggptihx.supabase.co/functions/v1/blog-og";

function encodeParam(value: string): string {
  return encodeURIComponent(value);
}

// Global cache-buster applied to every generated OG image URL.
// Bump BLOG_OG_VERSION (env) to force LinkedIn/Facebook/Twitter to re-scrape
// all posts without waiting for their ~7-day preview cache to expire.
// The per-post `date` is also folded in so editing a single post's date
// invalidates only that post's preview.
const BLOG_OG_VERSION = process.env.BLOG_OG_VERSION ?? "2";

function buildBlogOgImageUrl(
  title: string,
  category: string,
  slug: string,
  postDate?: string,
): string {
  const v = postDate
    ? `${BLOG_OG_VERSION}-${postDate.replace(/-/g, "")}`
    : BLOG_OG_VERSION;
  return `${OG_FUNCTION_URL}?slug=${encodeParam(slug)}&title=${encodeParam(title)}&category=${encodeParam(category)}&v=${encodeParam(v)}`;
}

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
  "/compliance-software/us": {
    title: "Compliance Software for US Banks & Fintechs",
    description:
      "Compliance software for US financial institutions — BSA/AML, OFAC sanctions, KYC/CIP, transaction monitoring and SAR/CTR e-filing in one FFIEC- and NYDFS Part 504-ready platform.",
    h1: "Compliance software built for US banks, fintechs and MSBs",
  },
  "/compliance-software/uk": {
    title: "Compliance Software for UK Banks & EMIs",
    description:
      "AML compliance software for UK financial institutions — MLR 2017, OFSI sanctions, KYC/CDD, FCA-ready transaction monitoring and SAR/DAML submissions in one JMLSG-aligned platform.",
    h1: "Compliance software built for UK banks, EMIs and crypto firms",
  },
  "/compliance-software/ch": {
    title: "Compliance Software for Swiss Banks, Fintechs & VASPs",
    description:
      "AML compliance software for Swiss financial institutions — GwG, GwV-FINMA, SECO sanctions, KYC/CDD, transaction monitoring and MROS reporting in one FINMA- and SRO-ready platform.",
    h1: "Compliance software built for Swiss banks, fintechs and VASPs",
  },
  "/compliance-software/it": {
    title: "Compliance Software for Italian Banks, IPs & Crypto Firms",
    description:
      "AML compliance software for Italian financial institutions — D.Lgs. 231/2007, Banca d'Italia and UIF obligations, KYC/adeguata verifica, transaction monitoring and SOS reporting to UIF.",
    h1: "Compliance software built for Italian banks, payment institutions and crypto firms",
  },
  "/compliance-software/nl": {
    title: "Compliance Software for Dutch Banks, PSPs & Crypto Firms",
    description:
      "AML compliance software for Dutch financial institutions — Wwft, Sanctiewet 1977, DNB and AFM obligations, KYC/CDD, transaction monitoring and unusual-transaction reporting to FIU-Nederland.",
    h1: "Compliance software built for Dutch banks, PSPs and crypto firms",
  },
  "/compliance-software/us/banks": {
    title: "BSA/AML Software for US Banks & Credit Unions",
    description:
      "FFIEC-aligned BSA/AML software for US banks and credit unions — CDD/beneficial ownership, CTR and SAR filing, OFAC screening, transaction monitoring and exam-ready audit trails.",
    h1: "BSA/AML compliance software for US banks and credit unions",
  },
  "/compliance-software/us/casinos": {
    title: "Casino AML Compliance Software (Title 31, US)",
    description:
      "Title 31 casino AML software for US casinos, tribal gaming, sportsbooks and iGaming — MTL, CTRC and SARC filing, OFAC screening and gaming-specific transaction monitoring.",
    h1: "Casino AML compliance software built for Title 31",
  },
  "/compliance-software/us/crypto": {
    title: "Crypto & VASP AML Compliance Software (US)",
    description:
      "AML compliance software for US crypto exchanges, custodians and VASPs — FinCEN MSB program, Travel Rule, OFAC wallet screening, SAR filing and on-chain transaction monitoring.",
    h1: "Crypto AML compliance software for US exchanges and VASPs",
  },
  "/compliance-software/us/fintechs": {
    title: "Fintech & MSB AML Compliance Software (US)",
    description:
      "FinCEN MSB-ready AML software for US fintechs, neobanks, payments firms and money transmitters — KYC, OFAC screening, SAR and CTR filing, monitoring and sponsor-bank reporting.",
    h1: "AML compliance software for US fintechs, payments and MSBs",
  },
  "/compliance-software/us/legal": {
    title: "AML & Client Due Diligence Software for US Law Firms",
    description:
      "Client due diligence, sanctions screening and risk software for US law firms — ABA-aligned intake CDD, OFAC checks, beneficial ownership, IOLTA payment risk and matter-level audit trails.",
    h1: "Client due diligence and sanctions screening software for US law firms",
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
  "/enterprise-aml-screening": {
    title: "Enterprise AML Screening — LexisNexis® Data | WorldAML",
    description:
      "Enterprise AML screening across 1,900+ global lists, powered by LexisNexis® data. Sanctions, PEP and adverse-media checks via API, batch and daily monitoring.",
    h1: "Enterprise AML screening — the WorldAML platform, powered by LexisNexis® data",
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
    title: ACADEMY_SEO.title,
    description: ACADEMY_SEO.description,
    h1: "Free AML Certification Online",
  },

  "/partners": {
    title: "Partner Programme",
    description:
      "Join the WorldAML partner programme: referral, affiliate, and reseller opportunities for compliance professionals.",
    h1: "WorldAML Partner Programme",
  },
  "/sanctions-check": {
    title: "Free Sanctions Search & OFAC Check — Instant, No Signup",
    description:
      "Screen any person or company against 1,900+ global sanctions, PEP and watchlists. Instant OFAC, EU, UN and HMT results — free, no signup required.",
    h1: "Free Sanctions Search — instant results across OFAC, EU, UN & 1,900+ lists",
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
  "/about-us": {
    title: "About WorldAML — Global AML & Compliance Solutions",
    description:
      "Learn about WorldAML, the trusted provider of AML screening, KYC/KYB verification, and compliance automation for regulated businesses worldwide.",
    h1: "About WorldAML",
  },
  // ── Pages that render but had no build-time entry (fell back to the homepage head) ──
  "/aml-screening/eu": {
    title: "EU AML Screening & Sanctions Compliance Software",
    description:
      "EU AML screening & sanctions compliance software — AMLR, 6AMLD, AMLA, EU consolidated sanctions and goAML reporting across all 27 Member States.",
    h1: "EU AML screening & sanctions compliance software",
  },
  "/aml-screening/uk": {
    title: "UK AML Screening & OFSI Sanctions Software",
    description:
      "AML, sanctions and PEP screening built for the UK — MLR 2017, FCA supervision, JMLSG guidance, OFSI consolidated list and NCA SAR Online reporting for banks, fintechs and crypto-asset firms.",
    h1: "UK AML screening & OFSI sanctions software",
  },
  "/sanctions-screening-software": {
    title: "Sanctions Screening Software — OFAC & OFSI",
    description:
      "Real-time sanctions screening software for OFAC, OFSI, EU, UN and 40+ national regimes. 50% Rule ownership resolution, sub-100ms payment screening, PEP and adverse-media data in one API.",
    h1: "Sanctions screening software",
  },
  "/aml-compliance-software": {
    title: "What Is AML Compliance Software? Best AML Software for Banks",
    description:
      "What AML compliance software does, the core features to expect, and how banks should choose the best AML software: coverage, false positives, monitoring and evidence.",
    h1: "What is AML compliance software?",
  },
  "/world-check-alternative": {
    title: "World-Check vs WorldCompliance Alternative",
    description:
      "World-Check vs WorldCompliance: compare Refinitiv World-Check and LexisNexis WorldCompliance on data coverage, pricing and workflow. See why compliance teams switch to WorldAML.",
    h1: "World-Check alternative",
  },
  "/alternatives": {
    title: "AML Software Alternatives Compared",
    description:
      "Compare WorldAML against World-Check, ComplyAdvantage, Dow Jones Risk Center, Napier and Sanction Scanner — for procurement and compliance teams evaluating a switch.",
    h1: "AML software alternatives compared",
  },
  "/alternatives/comply-advantage": {
    title: "ComplyAdvantage Alternative",
    description:
      "Compare WorldAML vs ComplyAdvantage: sanctions, PEP and adverse media coverage, case management, monitoring, pricing and EU data residency. See why teams switch.",
    h1: "ComplyAdvantage alternative",
  },
  "/alternatives/dow-jones-risk-center": {
    title: "Dow Jones Risk Center Alternative",
    description:
      "Compare WorldAML vs Dow Jones Risk Center on sanctions and PEP coverage, workflow, transaction monitoring, pricing and EU delivery. See why teams switch.",
    h1: "Dow Jones Risk Center alternative",
  },
  "/alternatives/napier": {
    title: "Napier Alternative",
    description:
      "Compare WorldAML vs Napier on sanctions and PEP screening, transaction monitoring, case management, pricing and Tier-1 data inclusion. See why teams switch.",
    h1: "Napier alternative",
  },
  "/alternatives/sanction-scanner": {
    title: "Sanction Scanner Alternative",
    description:
      "Compare WorldAML vs Sanction Scanner on data provenance, EU residency, case management, transaction monitoring and pricing. See why regulated teams switch.",
    h1: "Sanction Scanner alternative",
  },
  "/resources/us-aml-kyc-compliance-guide": {
    title: "US AML, KYC & Monitoring Guide (2026)",
    description:
      "A US buyer's guide to BSA/AML, KYC/CIP/CDD, OFAC sanctions and transaction monitoring — five program pillars, SAR/CTR filing rules, CTA beneficial ownership, and NYDFS Part 504.",
    h1: "US AML, KYC & transaction monitoring guide",
  },
  "/resources/what-is-sanctions-screening": {
    title: "What is Sanctions Screening? (2026 Guide)",
    description:
      "Sanctions screening explained: how it works, OFAC/UN/EU/HMT lists, regulatory obligations, and how compliance teams build an effective screening programme.",
    h1: "What is sanctions screening?",
  },
  "/resources/uae-aml-compliance-guide": {
    title: "UAE AML Compliance Guide (DIFC & ADGM)",
    description:
      "Practical AML/CFT guide for UAE Free Zone firms: DIFC, ADGM, DMCC obligations, sanctions screening, goAML reporting and FATF alignment.",
    h1: "UAE AML compliance guide",
  },
  "/resources/aml-compliance-checklist": {
    title: "AML Compliance Checklist — Key Controls",
    description:
      "Practical AML compliance and audit checklist for banks, fintechs, crypto, gaming and DNFBPs. Governance, CDD, sanctions screening, monitoring, SAR filing, training and record-keeping.",
    h1: "AML compliance checklist",
  },
  "/resources/fatf-travel-rule-compliance-guide": {
    title: "FATF Travel Rule Guide for VASPs (2026)",
    description:
      "Technical guide to FATF Recommendation 16 for VASPs: data requirements, thresholds, IVMS 101, self-hosted wallets, EU TFR and multi-jurisdictional obligations.",
    h1: "FATF Travel Rule guide for VASPs",
  },
  "/screening-monitoring": {
    title: "WorldAML Screening & Monitoring — Sanctions & PEP",
    description:
      "WorldAML Screening & Monitoring software covering sanctions, PEPs, adverse media, and RCAs. Real-time and batch screening across 1,900+ global lists.",
    h1: "WorldAML Screening & Monitoring",
  },
  "/screening-monitoring/pricing": {
    title: "Screening & Monitoring Pricing & Packages",
    description:
      "Annual pricing for WorldAML Screening & Monitoring. Platform plans from €590/year and API-only plans from €1,950/year with monitoring and audit-ready evidence.",
    h1: "Screening & Monitoring pricing",
  },
  "/book-demo": {
    title: "Book a Suite Demo — AML, KYC & Monitoring",
    description:
      "See WorldAML Suite live in 30 minutes. AML screening, KYC/KYB, transaction monitoring & regulatory reporting tailored to your regulator.",
    h1: "Book a WorldAML Suite demo",
  },
  "/kyc-verification": {
    title: "KYC Verification — Verify Customers in Seconds",
    description:
      "KYC verification with document checks, biometric face match, liveness detection and sanctions screening across 190+ countries. Onboard customers compliantly in under 60 seconds.",
    h1: "KYC verification",
  },
  "/identity-verification-service": {
    title: "Identity Verification Service — Document, Biometric & Liveness",
    description:
      "Identity verification service combining document authentication, biometric face match and certified liveness detection across 190+ countries. White-label, API-first, audit-ready.",
    h1: "Identity verification service",
  },
  "/aml-kyc-compliance": {
    title: "AML KYC Compliance — One Platform for the Whole Programme",
    description:
      "AML KYC compliance software uniting identity verification, sanctions & PEP screening, ongoing monitoring, case management and regulatory reporting — FATF-aligned and audit-ready.",
    h1: "AML KYC compliance",
  },
  "/advisory": {
    title: "MLRO & AML Compliance Consulting",
    description:
      "Advisory services from WorldAML MLROs: EWRA, AML & Sanctions policies, AMLCO reports, regulator questionnaires, internal audit, inspection preparation, and VMLRO support.",
    h1: "MLRO & AML compliance consulting",
  },
  "/advisory/ewra": {
    title: "EWRA Advisory — AML-FWRA & Sanctions FWRA",
    description:
      "Regulator-ready Enterprise-Wide Risk Assessment: AML-FWRA and Sanctions FWRA methodology, models, report, and board pack — typically delivered in 5–7 weeks.",
    h1: "EWRA advisory",
  },
  "/academy/templates": {
    title: "Free MLRO Templates — Board Report & SAR Log",
    description:
      "Download regulator-ready MLRO templates: board reports, enterprise risk assessment, suspicious activity log. Unlock the Pro Toolkit by completing any Academy course.",
    h1: "Free MLRO templates",
  },
  "/partners/apply": {
    title: "Apply to Partner Program",
    description:
      "Submit your partner application to join the WorldAML partner program. Choose from referral, affiliate, or reseller tiers.",
    h1: "Apply to the WorldAML partner program",
  },
  "/partners/directory": {
    title: "Partner Directory",
    description:
      "Find WorldAML certified partners — compliance consultancies, RegTech integrators, and resellers across every major market. Verified Bronze, Silver, and Gold badges.",
    h1: "WorldAML partner directory",
  },
};

/* ------------------------------------------------------------------ */
/*  Dynamic routes — course, market and EU-sanctions pages            */
/*  The sitemap itself is written by plugins/generate-sitemap.ts; this */
/*  plugin only makes sure every listed URL serves its own head.       */
/* ------------------------------------------------------------------ */

// Academy course pages — same snippet the page sets at runtime.
for (const [slug, seo] of Object.entries(ACADEMY_COURSE_SEO)) {
  routes[`/academy/${slug}`] = { title: seo.title, description: seo.description, h1: seo.title };
}

// EU sanctions regime pages — mirrors src/pages/EUSanctionsCountry.tsx.
for (const regime of allEUSanctionsRegimes) {
  routes[`/eu-sanctions/${regime.slug}`] = {
    title: `EU Sanctions on ${regime.country} – Restrictive Measures Guide`,
    description: regime.description,
    h1: `EU sanctions on ${regime.country}`,
  };
}

// Market pages — read from the data file as text (it imports icon
// components, which can't load in the build config).
function extractMarketSeo(): Array<{ slug: string; title: string; description: string }> {
  try {
    const candidates = [
      typeof __dirname !== "undefined" ? path.resolve(__dirname, "../src/data/marketPages.ts") : "",
      path.resolve(process.cwd(), "src/data/marketPages.ts"),
    ].filter(Boolean);
    const file = candidates.find((f) => fs.existsSync(f));
    if (!file) throw new Error("marketPages.ts not found");
    const src = fs.readFileSync(file, "utf-8");
    const str = String.raw`"((?:[^"\\]|\\.)*)"`;
    const re = new RegExp(
      String.raw`slug:\s*` + str + String.raw`[\s\S]*?seo:\s*\{\s*title:\s*` + str +
        String.raw`,\s*description:\s*` + str,
      "g",
    );
    const out: Array<{ slug: string; title: string; description: string }> = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      out.push({ slug: m[1], title: m[2], description: m[3] });
    }
    return out;
  } catch {
    console.warn("[seo-prerender] Could not read marketPages.ts");
    return [];
  }
}
for (const market of extractMarketSeo()) {
  routes[`/markets/${market.slug}`] = {
    title: market.title.replace(/\s*\|\s*WorldAML\s*$/i, ""),
    description: market.description,
    h1: market.title.replace(/\s*\|\s*WorldAML\s*$/i, ""),
  };
}

/* ------------------------------------------------------------------ */
/*  Retired addresses — the app redirects these client-side. Serve a   */
/*  noindex page that points crawlers at the live destination so the   */
/*  old URL drops out of the index instead of showing a copy.          */
/* ------------------------------------------------------------------ */
const REDIRECT_ROUTES: Record<string, string> = {
  "/about-us": "/about",
  "/get-started": "/contact-sales",
  "/free-aml-check": "/",
  "/platform/aml-screening": "/screening-monitoring",
  "/data-sources": "/screening-monitoring",
  "/data-sources/worldcompliance": "/screening-monitoring",
  "/data-sources/worldcompliance/pricing": "/pricing",
  "/data-sources/bridger-xg": "/screening-monitoring",
  "/data-coverage": "/screening-monitoring",
  "/resources/comparison/world-check-vs-worldcompliance-vs-dow-jones": "/alternatives",
};
for (const sub of ["resources", "worldcompliance/demo", "worldcompliance/eu-me", "worldcompliance/uk-ie", "worldcompliance/na", "bridger-xg/eu-me", "bridger-xg/uk-ie", "bridger-xg/na"]) {
  REDIRECT_ROUTES[`/data-sources/${sub}`] = "/screening-monitoring";
}
for (const country of Object.keys(coverageData)) {
  REDIRECT_ROUTES[`/data-coverage/${country}`] = "/screening-monitoring";
}

/** Every path that gets its own build-time HTML (for tests and logging). */
export const PRERENDERED_PATHS = (): string[] => [...Object.keys(routes), ...blogPosts.map((p) => `/blog/${p.slug}`)];
export const RETIRED_PATHS = (): string[] => Object.keys(REDIRECT_ROUTES);

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

      // --- Retired addresses: noindex page pointing at the live destination ---
      for (const [route, redirectTarget] of Object.entries(REDIRECT_ROUTES)) {
        const targetUrl = `${BASE_URL}${redirectTarget}`;
        const label = escapeHtmlAttr(routes[route]?.title ?? "Page moved");
        const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0;url=${targetUrl}" />
  <link rel="canonical" href="${targetUrl}" />
  <title>${label} | ${SITE_NAME}</title>
  <meta name="robots" content="noindex, follow" />
</head>
<body>
  <p>This page has moved to <a href="${targetUrl}">${targetUrl}</a>.</p>
</body>
</html>`;
        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, "index.html"), redirectHtml, "utf-8");
      }

      // --- Generate per-route HTML files ---
      for (const [route, rawMeta] of Object.entries(routes)) {
        if (route === "/" || REDIRECT_ROUTES[route]) continue;
        const meta: RouteMeta = {
          title: escapeHtmlAttr(rawMeta.title),
          description: escapeHtmlAttr(rawMeta.description),
          h1: escapeHtmlAttr(rawMeta.h1),
        };

        const fullTitle =
          meta.title === SITE_NAME ? meta.title : `${meta.title} | ${SITE_NAME}`;
        const canonicalUrl = `${BASE_URL}${route}`;

        let html = indexHtml;

        html = html.replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`);
        // Insert or replace meta description (with data-rh so react-helmet-async manages it)
        if (html.includes('<meta name="description"')) {
          html = html.replace(
            /<meta name="description" content="[^"]*"[^>]*/,
            `<meta data-rh="true" name="description" content="${meta.description}"`
          );
        } else {
          html = html.replace("</head>", `  <meta data-rh="true" name="description" content="${meta.description}" />\n  </head>`);
        }
        html = html.replace("</head>", `  <link data-rh="true" rel="canonical" href="${canonicalUrl}" />\n  </head>`);
        // OG tags — insert if missing (base index.html has none), replace if present
        const ogBlock = [
          `<meta data-rh="true" property="og:title" content="${fullTitle}" />`,
          `<meta data-rh="true" property="og:description" content="${meta.description}" />`,
          `<meta data-rh="true" property="og:url" content="${canonicalUrl}" />`,
          `<meta data-rh="true" property="og:image" content="${BASE_URL}/og-image.png" />`,
          `<meta data-rh="true" property="og:type" content="website" />`,
          `<meta data-rh="true" property="og:site_name" content="${SITE_NAME}" />`,
        ];
        if (html.includes('property="og:title"')) {
          html = html.replace(/<meta[^>]*property="og:title"[^>]*>/, ogBlock[0]);
          html = html.replace(/<meta[^>]*property="og:description"[^>]*>/, ogBlock[1]);
          html = html.replace(/<meta[^>]*property="og:url"[^>]*>/, ogBlock[2]);
        } else {
          html = html.replace("</head>", `  ${ogBlock.join("\n  ")}\n  </head>`);
        }
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
      if (rootHtml.includes('<meta name="description"')) {
        rootHtml = rootHtml.replace(
          /<meta name="description" content="[^"]*"[^>]*/,
          `<meta data-rh="true" name="description" content="${rootMeta.description}"`
        );
      } else {
        rootHtml = rootHtml.replace("</head>", `  <meta data-rh="true" name="description" content="${rootMeta.description}" />\n  </head>`);
      }
      rootHtml = rootHtml.replace("</head>", `  <link data-rh="true" rel="canonical" href="${BASE_URL}/" />\n  </head>`);
      fs.writeFileSync(path.join(distDir, "index.html"), rootHtml, "utf-8");

      // --- Per-blog-post HTML with unique OG image ---
      for (const post of blogPosts) {
        const canonicalUrl = `${BASE_URL}/blog/${post.slug}`;
        // If a post declares an explicit heroImage, use it verbatim so the
        // social preview shows the real photo instead of the branded card.
        const ogImage = post.heroImage
          ? post.heroImage
          : buildBlogOgImageUrl(post.title, post.category, post.slug, post.date);
        const ogImageAlt = post.heroImageAlt ?? post.title;
        const fullTitle = `${post.title} | ${SITE_NAME}`;
        const description = post.description;

        let html = indexHtml;

        html = html.replace(
          /<title>[^<]*<\/title>/,
          `<title>${escapeHtmlAttr(fullTitle)}</title>`
        );
        if (html.includes('<meta name="description"')) {
          html = html.replace(
            /<meta name="description" content="[^"]*"[^>]*/,
            `<meta data-rh="true" name="description" content="${escapeHtmlAttr(description)}"`
          );
        } else {
          html = html.replace(
            "</head>",
            `  <meta data-rh="true" name="description" content="${escapeHtmlAttr(description)}" />\n  </head>`
          );
        }
        html = html.replace(
          "</head>",
          `  <link data-rh="true" rel="canonical" href="${canonicalUrl}" />\n  </head>`
        );

        const ogBlock = [
          `<meta data-rh="true" property="og:title" content="${escapeHtmlAttr(post.title)}" />`,
          `<meta data-rh="true" property="og:description" content="${escapeHtmlAttr(description)}" />`,
          `<meta data-rh="true" property="og:url" content="${canonicalUrl}" />`,
          `<meta data-rh="true" property="og:image" content="${ogImage}" />`,
          `<meta data-rh="true" property="og:image:width" content="1200" />`,
          `<meta data-rh="true" property="og:image:height" content="630" />`,
          `<meta data-rh="true" property="og:image:alt" content="${escapeHtmlAttr(ogImageAlt)}" />`,
          `<meta data-rh="true" property="og:type" content="article" />`,
          `<meta data-rh="true" property="og:site_name" content="${SITE_NAME}" />`,
          `<meta data-rh="true" property="article:section" content="${escapeHtmlAttr(post.category)}" />`,
          `<meta data-rh="true" property="article:published_time" content="${post.date}" />`,
          `<meta data-rh="true" name="twitter:card" content="summary_large_image" />`,
          `<meta data-rh="true" name="twitter:title" content="${escapeHtmlAttr(post.title)}" />`,
          `<meta data-rh="true" name="twitter:description" content="${escapeHtmlAttr(description)}" />`,
          `<meta data-rh="true" name="twitter:image" content="${ogImage}" />`,
        ];

        if (html.includes('property="og:title"')) {
          html = html.replace(/<meta[^>]*property="og:title"[^>]*>/, ogBlock[0]);
          html = html.replace(/<meta[^>]*property="og:description"[^>]*>/, ogBlock[1]);
          html = html.replace(/<meta[^>]*property="og:url"[^>]*>/, ogBlock[2]);
          html = html.replace(/<meta[^>]*property="og:image"[^>]*>/, ogBlock[3]);
          html = html.replace(
            "</head>",
            `  ${ogBlock.slice(4).join("\n  ")}\n  </head>`
          );
        } else {
          html = html.replace("</head>", `  ${ogBlock.join("\n  ")}\n  </head>`);
        }

        html = html.replace(
          /<h1 style="position:absolute;left:-9999px">[^<]*<\/h1>/,
          `<h1 style="position:absolute;left:-9999px">${escapeHtmlAttr(post.title)}</h1>`
        );

        const postDir = path.join(distDir, "blog", post.slug);
        fs.mkdirSync(postDir, { recursive: true });
        fs.writeFileSync(path.join(postDir, "index.html"), html, "utf-8");
      }

      // sitemap.xml comes from plugins/generate-sitemap.ts (copied from public/).
      console.log(
        `[seo-prerender] Generated ${Object.keys(routes).length} page + ${blogPosts.length} blog + ${Object.keys(REDIRECT_ROUTES).length} retired-address HTML files`
      );
    },
  };
}
