# Academy premium visual redesign

Brand tokens stay locked (deep navy, slate, teal accent, dark default). This is a **visual** pass — no changes to Stripe, quiz logic, certificate generation, or DB. I'll rework layout, hierarchy, typography scale, motion, empty states, and micro-detail across the four surfaces.

## Approach

Redesign one surface at a time, in order. For each surface I:

1. Capture the current screen.
2. Generate **3 rendered design directions** (locked palette + type, varying composition/density/motion).
3. Show them to you — you pick one.
4. Implement the chosen direction, matching composition exactly.

This way you steer each surface instead of me shipping 4 redesigns blind.

## Phase order & what changes per surface

**1. Landing + course catalog** (`/academy`)
- Hero: stronger editorial headline treatment, replace stock portrait vibe with a more distinctive art-directed asset or typographic hero
- Stats strip: quieter, more premium (right-aligned metrics, hairline dividers)
- "How access works" card: reformat as a 3-step ribbon instead of bullet list
- Course grid: richer cards — level badge, duration, price, region, hover state
- Testimonials: pull-quote editorial layout instead of 3 equal cards
- Plan comparison: clearer free vs paid vs annual pass

**2. Course player + module flow** (`/academy/course/:slug`)
- Two-pane reading layout (module rail left, content right) with progress woven in
- Reading typography: tighter measure, better rhythm, callout/case-study components
- Sticky module progress + "next module" affordance
- Distinct states for locked / in-progress / complete modules

**3. Quiz + certificate issuance**
- Full-focus quiz view (chrome hidden, one question at a time, keyboard nav)
- Pass/fail reveal with proper reward moment (motion, seal animation)
- Certificate preview card: paper texture, seal, verifiable URL, share row (LinkedIn, copy link, email)
- Name-capture prompt replaced with an inline modal, not `window.prompt`

**4. Checkout + cart + post-purchase**
- Basket drawer redesign (line items, bundle discount visible, region/currency chip)
- Post-purchase success screen: "You're in" moment → jump straight into first module
- Dashboard certificates section: gallery-style cards with resend/share/download inline

## Cross-cutting polish (applied in every phase)
- Consistent motion register (framer-motion, restrained — 200–400ms, ease-out)
- Real skeletons + empty states instead of blank areas
- Regional currency chip treated as a first-class UI element, not a floating toast
- Hairline dividers, generous negative space, one accent color at a time
- Kill any remaining generic AI-hero look

## Out of scope
- No copy rewrite beyond micro-labels
- No pricing/plan structure changes
- No new courses or module content
- No backend/schema/edge-function changes

## Kickoff

If you approve, I start **Phase 1 (Landing + catalog)** immediately: capture → 3 directions → you pick → I ship. Then Phase 2, and so on.

Reply "go" (or "start with phase 2/3/4") and I begin.
