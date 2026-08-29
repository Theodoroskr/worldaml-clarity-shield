// Shared risk-level evaluation + threshold alert dispatch for the
// Screening & Monitoring workspace.
//
// Risk levels are derived from WorldAML's own match-count rules
// (provider-independent):
//   sanctions > 0            -> high
//   pep_rca or warnings > 0  -> medium
//   adverse_media > 0        -> elevated
//   otherwise                -> low
//
// evaluateRiskAlerts() compares the newly derived level with the level stored
// on monitoring_subjects. It only fires on an increase, which inherently
// suppresses repeat alerts at the same level until the level changes again.

import { Resend } from "npm:resend";

export type RiskLevel = "low" | "elevated" | "medium" | "high";

export const RISK_ORDER: Record<RiskLevel, number> = { low: 0, elevated: 1, medium: 2, high: 3 };

export interface MatchCounts {
  sanctions: number;
  pep_rca: number;
  warnings: number;
  adverse_media: number;
}

export function deriveRiskLevel(c: MatchCounts): RiskLevel {
  if (c.sanctions > 0) return "high";
  if (c.pep_rca > 0 || c.warnings > 0) return "medium";
  if (c.adverse_media > 0) return "elevated";
  return "low";
}

interface AlertRule {
  id: string;
  name: string;
  threshold: RiskLevel;
  categories: string[];
  assigned_to: string | null;
  notify_in_app: boolean;
  notify_email: boolean;
  email_recipients: string[];
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const LEVEL_LABEL: Record<RiskLevel, string> = {
  low: "Low", elevated: "Elevated", medium: "Medium", high: "High",
};

// deno-lint-ignore no-explicit-any
type Admin = any;

/**
 * Evaluate risk for a monitored entity after its match counts changed.
 * Fires in-app and/or email alerts for active rules whose threshold is met
 * when the level has increased since the last evaluation.
 * Returns the derived level (also when nothing fired).
 */
export async function evaluateRiskAlerts(
  admin: Admin,
  args: {
    organisationId: string;
    monitoringSubjectId: string;
    caseId: string | null;
    entityName: string;
    counts: MatchCounts;
  },
): Promise<RiskLevel> {
  const level = deriveRiskLevel(args.counts);

  const { data: subj } = await admin
    .from("monitoring_subjects")
    .select("risk_level, assigned_to")
    .eq("id", args.monitoringSubjectId)
    .maybeSingle();
  if (!subj) return level;

  const previous = (subj.risk_level ?? "low") as RiskLevel;
  const increased = RISK_ORDER[level] > RISK_ORDER[previous];

  // Always persist the latest evaluation so future comparisons are accurate.
  await admin
    .from("monitoring_subjects")
    .update({
      risk_level: level,
      ...(increased ? { risk_level_changed_at: new Date().toISOString() } : {}),
    })
    .eq("id", args.monitoringSubjectId);

  if (!increased) return level;

  const { data: rules } = await admin
    .from("screening_risk_alert_rules")
    .select("id,name,threshold,categories,assigned_to,notify_in_app,notify_email,email_recipients")
    .eq("organisation_id", args.organisationId)
    .eq("enabled", true);

  const matched = ((rules as AlertRule[] | null) ?? []).filter((r) => {
    if (RISK_ORDER[level] < RISK_ORDER[r.threshold]) return false;
    if (r.assigned_to && r.assigned_to !== subj.assigned_to) return false;
    if (r.categories?.length) {
      const cats: Record<string, number> = {
        sanctions: args.counts.sanctions,
        pep_rca: args.counts.pep_rca,
        warnings: args.counts.warnings,
        adverse_media: args.counts.adverse_media,
      };
      if (!r.categories.some((c) => (cats[c] ?? 0) > 0)) return false;
    }
    return true;
  });
  if (!matched.length) return level;

  const now = new Date().toISOString();
  const description =
    `Risk level increased to ${LEVEL_LABEL[level]} for ${args.entityName} ` +
    `(sanctions: ${args.counts.sanctions}, PEP/RCA: ${args.counts.pep_rca}, ` +
    `warnings: ${args.counts.warnings}, adverse media: ${args.counts.adverse_media})`;

  const triggeredRuleIds: string[] = [];
  for (const rule of matched) {
    if (rule.notify_in_app) {
      await admin.from("monitoring_alerts").insert({
        organisation_id: args.organisationId,
        monitoring_subject_id: args.monitoringSubjectId,
        case_id: args.caseId,
        change_type: "risk_threshold",
        change_description: `[${rule.name}] ${description}`,
        details: {
          rule_id: rule.id,
          previous_level: previous,
          new_level: level,
          counts: args.counts,
        },
        status: "new",
        detected_at: now,
      });
    }

    if (rule.notify_email && rule.email_recipients?.length) {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        try {
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: "WorldAML Screening <alerts@worldaml.com>",
            to: rule.email_recipients,
            subject: `Risk threshold crossed: ${args.entityName} is now ${LEVEL_LABEL[level]} risk`,
            html:
              `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">` +
              `<h2 style="color:#0f172a">Risk threshold crossed</h2>` +
              `<p><strong>${esc(args.entityName)}</strong> has moved from ` +
              `<strong>${LEVEL_LABEL[previous]}</strong> to ` +
              `<strong style="color:${level === "high" ? "#dc2626" : "#ea580c"}">${LEVEL_LABEL[level]}</strong> risk.</p>` +
              `<p style="color:#475569;font-size:14px">${esc(description)}</p>` +
              `<p style="color:#475569;font-size:14px">Rule: ${esc(rule.name)} (threshold: ${LEVEL_LABEL[rule.threshold]})</p>` +
              `<p><a href="https://worldaml.com/screening/monitored" ` +
              `style="display:inline-block;background:#0f766e;color:#fff;padding:10px 18px;border-radius:8px;` +
              `text-decoration:none;font-weight:600">Review in Monitored entities</a></p>` +
              `<p style="color:#94a3b8;font-size:12px;margin-top:24px">WorldAML Screening &amp; Monitoring — risk alert</p>` +
              `</div>`,
          });
        } catch (err) {
          console.warn("Risk alert email failed", err);
        }
      }
    }
    triggeredRuleIds.push(rule.id);
  }

  if (triggeredRuleIds.length) {
    await admin
      .from("screening_risk_alert_rules")
      .update({ last_triggered_at: now })
      .in("id", triggeredRuleIds);

    await admin.from("screening_audit_events").insert({
      organisation_id: args.organisationId,
      case_id: args.caseId,
      event_type: "risk_threshold_crossed",
      description,
      metadata: { previous_level: previous, new_level: level, rules: triggeredRuleIds },
    });
  }

  return level;
}
