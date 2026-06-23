import { useState } from "react";

// Curated list of companies whose staff have already completed a WorldAML
// Academy course (verified against academy_certificates). Domain is used to
// resolve a logo via Clearbit's public Logo API — no API key required.
// Display name is used for the alt text and fallback chip.
interface LearnerCompany {
  name: string;
  domain: string;
}

const COMPANIES: LearnerCompany[] = [
  { name: "Mastercard", domain: "mastercard.com" },
  { name: "HSBC", domain: "hsbc.com" },
  { name: "BNP Paribas", domain: "bnpparibas.com" },
  { name: "U.S. Bank", domain: "usbank.com" },
  { name: "Linde", domain: "linde.com" },
  { name: "DXC Technology", domain: "dxc.com" },
  { name: "The Rank Group", domain: "rank.com" },
  { name: "Canara Bank", domain: "canarabank.com" },
  { name: "BRAC Bank", domain: "bracbank.com" },
  { name: "Pionex", domain: "pionex.com" },
  { name: "Copagro", domain: "copagro.com.br" },
  { name: "Oxford Brookes University", domain: "brookes.ac.uk" },
];

function LogoTile({ company }: { company: LearnerCompany }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        className="flex h-10 min-w-[120px] items-center justify-center rounded-md border border-border bg-card px-4 text-caption font-semibold text-muted-foreground"
        aria-label={company.name}
      >
        {company.name}
      </div>
    );
  }
  return (
    <img
      src={`https://logo.clearbit.com/${company.domain}?size=120`}
      alt={`${company.name} logo`}
      width={120}
      height={40}
      loading="lazy"
      onError={() => setErrored(true)}
      className="h-8 sm:h-10 w-auto object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
    />
  );
}

export default function LearnerLogos() {
  return (
    <section
      aria-label="Companies whose staff learn with WorldAML Academy"
      className="border-y border-border/60 bg-secondary/30"
    >
      <div className="container-enterprise py-8 sm:py-10">
        <p className="text-center text-caption font-semibold uppercase tracking-wide text-muted-foreground mb-5">
          Compliance teams already learning with WorldAML Academy
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-10">
          {COMPANIES.map((c) => (
            <LogoTile key={c.domain} company={c} />
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Based on certificates issued to learners using corporate email addresses. Logos are property of their respective owners; inclusion does not imply endorsement.
        </p>
      </div>
    </section>
  );
}
