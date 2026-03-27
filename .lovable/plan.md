

## Update robots.txt for AI Crawlers

Add two new user-agent blocks to `public/robots.txt` allowing GPTBot (OpenAI) and PerplexityBot (Perplexity AI) full access to the site.

### File Change

**`public/robots.txt`** — Append before the sitemap line:

```
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /
```

This ensures AI systems can crawl and index all public content, improving visibility in AI-powered search and answer engines.

