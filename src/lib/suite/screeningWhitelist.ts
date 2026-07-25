import { supabase } from "@/integrations/supabase/client";
import type { ScreeningResult } from "@/services/screeningProvider";

export interface WhitelistEntry {
  id: string;
  customer_id: string;
  match_key: string;
  match_name: string;
  list_type: string | null;
  match_id: string | null;
  reason: string;
  reviewed_by: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  hit_count: number;
  last_hit_at: string | null;
  created_at: string;
}

/** Stable key for a screening hit: normalised name + list type. */
export function whitelistKey(name: string, listType?: string | null): string {
  const n = (name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${n}::${(listType || "any").toLowerCase()}`;
}

export function isActive(entry: WhitelistEntry, now = Date.now()): boolean {
  if (entry.revoked_at) return false;
  if (entry.expires_at && new Date(entry.expires_at).getTime() < now) return false;
  return true;
}

/** Active (non-revoked, non-expired) whitelist entries for a customer. */
export async function fetchWhitelist(customerId: string): Promise<WhitelistEntry[]> {
  if (!customerId) return [];
  const { data } = await supabase
    .from("suite_screening_whitelist")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as WhitelistEntry[]).filter(e => isActive(e));
}

/** All entries (including revoked/expired) for an organisation — management view. */
export async function fetchOrgWhitelist(orgId: string): Promise<WhitelistEntry[]> {
  if (!orgId) return [];
  const { data } = await supabase
    .from("suite_screening_whitelist")
    .select("*")
    .eq("organisation_id", orgId)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as WhitelistEntry[];
}

export function findWhitelistMatch(
  entries: WhitelistEntry[],
  result: Pick<ScreeningResult, "id" | "name" | "listType">,
): WhitelistEntry | undefined {
  const exact = whitelistKey(result.name, result.listType);
  const anyList = whitelistKey(result.name, null);
  return entries.find(e => e.match_key === exact || e.match_key === anyList || (e.match_id && e.match_id === result.id));
}

/**
 * Split screening results into suppressed (known false positives) and live hits,
 * and bump the hit counters on the entries that fired.
 */
export async function applyWhitelist(
  customerId: string,
  results: ScreeningResult[],
): Promise<{ live: ScreeningResult[]; suppressed: { result: ScreeningResult; entry: WhitelistEntry }[]; entries: WhitelistEntry[] }> {
  const entries = await fetchWhitelist(customerId);
  if (entries.length === 0) return { live: results, suppressed: [], entries };

  const live: ScreeningResult[] = [];
  const suppressed: { result: ScreeningResult; entry: WhitelistEntry }[] = [];
  for (const r of results) {
    const entry = findWhitelistMatch(entries, r);
    if (entry) suppressed.push({ result: r, entry });
    else live.push(r);
  }

  if (suppressed.length > 0) {
    const now = new Date().toISOString();
    const seen = new Map<string, WhitelistEntry>();
    suppressed.forEach(s => seen.set(s.entry.id, s.entry));
    await Promise.all(
      [...seen.values()].map(e =>
        supabase
          .from("suite_screening_whitelist")
          .update({ hit_count: (e.hit_count ?? 0) + 1, last_hit_at: now })
          .eq("id", e.id),
      ),
    );
  }

  return { live, suppressed, entries };
}

export async function addWhitelistEntry(input: {
  orgId: string | null;
  customerId: string;
  userId: string;
  result: Pick<ScreeningResult, "id" | "name" | "listType">;
  reason: string;
  reviewedBy?: string | null;
  expiresAt?: string | null;
  scopeAllLists?: boolean;
}) {
  return supabase.from("suite_screening_whitelist").insert({
    organisation_id: input.orgId,
    customer_id: input.customerId,
    user_id: input.userId,
    match_key: whitelistKey(input.result.name, input.scopeAllLists ? null : input.result.listType),
    match_name: input.result.name,
    list_type: input.scopeAllLists ? null : input.result.listType,
    match_id: input.result.id ?? null,
    reason: input.reason,
    reviewed_by: input.reviewedBy ?? null,
    expires_at: input.expiresAt ?? null,
  });
}

export async function revokeWhitelistEntry(id: string) {
  return supabase
    .from("suite_screening_whitelist")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
}
