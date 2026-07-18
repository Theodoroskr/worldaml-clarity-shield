// Standardized subscription help email.
// POST {
//   to: string,                    // required
//   name?: string,                   // first name preferred
//   productName?: string,            // e.g. "WorldAML Academy Annual Pass"
//   helpContext?: string,            // one sentence describing the situation
//   ctaUrl?: string,                 // e.g. checkout retry URL or account page
//   ctaLabel?: string,               // defaults to "Retry Checkout →"
//   reference?: string               // e.g. session id + timestamp
// }
// Always CCs info@worldaml.com.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "WorldAML Academy <academy@worldaml.com>";
const SUPPORT_EMAIL = "info@worldaml.com";

function escapeHtml(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const s = String(url).trim();
  if (!/^https?:\/\//i.test(s)) return undefined;
  return s.replace(/"/g, "%22");
}

function buildHtml(params: {
  greeting: string;
  productName: string;
  helpContext?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  reference?: string;
}) {
  const ctaLabel = escapeHtml(params.ctaLabel ?? "Retry Checkout →");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;background:#ffffff;">
      <div style="background:#1e3a5f;padding:28px 32px;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">WorldAML Academy</h1>
      </div>
      <div style="padding:28px 32px;color:#374151;font-size:15px;line-height:1.6;">
        <p>${escapeHtml(params.greeting)}</p>
        <p>
          We noticed that your subscription for <strong>${escapeHtml(params.productName)}</strong> may need attention.
          ${params.helpContext ? escapeHtml(params.helpContext) : "If you ran into any issue while completing your subscription, we're here to help."}
        </p>
        <p>
          No charge has been made, and there's no obligation — we just want to make sure you get the access you need.
        </p>
        ${safeUrl(params.ctaUrl)
          ? `<p style="margin:24px 0;">
               <a href="${safeUrl(params.ctaUrl)}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">
                 ${ctaLabel}
               </a>
             </p>`
          : ""
        }
        <p><strong>Need help?</strong> Just reply to this email (our team at <a href="mailto:${SUPPORT_EMAIL}" style="color:#0d9488;">${SUPPORT_EMAIL}</a> is on copy) and let us know what happened — for example:</p>
        <ul style="padding-left:20px;margin:8px 0 16px;">
          <li>Card declined or 3-D Secure verification failed</li>
          <li>Prefer a different payment method (bank transfer, invoice)</li>
          <li>Need a VAT-compliant invoice or want to pay in a different currency</li>
          <li>Interested in a team / multi-seat plan</li>
          <li>Any other question about your subscription or access</li>
        </ul>
        <p>We'll get you sorted quickly so you can access your courses, certificates, and any tools included with your subscription.</p>
        <p style="margin-top:28px;">Best regards,<br/>The WorldAML Team</p>
        ${params.reference
          ? `<p style="color:#9ca3af;font-size:12px;margin-top:24px;">Reference: ${escapeHtml(params.reference)}</p>`
          : ""
        }
      </div>
      <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">WorldAML · ${SUPPORT_EMAIL}</p>
      </div>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth: service-role (internal calls) OR authenticated admin only.
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const isServiceRole = !!serviceKey && token === serviceKey;
    if (!isServiceRole) {
      if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userData, error: userErr } = await authClient.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const adminClient = createClient(supabaseUrl, serviceKey);
      const { data: isAdmin } = await adminClient.rpc("has_role", {
        _user_id: userData.user.id, _role: "admin",
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { to, name, productName, helpContext, ctaUrl, ctaLabel, reference } = body;

    if (!to || typeof to !== "string") {
      return new Response(JSON.stringify({ error: "'to' email address is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!productName || typeof productName !== "string") {
      return new Response(JSON.stringify({ error: "'productName' is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    const greeting = name?.trim() ? `Hi ${name.trim().split(" ")[0]},` : "Hi there,";

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      cc: [SUPPORT_EMAIL],
      reply_to: SUPPORT_EMAIL,
      subject: `Need help with your ${productName} subscription?`,
      html: buildHtml({
        greeting,
        productName,
        helpContext,
        ctaUrl,
        ctaLabel,
        reference,
      }),
    });

    if (error) {
      console.error("Resend send error:", error);
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Subscription help email failed:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
