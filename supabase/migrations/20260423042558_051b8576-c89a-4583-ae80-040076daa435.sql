-- Remove old/short modules that pre-date the expansion (sort_order > 5 for 5-lesson courses, > 8 for KYC).
-- The new expanded lessons were inserted with sort_order 1..5 (or 1..8 for KYC), so we delete everything above.
DELETE FROM academy_modules
WHERE course_id IN (
  '3d375791-cb8c-4244-88c1-731cb8ab53ad', -- aml-europe
  '0e6867f5-ea81-49f4-bdd3-6488eab1a840', -- aml-gcc-mena
  '0f678565-de73-4f7e-af1c-abcfd6eac901', -- aml-asia-pacific
  '1df90931-6e22-4cec-8099-0f9991df801c', -- aml-americas
  '8446e0d2-f59e-474d-80fa-15b449785283', -- aml-africa
  'f913780e-4e58-42bc-b55c-478d94de62d6'  -- aml-cis
) AND sort_order > 5;

DELETE FROM academy_modules
WHERE course_id = 'a1000000-0000-0000-0000-000000000002' -- kyc-customer-due-diligence
  AND sort_order > 8;

-- Update durations to reflect expanded content
UPDATE academy_courses SET duration_minutes = 18 WHERE id IN (
  '3d375791-cb8c-4244-88c1-731cb8ab53ad',
  '0e6867f5-ea81-49f4-bdd3-6488eab1a840',
  '0f678565-de73-4f7e-af1c-abcfd6eac901',
  '1df90931-6e22-4cec-8099-0f9991df801c',
  '8446e0d2-f59e-474d-80fa-15b449785283',
  'f913780e-4e58-42bc-b55c-478d94de62d6'
);

UPDATE academy_courses SET duration_minutes = 22 WHERE id = 'a1000000-0000-0000-0000-000000000002';