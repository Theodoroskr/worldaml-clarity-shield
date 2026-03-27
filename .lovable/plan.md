

## Plan: Rule-Based Chatbot Widget

Add a floating chat bubble (bottom-right) on all pages with a pre-defined Q&A knowledge base covering WorldAML products, pricing, demos, and support.

### New Files

**1. `src/components/chatbot/ChatbotWidget.tsx`**
- Floating button (bottom-right, `fixed` position) with a chat icon
- Click opens a chat panel (350x450px card) with message history
- Input field at bottom, send button
- Close/minimize button
- Keyword-matching logic: scan user input against a knowledge base of Q&A entries, return the best match or a fallback "I can help you with..." response
- Quick-action buttons at start: "Request a Demo", "View Pricing", "Free AML Check", "Talk to Sales"
- Quick actions navigate or insert pre-filled responses with links
- Mobile responsive (full-width on small screens)

**2. `src/data/chatbotKnowledge.ts`**
- Array of `{ keywords: string[], question: string, answer: string, link?: string }` entries covering:
  - Product info (Suite, API, WorldCompliance, WorldID, AML screening, KYC/KYB, transaction monitoring)
  - Pricing questions → link to `/pricing`
  - Demo requests → link to `/contact-sales`
  - Free trial → link to `/get-started`
  - Free AML check → link to `/free-aml-check`
  - Data coverage → link to `/resources/data-coverage`
  - Partner program → link to `/partners`
  - Support/contact → link to `/support`
  - Security/compliance → link to `/platform/security`
- Fallback response suggesting top actions

### Modified Files

**`src/components/Layout.tsx`**
- Import and render `<ChatbotWidget />` so it appears on every page

### Technical Details
- No database, no AI API key, no external dependencies
- Pure client-side keyword matching with scoring (count keyword hits per entry, return highest)
- State managed with `useState` — no persistence needed
- z-index above other floating elements
- Smooth open/close animation with Tailwind transitions

### Scope
- 2 new files, 1 modified file
- No backend or database changes

