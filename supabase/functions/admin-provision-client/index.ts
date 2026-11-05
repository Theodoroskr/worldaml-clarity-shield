// WorldAML admin: invite a client user, attach them to a Suite company,
// switch on chosen modules and set screening search / monitoring limits.
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { isFreeEmail } from "../_shared/orgCreationPolicy.ts";
import { safeOrigin } from "../_shared/security.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  full_name: z.string().trim().max(120).optional(),
  organisation_id: z.string().uuid().optional(),
  company_name: z.string().trim().min(2).max(160).optional(),
  country: z.string().trim().max(80).optional(),
  regulator: z.string().trim().max(40).optional(),
  role: z.enum(["admin", "mlro", "compliance_officer", "analyst", "viewer"]),
  modules: z.array(z.enum(["screening", "kyc_kyb", "rcm"])).min(1),
  access: z.enum(["trial", "active"]),
  trial_days: z.number().int().min(1).max(365).default(14),
  search_quota: z.number().int().min(0).max(10_000_000).nullable(),
  monitor_quota: z.number().int().min(0).max(10_000_000).nullable(),
}).refine((b) => b.organisation_id || b.company_name, { message: "Choose a company or enter a new company name" });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
    const { data: u } = await admin.auth.getUser(auth.slice(7));
    const caller = u?.user;
    if (!caller) return json({ error: "Not authenticated" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin access required" }, 403);

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: parsed.error.issues.map((i) => i.message).join("; ") }, 400);
    const b = parsed.data;

    const { data: banned } = await admin.from("account_email_bans").select("email").eq("email", b.email).maybeSingle();
    if (banned) return json({ error: "This email is banned." }, 400);

    // 1. Company
    let orgId = b.organisation_id ?? null;
    let createdOrg = false;
    if (orgId) {
      const { data: org } = await admin.from("suite_organizations").select("id").eq("id", orgId).maybeSingle();
      if (!org) return json({ error: "Company not found" }, 404);
    } else {
      if (isFreeEmail(b.email)) return json({ error: "New client companies need a work email, not a personal one." }, 400);
      const { data: org, error } = await admin.from("suite_organizations").insert({
        name: b.company_name, country: b.country || null, regulator: b.regulator || null,
        primary_contact_email: b.email, primary_contact_name: b.full_name || null,
        created_by: caller.id, status: "active",
      }).select("id").single();
      if (error || !org) return json({ error: error?.message ?? "Could not create company" }, 400);
      orgId = org.id as string;
      createdOrg = true;
    }

    // 2. User: existing account or invite
    let userId: string | null = null;
    let invited = false;
    const { data: prof } = await admin.from("profiles").select("user_id").ilike("email", b.email).maybeSingle();
    if (prof?.user_id) {
      userId = prof.user_id as string;
    } else {
      const { data: inv, error } = await admin.auth.admin.inviteUserByEmail(b.email, {
        redirectTo: `${safeOrigin(req)}/suite`,
        data: { full_name: b.full_name ?? "" },
      });
      if (error || !inv?.user) {
        if (createdOrg) await admin.from("suite_organizations").delete().eq("id", orgId);
        return json({ error: error?.message ?? "Could not invite user" }, 400);
      }
      userId = inv.user.id;
      invited = true;
    }

    // 3. Membership
    const { data: existingMember } = await admin.from("suite_org_members").select("id")
      .eq("organization_id", orgId).eq("user_id", userId).maybeSingle();
    if (existingMember) {
      await admin.from("suite_org_members").update({ role: b.role }).eq("id", existingMember.id);
    } else {
      const { error } = await admin.from("suite_org_members").insert({
        organization_id: orgId, user_id: userId, role: b.role, invited_email: b.email,
        joined_at: new Date().toISOString(),
      });
      if (error) return json({ error: error.message }, 400);
    }

    // 4. Modules for the company + this member
    const endsAt = b.access === "trial" ? new Date(Date.now() + b.trial_days * 864e5).toISOString() : null;
    for (const m of b.modules) {
      const { error } = await admin.from("suite_module_access").upsert(
        { organisation_id: orgId, module: m, status: b.access, enabled: true, ends_at: endsAt },
        { onConflict: "organisation_id,module" },
      );
      if (error) return json({ error: error.message }, 400);
      await admin.from("suite_member_module_access").upsert(
        { organisation_id: orgId, user_id: userId, module: m, created_by: caller.id },
        { onConflict: "organisation_id,user_id,module", ignoreDuplicates: true },
      );
      await admin.from("admin_module_audit").insert({
        actor_id: caller.id, organisation_id: orgId, module: m, action: "grant_change",
        before: null, after: { status: b.access, ends_at: endsAt, via: "provision_client" },
      });
    }

    // 5. Screening access + limits
    if (b.modules.includes("screening")) {
      const meta = { search_quota_annual: b.search_quota, monitor_quota: b.monitor_quota, granted_by: caller.id };
      const { error: paErr } = await admin.from("product_access").upsert({
        organisation_id: orgId, product: "screening", plan: b.access === "trial" ? "trial" : "custom",
        status: b.access, seats: 5, started_at: new Date().toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: endsAt ?? new Date(Date.now() + 365 * 864e5).toISOString(),
        metadata: meta,
      }, { onConflict: "organisation_id,product" });
      if (paErr) return json({ error: paErr.message }, 400);

      const row = {
        organisation_id: orgId, plan: b.access === "trial" ? "trial" : "custom", status: "active",
        search_quota_annual: b.search_quota, monitor_quota: b.monitor_quota,
        monitored_entity_quota: b.monitor_quota ?? 2000,
        current_period_end: endsAt ?? new Date(Date.now() + 365 * 864e5).toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data: sub } = await admin.from("screening_subscriptions").select("id").eq("organisation_id", orgId).maybeSingle();
      const { error: sErr } = sub
        ? await admin.from("screening_subscriptions").update(row).eq("id", sub.id)
        : await admin.from("screening_subscriptions").insert({ ...row, user_id: userId });
      if (sErr) return json({ error: sErr.message }, 400);

      await admin.from("product_members").upsert(
        { organisation_id: orgId, product: "screening", user_id: userId, role: b.role === "admin" ? "admin" : "analyst", created_by: caller.id },
        { onConflict: "organisation_id,product,user_id" },
      );
    }

    await admin.from("suite_audit_log").insert({
      user_id: caller.id, organisation_id: orgId, action: "WorldAML provisioned client user", entity_type: "module",
      details: { email: b.email, role: b.role, modules: b.modules, access: b.access, ends_at: endsAt,
        search_quota: b.search_quota, monitor_quota: b.monitor_quota, by: "worldaml" },
    });

    return json({ ok: true, organisation_id: orgId, user_id: userId, invited, created_org: createdOrg });
  } catch (e) {
    console.error("admin-provision-client error", (e as Error).message);
    return json({ error: "Provisioning failed" }, 500);
  }
});
