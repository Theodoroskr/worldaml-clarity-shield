import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PARTNERS_EMAIL = "partners@worldaml.com";
const FROM_EMAIL = "WorldAML Partners <forms@worldaml.com>";
const SITE_URL = "https://worldaml.com";

function escapeHtml(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function safeSend(resend: any, params: any) {
  try {
    const { error } = await resend.emails.send(params);
    if (error) console.error("Resend error:", error);
  } catch (err: any) {
    console.error("Email send failed (non-blocking):", err?.message ?? err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({})) as { deal_id?: string };
    if (!body.deal_id) {
      return new Response(JSON.stringify({ error: "deal_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: deal, error: dealErr } = await admin
      .from("deal_registrations")
      .select("*")
      .eq("id", body.deal_id)
      .maybeSingle();

    if (dealErr || !deal) {
      return new Response(JSON.stringify({ error: "Deal not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Caller must be the submitter or owner of the partner account
    const { data: partner } = await admin
      .from("partners")
      .select("id, user_id, display_name, referral_code, partner_type, commission_rate")
      .eq("id", deal.partner_id)
      .maybeSingle();

    const isOwner = deal.submitted_by === authData.user.id || partner?.user_id === authData.user.id;
    if (!isOwner) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", deal.submitted_by ?? partner?.user_id)
      .maybeSingle();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set — skipping email");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    const submitterEmail = profile?.email || authData.user.email || "";
    const partnerName = partner?.display_name || profile?.full_name || "Partner";
    const products = Array.isArray(deal.product_interest)
      ? deal.product_interest.join(", ")
      : (deal.product_interest ?? "—");

    const row = (label: string, value: unknown) => `
      <tr>
        <td style="padding:6px 12px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:6px 0;color:#111827;font-size:13px;">${escapeHtml(String(value ?? "—") || "—").replace(/\n/g, "<br/>")}</td>
      </tr>`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:18px;font-weight:700;">New Deal Registration</h1>
          <p style="color:#c7d2e1;margin:6px 0 0;font-size:13px;">Awaiting review &amp; deal-protection approval</p>
        </div>
        <div style="padding:24px 32px;">
          <table style="width:100%;border-collapse:collapse;">
            ${row("Partner", `${partnerName}${partner?.referral_code ? ` (${partner.referral_code})` : ""}`)}
            ${row("Partner type", partner?.partner_type)}
            ${row("Commission rate", partner?.commission_rate != null ? `${partner.commission_rate}%` : "—")}
            ${row("Submitted by", submitterEmail)}
            ${row("Submitted at", deal.created_at)}
          </table>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:18px 0;" />
          <table style="width:100%;border-collapse:collapse;">
            ${row("Prospect company", deal.prospect_company)}
            ${row("Country", deal.prospect_country)}
            ${row("Contact name", deal.prospect_contact_name)}
            ${row("Contact email", deal.prospect_email)}
            ${row("Product interest", products)}
            ${row("Estimated ARR (EUR)", deal.estimated_arr_eur)}
            ${row("Status", deal.status)}
            ${row("Notes", deal.notes)}
          </table>
          <p style="margin-top:24px;">
            <a href="${SITE_URL}/admin/partners#deal-registrations"
               style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 26px;border-radius:6px;font-weight:600;font-size:14px;">
              Review &amp; approve in Admin →
            </a>
          </p>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;">
            Deal ID: ${escapeHtml(deal.id)}
          </p>
        </div>
      </div>
    `;

    await safeSend(resend, {
      from: FROM_EMAIL,
      to: [PARTNERS_EMAIL],
      subject: `New deal registration: ${deal.prospect_company} — ${partnerName}`,
      html,
      reply_to: submitterEmail || undefined,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-deal-registration error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
