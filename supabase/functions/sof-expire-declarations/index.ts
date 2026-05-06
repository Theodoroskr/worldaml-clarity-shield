// Daily sweep: expire verified SoF declarations past their 12-month term and
// notify each organisation's compliance team via email.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML <forms@worldaml.com>";
const SOF_URL = "https://worldaml.com/suite/source-of-funds";
const NOTIFY_ROLES = ["admin", "mlro", "compliance_officer"];

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth: require service-role key (cron-only endpoint)
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token || token !== SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      SERVICE_ROLE_KEY,
    );

    // 1. Find verified declarations whose term has ended
    const { data: dueDecls, error: selErr } = await supabase
      .from("suite_sof_declarations")
      .select("id, customer_id, organisation_id, expires_at")
      .eq("status", "verified")
      .lte("expires_at", new Date().toISOString());

    if (selErr) throw selErr;

    const expiredCount = dueDecls?.length ?? 0;

    if (expiredCount === 0) {
      return new Response(
        JSON.stringify({ expired_count: 0, notified_orgs: 0, errors: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Flip status -> expired (audit trigger logs the change automatically)
    const ids = dueDecls!.map((d) => d.id);
    const { error: updErr } = await supabase
      .from("suite_sof_declarations")
      .update({ status: "expired" })
      .in("id", ids);
    if (updErr) throw updErr;

    // 3. Enrich with customer names
    const customerIds = [...new Set(dueDecls!.map((d) => d.customer_id))];
    const { data: customers } = await supabase
      .from("suite_customers")
      .select("id, name")
      .in("id", customerIds);
    const custName = new Map((customers ?? []).map((c) => [c.id, c.name]));

    // 4. Group by organisation
    const byOrg = new Map<string, typeof dueDecls>();
    for (const d of dueDecls!) {
      const list = byOrg.get(d.organisation_id) ?? [];
      list.push(d);
      byOrg.set(d.organisation_id, list);
    }

    const errors: string[] = [];
    let notifiedOrgs = 0;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;
    if (!resend) console.warn("RESEND_API_KEY not set — skipping notifications");

    // 5. Notify each organisation's compliance team
    for (const [orgId, decls] of byOrg.entries()) {
      try {
        const { data: members } = await supabase
          .from("suite_org_members")
          .select("user_id, role")
          .eq("organization_id", orgId)
          .in("role", NOTIFY_ROLES);

        const userIds = [...new Set((members ?? []).map((m) => m.user_id))];
        if (userIds.length === 0) continue;

        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, email, full_name")
          .in("user_id", userIds);

        const recipients = (profiles ?? [])
          .map((p) => p.email)
          .filter((e): e is string => !!e);
        if (recipients.length === 0 || !resend) continue;

        const rows = decls!
          .map((d) => {
            const name = escapeHtml(custName.get(d.customer_id) ?? "Unknown customer");
            const exp = d.expires_at
              ? new Date(d.expires_at).toLocaleDateString("en-GB")
              : "—";
            return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${name}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${exp}</td></tr>`;
          })
          .join("");

        const subject = `SoF declarations expired — ${decls!.length} customer(s) require re-verification`;
        const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f6f8fb;padding:24px;color:#0f172a;">
<div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
  <h2 style="margin:0 0 8px 0;color:#0f1b3d;">Source of Funds — re-verification required</h2>
  <p style="margin:0 0 20px 0;color:#475569;">The following verified SoF declarations have reached the end of their 12-month term and have been moved to <strong>expired</strong>. Please initiate re-verification.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <thead><tr style="background:#f1f5f9;"><th style="text-align:left;padding:10px 12px;">Customer</th><th style="text-align:left;padding:10px 12px;">Expired on</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:24px;text-align:center;">
    <a href="${SOF_URL}" style="display:inline-block;background:#0d9488;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Open Source of Funds</a>
  </div>
  <p style="margin:24px 0 0 0;font-size:12px;color:#94a3b8;">Sent automatically by WorldAML Suite.</p>
</div></body></html>`;

        const { error: sendErr } = await resend.emails.send({
          from: FROM_EMAIL,
          to: recipients,
          subject,
          html,
        });
        if (sendErr) {
          errors.push(`org ${orgId}: ${sendErr.message ?? sendErr}`);
        } else {
          notifiedOrgs++;
        }
      } catch (e: any) {
        errors.push(`org ${orgId}: ${e?.message ?? String(e)}`);
      }
    }

    return new Response(
      JSON.stringify({ expired_count: expiredCount, notified_orgs: notifiedOrgs, errors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("sof-expire-declarations error:", e);
    return new Response(
      JSON.stringify({ error: e?.message ?? String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
