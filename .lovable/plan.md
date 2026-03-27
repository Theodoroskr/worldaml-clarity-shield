

## Plan: Partner & Referral Program

Build a full partner program with application, admin approval, referral tracking, commission attribution, and a partner dashboard.

### Database Changes (3 new tables, 1 migration)

**`partner_applications`** — stores applications from prospective partners
- `id`, `user_id` (FK to auth.users), `company_name`, `website`, `partner_type` (enum: `referral`, `affiliate`, `reseller`), `description`, `status` (pending/approved/rejected), `created_at`, `reviewed_at`, `reviewed_by`

**`partners`** — approved partners with tracking codes and commission config
- `id`, `user_id`, `referral_code` (unique, auto-generated), `partner_type`, `commission_rate` (decimal, e.g. 0.10 for 10%), `is_active`, `created_at`

**`referrals`** — tracks each referral and its conversion status
- `id`, `partner_id` (FK to partners), `referred_email`, `referral_code_used`, `status` (clicked/signed_up/converted), `conversion_value` (nullable decimal), `commission_earned` (nullable decimal), `created_at`, `converted_at`

RLS: Partners see only their own data; admins see everything. Public insert on `partner_applications`.

### New Pages & Components

**1. `/partners` — Public Partner Program landing page**
- Hero explaining the program (referral, affiliate, reseller tiers)
- Benefits grid (commissions, co-branded materials, dedicated support)
- "Apply Now" CTA linking to `/partners/apply`

**2. `/partners/apply` — Partner Application Form**
- Auth-gated (must be logged in)
- Fields: company name, website, partner type selection, description of how they plan to refer
- Submits to `partner_applications` table
- Success state: "Application submitted — we'll review within 48 hours"

**3. `/partners/dashboard` — Partner Dashboard (auth-gated, approved partners only)**
- Overview stats: total referrals, conversions, pending commission, total earned
- Unique referral link display with copy button (`?ref=CODE`)
- Referral history table with status badges (clicked → signed up → converted)
- Commission breakdown

**4. Admin Panel — New "Partners" tab in `/admin`**
- List partner applications with approve/reject actions
- View active partners, their referral codes, and performance metrics
- Set/adjust commission rates per partner

### Referral Tracking Logic

- Referral codes appended as `?ref=CODE` query param
- On any page load, capture `ref` param and store in `localStorage`
- On signup, read stored `ref` code and insert a row into `referrals` with `status: 'signed_up'`
- On conversion (e.g. Stripe checkout success), update referral to `status: 'converted'` with value

### Files Created/Modified

| File | Action |
|------|--------|
| `src/pages/Partners.tsx` | Create — landing page |
| `src/pages/PartnerApply.tsx` | Create — application form |
| `src/pages/PartnerDashboard.tsx` | Create — partner dashboard |
| `src/components/partners/PartnerHeroSection.tsx` | Create |
| `src/components/partners/PartnerBenefitsSection.tsx` | Create |
| `src/components/partners/PartnerApplicationForm.tsx` | Create |
| `src/components/partners/PartnerStatsCards.tsx` | Create |
| `src/components/partners/ReferralTable.tsx` | Create |
| `src/pages/Admin.tsx` | Modify — add Partners tab |
| `src/App.tsx` | Modify — add 3 routes |
| `src/components/Footer.tsx` | Modify — add Partner Program link |
| Migration | 3 tables + enum + RLS policies |

### Scope
- 1 database migration (3 tables, 1 enum, RLS policies)
- 8 new files, 3 modified files
- No external dependencies

