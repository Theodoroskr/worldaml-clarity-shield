import { supabase } from "@/integrations/supabase/client";

export type PartnerAuditEntityType =
  | "partner_application"
  | "partner"
  | "deal_registration"
  | "referral"
  | "notification_settings";

export async function logPartnerAdminAction(params: {
  action: string;
  entity_type: PartnerAuditEntityType;
  entity_id?: string | null;
  entity_label?: string | null;
  changes?: Record<string, unknown> | null;
}) {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) return;
    await supabase.from("partner_admin_audit_log" as any).insert({
      actor_user_id: user.id,
      actor_email: user.email ?? null,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id ?? null,
      entity_label: params.entity_label ?? null,
      changes: params.changes ?? null,
    } as any);
  } catch (e) {
    // Non-fatal — never block the primary admin action on audit write.
    console.error("partner audit log failed:", e);
  }
}
