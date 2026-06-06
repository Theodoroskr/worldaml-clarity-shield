-- Fix 1: Remove table-level SELECT policy on academy_questions
-- so correct_index is never exposed via PostgREST. The
-- academy_questions_safe view and submit_quiz_and_issue_certificate
-- function remain the only authorized access paths.
DROP POLICY IF EXISTS "Authenticated can view published question columns" ON public.academy_questions;

-- Fix 2: Drop the overly-permissive customer-documents INSERT policy
-- that allowed uploads to <uid>/* outside the protected sof/ path.
-- Only "Users can upload own SoF docs" remains, which enforces sof/<uid>/...
DROP POLICY IF EXISTS "Users can upload own customer documents" ON storage.objects;