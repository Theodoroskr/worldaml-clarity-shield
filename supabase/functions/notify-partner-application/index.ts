import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "info@worldaml.com";
const FROM_EMAIL = "WorldAML Partners <forms@worldaml.com>";
const SITE_URL = "https://worldaml.com";

function escapeHtml(str: string): string {
  return str
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

interface PartnerNotifyRequest {
  application_id: string;
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

    // Auth via user JWT
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json() as PartnerNotifyRequest;
    if (!body.application_id) {
      return new Response(JSON.stringify({ error: "application_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: app, error: appErr } = await admin
      .from("partner_applications")
      .select("id, user_id, company_name, website, partner_type, description, created_at")
      .eq("id", body.application_id)
      .maybeSingle();

    if (appErr || !app) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the caller owns the application
    if (app.user_id !== authData.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", app.user_id)
      .maybeSingle();

    const applicantEmail = profile?.email || authData.user.email || "";
    const applicantName = profile?.full_name || "there";

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set — skipping emails");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);

    const safe = {
      company: escapeHtml(app.company_name || ""),
      website: escapeHtml(app.website || "—"),
      type: escapeHtml(app.partner_type || ""),
      description: escapeHtml(app.description || "—").replace(/\n/g, "<br/>"),
      email: escapeHtml(applicantEmail),
      name: escapeHtml(applicantName),
    };

    // 1. Admin notification
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:24px 32px;">
          <h1 style="color:#fff;margin:0;font-size:18px;font-weight:700;">New Partner Application</h1>
        </div>
        <div style="padding:28px 32px;color:#374151;font-size:14px;line-height:1.6;">
          <p><strong>Company:</strong> ${safe.company}</p>
          <p><strong>Website:</strong> ${safe.website}</p>
          <p><strong>Partner Type:</strong> ${safe.type}</p>
          <p><strong>Applicant:</strong> ${safe.name} &lt;${safe.email}&gt;</p>
          <p><strong>Plan / Description:</strong><br/>${safe.description}</p>
          <p style="margin-top:24px;">
            <a href="${SITE_URL}/admin" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:10px 22px;border-radius:6px;font-weight:600;font-size:14px;">
              Review in Admin →
            </a>
          </p>
        </div>
      </div>
    `;

    // 2. Applicant thank-you
    const applicantHtml = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">Thank you for applying</h1>
        </div>
        <div style="padding:28px 32px;color:#374151;font-size:15px;line-height:1.6;">
          <p>Hi ${safe.name},</p>
          <p>Thanks for applying to the <strong>WorldAML Partner Program</strong>. We've received your application for <strong>${safe.company}</strong> as a <strong>${safe.type}</strong> partner.</p>
          <p>Our partnerships team will review your application and get back to you within <strong>48 hours</strong>. If we need any additional information, we'll be in touch directly.</p>
          <p>In the meantime, you can explore our partner resources:</p>
          <p>
            <a href="${SITE_URL}/partners" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">
              Partner Program Overview →
            </a>
          </p>
          <p style="margin-top:24px;">Questions? Just reply to this email or reach us at <a href="mailto:info@worldaml.com" style="color:#0d9488;">info@worldaml.com</a>.</p>
          <p>— The WorldAML Team</p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">WorldAML · ${SITE_URL}</p>
        </div>
      </div>
    `;

    await safeSend(resend, {
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `New partner application: ${app.company_name} (${app.partner_type})`,
      html: adminHtml,
      reply_to: applicantEmail || undefined,
    });

    if (applicantEmail) {
      await safeSend(resend, {
        from: FROM_EMAIL,
        to: [applicantEmail],
        subject: "We received your WorldAML partner application",
        html: applicantHtml,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-partner-application error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
