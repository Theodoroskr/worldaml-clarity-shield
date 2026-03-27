

## Send Certificate Email via Resend on Quiz Completion

### Overview
Create a new Edge Function that sends a branded certificate email to the user when they pass a quiz. Trigger it from the existing `submitQuiz()` flow in `AcademyCourse.tsx`. Uses the existing Resend setup (same pattern as `submit-form` and `notify-new-signup`).

### Changes

#### 1. New Edge Function: `supabase/functions/send-certificate-email/index.ts`
- Uses `RESEND_API_KEY` from env (already configured)
- Sends from `forms@worldaml.com` (or `noreply@worldaml.com`) to the user's email
- Accepts: `holder_name`, `email`, `course_title`, `score`, `certificate_url`
- HTML email template with navy/teal branding matching WorldAML style:
  - Logo area with "WorldAML Academy"
  - Congratulations message with course name and score
  - CTA button linking to the certificate page
  - LinkedIn share CTA
  - Footer with "This is an automated certificate notification"
- Idempotency: include `X-Entity-Ref-ID` header with certificate ID to prevent duplicates

#### 2. Update `src/pages/AcademyCourse.tsx`
- After certificate is successfully created (line ~162), invoke the new edge function:
  ```
  supabase.functions.invoke("send-certificate-email", {
    body: {
      holder_name: holderName,
      email: user.email,
      course_title: course.title,
      score,
      certificate_url: `${window.location.origin}/academy/certificate/${cert.share_token}`
    }
  })
  ```
- Fire-and-forget (don't block the UI on email delivery)
- No error handling needed — email is a bonus, not critical path

### Technical Details
- Same Resend pattern as existing `submit-form/index.ts`
- No database changes needed
- No new secrets needed (`RESEND_API_KEY` already configured)
- Email subject: "Your WorldAML Certificate — {Course Title}"

