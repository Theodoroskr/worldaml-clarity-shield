import { useState, useEffect, useCallback } from "react";
import type { NewsItem, NewsCategory, TrustTier } from "@/components/news/NewsCard";
import { fetchAllFeeds } from "@/services/rssService";
import { supabase } from "@/integrations/supabase/client";
import { cleanSummary, cleanTitle, truncateSummary } from "@/lib/newsSummary";

const VALID_CATEGORIES: NewsCategory[] = [
  "Regulatory Updates",
  "Sanctions & Enforcement",
  "AML & Financial Crime",
  "GCC Regulatory Updates",
];

/**
 * Updates collected by the monthly `refresh-news` job, stored in the backend so the
 * News page always has fresh, category-aligned content even if a live feed is down.
 */
async function fetchStoredUpdates(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from("news_updates")
    .select("id, title, summary, full_summary, source, source_url, category, published_at, tags, trust_tier")
    .order("published_at", { ascending: false })
    .limit(120);

  if (error) {
    console.warn("Stored news updates unavailable:", error.message);
    return [];
  }

  return (data ?? [])
    .filter((row) => VALID_CATEGORIES.includes(row.category as NewsCategory))
    .map((row) => {
      const title = cleanTitle(row.title);
      const full = cleanSummary(row.full_summary ?? row.summary, title);
      const summary = cleanSummary(row.summary, title) || truncateSummary(full);
      return {
        id: `db-${row.id}`,
        title,
        source: row.source,
        sourceUrl: row.source_url,
        publishedAt: row.published_at,
        category: row.category as NewsCategory,
        tags: row.tags ?? [],
        // A summary that only repeats the headline adds nothing — leave it blank.
        summary: summary.toLowerCase() === title.toLowerCase() ? "" : summary,

        fullSummary: full || undefined,
        trustTier: (row.trust_tier as TrustTier) ?? "A",
      };
    })
    .filter((item) => item.title && item.sourceUrl);
}


