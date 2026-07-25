import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "WorldAML Suite <portal@worldaml.com>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Missing auth" }, 401);

    // Verify caller is staff
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: uErr } = await userClient.auth.getUser();
    if (uErr || !user) return json({ error: "Unauthenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const customerId: string | undefined = body.customer_id;
    const email: string | undefined = (body.email ?? "").toString().trim().toLowerCase();
    if (!customerId || !email || !email.includes("@")) {
      return json({ error: "customer_id and valid email required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Load customer + verify staff authorisation via RPC (uses caller identity)
    const { data: portalRowId, error: rpcErr } = await userClient.rpc(
      "portal_invite_customer" as never,
      { _customer_id: customerId, _email: email } as never,
    );
    if (rpcErr) return json({ error: rpcErr.message }, 403);

    // Send invite via Supabase Auth (creates auth user if new, or emails magic link if exists)
    const redirectTo = `${req.headers.get("origin") ?? "https://worldaml.com"}/portal/callback`;

    const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { portal_customer_id: customerId },
    });

    let magicLink: string | null = null;
    if (inviteErr && /already been registered|already exists/i.test(inviteErr.message)) {
      // Fallback: generate magic link for existing user
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });
      if (linkErr) return json({ error: linkErr.message }, 500);
      magicLink = linkData?.properties?.action_link ?? null;

      if (RESEND_KEY && magicLink) {
        const resend = new Resend(RESEND_KEY);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Access your compliance portal",
          html: `<p>You've been invited to a secure compliance portal.</p>
                 <p><a href="${magicLink}" style="display:inline-block;padding:10px 18px;background:#0f766e;color:#fff;border-radius:6px;text-decoration:none">Sign in to portal</a></p>
                 <p style="color:#666;font-size:12px">This link is single-use and expires shortly.</p>`,
        });
      }
    } else if (inviteErr) {
      return json({ error: inviteErr.message }, 500);
    }

    return json({ ok: true, portal_user_id: portalRowId, existing_user: !!magicLink });
  } catch (e) {
    console.error("portal-invite error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
