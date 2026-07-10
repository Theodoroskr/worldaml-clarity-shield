UPDATE public.academy_course_purchases
SET user_id = 'e81ee119-2cad-4753-9d05-670a83841693'::uuid,
    updated_at = now()
WHERE id = '43927c36-9254-49a1-89ff-0a2a392d42bb'::uuid
  AND stripe_session_id = 'cs_live_a1qMl8DSW08DQYwKMcegWasc8wDTwuD7v4bkqL7rfIsaBLEgJJgEklW1Xw'
  AND course_slug = '__annual_pass__'
  AND status = 'paid';