

## Fix: Restrict Public Certificate Access to Token-Based Lookup

### Problem
The `academy_certificates` table has an RLS policy `Anyone can view certificates by share_token` with `USING (true)`, which exposes **all** certificate records publicly. The intent is to allow viewing a single certificate via its `share_token`, but the policy doesn't enforce that filter.

### Solution
Replace the overly permissive public SELECT policy with a **security-definer function** that accepts a `share_token` parameter and returns only the matching row. Then restrict the public SELECT policy to `USING (false)` for anonymous users (keeping the authenticated user's own-certificate policy intact).

### Database migration

1. **Drop** the permissive `Anyone can view certificates by share_token` policy
2. **Create** a security-definer function `get_certificate_by_token(text)` that returns the certificate row joined with course data — callable by anyone but scoped to exactly one token
3. No new public SELECT policy needed for anon — access goes through the function

### Code change — `src/pages/AcademyCertificate.tsx`

Replace the direct table query:
```ts
supabase.from("academy_certificates").select("*, academy_courses(*)").eq("share_token", token).single()
```
with an RPC call:
```ts
supabase.rpc("get_certificate_by_token", { _token: token }).single()
```

The function returns the same shape (certificate fields + nested course object), so the rest of the component stays unchanged.

### Files changed
- **Database migration** — drop policy, create `get_certificate_by_token` function
- **`src/pages/AcademyCertificate.tsx`** — switch from `.from()` to `.rpc()`

