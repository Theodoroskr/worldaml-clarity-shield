// Shared security helpers for edge functions.
// deno-lint-ignore-file no-explicit-any

/** Escape a value for safe interpolation into HTML (emails, etc.). */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const ALLOWED_ORIGINS = new Set<string>([
  "https://worldaml.com",
  "https://www.worldaml.com",
  "https://academy.worldaml.com",
  "https://suite.worldaml.com",
  "https://worldaml-clarity-shield.lovable.app",
  "https://id-preview--45fad80e-a3af-4af8-8314-fd6244206421.lovable.app",
]);

const DEFAULT_ORIGIN = "https://worldaml.com";

/**
 * Return the request Origin only when it is one of our own sites; otherwise
 * fall back to the production site. Prevents return/redirect URLs from
 * pointing at attacker-controlled domains.
 */
export function safeOrigin(req: Request, fallback: string = DEFAULT_ORIGIN): string {
  const origin = (req.headers.get("origin") || "").replace(/\/+$/, "");
  if (!origin) return fallback;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  try {
    const u = new URL(origin);
    if (u.protocol === "https:" && /^[a-z0-9-]+\.lovable\.app$/i.test(u.hostname) &&
        u.hostname.includes("45fad80e-a3af-4af8-8314-fd6244206421")) {
      return origin;
    }
    if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) {
      return origin;
    }
  } catch { /* ignore */ }
  return fallback;
}

/**
 * Authorise a scheduled (pg_cron) invocation. Accepts either the service-role
 * key as bearer token, or the shared scheduled-job secret (stored in a
 * service-role-only table) in the `x-cron-secret` header.
 */
export async function isAuthorizedScheduledCall(req: Request, admin: any): Promise<boolean> {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (serviceKey && bearer && bearer === serviceKey) return true;

  const provided = req.headers.get("x-cron-secret") ?? "";
  if (!provided) return false;
  const { data } = await admin
    .from("internal_cron_secrets")
    .select("secret")
    .eq("name", "scheduled_jobs")
    .maybeSingle();
  return !!data?.secret && data.secret === provided;
}

const INTERNAL_DOMAINS = ["worldaml.com", "infocreditgroup.com"];

/** True when the address is an internal WorldAML / Infocredit mailbox. */
export function isInternalEmail(email: string): boolean {
  const d = email.trim().toLowerCase().split("@")[1] ?? "";
  return INTERNAL_DOMAINS.some((x) => d === x || d.endsWith("." + x));
}

/** True when the address belongs to a registered WorldAML account (or internal mailbox). */
export async function isKnownRecipient(admin: any, email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  if (isInternalEmail(e)) return true;
  const { data } = await admin.from("profiles").select("user_id").ilike("email", e).limit(1);
  return !!data?.length;
}

/** Only allow links to our own sites in outbound emails. */
export function isSafeLink(url: unknown): boolean {
  if (typeof url !== "string" || !url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" &&
      (u.hostname === "worldaml.com" || u.hostname.endsWith(".worldaml.com"));
  } catch { return false; }
}
