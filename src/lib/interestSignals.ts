/**
 * Lightweight, privacy-friendly interest signals used to personalise the
 * learner dashboard. Everything is stored locally in the browser — no
 * tracking, no network calls, no personal data.
 */

const TERMS_KEY = "worldaml.signals.searchTerms";
const VIEWS_KEY = "worldaml.signals.courseViews";
const MAX_TERMS = 8;
const MAX_VIEWS = 12;

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, values: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

/** Record a course search term (call debounced — very short terms are ignored). */
export function recordSearchTerm(term: string) {
  const clean = term.trim().toLowerCase();
  if (clean.length < 3) return;
  const next = [clean, ...read(TERMS_KEY).filter((t) => t !== clean)].slice(0, MAX_TERMS);
  write(TERMS_KEY, next);
}

/** Record that the learner opened a course. */
export function recordCourseView(slug: string) {
  if (!slug) return;
  const next = [slug, ...read(VIEWS_KEY).filter((s) => s !== slug)].slice(0, MAX_VIEWS);
  write(VIEWS_KEY, next);
}

export interface InterestSignals {
  terms: string[];
  viewedSlugs: string[];
}

export function getInterestSignals(): InterestSignals {
  return { terms: read(TERMS_KEY), viewedSlugs: read(VIEWS_KEY) };
}

export function clearInterestSignals() {
  write(TERMS_KEY, []);
  write(VIEWS_KEY, []);
}