// Curated baseline updates, shown when live feeds are unavailable.
const fallbackItems: NewsItem[] = [
  // ---- 2026: Sanctions & Enforcement ----
  {
    id: "se-2026-01",
    title: "OFAC Expands Russia-Related Designations Targeting Shadow-Fleet Shipping and Payment Intermediaries",
    source: "Office of Foreign Assets Control",
    sourceUrl: "https://ofac.treasury.gov",
    publishedAt: "2026-07-16",
    category: "Sanctions & Enforcement",
    tags: ["sanctions", "russia", "shipping", "enforcement_action"],
    summary:
      "The US Treasury added a further tranche of vessels, shipping managers and third-country payment intermediaries to the SDN List for facilitating price-cap evasion on Russian crude. Screening teams should re-run vessel, IMO number and counterparty checks, and review any correspondent relationships routed through the newly designated intermediaries.",
    trustTier: "A",
  },
  {
    id: "se-2026-02",
    title: "EU Adopts Further Restrictive Measures and Tightens Anti-Circumvention Obligations for Operators",
    source: "European Union — Official Journal",
    sourceUrl: "https://eur-lex.europa.eu",
    publishedAt: "2026-06-04",
    category: "Sanctions & Enforcement",
    tags: ["sanctions", "eu", "circumvention"],
    summary:
      "The latest EU package extends listings across defence, technology and logistics supply chains and reinforces the obligation on operators to conduct due diligence on third-country subsidiaries. Firms are expected to evidence ownership and control analysis beyond the 50% rule and to document escalation where indirect exposure is identified.",
    trustTier: "A",
  },
  {
    id: "se-2026-03",
    title: "OFSI Publishes Enforcement Findings on Sanctions Reporting Failures by Financial Institutions",
    source: "Office of Financial Sanctions Implementation",
    sourceUrl: "https://www.gov.uk/government/organisations/office-of-financial-sanctions-implementation",
    publishedAt: "2026-04-22",
    category: "Sanctions & Enforcement",
    tags: ["sanctions", "uk", "enforcement_action", "reporting"],
    summary:
      "OFSI set out findings against firms that failed to report frozen assets and suspected breaches within statutory deadlines. The findings emphasise timely reporting, accurate record-keeping of frozen balances, and clear ownership of sanctions escalation within the compliance function.",
    trustTier: "A",
  },
  {
    id: "se-2026-04",
    title: "FinCEN and DOJ Announce Coordinated Action Against Cross-Border Laundering Network",
    source: "Financial Crimes Enforcement Network",
    sourceUrl: "https://www.fincen.gov",
    publishedAt: "2026-02-19",
    category: "Sanctions & Enforcement",
    tags: ["enforcement_action", "aml", "crypto"],
    summary:
      "A coordinated action targeted a network moving proceeds through shell companies, trade invoices and virtual asset intermediaries. The accompanying red-flag indicators cover rapid pass-through activity, mismatched invoice values and use of nested exchange accounts, and should be reflected in transaction monitoring scenarios.",
    trustTier: "A",
  },

  // ---- 2026: GCC Regulatory Updates ----
  {
    id: "gcc-2026-01",
    title: "UAE Central Bank Issues Updated AML/CFT Guidance for Licensed Financial Institutions",
    source: "Central Bank of the UAE",
    sourceUrl: "https://www.centralbank.ae",
    publishedAt: "2026-07-02",
    category: "GCC Regulatory Updates",
    tags: ["uae", "aml", "aml_guidance", "kyc"],
    summary:
      "The guidance restates supervisory expectations on risk-based customer due diligence, sanctions screening quality and suspicious transaction reporting through the goAML platform. Institutions are expected to evidence screening list coverage, calibrate matching thresholds, and demonstrate timely escalation of alerts to the compliance officer.",
    trustTier: "A",
  },
  {
    id: "gcc-2026-02",
    title: "DFSA Sets Enhanced Expectations for Ongoing Monitoring and Periodic Review in the DIFC",
    source: "Dubai Financial Services Authority",
    sourceUrl: "https://www.dfsa.ae",
    publishedAt: "2026-05-14",
    category: "GCC Regulatory Updates",
    tags: ["uae", "difc", "cdd", "monitoring"],
    summary:
      "Authorised firms in the DIFC are expected to refresh customer risk ratings on a defined cycle, re-screen customers and beneficial owners against updated sanctions and PEP data, and retain evidence of each review. The DFSA highlights gaps where firms rely on onboarding-only screening without ongoing re-screening.",
    trustTier: "A",
  },
  {
    id: "gcc-2026-03",
    title: "Saudi Central Bank Strengthens AML Controls for Payment Service Providers and Open Banking",
    source: "Saudi Central Bank (SAMA)",
    sourceUrl: "https://www.sama.gov.sa",
    publishedAt: "2026-03-25",
    category: "GCC Regulatory Updates",
    tags: ["ksa", "payments", "psp", "aml"],
    summary:
      "SAMA reinforced requirements for licensed payment and open-banking providers, including real-time transaction monitoring, merchant onboarding due diligence and sanctions screening of both payers and payees. Providers must be able to reconstruct the full audit trail of any screened or blocked transaction on request.",
    trustTier: "A",
  },
  {
    id: "gcc-2026-04",
    title: "Qatar and Bahrain Regulators Align Beneficial Ownership Verification Requirements",
    source: "Qatar Financial Centre Regulatory Authority",
    sourceUrl: "https://www.qfcra.com",
    publishedAt: "2026-01-29",
    category: "GCC Regulatory Updates",
    tags: ["qatar", "bahrain", "ubo", "kyc"],
    summary:
      "Regulators in Qatar and Bahrain tightened expectations on identifying and verifying ultimate beneficial owners for corporate customers, including layered ownership structures across multiple jurisdictions. Firms should capture the full ownership chain, verify control where no 25% owner exists, and re-verify on material change.",
    trustTier: "A",
  },

  // ---- Reference items ----
  {
    id: "fallback-1",
    title: "FATF Updates Guidance on Virtual Assets and Virtual Asset Service Providers",
    source: "Financial Action Task Force",
    sourceUrl: "https://www.fatf-gafi.org",
    publishedAt: "2025-01-28",
    category: "Regulatory Updates",
    tags: ["crypto", "vasp", "aml_guidance"],
    summary: "New guidance clarifies the application of FATF standards to virtual assets and VASPs, with updated risk indicators for jurisdictions.",
    trustTier: "A",
  },
  {
    id: "fallback-2",
    title: "OFAC Designates Additional Entities Under Russia-Related Sanctions",
    source: "Office of Foreign Assets Control",
    sourceUrl: "https://ofac.treasury.gov",
    publishedAt: "2025-01-27",
    category: "Sanctions & Enforcement",
    tags: ["sanctions", "russia", "enforcement_action"],
    summary: "Treasury's OFAC adds multiple entities and individuals to the SDN List in connection with Russia's ongoing activities.",
    trustTier: "A",
  },
  {
    id: "fallback-3",
    title: "FCA Fines Major Bank £87.4m for AML Control Failures",
    source: "Financial Conduct Authority",
    sourceUrl: "https://www.fca.org.uk",
    publishedAt: "2025-01-25",
    category: "AML & Financial Crime",
    tags: ["enforcement_action", "aml", "banking"],
    summary: "The FCA has issued its largest AML fine following a multi-year investigation into systemic failures in transaction monitoring.",
    trustTier: "A",
  },
  {
    id: "fallback-4",
    title: "DFSA Issues Updated Guidance on Customer Due Diligence Requirements",
    source: "Dubai Financial Services Authority",
    sourceUrl: "https://www.dfsa.ae",
    publishedAt: "2025-01-24",
    category: "GCC Regulatory Updates",
    tags: ["kyc", "cdd", "uae"],
    summary: "The DFSA has published enhanced CDD requirements for authorised firms operating within the DIFC, effective Q2 2025.",
    trustTier: "A",
  },
  {
    id: "fallback-5",
    title: "FinCEN Issues Advisory on Illicit Finance Risks in the Real Estate Sector",
    source: "Financial Crimes Enforcement Network",
    sourceUrl: "https://www.fincen.gov",
    publishedAt: "2025-01-22",
    category: "Regulatory Updates",
    tags: ["real_estate", "aml_guidance", "advisory"],
    summary: "New advisory highlights money laundering vulnerabilities in residential and commercial real estate transactions.",
    trustTier: "A",
  },
  {
    id: "fallback-6",
    title: "SAMA Announces Enhanced AML Framework for Payment Service Providers",
    source: "Saudi Arabian Monetary Authority",
    sourceUrl: "https://www.sama.gov.sa",
    publishedAt: "2025-01-20",
    category: "GCC Regulatory Updates",
    tags: ["payments", "psp", "ksa", "aml"],
    summary: "Saudi Central Bank mandates enhanced AML controls for licensed PSPs, including real-time transaction monitoring requirements.",
    trustTier: "A",
  },
];

