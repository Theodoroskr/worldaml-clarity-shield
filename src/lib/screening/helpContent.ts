// Curated in-app help content for the Screening & Monitoring workspace.
// Static by design: no backend round-trip, versioned with the product.
import { riskAlertHelp } from "@/lib/riskAlertHelp";

export type HelpCategory =
  | "Getting started"
  | "Running a screening"
  | "Reviewing matches"
  | "Ongoing monitoring"
  | "Risk alerts"
  | "Plans & quota"
  | "Team & access";

export interface HelpArticleEntry {
  id: string;
  category: HelpCategory;
  title: string;
  body: string;
  /** Optional in-app destination related to the article. */
  link?: { label: string; to: string };
}

export const HELP_CATEGORY_ORDER: HelpCategory[] = [
  "Getting started",
  "Running a screening",
  "Reviewing matches",
  "Ongoing monitoring",
  "Risk alerts",
  "Plans & quota",
  "Team & access",
];

export const SUPPORT_CATEGORIES = [
  "Screening results",
  "Ongoing monitoring",
  "Billing & plans",
  "Team & access",
  "Technical issue",
  "Something else",
] as const;

const baseArticles: HelpArticleEntry[] = [
  {
    id: "start-workspace",
    category: "Getting started",
    title: "What this workspace does",
    body: "Screening & Monitoring lets you check people and organisations against 1,900+ sanctions, PEP, watchlist and adverse media sources, review the matches as a case, record a decision, and keep subjects under ongoing monitoring afterwards. Everything you do is recorded for audit: searches, filters, match decisions and monitoring changes.",
    link: { label: "Open the workspace", to: "/screening" },
  },
  {
    id: "start-first-search",
    category: "Getting started",
    title: "Your first screening in three steps",
    body: "1) Enter the subject's full name as it appears on their document and pick the entity type. 2) Run the search and review each match, opening the profile drawer for details. 3) Record a decision on every match — confirm, mark false positive or escalate — and optionally add the subject to ongoing monitoring. The case status updates automatically as you decide.",
  },
  {
    id: "search-entity-type",
    category: "Running a screening",
    title: "Entity type, including \"Any\"",
    body: "Entity type tells the provider whether to look for a person, an organisation, a vessel or an aircraft. Choosing \"Any\" removes the filter entirely, so records with a missing or mis-typed entity type still appear — useful when a company is filed as a person, or when you are reconciling against the provider's own portal. With \"Any\" selected, entity-type conflict warnings are suppressed because no type was asserted.",
  },
  {
    id: "search-fuzziness",
    category: "Running a screening",
    title: "Fuzziness interval",
    body: "Fuzziness controls how wide the provider casts the net. A low value only tolerates small typos, a high value also tolerates reordered names, missing middle names and transliteration differences. It is a recall setting, not a precision setting: raising it brings back more candidates, which are then ranked locally by our own similarity engine. Start at the default and raise it when you expect transliterated or reordered names.",
  },
  {
    id: "search-sources",
    category: "Running a screening",
    title: "Sources and list coverage",
    body: "By default the search covers sanctions, PEP/RCA, regulatory warnings and — where your plan includes it — adverse media. Narrowing sources reduces noise but risks missing a hit, so keep the full set for regulated onboarding checks and narrow only for targeted investigations.",
  },
  {
    id: "search-provider-preset",
    category: "Running a screening",
    title: "\"Match provider portal view\"",
    body: "This preset reproduces the data provider's own portal defaults in one click: 50% fuzziness, all entity types and all source categories. Use it when a colleague sees a different number of results in the provider portal than you see here — after applying the preset, the two views should line up.",
  },
  {
    id: "search-active-filters",
    category: "Running a screening",
    title: "The active filters panel",
    body: "The search summary lists every filter actually applied to the query — entity type, fuzziness, sources and any exclusions. If a result you expected is missing, check this panel first: nearly always a filter, not the provider, removed it.",
  },
  {
    id: "results-match-basis",
    category: "Reviewing matches",
    title: "Match basis colours and similarity scores",
    body: "Each match shows why it was returned: name, date of birth, nationality, identifier and other attributes are individually marked as matching, partially matching, conflicting or unavailable. The similarity score is calculated locally with a Jaro-Winkler based engine, so it is consistent across providers. Treat conflicts on strong identifiers (date of birth, passport number) as evidence for a false positive, never the score alone.",
  },
  {
    id: "results-grouping",
    category: "Reviewing matches",
    title: "Grouping duplicate entities",
    body: "Providers often return the same person several times, once per list. \"Group duplicate entities\" merges hits that share a normalised name, year of birth and country into one card, showing the combined risk categories and a \"N listings merged\" breakdown. Grouping is display-only — the underlying records are stored and exported individually for audit.",
  },
  {
    id: "results-drawer",
    category: "Reviewing matches",
    title: "Profile drawer and photos",
    body: "Click a match card — or its photo — to open the full profile drawer with aliases, dates of birth, nationalities, identifiers, list memberships and source references. Photos are loaded lazily and cached for the session so repeated reviews stay fast.",
  },
  {
    id: "results-decisions",
    category: "Reviewing matches",
    title: "What each decision does",
    body: "Confirm match marks the hit as a true match and moves the case to Match confirmed. False positive removes it from the outstanding review list and, once every match is cleared, closes the case as False positives resolved. Escalate routes the case for senior review. Add to ongoing monitoring keeps the subject under watch. Every decision stores your rationale and is written to the audit trail.",
  },
  {
    id: "results-export",
    category: "Reviewing matches",
    title: "Exporting a decision record",
    body: "You can export a branded PDF of the case containing the search parameters, the matches with their scores and match basis, and the decisions with rationale and timestamps. This is the artefact to keep on file for your regulator or auditor.",
  },
  {
    id: "monitoring-activate",
    category: "Ongoing monitoring",
    title: "Adding a subject to ongoing monitoring",
    body: "Use \"Monitor this subject\" on the case header — including when a search returned no matches — or the \"Add to ongoing monitoring\" decision on a specific match. Activation checks your monitoring quota, registers the subject with the data provider and creates a monitored entity you can see under Monitored entities.",
    link: { label: "Monitored entities", to: "/screening/monitored" },
  },
  {
    id: "monitoring-timeline",
    category: "Ongoing monitoring",
    title: "The monitoring timeline",
    body: "The case page shows when monitoring was activated, paused or stopped and when the provider sent an update. Updates arrive from a daily check, so alerts are as fresh as that schedule rather than real time.",
  },
  {
    id: "monitoring-review",
    category: "Ongoing monitoring",
    title: "Reviewing monitoring updates",
    body: "A provider update marks the case as \"Monitoring update requires review\" and shows a Requires review badge in the timeline. Open the case, look at what changed, then use Mark reviewed — or Mark all reviewed — to clear the flag. Clearing is recorded with your user and timestamp.",
  },
  ...riskAlertHelp.articles.map((a, i) => ({
    id: `risk-alerts-${i}`,
    category: "Risk alerts" as const,
    title: a.title,
    body: a.body,
    link:
      i === 0
        ? { label: "Manage risk alert rules", to: "/screening/risk-alerts" }
        : undefined,
  })),
  {
    id: "plans-demo",
    category: "Plans & quota",
    title: "The free demo plan",
    body: "Signing in without a subscription activates a one-time demo with 5 free screening searches against the live data sources. Ongoing monitoring, adverse media and case exports need a paid package. Demo searches do not roll over.",
    link: { label: "View packages", to: "/screening-monitoring/pricing" },
  },
  {
    id: "plans-quota",
    category: "Plans & quota",
    title: "How your quota is counted",
    body: "Each executed search consumes one screening from your annual allowance; opening a saved case, re-reading results or exporting a PDF does not. Monitored entities are counted separately against your monitoring quota. The sidebar shows both remaining balances.",
  },
  {
    id: "plans-billing",
    category: "Plans & quota",
    title: "Upgrading, receipts and renewals",
    body: "Upgrades are purchased by card and activate immediately after checkout; the activation page shows your plan, quotas, amount paid and next billing date, plus a link to the hosted receipt. A confirmation email with the same details is sent on activation.",
  },
  {
    id: "team-invite",
    category: "Team & access",
    title: "Inviting colleagues",
    body: "Invite teammates from Team & access. Each seat counts against your plan's seat quota, and invited users join your organisation, so they see the same cases, monitored entities and alert rules.",
    link: { label: "Team & access", to: "/screening/team" },
  },
  {
    id: "team-roles",
    category: "Team & access",
    title: "Roles and what they can do",
    body: "Analysts run screenings and record decisions. Reviewers and MLRO approvers handle escalations. Viewers can read cases and exports but cannot decide. Admins additionally manage seats, add-on modules and billing.",
  },
  {
    id: "team-modules",
    category: "Team & access",
    title: "Add-on modules",
    body: "Optional paid modules extend the workspace — for example Escalation & Four-Eyes Review, which requires a second approver before a confirmed match can be closed. Modules are enabled per organisation and take effect immediately.",
    link: { label: "Add-on modules", to: "/screening/modules" },
  },
];

export const HELP_ARTICLES: HelpArticleEntry[] = baseArticles;

export function searchHelpArticles(query: string): HelpArticleEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return HELP_ARTICLES;
  const terms = q.split(/\s+/);
  return HELP_ARTICLES.filter((a) => {
    const haystack = `${a.title} ${a.body} ${a.category}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
