## Goal

Make `/rcm/*` fully translatable and Arabic-correct. Today the nav, header, and placeholder titles already read from `react-i18next`, but the placeholder body, dashboard footer text, and dashboard "no org" hint are hardcoded English, and the layout shell doesn't react to `dir="rtl"` (logical spacing, scroll direction, sidebar side).

## Scope

1. **Replace remaining hardcoded English strings** under `/rcm/*` with `t()` keys.
2. **Add the missing translation keys** to both `en.json` and `ar.json`.
3. **Make the layout RTL-aware** so Arabic renders correctly (sidebar on the right, logical paddings, header alignment).
4. **Guarantee i18n is initialised before any RCM page mounts** (currently relies on a side-effect import that is only inside `RcmLayout`).

## Implementation

### 1. New i18n keys

Add to `src/i18n/locales/en.json` under `rcm`:

```
"placeholder": {
  "body": "Module scaffolded. CRUD UI ships in the next iteration — schema, RLS and demo data are already live."
},
"dashboard": {
  ...existing,
  "scaffold_note": "Schema, RLS, and Region Trade Bank demo data are live. Library, Obligations, Controls, Assessments, Tasks, Evidence, Reports, Translation Review, Audit and Settings UIs are scaffolded — basic CRUD lands in the next iteration.",
  "sign_in_first": "Sign in first via {{loginPath}}."
}
```

Add Arabic equivalents to `src/i18n/locales/ar.json`:

```
"placeholder": {
  "body": "الوحدة جاهزة هيكلياً. ستظهر واجهة CRUD في التكرار التالي — المخطط وسياسات RLS والبيانات التجريبية فعّالة بالفعل."
},
"dashboard": {
  ...existing,
  "scaffold_note": "المخطط وسياسات RLS وبيانات Region Trade Bank التجريبية فعّالة. تم تجهيز واجهات المكتبة والالتزامات والضوابط والتقييمات والمهام والأدلة والتقارير ومراجعة الترجمة والتدقيق والإعدادات — تصل عمليات CRUD الأساسية لاحقاً.",
  "sign_in_first": "يرجى تسجيل الدخول أولاً عبر {{loginPath}}."
}
```

### 2. Wire keys into components

- `src/pages/rcm/RcmPlaceholder.tsx` — replace the hardcoded sentence with `t("rcm.placeholder.body")`.
- `src/pages/rcm/RcmDashboard.tsx` — replace the scaffold paragraph with `t("rcm.dashboard.scaffold_note")` and the "Sign in first" line with the `sign_in_first` key (`<Trans>` with the `/login` link, or split the translated string around the `/login` href).

### 3. RTL-aware layout

Update `src/pages/rcm/RcmLayout.tsx`:

- Read `i18n.dir()` (or `i18n.language`) and pass `side="right"` to `<RcmSidebar />` when RTL so the sidebar mounts on the trailing edge.
- Replace directional Tailwind utilities with logical equivalents in the header/main: `pl-`/`pr-` → `ps-`/`pe-`, `ml-`/`mr-` → `ms-`/`me-`, `text-left/right` → `text-start/end`. Specifically the header `px-3` is already symmetric, but the inner clusters use `gap-3` which is fine. Audit `RcmSidebar.tsx` for any `ml/mr/pl/pr` and swap to `ms/me/ps/pe` (none currently, but verify after the `side="right"` change).
- Pass an `dir` attribute on the outer wrapper as a belt-and-braces signal: `<div dir={i18n.dir()} ...>`.

Update `src/components/rcm/RcmSidebar.tsx`:

- Accept an optional `side?: "left" | "right"` prop and forward to the shadcn `<Sidebar>` component.

### 4. Bootstrap i18n early

Move the `import "@/i18n"` side-effect import from `RcmLayout.tsx` into `src/main.tsx` so the i18n instance, language detection and `dir`/`lang` attributes on `<html>` are applied before the very first render (avoids a flash of English on a deep-link to `/rcm/obligations`). Keep the import in `RcmLayout.tsx` as a no-op safety net.

### 5. QA checklist (in default mode after edits)

- Visit `/rcm`, switch to Arabic via the LanguageSwitcher → header label, sidebar items, KPI tiles, scaffold note all translate.
- Reload on `/rcm/obligations` directly with `localStorage` set to `ar` → page title and placeholder body both render Arabic, `<html dir="rtl" lang="ar">`.
- Sidebar is anchored to the right edge in RTL; chevrons/icons remain visually correct.
- Switch back to English → layout flips back to LTR, sidebar returns to the left.

## Files touched

- edit `src/i18n/locales/en.json` — add `placeholder` and dashboard keys.
- edit `src/i18n/locales/ar.json` — add Arabic translations.
- edit `src/pages/rcm/RcmPlaceholder.tsx` — translate body.
- edit `src/pages/rcm/RcmDashboard.tsx` — translate scaffold note + sign-in hint.
- edit `src/pages/rcm/RcmLayout.tsx` — RTL `dir`, sidebar side, drop redundant import.
- edit `src/components/rcm/RcmSidebar.tsx` — accept `side` prop.
- edit `src/main.tsx` — import `@/i18n` once at app boot.

## Out of scope

- Translating each future CRUD page (will be done as those pages get built).
- Server-side localisation of database-stored regulation/obligation text (already covered separately by `rcm_obligation_translations`).
- Adding more than EN/AR (e.g. FR, ES) — current `supportedLngs` stays `["en","ar"]`.
