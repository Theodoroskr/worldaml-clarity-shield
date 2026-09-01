CREATE POLICY "Users can read their own product membership"
ON public.product_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());