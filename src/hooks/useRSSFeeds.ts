import { useState, useEffect, useCallback } from "react";
import type { NewsItem } from "@/components/news/NewsCard";
import { fetchAllFeeds } from "@/services/rssService";

// Fallback sample data in case feeds fail
const fallbackItems: NewsItem[] = [
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

    try {
      const liveItems = await fetchAllFeeds();

      if (liveItems.length > 0) {
        setItems(liveItems);
        setIsLive(true);
      } else {
        // Use fallback if no live items
        setItems(fallbackItems);
        setIsLive(false);
      }
    } catch (err) {
      console.error("Failed to fetch RSS feeds:", err);
      setError("Unable to load live updates");
      setItems(fallbackItems);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
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
