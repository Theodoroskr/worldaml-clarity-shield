/**
 * Cleans feed descriptions so a news card only ever shows the four fields we
 * publish: date, title, summary and source. Everything else that syndicated
 * feeds bundle into the description (markup, share prompts, "read more" calls,
 * bylines, publisher suffixes, raw links) is stripped out here.
 */

const BOILERPLATE_PATTERNS: RegExp[] = [
  /\b(read|find out|learn)\s+(more|the full (story|article|release))\b[^.]*\.?/gi,
  /\bcontinue reading\b[^.]*\.?/gi,
  /\bclick here\b[^.]*\.?/gi,
  /\bthe post .*? appeared first on .*?\.?$/gi,
  /\bshare (this|on) (article|story|linkedin|facebook|twitter|x)\b[^.]*\.?/gi,
  /\b(subscribe|sign up) (to|for) [^.]*\.?/gi,
  /\bview (the )?(original|full) (article|press release)\b[^.]*\.?/gi,
  /\bcopyright\b[^.]*\.?/gi,
  /\ball rights reserved\b\.?/gi,
  /\bphoto(graph)? (credit|by)\b[^.]*\.?/gi,
  /\b(by|written by|reported by)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s*[|–—-]?\s*$/g,
];

function stripMarkup(input: string): string {
  const withoutTags = input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  if (typeof document === "undefined") return withoutTags;
  const holder = document.createElement("textarea");
  holder.innerHTML = withoutTags;
  return holder.value;
}

/**
 * Reduce a raw feed description to plain summary prose.
 * Returns an empty string when nothing meaningful is left.
 */
export function cleanSummary(raw: string | null | undefined, title = ""): string {
  if (!raw) return "";

  let text = stripMarkup(String(raw))
    .replace(/&nbsp;?/gi, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\S+@\S+\.\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const pattern of BOILERPLATE_PATTERNS) {
    text = text.replace(pattern, " ");
  }

  // Aggregators append " - Publisher" to the description tail.
  text = text.replace(/\s[-–—]\s[A-Z][\w.&' ]{2,40}$/, "");

  // Drop a repeated headline so the summary adds information.
  const cleanTitle = stripMarkup(title).replace(/\s+/g, " ").trim();
  if (cleanTitle && text.toLowerCase().startsWith(cleanTitle.toLowerCase())) {
    const remainder = text.slice(cleanTitle.length).replace(/^[\s\-–—:.]+/, "").trim();
    if (remainder.length > 40) text = remainder;
  }

  text = text.replace(/\s+/g, " ").replace(/^[\s\-–—:•|]+/, "").trim();

  // Anything shorter than this is a stub such as a publisher name.
  return text.length < 25 ? "" : text;
}

/** Trim to a readable length without leaving a half-finished sentence. */
export function truncateSummary(text: string, maxLength = 320): string {
  const clean = text.trim();
  if (clean.length <= maxLength) return clean;

  const window = clean.slice(0, maxLength);
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? "),
  );
  if (sentenceEnd > maxLength * 0.5) return window.slice(0, sentenceEnd + 1).trim();

  const wordEnd = window.lastIndexOf(" ");
  const cut = (wordEnd > 0 ? window.slice(0, wordEnd) : window).replace(/[,;:.\-–—]+$/, "").trim();
  return `${cut}…`;
}
