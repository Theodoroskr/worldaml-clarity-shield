

# Client-Side RSS Integration Plan

## Overview
Add live RSS feed fetching to the News page using a free RSS-to-JSON proxy service (rss2json.com). No backend required - works entirely in the browser.

---

## How It Works

```text
RSS Feed (XML) → rss2json.com API → JSON → NewsCard[]
```

The proxy service converts XML feeds to JSON and handles CORS, so we can fetch directly from the browser.

---

## Implementation

### 1. Create RSS Service (`src/services/rssService.ts`)

A utility to fetch and parse RSS feeds:

```text
- Fetch from: https://api.rss2json.com/v1/api.json?rss_url={FEED_URL}
- Map RSS items to NewsItem format
- Handle errors gracefully
- Cache results to avoid rate limits
```

**Feed sources to include:**
| Source | RSS URL | Category |
|--------|---------|----------|
| FATF | fatf-gafi.org/rss.xml | Regulatory Updates |
| OFAC | ofac.treasury.gov/rss.xml | Sanctions & Enforcement |
| FCA | fca.org.uk/news/rss.xml | AML & Financial Crime |
| FinCEN | fincen.gov/rss.xml | Regulatory Updates |

### 2. Create Custom Hook (`src/hooks/useRSSFeeds.ts`)

React hook to manage RSS data:
- Fetch from multiple feeds on mount
- Merge and sort by date
- Combine with sample/fallback data
- Handle loading and error states

### 3. Update News Page (`src/pages/News.tsx`)

- Use `useRSSFeeds` hook instead of static data
- Show loading skeleton while fetching
- Fall back to sample data if feeds fail
- Display "Live" badge for real-time items

---

## Technical Details

### RSS-to-JSON API
- **Service:** rss2json.com (free tier: 10,000 requests/day)
- **No API key required** for basic usage
- **CORS enabled** - works from browser

### Data Mapping
```text
RSS Item → NewsItem
─────────────────────
title → title
link → sourceUrl
pubDate → publishedAt
description → summary (truncated)
feed.title → source
```

### Category Assignment
Items are categorised based on their source feed:
- FATF, FinCEN, EBA feeds → "Regulatory Updates"
- OFAC feeds → "Sanctions & Enforcement"
- FCA, INTERPOL feeds → "AML & Financial Crime"
- DFSA, SAMA feeds → "GCC Regulatory Updates"

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/services/rssService.ts` |
| Create | `src/hooks/useRSSFeeds.ts` |
| Modify | `src/pages/News.tsx` |

---

## Limitations (Good to Know)

- **Rate limits:** Free tier allows 10,000 requests/day (plenty for a marketing site)
- **Feed availability:** Some regulators may block proxy requests; fallback to sample data handles this
- **No deduplication:** Client-side only, so duplicates may appear if user refreshes frequently

This approach is perfect for demonstrating live data without infrastructure cost.

