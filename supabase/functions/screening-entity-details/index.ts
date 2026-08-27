// Loads the complete listed-entity profile for a match and returns it in the
// WorldAML normalised model. The data provider is never named in the payload.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getProvider, providerErrorResponse } from "../_shared/screening/index.ts";
import { normaliseEntityProfile } from "../_shared/screening/entityProfile.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const matchId = String(body.match_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(matchId)) return json({ error: "Invalid request" }, 400);

  // Authorisation: the caller must be able to read the match under RLS.
  const { data: visible } = await userClient
    .from("screening_matches")
    .select("id, organisation_id, matched_name, profile")
    .eq("id", matchId)
    .maybeSingle();
  if (!visible) return json({ error: "Not found" }, 404);

  const cached = (visible.profile ?? {}) as Record<string, unknown>;
  const cachedFull = cached.full_profile as Record<string, unknown> | undefined;
  if (cachedFull && body.refresh !== true) {
    return json({ profile: cachedFull, cached: true });
  }

  const { data: ref } = await admin
    .from("provider_references")
    .select("provider_id, provider_ref")
    .eq("entity_kind", "match")
    .eq("entity_id", matchId)
    .maybeSingle();

  const providerSearchId = String(
    (ref?.provider_ref as Record<string, unknown> | null)?.search_id ?? "",
  );
  if (!ref?.provider_id || !providerSearchId) {
    return json({ error: "No listed profile is available for this match" }, 404);
  }

  try {
    const provider = getProvider();
    const content = await provider.retrieveFullDetails(providerSearchId, String(ref.provider_id));
    const profile = normaliseEntityProfile(content);

    await admin
      .from("screening_matches")
      .update({
        profile: { ...cached, full_profile: profile, full_profile_loaded_at: new Date().toISOString() },
      })
      .eq("id", matchId);

    await admin.from("screening_audit_events").insert({
      organisation_id: visible.organisation_id,
      match_id: matchId,
      event_type: "profile_enriched",
      description: `Full listed profile loaded for ${visible.matched_name}`,
      metadata: { listings: profile.listings.length, associates: profile.associates.length },
      actor_id: user.id,
    });

    return json({ profile, cached: false });
  } catch (err) {
    return providerErrorResponse(err, corsHeaders);
  }
});
