import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BestPracticeCard } from "@/components/bestpractices/BestPracticeCard";
import { bestPractices, type BestPracticeCategory } from "@/data/bestPractices";
import { cn } from "@/lib/utils";
import { BookOpen, ArrowRight, ShieldCheck } from "lucide-react";

type FilterCategory = "All" | BestPracticeCategory;

const categories: FilterCategory[] = [
  "All",
  "KYC/KYB",
  "Sanctions Screening",
  "Ongoing Monitoring",
  "Risk Assessment",
  "Governance & Audit",
];

const BestPractices = () => {
  const [selected, setSelected] = useState<FilterCategory>("All");

  const filtered = useMemo(
    () =>
      selected === "All"
        ? bestPractices
        : bestPractices.filter((bp) => bp.category === selected),
    [selected]
  );

  return (
    <>
      <SEO
        title="Global AML & Compliance Best Practices | WorldAML"
        description="Curated AML and compliance best practices from FATF, Basel Committee, Wolfsberg Group, FCA, FinCEN, and leading global banks. Linked to WorldAML features."
        canonical="/resources/best-practices"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/best-practices" },
          { name: "Best Practices", url: "/resources/best-practices" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-surface-subtle to-background border-b border-divider">
        <div className="container-enterprise py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-caption font-semibold px-3 py-1.5 rounded-full mb-6">
              <BookOpen className="w-4 h-4" />
              Global Best Practices
            </div>
            <h1 className="text-h1 font-bold text-navy mb-6">
              AML & Compliance Best Practices from Global Institutions
            </h1>
            <p className="text-body-lg text-text-secondary mb-8 max-w-2xl">
              Curated frameworks and principles drawn from FATF, the Basel Committee, Wolfsberg
              Group, FCA, FinCEN, QFCRA and leading global banks — each linked to the WorldAML
              feature that helps you apply them.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-body-sm text-text-tertiary">
              {["FATF", "Basel Committee", "Wolfsberg Group", "FCA", "FinCEN", "EU AMLD6", "QFCRA", "CBUAE"].map((inst) => (
                <span key={inst} className="bg-secondary px-3 py-1 rounded-full font-medium text-text-secondary">
                  {inst}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="container-enterprise py-12 md:py-16">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-body-sm font-medium transition-all",
                selected === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-text-secondary hover:bg-secondary/80 hover:text-navy"
              )}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({bestPractices.filter((bp) => bp.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-body-sm text-text-tertiary mb-8">
          Showing <span className="font-semibold text-navy">{filtered.length}</span>{" "}
          best practices{selected !== "All" ? ` in "${selected}"` : ""}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((bp) => (
            <BestPracticeCard key={bp.id} item={bp} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-subtle border-t border-divider">
        <div className="container-enterprise py-16 md:py-20 text-center">
          <h2 className="text-h2 font-bold text-navy mb-4">
            See These Practices in Action
          </h2>
          <p className="text-body-lg text-text-secondary mb-8 max-w-xl mx-auto">
            WorldAML is built around these global standards. Book a demo to see how our
            platform operationalises FATF, Basel, and FCA requirements for your team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/demo">Request a Demo <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/platform">Explore the Platform</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/resources/sanctions-lists">
                <ShieldCheck className="w-4 h-4 mr-2" />
                View Official Sanctions Sources
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default BestPractices;
