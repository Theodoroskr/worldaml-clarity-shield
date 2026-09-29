# Fix certificate names (Polish letters + updated names)

## What is going wrong (confirmed)
1. **"ł" prints as "B"** — the certificate PDF uses a basic built-in font that has no Polish (or other accented Central European) letters, so "Rafał" comes out as "RafaB". The web page shows the name correctly; only the PDF is broken.
2. **The new name is ignored on retake** — when someone retakes a quiz, only the score is updated on their existing certificate. The name saved the first time ("Rafał Bruszewski") is kept forever, even though Rafal's profile now says "Rafal Bruszewski".

## Fixes
1. **Full character support in the PDF** — embed a Unicode font (e.g. Noto Sans / DejaVu) in the certificate PDF so names like Rafał, Łukasz, Żaneta, Müller, Dvořák, Ødegaard print correctly. This benefits every learner.
2. **Use the current name on retake** — when a quiz is passed again, the certificate name is updated to the learner's current profile name.
3. **Rafal's certificate** — update his existing certificate to show "Rafal Bruszewski" (as he asked), so he can download it immediately with no retake. Same certificate link and verification code stay valid.
4. (Optional, small) A "Refresh name from profile" button on My Certificates so learners who change their name can update certificates without retaking.

## Suggested reply to Rafal
Apologise, confirm the certificate now reads "Rafal Bruszewski", and mention that after the fix he could switch back to "Rafał" if he prefers.

## Technical details
- `src/pages/AcademyCertificate.tsx`: jsPDF `doc.text(holder_name)` uses Helvetica (WinAnsi). Add a TTF (base64 via `addFileToVFS` + `addFont`), lazy-loaded, used for the name line (and other dynamic text).
- Migration: `submit_quiz_and_issue_certificate` → `ON CONFLICT ... DO UPDATE SET score = EXCLUDED.score, holder_name = EXCLUDED.holder_name`.
- Data fix: update `academy_certificates` id `c2398642-...` holder_name → "Rafal Bruszewski".
- Optional button: security-definer RPC setting `holder_name` from caller's `profiles.full_name` for their own certificates only.
