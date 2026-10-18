// Who may cause a WorldAML Suite organisation to be created.
// Self-serve users (Academy learners, public signups, personal email
// addresses) must never spawn a company. Keep in sync with src/lib/workEmail.ts.

export const FREE_EMAIL_DOMAINS = new Set<string>([
  "gmail.com", "googlemail.com", "gmial.com", "yahoo.com", "yahoo.co.uk", "yahoo.fr", "yahoo.de",
  "yahoo.es", "yahoo.it", "ymail.com", "rocketmail.com", "hotmail.com", "hotmail.co.uk",
  "hotmail.fr", "hotmail.de", "hotmail.es", "hotmail.it", "outlook.com", "outlook.co.uk",
  "outlook.fr", "outlook.de", "outlook.es", "outlook.it", "live.com", "live.co.uk", "msn.com",
  "icloud.com", "me.com", "mac.com", "aol.com", "aim.com", "protonmail.com", "proton.me", "pm.me",
  "tutanota.com", "tuta.io", "tutamail.com", "gmx.com", "gmx.de", "gmx.net", "gmx.us", "mail.com",
  "yandex.com", "yandex.ru", "ya.ru", "zoho.com", "zohomail.com", "fastmail.com", "fastmail.fm",
  "hey.com", "qq.com", "163.com", "126.com", "sina.com", "sina.cn", "naver.com", "daum.net",
  "hanmail.net", "rediffmail.com", "inbox.com", "hushmail.com", "o2.pl", "wp.pl", "onet.pl",
  "interia.pl", "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "trashmail.com", "yopmail.com", "throwawaymail.com", "maildrop.cc",
  "getnada.com", "sharklasers.com", "dispostable.com",
]);

export function emailDomain(email: string | null | undefined): string | null {
  const e = (email ?? "").trim().toLowerCase();
  const at = e.lastIndexOf("@");
  return at > 0 && at < e.length - 1 ? e.slice(at + 1) : null;
}

export function isFreeEmail(email: string | null | undefined): boolean {
  const d = emailDomain(email);
  return !d || FREE_EMAIL_DOMAINS.has(d);
}

/**
 * Returns a real company name when the user qualifies for an enterprise
 * demo organisation, or null when they must not get one.
 * Rules: company email AND an explicit company name that isn't just
 * an email domain.
 */
export function enterpriseOrgNameFor(
  email: string | null | undefined,
  companyName: unknown,
): string | null {
  if (isFreeEmail(email)) return null;
  const name = typeof companyName === "string" ? companyName.trim() : "";
  if (name.length < 2) return null;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(name)) return null; // looks like a domain
  return name.slice(0, 200);
}
