// Client-side lead scoring for /book-demo qualifying form.
// Score 0-100. Higher = better fit / higher intent.

export type BookDemoLead = {
  email: string;
  company: string;
  companySize: "1-10" | "11-50" | "51-200" | "200+";
  industry: "bank" | "fintech" | "crypto" | "igaming" | "other";
  jurisdiction: string;
  role: "mlro" | "compliance" | "cto" | "founder" | "other";
  useCases: string[]; // ['aml','kyc','tm','reporting']
  volume: "lt_1k" | "1k_10k" | "10k_100k" | "gt_100k";
};

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "live.com",
  "msn.com",
  "yandex.com",
  "mail.com",
  "gmx.com",
  "zoho.com",
]);

export function isFreeEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return !!domain && FREE_EMAIL_DOMAINS.has(domain);
}

export function calculateLeadScore(lead: BookDemoLead): {
  score: number;
  tier: "hot" | "qualified" | "low";
  breakdown: Record<string, number>;
} {
  const breakdown: Record<string, number> = {};

  // Work email (25)
  breakdown.work_email = isFreeEmail(lead.email) ? 0 : 25;

  // Company size (20)
  breakdown.company_size = { "1-10": 5, "11-50": 12, "51-200": 18, "200+": 20 }[lead.companySize] ?? 0;

  // Industry fit — banks/fintech/crypto/igaming are ICP (20)
  breakdown.industry = { bank: 20, fintech: 20, crypto: 18, igaming: 18, other: 5 }[lead.industry] ?? 0;

  // Role / decision-maker (15)
  breakdown.role = { mlro: 15, compliance: 13, cto: 10, founder: 12, other: 3 }[lead.role] ?? 0;

  // Volume (15) — bigger volume = bigger contract
  breakdown.volume = { lt_1k: 3, "1k_10k": 8, "10k_100k": 13, gt_100k: 15 }[lead.volume] ?? 0;

  // Use case breadth (5) — more modules = stickier
  breakdown.use_cases = Math.min(5, lead.useCases.length * 2);

  const score = Math.min(
    100,
    Object.values(breakdown).reduce((a, b) => a + b, 0),
  );

  const tier: "hot" | "qualified" | "low" =
    score >= 70 ? "hot" : score >= 40 ? "qualified" : "low";

  return { score, tier, breakdown };
}
