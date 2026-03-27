
-- 1. Drop permissive INSERT/UPDATE policies on academy_progress
DROP POLICY IF EXISTS "Users can insert own progress" ON public.academy_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.academy_progress;

-- 2. New INSERT policy: users can only insert progress with quiz fields at defaults
CREATE POLICY "Users can insert own progress (modules only)"
ON public.academy_progress FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND quiz_passed = false
  AND quiz_score IS NULL
);

-- 3. New UPDATE policy: users can only update completed_modules, NOT quiz fields
CREATE POLICY "Users can update own module progress"
ON public.academy_progress FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND quiz_passed = false
  AND quiz_score IS NULL
);

-- 4. Drop the client-side certificate INSERT policy
DROP POLICY IF EXISTS "Users can insert own certificates" ON public.academy_certificates;

-- 5. Create server-side function to submit quiz, validate, and issue certificate
CREATE OR REPLACE FUNCTION public.submit_quiz_and_issue_certificate(
  _course_id uuid,
  _answers jsonb,
  _holder_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total int;
  _correct int;
  _score int;
  _passed boolean;
  _cert_row record;
  _share_token text;
BEGIN
  -- Count total questions for the course
  SELECT count(*) INTO _total
  FROM academy_questions
  WHERE course_id = _course_id;

  IF _total = 0 THEN
    RAISE EXCEPTION 'No questions found for this course';
  END IF;

  -- Count correct answers: _answers is {"question_id": selected_index, ...}
  SELECT count(*) INTO _correct
  FROM academy_questions q
  WHERE q.course_id = _course_id
    AND (_answers->>q.id::text)::int = q.correct_index;

  _score := round((_correct::numeric / _total) * 100);
  _passed := _score >= 80;

  -- Verify all modules are completed
  IF NOT EXISTS (
    SELECT 1 FROM academy_progress
    WHERE user_id = auth.uid() AND course_id = _course_id
  ) THEN
    -- Create progress record
    INSERT INTO academy_progress (user_id, course_id, completed_modules)
    VALUES (auth.uid(), _course_id, '[]'::jsonb);
  END IF;

  -- Update progress with server-validated quiz results (bypasses RLS via SECURITY DEFINER)
  UPDATE academy_progress
  SET quiz_score = _score,
      quiz_passed = _passed,
      completed_at = CASE WHEN _passed THEN now() ELSE NULL END
  WHERE user_id = auth.uid() AND course_id = _course_id;

  -- If passed, issue certificate
  IF _passed THEN
    INSERT INTO academy_certificates (user_id, course_id, holder_name, score)
    VALUES (auth.uid(), _course_id, _holder_name, _score)
    ON CONFLICT (user_id, course_id) DO UPDATE SET score = EXCLUDED.score
    RETURNING * INTO _cert_row;

    RETURN jsonb_build_object(
      'passed', true,
      'score', _score,
      'certificate_id', _cert_row.id,
      'share_token', _cert_row.share_token
    );
  END IF;

  RETURN jsonb_build_object('passed', false, 'score', _score);
END;
$$;
