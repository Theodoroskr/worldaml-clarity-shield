
# Signup Notification, User Approval Workflow & Branded Auth Emails

This plan covers three interconnected features that together create a complete, professional user onboarding flow for WorldAML.

---

## What Will Be Built

### 1. Admin Notification on New Signup
A backend function triggered by a new user registration that sends an email to `info@worldaml.com` with the user's name, company, and email address. Uses the existing Resend setup (`RESEND_API_KEY` + `forms@worldaml.com`).

### 2. User Approval Workflow
New accounts will be placed in a **"pending"** state and cannot access the dashboard until approved by an admin. This involves:
- A `user_status` field on the `profiles` table (`pending` | `approved` | `rejected`)
- A separate `user_roles` table for admin access (following the security guidelines — roles are never stored on profiles)
- An `has_role()` security-definer function to safely check admin status
- A protected `/admin` dashboard page where admins can approve or reject pending users
- A gate in `AuthContext` that blocks access to `/dashboard` for unapproved users, redirecting to a "pending approval" holding page

### 3. Branded Auth Emails
Using the Lovable managed auth email system (`scaffold_auth_email_templates`), all system emails (verification, password reset, etc.) will be sent with WorldAML branding — matching the navy/teal color palette from `index.css`, with the WorldAML logo, and copy consistent with the platform's tone.

---

## Technical Implementation Plan

### Database Changes (Migrations)

**Migration 1 — Add `status` to `profiles`:**
```sql
ALTER TABLE public.profiles
  ADD COLUMN status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));
```

**Migration 2 — Create `user_roles` table:**
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can view all roles; users can view their own
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

**Migration 3 — Admin can view all profiles (for the approval dashboard):**
```sql
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

---

### Backend Function — `notify-new-signup`
A new edge function that:
1. Receives a webhook-style call triggered from the `handle_new_user` database trigger (or called directly from Signup page after successful registration)
2. Sends an admin notification email to `info@worldaml.com` using the same Resend pattern as `submit-form`

The email will include: full name, company name, email address, sign-up time, and a direct link to the admin approval panel.

The simplest, most reliable pattern: call the function from `src/pages/Signup.tsx` right after successful `signUp()`.

---

### Frontend Changes

**`src/contexts/AuthContext.tsx`**
- Add `status` and `isAdmin` to the context, derived from the `profiles` table and `user_roles` table respectively
- Expose `isApproved` boolean for easy gate-checking

**`src/pages/Dashboard.tsx`**
- Add a guard: if `user` exists but `profile.status === 'pending'`, redirect to `/pending-approval` instead of showing the dashboard

**`src/pages/PendingApproval.tsx` (new)**
- A simple holding page: "Your account is pending review. You'll receive an email once approved."
- Shows the user's name and email
- Has a sign-out button

**`src/pages/Admin.tsx` (new)**
- Protected — only accessible to users with the `admin` role
- Lists all users with `pending` status with their name, company, email, and sign-up date
- Approve / Reject buttons that update `profiles.status`
- A separate tab showing all approved/rejected users
- Route: `/admin`

**`src/App.tsx`**
- Add routes for `/pending-approval` and `/admin`

---

### Branded Auth Emails
Using `scaffold_auth_email_templates` which will:
- Create all 6 email templates (signup confirmation, password reset, magic link, etc.)
- Apply WorldAML branding: navy (`#1e3a5f`) headings, teal (`#0d9488`) buttons, white body background
- Use the WorldAML logo from `src/assets/infocredit-logo.png` (or the favicon)
- Copy tone: professional, compliance-focused ("Welcome to WorldAML — your account verification link is below")

---

## User Flow After This Is Built

```text
User signs up on /signup
  → Email verification sent (branded WorldAML email)
  → Admin receives notification at info@worldaml.com with name/company/email + link to /admin
  → User verifies email → lands on /pending-approval
  → Admin logs into /admin → approves user
  → User can now access /dashboard
```

---

## Files Created / Modified

| File | Change |
|---|---|
| DB migration | Add `status` to `profiles`, create `user_roles` table + policies |
| `supabase/functions/notify-new-signup/index.ts` | New edge function — sends admin notification email |
| `supabase/functions/_shared/email-templates/*.tsx` | Scaffolded branded templates (6 files) |
| `supabase/functions/auth-email-hook/index.ts` | Scaffolded hook |
| `src/contexts/AuthContext.tsx` | Add `isApproved`, `isAdmin`, `status` to context |
| `src/pages/Signup.tsx` | Call `notify-new-signup` after successful registration |
| `src/pages/Dashboard.tsx` | Guard for pending users → redirect to `/pending-approval` |
| `src/pages/PendingApproval.tsx` | New holding page for unapproved users |
| `src/pages/Admin.tsx` | New admin panel to approve/reject users |
| `src/App.tsx` | Add `/pending-approval` and `/admin` routes |
