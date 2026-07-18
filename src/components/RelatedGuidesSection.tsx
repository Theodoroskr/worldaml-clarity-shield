import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export interface RelatedGuideLink {
  to: string;
  title: string;
  description: string;
}

interface Props {
  heading?: string;
  intro?: string;
  currentPath?: string;
  links: RelatedGuideLink[];
}

/**
 * Contextual internal-linking block for compliance guide pages.
 * Improves topical relevance and crawl paths between related guides.
 */
export const RelatedGuidesSection = ({
  heading = "Related compliance guides",
  intro,
  currentPath,
  links,
}: Props) => {
  const filtered = links.filter((l) => l.to !== currentPath);
  if (filtered.length === 0) return null;

  return (
    <section className="section-padding bg-surface-subtle border-t border-divider">
      <div className="container-enterprise max-w-5xl">
        <h2 className="text-headline text-foreground mb-3">{heading}</h2>
        {intro && (
          <p className="text-body text-muted-foreground mb-8 max-w-3xl">
            {intro}
          </p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary flex items-center gap-2">
                {l.title}
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-body-sm text-muted-foreground">
                {l.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Central registry of guide links for consistent, curated cross-linking.
export const GUIDE_LINKS: Record<string, RelatedGuideLink> = {
  whatIsSanctions: {
    to: "/resources/what-is-sanctions-screening",
    title: "What is Sanctions Screening?",
    description: "Plain-English guide to OFAC, UN, EU, HMT lists and how screening programmes work.",
  },
  sanctionsSoftware: {
    to: "/sanctions-screening-software",
    title: "Sanctions Screening Software",
    description: "Real-time and batch screening across 1,900+ global lists, tuned to reduce false positives.",
  },
  sanctionsLists: {
    to: "/resources/sanctions-lists",
    title: "Sanctions Lists Directory",
    description: "Coverage of every major global sanctions and watchlist regime.",
  },
  amlChecklist: {
    to: "/resources/aml-compliance-checklist",
    title: "AML Compliance Checklist",
    description: "Step-by-step operational checklist for building an AML programme.",
  },
  usGuide: {
    to: "/resources/us-aml-kyc-compliance-guide",
    title: "US AML & KYC Compliance Guide",
    description: "FinCEN, OFAC, FFIEC and the six pillars of a US AML programme.",
  },
  uaeGuide: {
    to: "/resources/uae-aml-compliance-guide",
    title: "UAE AML Compliance Guide",
    description: "Central Bank of UAE, goAML, and Local Terrorist List requirements.",
  },
  fatfTravel: {
    to: "/resources/fatf-travel-rule-guide",
    title: "FATF Travel Rule Guide",
    description: "Recommendation 16 for VASPs, thresholds, and originator/beneficiary data.",
  },
  compareProviders: {
    to: "/resources/comparison/world-check-vs-worldcompliance-vs-dow-jones",
    title: "World-Check vs WorldCompliance vs Dow Jones",
    description: "Side-by-side comparison of the top three AML data providers.",
  },
  worldCheckAlt: {
    to: "/world-check-alternative",
    title: "World-Check Alternative",
    description: "How LexisNexis WorldCompliance compares as a Refinitiv World-Check replacement.",
  },
  csUS: {
    to: "/compliance-software/us",
    title: "Compliance Software — United States",
    description: "US-focused platform overview for FinCEN, OFAC, and FFIEC-regulated firms.",
  },
  csUK: {
    to: "/compliance-software/uk",
    title: "Compliance Software — United Kingdom",
    description: "FCA, HMRC and OFSI-aligned compliance software for UK firms.",
  },
  csNL: {
    to: "/compliance-software/nl",
    title: "Compliance Software — Netherlands",
    description: "DNB, AFM and Wwft-aligned platform for Dutch obliged entities.",
  },
  csCH: {
    to: "/compliance-software/ch",
    title: "Compliance Software — Switzerland",
    description: "FINMA, SECO and GwG-aligned compliance software for Swiss firms.",
  },
  csIT: {
    to: "/compliance-software/it",
    title: "Compliance Software — Italy",
    description: "Banca d'Italia, UIF and D.Lgs. 231/2007-aligned platform for Italian firms.",
  },
  amlScreeningUK: {
    to: "/aml-screening-uk",
    title: "AML Screening — UK",
    description: "UK-specific screening workflows aligned with MLR 2017 and JMLSG guidance.",
  },
  amlScreeningEU: {
    to: "/aml-screening-eu",
    title: "AML Screening — EU",
    description: "EU-wide screening aligned with AMLD6 and the incoming AMLA regime.",
  },
  platformScreening: {
    to: "/platform/aml-screening",
    title: "AML Screening Platform",
    description: "Product overview of the WorldAML screening orchestration layer.",
  },
};

export default RelatedGuidesSection;
