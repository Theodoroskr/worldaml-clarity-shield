

## Current State

**Where completed courses are visible:**
- **Dashboard** (`/dashboard`): Shows "My Certificates" section with all earned certificates, share links, and LinkedIn sharing
- **Academy Course page** (`/academy/:slug`): Shows progress bar and quiz results inline
- **Academy listing** (`/academy`): Currently does NOT show which courses are completed — no visual indicator for logged-in users

**What's missing:**
1. No completion badges on the Academy course listing for logged-in users
2. No email notification when a certificate is earned
3. No "My Progress" section showing in-progress vs completed courses

## Plan

### 1. Add completion indicators to Academy course cards

**File: `src/pages/Academy.tsx`**
- For logged-in users, fetch `academy_progress` and `academy_certificates` for their user ID
- Overlay a checkmark badge on completed courses (quiz_passed = true)
- Show "In Progress" badge on courses with progress but no certificate
- Keep cards unchanged for anonymous visitors

### 2. Add "My Courses" tab/section to Academy page

**File: `src/pages/Academy.tsx`**
- For logged-in users, add a "My Progress" summary above the course grid showing: courses started, courses completed, certificates earned
- Add filter tabs: "All Courses" | "In Progress" | "Completed"

### 3. Send certificate email on quiz completion

**Database**: No changes needed — existing tables suffice

**Email setup**: Set up transactional email infrastructure and create a certificate-earned template:
- Call `setup_email_infra` to create queue infrastructure
- Call `scaffold_transactional_email` to create the Edge Function
- Create a `certificate-earned.tsx` template with course name, score, certificate link, and LinkedIn share CTA
- Register in the TEMPLATES registry and deploy

**File: `src/pages/AcademyCourse.tsx`**
- After certificate is created in `submitQuiz()`, invoke `send-transactional-email` with the `certificate-earned` template
- Include `templateData`: holder name, course title, score, certificate URL

### 4. Create unsubscribe page

- Create the route/page as required by the transactional email system (path determined by scaffold tool)
- Branded page matching the site's design, handles token validation and unsubscribe confirmation

### Technical Details

- Email template will use React Email components styled to match WorldAML brand (navy headings, teal accents, white background)
- Idempotency key: `cert-email-${certificate.id}` to prevent duplicate sends
- The certificate URL in the email links to the public verification page (`/academy/certificate/:token`)
- Email subject: "Your WorldAML Certificate — {Course Title}"

