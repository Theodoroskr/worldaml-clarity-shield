# Help module in the Screening & Monitoring workspace

Add an always-available Help panel to the screening workspace: a "Help" button in the sidebar (and mobile bar) opens a slide-over with searchable, curated articles and a support ticket form that saves to the database.

## What the user gets

- A **Help** entry at the bottom of the screening sidebar, available on every screening page (Workspace, Monitored entities, Risk alerts, Team & access, Add-on modules).
- A **slide-over panel** with:
  - A search box filtering articles by title and body.
  - Articles grouped by category (Getting started, Running a screening, Reviewing matches, Ongoing monitoring, Risk alerts, Plans & quota, Team & access).
  - Expandable article bodies, so the panel stays scannable.
  - A footer with links to packages, API documentation and email support.
- A **"Contact support"** tab in the same panel with a short form (subject, category, message, optional current page context). Submitting saves a ticket and shows a confirmation with the reference number.
- Existing risk-alert help copy is reused rather than duplicated.

## Content

Static, curated content in code covering, at minimum:
- Running a search: entity type (including "Any"), fuzziness interval, sources, the "Match provider portal view" preset, active filters panel.
- Reading results: match basis colours, similarity scores, grouped duplicate entities, opening the profile drawer and photo gallery.
- Decisions: confirm, false positive, escalate, add to monitoring; what each does to the case status.
- Monitoring: activating monitoring for a subject, the monitoring timeline, alerts and "mark reviewed".
- Risk alerts: reuse of the existing risk alert help articles.
- Plans and quota: demo plan, search quota, upgrading, receipts.
- Team & access: inviting members, roles.

## Technical notes

- New `src/lib/screening/helpContent.ts` — typed article list (`id`, `category`, `title`, `body`, optional `link`), importing and re-exporting the existing `riskAlertHelp` articles so copy stays in one place.
- New `src/components/screening/HelpPanel.tsx` — shadcn `Sheet` (right side) with `Tabs` for "Articles" and "Contact support"; local search state, `Accordion` for article bodies.
- `ScreeningLayout.tsx` — add a Help button in the sidebar footer (icon-only when collapsed, tooltip) and in the mobile product bar; render the panel once at layout level so it works on every screening route. Panel can also be opened via a `?help=` query param for deep links from pages.
- Database migration for support tickets:
  - `public.support_tickets` (id, user_id, organisation_id nullable, product text default 'screening', category, subject, message, page_path, status default 'open', created_at).
  - GRANTs: `INSERT, SELECT` to `authenticated`, `ALL` to `service_role` (no anon).
  - RLS enabled: users insert their own rows (`auth.uid() = user_id`) and select their own rows; admins (`has_role(auth.uid(),'admin')`) can select and update all.
- Ticket submit inserts directly from the client via the existing Supabase client; errors surface as a toast. No email sending in this scope.
- Styling uses existing semantic tokens (teal accent, dark sidebar surfaces) — no hardcoded colours.
