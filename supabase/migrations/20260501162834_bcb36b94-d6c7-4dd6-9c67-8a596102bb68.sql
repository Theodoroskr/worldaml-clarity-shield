CREATE POLICY "Authenticated users can read questions"
ON public.academy_questions
FOR SELECT
TO authenticated
USING (true);