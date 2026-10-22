import { createClient } from "npm:@supabase/supabase-js@2.57.2";

// One-time, narrowly scoped removal; delete the deployed function after verification.
const targetId = "08e0e449-c95b-471e-ae13-57071176dd5d";
const targetEmail = "divs_daks@yahoo.co.in";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false },
  });
  const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (!token) return json({ error: "Sign in required" }, 401);
  const { data: caller, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !caller.user) return json({ error: "Sign in required" }, 401);
  const { data: isAdmin, error: roleError } = await admin.rpc("has_role", { _user_id: caller.user.id, _role: "admin" });
  if (roleError || !isAdmin || caller.user.id === targetId) return json({ error: "Admin access required" }, 403);
  const { data: ban, error: banError } = await admin.from("account_email_bans").select("email").eq("email", targetEmail).maybeSingle();
  if (banError || !ban) return json({ error: "Permanent ban must exist first" }, 409);
  const { data: target, error: targetError } = await admin.auth.admin.getUserById(targetId);
  if (targetError || target.user?.email?.toLowerCase() !== targetEmail) return json({ error: "Target account mismatch" }, 409);
  const { error: blockError } = await admin.auth.admin.updateUserById(targetId, { ban_duration: "876000h" });
  if (blockError) return json({ error: "Could not ban account" }, 500);
  const { error: deleteError } = await admin.auth.admin.deleteUser(targetId);
  if (deleteError) return json({ error: "Account banned, but deletion failed" }, 500);
  return json({ deleted: true, registration_blocked: true });
});