import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://uxjjxnnyrjkhcggptihx.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4amp4bm55cmpraGNnZ3B0aWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTE5MzIsImV4cCI6MjA4NTU4NzkzMn0.19w0NamKWVZHENxcfXxVNgmhywd3PQUKdKaO3bh_WrQ";

/** Signed-out client: only sees what public Academy pages see. */
export const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Access token for an admin session, taken from ACADEMY_ADMIN_ACCESS_TOKEN or
 * from the session file written by `lovable auth-session`. Returns null when
 * neither is available or the session has expired.
 */
export function findAdminAccessToken(): string | null {
  const fromEnv = process.env.ACADEMY_ADMIN_ACCESS_TOKEN;
  if (fromEnv) return fromEnv;

  const file = join(homedir(), ".cache", "lovable-auth", "session.json");
  if (!existsSync(file)) return null;
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    const session = parsed.session ?? parsed;
    const expiresAt = Number(session.expires_at ?? 0);
    if (expiresAt && expiresAt * 1000 < Date.now()) return null;
    return typeof session.access_token === "string" ? session.access_token : null;
  } catch {
    return null;
  }
}

export function signedInClient(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
