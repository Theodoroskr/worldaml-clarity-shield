import { supabase } from "@/integrations/supabase/client";

/** Optional, separately priced add-on modules for Screening & Monitoring. */
export interface ScreeningModuleDefinition {
  key: string;
  name: string;
  tagline: string;
  monthlyPriceEur: number;
  priceNote: string;
  bullets: string[];
}

export const SCREENING_MODULES: ScreeningModuleDefinition[] = [
  {
    key: "four_eyes",
    name: "Escalation & Four-Eyes Review",
    tagline:
      "Segregation of duties for organisations where analysts, compliance officers and the MLRO hold different authority levels.",
    monthlyPriceEur: 149,
    priceNote: "€149 / month per organisation (unlimited seats)",
    bullets: [
      "Analysts can escalate a match instead of closing it",
      "Escalations are routed to the MLRO (or compliance officer) and appear in their queue",
      "Only MLRO, compliance officer or organisation admin can resolve an escalated match",
      "Escalation reason, reviewer and timestamps recorded in the audit trail",
    ],
  },
];

export type ScreeningModuleStatus =
  | "not_requested"
  | "requested"
  | "active"
  | "cancelled"
  | "expired";

export interface ScreeningModuleState {
  organisation_id: string | null;
  module: string | null;
  status: ScreeningModuleStatus;
  monthly_price_eur: number | null;
  requested_at: string | null;
  activated_at: string | null;
  current_period_end: string | null;
  member_role: string | null;
}

export interface ScreeningModulesSnapshot {
  organisationId: string | null;
  memberRole: string | null;
  modules: Record<string, ScreeningModuleState>;
}

export async function fetchScreeningModules(): Promise<ScreeningModulesSnapshot> {
  const { data, error } = await supabase.rpc("current_user_screening_modules");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as ScreeningModuleState[];
  const snapshot: ScreeningModulesSnapshot = {
    organisationId: rows[0]?.organisation_id ?? null,
    memberRole: rows[0]?.member_role ?? null,
    modules: {},
  };
  for (const row of rows) {
    if (!row.module) continue;
    snapshot.modules[row.module] = row;
  }
  return snapshot;
}

export function isModuleActive(snapshot: ScreeningModulesSnapshot | null, key: string): boolean {
  const state = snapshot?.modules[key];
  if (!state || state.status !== "active") return false;
  if (state.current_period_end && new Date(state.current_period_end) <= new Date()) return false;
  return true;
}

/** Organisation admins and MLROs can opt in; activation is confirmed by WorldAML. */
export async function requestScreeningModule(organisationId: string, key: string) {
  const definition = SCREENING_MODULES.find((m) => m.key === key);
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("You need to be signed in");

  const { error } = await supabase.from("screening_org_modules").insert({
    organisation_id: organisationId,
    module: key,
    status: "requested",
    requested_by: userId,
    monthly_price_eur: definition?.monthlyPriceEur ?? null,
  });
  if (error) throw new Error(error.message);
}

export const SENIOR_ROLES = ["mlro", "compliance_officer", "admin"];

export function isSeniorReviewer(role: string | null | undefined): boolean {
  return SENIOR_ROLES.includes(String(role ?? ""));
}
