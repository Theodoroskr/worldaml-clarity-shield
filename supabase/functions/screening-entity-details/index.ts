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

const normName = (v: unknown) =>
  String(v ?? "").toLowerCase().replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim();

/** When a profile has no photos of its own, borrow the photos of a sibling
 *  profile for the same entity — matches from the same screening search first
 *  (strongest alias signal), then any match in the organisation whose primary
 *  name or aliases overlap this profile's names. */
async function borrowAliasImages(
  admin: ReturnType<typeof createClient>,
  orgId: string,
  searchId: string | null,
  matchId: string,
  profile: { images: string[]; primary_name: string | null; aliases: string[] },
): Promise<{ images: string[]; shared: boolean }> {
  if (profile.images.length > 0) return { images: profile.images, shared: false };

  const names = new Set(
    [profile.primary_name, ...profile.aliases].map(normName).filter(Boolean),
  );
  if (names.size === 0) return { images: [], shared: false };

  const collect = (rows: Record<string, unknown>[] | null): string[] => {
    for (const row of rows ?? []) {
      if (String(row.id) === matchId) continue;
      const fp = (row.profile as Record<string, unknown> | null)?.full_profile as
        | Record<string, unknown>
        | undefined;
      const imgs = Array.isArray(fp?.images) ? (fp!.images as string[]).filter(Boolean) : [];
      if (imgs.length === 0) continue;
      const otherNames = [fp!.primary_name, ...((fp!.aliases as string[]) ?? []), row.matched_name]
        .map(normName)
        .filter(Boolean);
      if (otherNames.some((n) => names.has(n))) return imgs;
    }
    return [];
  };

  if (searchId) {
    const { data } = await admin
      .from("screening_matches")
      .select("id, matched_name, profile")
      .eq("search_id", searchId)
      .not("profile_fetched_at", "is", null)
      .limit(50);
    const imgs = collect(data as Record<string, unknown>[] | null);
    if (imgs.length > 0) return { images: imgs, shared: true };
  }

  const { data } = await admin
    .from("screening_matches")
    .select("id, matched_name, profile")
    .eq("organisation_id", orgId)
    .not("profile_fetched_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);
  const imgs = collect(data as Record<string, unknown>[] | null);
  return { images: imgs, shared: imgs.length > 0 };
}

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
    .select("id, organisation_id, matched_name, profile, search_id")
    .eq("id", matchId)
    .maybeSingle();
  if (!visible) return json({ error: "Not found" }, 404);

  const cached = (visible.profile ?? {}) as Record<string, unknown>;
  const cachedFull = cached.full_profile as Record<string, unknown> | undefined;
  const isRefresh = body.refresh === true;
  if (cachedFull && !isRefresh) {
    const shared = await borrowAliasImages(
      admin,
      visible.organisation_id as string,
      (visible.search_id as string | null) ?? null,
      matchId,
      cachedFull as never,
    );
    return json({
      profile: { ...cachedFull, images: shared.images },
      cached: true,
      images_shared_from_alias: shared.shared,
    });
  }

  // A refresh triggers a fresh, billable provider lookup, so it consumes one
  // search from the organisation's annual allowance (the first, cached load
  // does not — it is part of the original screening run).
  const orgId = visible.organisation_id as string;
  let periodStart: Date | null = null;
  let periodEnd: Date | null = null;
  if (isRefresh) {
    const { data: quotaRows } = await admin.rpc("get_screening_org_quota", { _org_id: orgId });
    const quota = Array.isArray(quotaRows) ? quotaRows[0] : null;
    if (quota?.current_period_end) {
      periodEnd = new Date(quota.current_period_end);
      periodStart = new Date(periodEnd);
      periodStart.setFullYear(periodStart.getFullYear() - 1);
    }
    if (quota?.search_quota_annual != null) {
      const { count: usedSearches, error: countErr } = await admin
        .from("screening_searches")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", orgId)
        .eq("status", "completed")
        .gte("created_at", periodStart ? periodStart.toISOString() : "1970-01-01")
        .lte("created_at", periodEnd ? periodEnd.toISOString() : new Date().toISOString());
      if (!countErr && (usedSearches ?? 0) >= quota.search_quota_annual) {
        return json({
          error:
            "Annual screening search quota reached, so the profile cannot be refreshed. Upgrade your plan or contact sales.",
          code: "search_quota_exceeded",
        }, 403);
      }
    }
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

    const shared = await borrowAliasImages(
      admin,
      orgId,
      (visible.search_id as string | null) ?? null,
      matchId,
      profile,
    );
    const profileWithImages = { ...profile, images: shared.images };

    const fetchedAt = new Date().toISOString();
    await admin
      .from("screening_matches")
      .update({
        profile: { ...cached, full_profile: profileWithImages, full_profile_loaded_at: fetchedAt },
        profile_fetched_at: fetchedAt,
      })
      .eq("id", matchId);

    // Meter the billable refresh against the annual search allowance.
    let searchSubjectId: string | null = null;
    if (isRefresh) {
      if (visible.search_id) {
        const { data: parentSearch } = await admin
          .from("screening_searches")
          .select("subject_id")
          .eq("id", visible.search_id)
          .maybeSingle();
        searchSubjectId = (parentSearch?.subject_id as string | null) ?? null;
      }
      await admin.from("screening_searches").insert({
        organisation_id: orgId,
        subject_id: searchSubjectId,
        reference: `REFRESH-${Date.now()}-${matchId.slice(0, 8)}`,
        search_parameters: { type: "profile_refresh", match_id: matchId },
        status: "completed",
        initiated_by: user.id,
      });
    }

    await admin.from("screening_audit_events").insert({
      organisation_id: orgId,
      match_id: matchId,
      event_type: "profile_enriched",
      description: isRefresh
        ? `Listed profile refreshed for ${visible.matched_name} (1 search consumed)`
        : `Full listed profile loaded for ${visible.matched_name}`,
      metadata: {
        listings: profile.listings.length,
        associates: profile.associates.length,
        media: profile.media.length,
        refresh: isRefresh,
        billable: isRefresh,
        images_shared_from_alias: shared.shared,
        fetched_at: fetchedAt,
      },
      actor_id: user.id,
    });

    return json({
      profile: profileWithImages,
      cached: false,
      consumed_search: isRefresh,
      images_shared_from_alias: shared.shared,
    });
  } catch (err) {
    return providerErrorResponse(err, corsHeaders);
  }
});
