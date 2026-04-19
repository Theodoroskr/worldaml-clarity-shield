// Shared work-email validator: blocks free/personal email providers.
// Used to enforce company-email-only sign ups and lead capture.

export const FREE_EMAIL_DOMAINS = new Set<string>([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.fr",
  "yahoo.de",
  "yahoo.es",
  "yahoo.it",
  "ymail.com",
  "rocketmail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.fr",
  "hotmail.de",
  "hotmail.es",
  "hotmail.it",
  "outlook.com",
  "outlook.co.uk",
  "outlook.fr",
  "outlook.de",
  "outlook.es",
  "outlook.it",
  "live.com",
  "live.co.uk",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "aim.com",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "tutanota.com",
  "tuta.io",
  "tutamail.com",
  "gmx.com",
  "gmx.de",
  "gmx.net",
  "gmx.us",
  "mail.com",
  "yandex.com",
  "yandex.ru",
  "ya.ru",
  "zoho.com",
  "zohomail.com",
  "fastmail.com",
  "fastmail.fm",
  "hey.com",
  "qq.com",
  "163.com",
  "126.com",
  "sina.com",
  "sina.cn",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "rediffmail.com",
  "inbox.com",
  "hushmail.com",
  "lavabit.com",
  "cock.li",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "trashmail.com",
  "yopmail.com",
  "throwawaymail.com",
  "maildrop.cc",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
  "fakemail.net",
  "mintemail.com",
]);

export function getEmailDomain(email: string): string | null {
  const trimmed = (email || "").trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 1 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export function isFreeEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  return FREE_EMAIL_DOMAINS.has(domain);
}

export function isWorkEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}

export const WORK_EMAIL_ERROR =
  "Please use your company email address. Free providers (Gmail, Outlook, Yahoo, etc.) are not accepted.";