const normaliseTitle = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Live feeds don't cover every category evenly (Sanctions & Enforcement and GCC in
 * particular are often empty), so the monthly stored updates and the curated baseline
 * are always merged in and de-duplicated against live headlines. Newest first.
 */
function mergeSources(...sources: NewsItem[][]): NewsItem[] {
  const seen = new Set<string>();
  const merged: NewsItem[] = [];
  for (const source of [...sources, fallbackItems]) {
    for (const item of source) {
      const key = normaliseTitle(item.title);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }
  return merged.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

interface UseRSSFeedsResult {
  items: NewsItem[];
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
  refresh: () => void;
}

export function useRSSFeeds(): UseRSSFeedsResult {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const loadFeeds = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [liveResult, storedResult] = await Promise.allSettled([
      fetchAllFeeds(),
      fetchStoredUpdates(),
    ]);

    const liveItems = liveResult.status === "fulfilled" ? liveResult.value : [];
    const storedItems = storedResult.status === "fulfilled" ? storedResult.value : [];

    if (liveResult.status === "rejected") {
      console.error("Failed to fetch RSS feeds:", liveResult.reason);
      if (storedItems.length === 0) setError("Unable to load live updates");
    }

    setItems(mergeSources(liveItems, storedItems));
    setIsLive(liveItems.length > 0 || storedItems.length > 0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  return {
    items,
    isLoading,
    error,
    isLive,
    refresh: loadFeeds,
  };
}

export default useRSSFeeds;
