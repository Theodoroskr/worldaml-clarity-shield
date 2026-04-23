-- Delete short legacy modules (the new ones are all >1500 chars; old ones <1000)
DELETE FROM academy_modules
WHERE course_id IN (
  '3d375791-cb8c-4244-88c1-731cb8ab53ad',
  '0e6867f5-ea81-49f4-bdd3-6488eab1a840',
  '0f678565-de73-4f7e-af1c-abcfd6eac901',
  '1df90931-6e22-4cec-8099-0f9991df801c',
  '8446e0d2-f59e-474d-80fa-15b449785283',
  'f913780e-4e58-42bc-b55c-478d94de62d6',
  'a1000000-0000-0000-0000-000000000002'
)
AND LENGTH(content) < 1200;

-- Re-sequence sort_order per course
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY sort_order, title) AS rn
  FROM academy_modules
  WHERE course_id IN (
    '3d375791-cb8c-4244-88c1-731cb8ab53ad',
    '0e6867f5-ea81-49f4-bdd3-6488eab1a840',
    '0f678565-de73-4f7e-af1c-abcfd6eac901',
    '1df90931-6e22-4cec-8099-0f9991df801c',
    '8446e0d2-f59e-474d-80fa-15b449785283',
    'f913780e-4e58-42bc-b55c-478d94de62d6',
    'a1000000-0000-0000-0000-000000000002'
  )
)
UPDATE academy_modules m SET sort_order = r.rn
FROM ranked r WHERE m.id = r.id;