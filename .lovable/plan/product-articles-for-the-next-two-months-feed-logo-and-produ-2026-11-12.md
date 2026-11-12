# Product articles for the next two months (feed, logo and product images)

## What you get
- 16 product articles, two a week (Tuesdays and Fridays) from Fri 11 Dec 2026 to Tue 2 Feb 2027. They follow on from the current batch, which ends on 8 Dec.
- Each article has its own picture: an illustration of the product (screens, dashboards, documents, globe or network shapes), with no people. The WorldAML logo you sent is placed in a corner of every picture.
- Each picture shows at the top of its article, on the blog list and in social sharing previews. It is also attached to the article's entry in the news feed, so Make can post the picture together with the article.
- All facts about the products come only from your own product pages. Nothing is invented, including prices that aren't already published.

## Release schedule (one article per product feature)
| Date | Product | Topic |
|---|---|---|
| Fri 11 Dec | WorldAML Suite | One workspace for screening, monitoring, cases and reporting |
| Tue 15 Dec | Screening & Monitoring | How ongoing monitoring alerts you to risk changes |
| Fri 18 Dec | Screening & Monitoring | Explainable name matching: why each match appears |
| Tue 22 Dec | Suite: MRZ Document Check | Checking passports and ID cards before onboarding |
| Tue 29 Dec | Enterprise AML Screening | Screening at enterprise scale |
| Fri 1 Jan | WorldID | Digital identity checks for KYC |
| Tue 5 Jan | KYC/KYB API | Building onboarding into your app |
| Fri 8 Jan | AML / Sanctions Screening API | Adding real-time screening to payment flows |
| Tue 12 Jan | Suite: Risk alerts | Risk levels and threshold alert rules |
| Fri 15 Jan | Suite: Cases and audit trail | Evidence regulators expect |
| Tue 19 Jan | Suite: Transaction monitoring | Rules matched to your regulator |
| Fri 22 Jan | Suite: Regulatory reporting | Automatic report exports |
| Tue 26 Jan | Data coverage | 1,900+ global lists explained |
| Fri 29 Jan | WorldAML Academy | Free certificate and team training seats |
| Tue 2 Feb | Platform API | Connecting WorldAML to your own systems |
| Fri 5 Feb | Why WorldAML | Two lanes: the WorldAML platform and LexisNexis data |

Christmas Day (Fri 25 Dec) is skipped. The exact topics may shift slightly if a product page doesn't have enough detail for a full article.

## What you need to do
- Publish on each release day, as you do now, so the feed and Make pick up the new article.

## Technical section
- Write the posts in `src/data/blogPosts.ts`, with `date` set to the release day. The existing release-date logic and its test already handle when each one goes live.
- Generate the 16 illustrations with no people. Place the logo from the upload in a corner of each, using a code overlay so the logo stays exact. Upload the images as hosted assets and set each post's `heroImage` (absolute `https://worldaml.com` URL) and `heroImageAlt`.
- Feed: add `<enclosure>` and `media:content` image tags for each post with a `heroImage`. Show the picture on the blog list cards and at the top of each article.
- Extend `blog-schedule.test.ts` to check the 16 Tue/Fri dates and that every new post has a picture, and `rss-feed.test.ts` to check that the image appears in the feed. Inspect every generated picture before using it.
