import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML Screening <info@worldaml.com>";
const SCREENING_URL = "https://worldaml.com/screening";
const SUPPORT_EMAIL = "info@worldaml.com";

function escapeHtml(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildHtml(invitee: string, inviter: string, role: string, isNew: boolean): string {
  const displayInvitee = escapeHtml(invitee || "there");
  const displayInviter = escapeHtml(inviter || "Your organisation");
  const displayRole = escapeHtml(role);
  const action = isNew
    ? `<p style="color:#374151;font-size:15px;margin:0 0 20px;line-height:1.6;">
         Create a free WorldAML account with this email address, then sign in to access the workspace.
       </p>`
    : `<p style="color:#374151;font-size:15px;margin:0 0 20px;line-height:1.6;">
         Sign in with your existing WorldAML account to open the workspace.
       </p>`;

  return `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
    <div style="background:#1e3a5f;padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.3px;">
        You've been invited to WorldAML Screening & Monitoring
      </h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#374151;font-size:15px;margin:0 0 16px;">Hi ${displayInvitee},</p>
      <p style="color:#374151;font-size:15px;margin:0 0 20px;line-height:1.6;">
        <strong>${displayInviter}</strong> has invited you to join their WorldAML Screening & Monitoring workspace as a
        <strong>${displayRole}</strong>.
      </p>
      ${action}
      <div style="text-align:center;margin:28px 0 12px;">
        <a href="${SCREENING_URL}"
           style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;">
          Open Screening Workspace →
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:24px 0 0;line-height:1.5;">
        Questions? Reply to this email or contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#0d9488;">${SUPPORT_EMAIL}</a>.
      </p>
    </div>
  </div>
  `;
}

function buildText(invitee: string, inviter: string, role: string, isNew: boolean): string {
  const action = isNew
    ? "Create a free WorldAML account with this email address, then sign in to access the workspace."
    : "Sign in with your existing WorldAML account to open the workspace.";
  return `Hi ${invitee || "there"},

${inviter || "Your organisation"} has invited you to join their WorldAML Screening & Monitoring workspace as a ${role}.

${action}

Open Screening Workspace: ${SCREENING_URL}

Questions? Contact us at ${SUPPORT_EMAIL}.
`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
      const body = await request.json().catch(() => ({}));
      const { email, inviter_name, role, is_new_user } = body;

      if (!email || !isValidEmail(email)) {
        return new Response(JSON.stringify({ error: "Valid email is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: "You're invited to WorldAML Screening & Monitoring",
        html: buildHtml(email, inviter_name ?? "", role ?? "Analyst", !!is_new_user),
        text: buildText(email, inviter_name ?? "", role ?? "Analyst", !!is_new_user),
      });

      if (error) {
        console.error("Resend error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (err: any) {
      console.error("Edge function error:", err);
      return new Response(JSON.stringify({ error: err?.message || "Internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
