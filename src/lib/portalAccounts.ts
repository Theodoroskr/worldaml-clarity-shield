import { supabase } from "@/integrations/supabase/client";

/**
 * One WorldAML identity (email + password) can hold up to three independent
 * profiles: Academy learner, Partner and Business buyer. Each profile still
 * requires its own sign-up, but the credentials are shared.
 */

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "outlook.com", "live.com", "msn.com",
  "aol.com", "icloud.com", "me.com", "mac.com", "proton.me", "protonmail.com",
  "gmx.com", "gmx.de", "mail.com", "mail.ru", "yandex.com", "yandex.ru",
  "zoho.com", "tutanota.com", "hushmail.com", "fastmail.com", "inbox.com",
  "qq.com", "163.com", "126.com", "naver.com", "web.de", "t-online.de",
]);

const DISPOSABLE_HINTS = ["mailinator", "tempmail", "10minutemail", "guerrillamail", "yopmail", "trashmail", "sharklasers"];

export function emailDomain(email: string): string {
  return (email.split("@")[1] || "").trim().toLowerCase();
}

/** True when the address looks like a company (work) address. */
export function isWorkEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain || !domain.includes(".")) return false;
  if (FREE_EMAIL_DOMAINS.has(domain)) return false;
  return !DISPOSABLE_HINTS.some((hint) => domain.includes(hint));
}

export interface EnsureAccountResult {
  /** Signed-in user id, when a live session could be established. */
  userId: string | null;
  /** The identity already existed — this sign-up added a new profile to it. */
  existingIdentity: boolean;
  /** Account created but e-mail confirmation is required before sign-in. */
  needsConfirmation: boolean;
  error: string | null;
}

/**
 * Creates the shared auth identity for a portal sign-up, or signs the visitor
 * in when they already have a WorldAML account with the same password.
 */
export async function ensureAuthAccount(
  email: string,
  password: string,
  metadata: Record<string, unknown> = {},
): Promise<EnsureAccountResult> {
  const cleanEmail = email.trim();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: { emailRedirectTo: window.location.origin, data: metadata },
  });

  const alreadyRegistered =
    !!signUpError && /already|exists|registered/i.test(signUpError.message);

  if (signUpError && !alreadyRegistered) {
    return { userId: null, existingIdentity: false, needsConfirmation: false, error: signUpError.message };
  }

  if (!signUpError && signUpData.session?.user) {
    return { userId: signUpData.session.user.id, existingIdentity: false, needsConfirmation: false, error: null };
  }

  // Either the identity already existed, or confirmation is pending.
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (signInData?.user) {
    return {
      userId: signInData.user.id,
      existingIdentity: alreadyRegistered || !signUpData?.user,
      needsConfirmation: false,
      error: null,
    };
  }

  if (alreadyRegistered) {
    return {
      userId: null,
      existingIdentity: true,
      needsConfirmation: false,
      error:
        signInError?.message ||
        "An account already exists for this email. Use your existing WorldAML password to add this profile.",
    };
  }

  return { userId: null, existingIdentity: false, needsConfirmation: true, error: null };
}
