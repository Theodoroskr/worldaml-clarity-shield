import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3";
import { provisionEntitlement } from "../_shared/business/provision.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const BodySchema = z.object({
  action: z.enum(["grant_plan", "cancel", "update_seats"]),
  business_account_id: z.string().uuid(),
  product: z.enum(["screening", "suite", "academy"]).optional(),
  plan_code: z.string().min(1).max(60).optional(),
  seats: z.number().int().min(1).max(1000).optional(),
  amount_cents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  interval: z.enum(["month", "year", "one_time"]).optional(),
  period_months: z.number().int().min(1).max(36).optional(),
  subscription_id: z.string().uuid().optional(), // for cancel/update_seats
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const caller = userData?.user;
    if (!caller) return json({ error: "Not authenticated" }, 401);

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin access required" }, 403);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const body = parsed.data;

    const { data: account } = await admin
      .from("business_accounts")
      .select("id, user_id, organisation_id, company_name")
      .eq("id", body.business_account_id)
      .maybeSingle();
    if (!account) return json({ error: "Business account not found" }, 404);

    if (body.action === "grant_plan") {
      if (!body.product || !body.plan_code) return json({ error: "product and plan_code are required" }, 400);

      // Resolve or create the organisation for this account.
      let orgId = account.organisation_id as string | null;
      if (!orgId) {
        const { data: org, error: orgErr } = await admin
          .from("suite_organizations")
          .insert({ name: account.company_name, created_by: account.user_id, status: "active" })
          .select("id")
          .single();
        if (orgErr || !org) throw orgErr ?? new Error("Could not create organisation");
        orgId = org.id as string;
        await admin.from("business_accounts").update({ organisation_id: orgId }).eq("id", account.id);
      }
      await admin.from("suite_org_members").upsert(
        { organization_id: orgId, user_id: account.user_id, role: "admin" },
        { onConflict: "organization_id,user_id", ignoreDuplicates: true },
      );

      const months = body.interval === "month" ? 1 : 12;
      const periodEnd = new Date(Date.now() + (body.period_months ?? months) * 30 * 864e5).toISOString();

      const { subscriptionId } = await provisionEntitlement(admin, {
        userId: account.user_id,
        businessAccountId: account.id,
        organisationId: orgId,
        product: body.product,
        planCode: body.plan_code,
        seats: body.seats ?? 1,
        source: "manual",
        amountCents: body.amount_cents ?? null,
        currency: body.currency ?? "EUR",
        interval: body.interval ?? "year",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: periodEnd,
        metadata: { granted_by: caller.id },
      });

      // Audit trail.
      try {
        await admin.from("admin_access_audit").insert({
          performed_by: caller.id,
          performed_by_email: caller.email ?? null,
          action: "business_plan_granted",
          target_email: (caller.user_metadata?.email as string | undefined) ?? null,
          detail: `Granted ${body.product} plan ${body.plan_code} (${body.seats ?? 1} seat(s)) to ${account.company_name}`,
          new_value: { business_account_id: account.id, product: body.product, plan: body.plan_code, seats: body.seats ?? 1 },
        });
      } catch (_) { /* non-fatal */ }

      return json({ status: "granted", subscription_id: subscriptionId });
    }

    if (body.action === "cancel") {
      if (!body.subscription_id) return json({ error: "subscription_id is required" }, 400);
      const { data: sub } = await admin
        .from("business_subscriptions")
        .select("id, organisation_id, product")
        .eq("id", body.subscription_id)
        .eq("business_account_id", account.id)
        .maybeSingle();
      if (!sub) return json({ error: "Subscription not found" }, 404);

      const now = new Date().toISOString();
      await admin.from("business_subscriptions")
        .update({ status: "canceled", canceled_at: now, updated_at: now })
        .eq("id", sub.id);
      await admin.from("product_access")
        .update({ status: "cancelled", updated_at: now })
        .eq("organisation_id", sub.organisation_id)
        .eq("product", sub.product);
      if (sub.product === "screening") {
        await admin.from("screening_subscriptions")
          .update({ status: "cancelled", updated_at: now })
          .eq("organisation_id", sub.organisation_id);
      }
      try {
        await admin.from("admin_access_audit").insert({
          performed_by: caller.id,
          performed_by_email: caller.email ?? null,
          action: "business_plan_canceled",
          detail: `Canceled business subscription ${sub.id} for ${account.company_name}`,
          previous_value: { business_account_id: account.id, subscription_id: sub.id },
        });
      } catch (_) { /* non-fatal */ }
      return json({ status: "canceled" });
    }

    // update_seats
    if (!body.subscription_id || !body.seats) return json({ error: "subscription_id and seats are required" }, 400);
    const { data: sub } = await admin
      .from("business_subscriptions")
      .select("id, organisation_id, product")
      .eq("id", body.subscription_id)
      .eq("business_account_id", account.id)
      .maybeSingle();
    if (!sub) return json({ error: "Subscription not found" }, 404);
    await admin.from("business_subscriptions")
      .update({ seats: body.seats, updated_at: new Date().toISOString() })
      .eq("id", sub.id);
    await admin.from("product_access")
      .update({ seats: body.seats, updated_at: new Date().toISOString() })
      .eq("organisation_id", sub.organisation_id)
      .eq("product", sub.product);
    if (sub.product === "screening") {
      await admin.from("screening_subscriptions")
        .update({ seat_quota: body.seats, updated_at: new Date().toISOString() })
        .eq("organisation_id", sub.organisation_id);
    }
    return json({ status: "updated", seats: body.seats });
  } catch (error) {
    console.error("[admin-provision-plan]", error);
    return json({ error: "Could not complete the action" }, 500);
  }
});
