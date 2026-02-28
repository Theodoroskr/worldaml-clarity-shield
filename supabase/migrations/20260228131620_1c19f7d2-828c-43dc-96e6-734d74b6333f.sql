
-- Add lead_status column to form_submissions
ALTER TABLE public.form_submissions
ADD COLUMN lead_status text NOT NULL DEFAULT 'new';

-- Add a check constraint for valid statuses
ALTER TABLE public.form_submissions
ADD CONSTRAINT form_submissions_lead_status_check
CHECK (lead_status IN ('new', 'contacted', 'qualified', 'closed'));

-- Allow admins to SELECT and UPDATE form_submissions
CREATE POLICY "Admins can view all form submissions"
ON public.form_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update form submissions"
ON public.form_submissions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
