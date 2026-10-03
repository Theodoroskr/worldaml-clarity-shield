import { Resend } from "npm:resend";
import { createClient } from "npm:@supabase/supabase-js@2";

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
      const deny = (msg: string, status: number) =>
        new Response(JSON.stringify({ error: msg }), {
          status, headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      // Caller must be signed in.
      const authHeader = request.headers.get("Authorization") ?? "";
      if (!authHeader.startsWith("Bearer ")) return deny("Unauthorized", 401);
      const url = Deno.env.get("SUPABASE_URL")!;
      const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await userClient.auth.getUser();
      const caller = userData?.user;
      if (!caller) return deny("Unauthorized", 401);
      const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
      const body = await request.json().catch(() => ({}));
      const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
      const role = typeof body?.role === "string" ? body.role.slice(0, 60) : "Analyst";

      if (!email || !isValidEmail(email)) {
        return new Response(JSON.stringify({ error: "Valid email is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Only send for an invite in an org the caller administers (platform admins: any org).
      const { data: isPlatformAdmin } = await admin.rpc("has_role", { _user_id: caller.id, _role: "admin" });
      let orgIds: string[] = [];
      if (!isPlatformAdmin) {
        const { data: adminOrgs } = await admin
          .from("product_members")
          .select("organisation_id")
          .eq("user_id", caller.id)
          .eq("product", "screening")
          .eq("role", "admin");
        orgIds = (adminOrgs ?? []).map((r: any) => r.organisation_id);
        if (!orgIds.length) return deny("Not authorised", 403);
      }

      // Resolve an existing account by profile or auth email.
      const { data: prof } = await admin
        .from("profiles").select("user_id").ilike("email", email).maybeSingle();
      let inviteeUserId: string | null = prof?.user_id ?? null;
      if (!inviteeUserId) {
        const { data: uid } = await admin.rpc("get_user_id_by_email", { _email: email }).maybeSingle?.() ?? { data: null };
        if (typeof uid === "string") inviteeUserId = uid;
      }
      let q = admin.from("product_members").select("id, user_id").eq("product", "screening");
      if (!isPlatformAdmin) q = q.in("organisation_id", orgIds);
      q = inviteeUserId
        ? q.or(`invited_email.eq.${email},user_id.eq.${inviteeUserId}`)
        : q.eq("invited_email", email);
      const { data: inviteRows } = await q.limit(1);
      if (!inviteRows?.length) return deny("No matching invitation", 403);
      const is_new_user = !inviteRows[0].user_id;

      const { data: callerProfile } = await admin
        .from("profiles").select("full_name, email").eq("user_id", caller.id).maybeSingle();
      const inviter_name = callerProfile?.full_name || callerProfile?.email || caller.email || "";

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
