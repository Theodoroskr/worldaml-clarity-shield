
CREATE OR REPLACE FUNCTION public.submit_quiz_and_issue_certificate(_course_id uuid, _answers jsonb, _holder_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _total int;
  _correct int;
  _score int;
  _passed boolean;
  _cert_row record;
  _share_token text;
  _correct_answers jsonb;
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

  -- Build correct answers map to return to the client
  SELECT jsonb_object_agg(q.id::text, q.correct_index)
  INTO _correct_answers
  FROM academy_questions q
  WHERE q.course_id = _course_id;

  -- Verify all modules are completed
  IF NOT EXISTS (
    SELECT 1 FROM academy_progress
    WHERE user_id = auth.uid() AND course_id = _course_id
  ) THEN
    INSERT INTO academy_progress (user_id, course_id, completed_modules)
    VALUES (auth.uid(), _course_id, '[]'::jsonb);
  END IF;

  -- Update progress with server-validated quiz results
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
      'share_token', _cert_row.share_token,
      'correct_answers', _correct_answers
    );
  END IF;

  RETURN jsonb_build_object('passed', false, 'score', _score, 'correct_answers', _correct_answers);
END;
$function$;
