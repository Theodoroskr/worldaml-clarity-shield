import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { NewsCard, type NewsItem, type NewsCategory } from "@/components/news/NewsCard";
import { CategoryFilter, type FilterCategory } from "@/components/news/CategoryFilter";
import { ArrowRight } from "lucide-react";

// Sample news data demonstrating the content structure
const sampleNewsItems: NewsItem[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
    id: "5",
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
    id: "6",
    title: "SAMA Announces Enhanced AML Framework for Payment Service Providers",
    source: "Saudi Arabian Monetary Authority",
    sourceUrl: "https://www.sama.gov.sa",
    publishedAt: "2025-01-20",
    category: "GCC Regulatory Updates",
    tags: ["payments", "psp", "ksa", "aml"],
    summary: "Saudi Central Bank mandates enhanced AML controls for licensed PSPs, including real-time transaction monitoring requirements.",
    trustTier: "A",
  },
  {
    id: "7",
    title: "EU AML Authority Publishes Draft Technical Standards",
    source: "European Banking Authority",
    sourceUrl: "https://www.eba.europa.eu",
    publishedAt: "2025-01-18",
    category: "Regulatory Updates",
    tags: ["amla", "eu", "technical_standards"],
    summary: "Draft standards outline supervisory expectations for obliged entities ahead of the new EU AML Authority becoming operational.",
    trustTier: "A",
  },
  {
    id: "8",
    title: "INTERPOL Reports Surge in Cross-Border Financial Crime Networks",
    source: "INTERPOL",
    sourceUrl: "https://www.interpol.int",
    publishedAt: "2025-01-15",
    category: "AML & Financial Crime",
    tags: ["organized_crime", "cross_border", "law_enforcement"],
    summary: "Global operation identifies coordinated money laundering networks operating across 40+ jurisdictions.",
    trustTier: "B",
  },
];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("All");

  const filteredNews = useMemo(() => {
    if (selectedCategory === "All") return sampleNewsItems;
    return sampleNewsItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h1 className="text-display-sm md:text-display font-bold text-navy mb-4">
                News & Regulatory Updates
              </h1>
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
            {/* Category Filter */}
            <div className="mb-8">
              <CategoryFilter 
                selected={selectedCategory} 
                onSelect={setSelectedCategory} 
              />
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>

            {/* Empty State */}
            {filteredNews.length === 0 && (
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
                  <Link to="/api">
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
