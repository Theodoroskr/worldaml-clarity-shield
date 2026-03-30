
-- The ALL policy already covers DELETE for admins, but we need to ensure it works.
-- No additional migration needed since "Admins can manage auto_approve_domains" with FOR ALL covers INSERT, SELECT, UPDATE, DELETE.
SELECT 1;
