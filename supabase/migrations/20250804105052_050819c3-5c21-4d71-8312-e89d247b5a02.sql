-- Check existing workout_exercises table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'workout_exercises' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check table constraints (fixed query)
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'workout_exercises' 
AND tc.table_schema = 'public';