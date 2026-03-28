-- Add restrictive INSERT policy so only admins can insert roles
CREATE POLICY "Restrict non-admins from inserting roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add restrictive UPDATE policy for same reason
CREATE POLICY "Restrict non-admins from updating roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add restrictive DELETE policy
CREATE POLICY "Restrict non-admins from deleting roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));