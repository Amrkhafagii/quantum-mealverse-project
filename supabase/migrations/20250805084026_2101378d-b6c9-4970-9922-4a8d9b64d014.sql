-- Check if we should use workout_templates table instead
-- First let's see what tables exist for workout templates
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%workout%' 
AND table_name LIKE '%template%';

-- Check the workouts table structure to see if it stores templates
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workouts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if workouts table has any data
SELECT id, name, type FROM workouts LIMIT 10;