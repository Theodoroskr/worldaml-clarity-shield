
UPDATE public.academy_courses c
SET duration_minutes = GREATEST(5, CEIL(sub.words::numeric / 200))::integer,
    estimated_words = sub.words::integer
FROM (
  SELECT c2.id,
         COALESCE(SUM(LENGTH(m.content) - LENGTH(REPLACE(m.content, ' ', '')) + 1), 0) AS words
  FROM public.academy_courses c2
  LEFT JOIN public.academy_modules m ON m.course_id = c2.id
  GROUP BY c2.id
) sub
WHERE c.id = sub.id;
