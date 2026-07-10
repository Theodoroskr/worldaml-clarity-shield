UPDATE public.academy_course_purchases
SET user_id = '85107455-969c-4c58-9b0c-1381f81d44ab', updated_at = now()
WHERE id = '43927c36-9254-49a1-89ff-0a2a392d42bb'
  AND stripe_session_id = 'cs_live_a1qMl8DSW08DQYwKMcegWasc8wDTwuD7v4bkqL7rfIsaBLEgJJgEklW1Xw';

DELETE FROM public.academy_course_purchases
WHERE id = '4cd36a49-f95f-40e6-a42b-dd0103ba7076' AND status = 'pending';