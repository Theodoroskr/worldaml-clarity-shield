import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

// Demo allowance: 5 annual searches, no monitoring, single seat.
function escapeHtml(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const DEMO_QUOTA = { search: 5, monitor: 0, seats: 1 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    // Ownership always derives from the bearer token, never from the body.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);
    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) return json({ error: "Authentication required" }, 401);

    // 1. Resolve (or create) the caller's organisation.
    const { data: membership } = await admin
      .from("suite_org_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let orgId = membership?.organization_id as string | undefined;

    if (!orgId) {
      const orgName =
        (user.user_metadata?.company_name as string | undefined)?.trim() ||
        (user.email ? user.email.split("@")[1] : "") ||
        "My Organisation";
      const { data: org, error: orgErr } = await admin
        .from("suite_organizations")
        .insert({ name: orgName, status: "active", subscription_tier: "screening", created_by: user.id })
        .select("id")
        .single();
      if (orgErr || !org) throw orgErr ?? new Error("Could not create organisation");
      orgId = org.id as string;
      await admin
        .from("suite_org_members")
        .insert({ organization_id: orgId, user_id: user.id, role: "admin" });
    }

    // Keep the business portal pointed at the organisation that owns the products.
    await admin
      .from("business_accounts")
      .update({ organisation_id: orgId, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("organisation_id", null);

    // 2. Never downgrade or duplicate an existing subscription.

    const { data: existingSub } = await admin
      .from("screening_subscriptions")
      .select("id, plan, status")
      .eq("organisation_id", orgId)
      .limit(1)
      .maybeSingle();

    if (existingSub) {
      return json({ plan: existingSub.plan ?? null, granted: false });
    }

    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    // 3. Grant the demo.
    const { error: insertErr } = await admin.from("screening_subscriptions").insert({
      organisation_id: orgId,
      user_id: user.id,
      plan: "demo",
      status: "active",
      monitored_entity_quota: DEMO_QUOTA.monitor,
      search_quota_annual: DEMO_QUOTA.search,
      monitor_quota: DEMO_QUOTA.monitor,
      seat_quota: DEMO_QUOTA.seats,
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (insertErr) throw insertErr;

    // Keep the product_access registry in sync (source of truth for portal guards).
    const { data: existingAccess } = await admin
      .from("product_access")
      .select("id")
      .eq("organisation_id", orgId)
      .eq("product", "screening")
      .maybeSingle();

    const accessPayload = {
      organisation_id: orgId,
      product: "screening",
      plan: "demo",
      status: "active",
      seats: DEMO_QUOTA.seats,
      seats_used: 1,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      started_at: periodStart.toISOString(),
      metadata: {
        search_quota_annual: DEMO_QUOTA.search,
        monitor_quota: DEMO_QUOTA.monitor,
        source: "hero_demo_signup",
      },
      updated_at: new Date().toISOString(),
    };

    if (existingAccess) {
      await admin.from("product_access").update(accessPayload).eq("id", existingAccess.id);
    } else {
      await admin.from("product_access").insert(accessPayload);
    }

    await admin.from("product_members").upsert({
      organisation_id: orgId,
      product: "screening",
      user_id: user.id,
      role: "admin",
      created_by: user.id,
    }, { onConflict: "organisation_id,product,user_id" });

    // Keep the business portal pointed at the organisation that owns the products.
    await admin
      .from("business_accounts")
      .update({ organisation_id: orgId, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("organisation_id", null);


    try {
      await admin.rpc("ensure_default_screening_policy", { _org: orgId });
    } catch (_) { /* non-fatal */ }

    // Welcome / confirmation email — non-fatal if it fails.
    try {
      const apiKey = Deno.env.get("RESEND_API_KEY");
      if (apiKey && user.email) {
        const name = escapeHtml(
          ((user.user_metadata?.full_name as string | undefined) ?? "").split(" ")[0] || "there",
        );
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: "WorldAML Screening <info@worldaml.com>",
          to: [user.email],
          subject: "Your 5 free WorldAML screenings are active",
          html: `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
    <div style="background:#1e3a5f;padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Your demo is active</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#374151;font-size:15px;margin:0 0 16px;">Hi ${name},</p>
      <p style="color:#374151;font-size:15px;margin:0 0 20px;line-height:1.6;">
        Your WorldAML account is confirmed and <strong>5 free screening searches</strong> have been added to your
        workspace. Screen any person or company against 1,900+ global sanctions, PEP and watchlist sources.
      </p>
      <div style="text-align:center;margin:28px 0 12px;">
        <a href="https://worldaml.com/screening" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;">
          Open your workspace &rarr;
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:24px 0 0;line-height:1.5;">
        Need ongoing monitoring, adverse media or more seats? See the
        <a href="https://worldaml.com/screening-monitoring/pricing" style="color:#0d9488;">annual packages</a>,
        or reply to this email and our team will help.
      </p>
    </div>
  </div>`,
          text: `Hi ${name},\n\nYour WorldAML account is confirmed and 5 free screening searches have been added to your workspace.\n\nOpen your workspace: https://worldaml.com/screening\nPackages: https://worldaml.com/screening-monitoring/pricing\n`,
        });
      }
    } catch (mailErr) {
      console.error("demo welcome email failed", mailErr);
    }

    return json({ plan: "demo", granted: true });
  } catch (error) {
    console.error("claim-screening-demo error", error);
    return json({ error: "Could not activate the demo" }, 500);
  }
});
