
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
  _correct_answers jsonb;
  _email text;
  _domain text;
  _is_free_webmail boolean := false;
  _is_admin boolean := false;
  _domain_cert_count int := 0;
  _domain_cap int := 3;
  _free_domains text[] := ARRAY[
    'gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','yahoo.co.in',
    'outlook.com','hotmail.com','live.com','msn.com','icloud.com','me.com',
    'protonmail.com','proton.me','gmx.com','gmx.de','aol.com','mail.com',
    'yandex.com','yandex.ru','zoho.com','qq.com','163.com','126.com'
  ];
BEGIN
  -- Count total questions for the course
  SELECT count(*) INTO _total FROM academy_questions WHERE course_id = _course_id;
  IF _total = 0 THEN RAISE EXCEPTION 'No questions found for this course'; END IF;

  -- Score
  SELECT count(*) INTO _correct
  FROM academy_questions q
  WHERE q.course_id = _course_id
    AND (_answers->>q.id::text)::int = q.correct_index;

  _score := round((_correct::numeric / _total) * 100);
  _passed := _score >= 80;

  SELECT jsonb_object_agg(q.id::text, q.correct_index)
  INTO _correct_answers
  FROM academy_questions q
  WHERE q.course_id = _course_id;

  -- Ensure progress row exists
  IF NOT EXISTS (SELECT 1 FROM academy_progress WHERE user_id = auth.uid() AND course_id = _course_id) THEN
    INSERT INTO academy_progress (user_id, course_id, completed_modules)
    VALUES (auth.uid(), _course_id, '[]'::jsonb);
  END IF;

  UPDATE academy_progress
  SET quiz_score = _score,
      quiz_passed = _passed,
      completed_at = CASE WHEN _passed THEN now() ELSE NULL END
  WHERE user_id = auth.uid() AND course_id = _course_id;

  -- If passed, evaluate per-domain daily cap before issuing certificate
  IF _passed THEN
    SELECT LOWER(email) INTO _email FROM profiles WHERE user_id = auth.uid();
    _is_admin := public.has_role(auth.uid(), 'admin'::app_role);

    IF _email IS NOT NULL AND position('@' in _email) > 0 THEN
      _domain := split_part(_email, '@', 2);
      _is_free_webmail := _domain = ANY(_free_domains);
    END IF;

    -- Apply cap only to non-admin corporate domains
    IF NOT _is_admin AND _domain IS NOT NULL AND NOT _is_free_webmail THEN
      SELECT count(*) INTO _domain_cert_count
      FROM academy_certificates c
      JOIN profiles p ON p.user_id = c.user_id
      WHERE LOWER(p.email) LIKE '%@' || _domain
        AND c.issued_at > now() - INTERVAL '24 hours'
        -- Don't count the user's own existing cert on this course (idempotent retry)
        AND NOT (c.user_id = auth.uid() AND c.course_id = _course_id);

      IF _domain_cert_count >= _domain_cap THEN
        RETURN jsonb_build_object(
          'passed', true,
          'score', _score,
          'correct_answers', _correct_answers,
          'certificate_withheld', true,
          'reason', 'domain_daily_cap',
          'message', format(
            'Your team at %s has reached the daily limit of %s free certificates (24-hour window). Your quiz pass is recorded — the certificate will be issued automatically once the window resets, or contact info@worldaml.com for a team plan.',
            _domain, _domain_cap
          ),
          'domain', _domain,
          'cap', _domain_cap,
          'count_24h', _domain_cert_count
        );
      END IF;
    END IF;

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
