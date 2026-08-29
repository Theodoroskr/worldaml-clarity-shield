// Structured help content for configurable risk alerts.
// Written once here so the future help assistance module can surface the same copy.

export interface HelpArticle {
  title: string;
  body: string;
}

export const riskAlertHelp: { summary: string; articles: HelpArticle[] } = {
  summary:
    "Risk alerts notify you when a monitored entity's risk level rises above a threshold you choose.",
  articles: [
    {
      title: "What risk levels mean",
      body: "Every monitored entity has a risk level derived from its screening results: High (at least one sanctions match), Medium (PEP/RCA or regulatory warning matches), Elevated (adverse media matches only), or Low (no matches). Levels are provider-independent — they come from your match counts, not an external score.",
    },
    {
      title: "How thresholds work",
      body: "A rule fires when an entity's level increases to or past the threshold you set. For example, a Medium threshold also triggers on High. Only increases trigger alerts — an entity dropping back to Low is visible in its history but does not send a notification.",
    },
    {
      title: "When alerts are evaluated",
      body: "Risk is re-evaluated each time a screening runs and each time the daily monitoring check detects new data for an entity. Alerts are therefore as fresh as your monitoring schedule, not real-time.",
    },
    {
      title: "Who gets notified",
      body: "Each rule controls its own channels: an in-app alert in the Monitored entities timeline, an email to the addresses you list, or both. You can scope a rule to specific categories (for example sanctions only) or to entities assigned to a specific team member.",
    },
    {
      title: "Reducing noise",
      body: "Repeat alerts are suppressed: once an entity triggers at a level, the same rule will not fire again for that entity until its level changes. Prefer one broad Medium rule over many narrow ones, and use category scoping to keep adverse-media-only changes out of escalation channels.",
    },
  ],
};
