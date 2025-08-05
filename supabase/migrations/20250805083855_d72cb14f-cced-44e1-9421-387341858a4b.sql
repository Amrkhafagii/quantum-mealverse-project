-- Populate workout_exercises table correctly using template_id instead of workout_id
-- The constraint requires either workout_session_id OR template_id to be NOT NULL

-- Clear any existing data first
DELETE FROM workout_exercises WHERE template_id IS NOT NULL;

-- Insert workout exercises for "Beginner Flexibility Flow" (ID: 126)
INSERT INTO workout_exercises (template_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 126, e.id, 
  CASE e.name
    WHEN 'Cobra Stretch' THEN 1
    WHEN 'Side Plank' THEN 2
    WHEN 'Dead Bug' THEN 3
    WHEN 'Bird Dog' THEN 4
    WHEN 'Cat-Cow Stretch' THEN 5
    WHEN 'Child''s Pose' THEN 6
    WHEN 'Hip Circles' THEN 7
  END as order_index,
  1 as target_sets,
  1 as target_reps,
  CASE e.name
    WHEN 'Cobra Stretch' THEN 15
    WHEN 'Side Plank' THEN 20
    WHEN 'Dead Bug' THEN 15
    WHEN 'Bird Dog' THEN 15
    WHEN 'Cat-Cow Stretch' THEN 10
    WHEN 'Child''s Pose' THEN 10
    WHEN 'Hip Circles' THEN 15
  END as rest_time_seconds,
  CASE e.name
    WHEN 'Cobra Stretch' THEN 'Hold for 30 seconds'
    WHEN 'Side Plank' THEN 'Hold for 20 seconds each side'
    WHEN 'Dead Bug' THEN 'Hold for 45 seconds'
    WHEN 'Bird Dog' THEN 'Hold for 30 seconds each side'
    WHEN 'Cat-Cow Stretch' THEN '10 slow movements'
    WHEN 'Child''s Pose' THEN 'Hold for 60 seconds'
    WHEN 'Hip Circles' THEN '10 circles each direction'
  END as notes
FROM exercises e
WHERE e.name IN ('Cobra Stretch', 'Side Plank', 'Dead Bug', 'Bird Dog', 'Cat-Cow Stretch', 'Child''s Pose', 'Hip Circles');

-- Insert workout exercises for "Beginner Full Body Foundation" (ID: 124)
INSERT INTO workout_exercises (template_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 124, e.id,
  CASE e.name
    WHEN 'Push-ups' THEN 1
    WHEN 'Bodyweight Squats' THEN 2
    WHEN 'Plank' THEN 3
    WHEN 'Lunges' THEN 4
    WHEN 'Glute Bridges' THEN 5
    WHEN 'Mountain Climbers' THEN 6
    WHEN 'Dead Bug' THEN 7
    WHEN 'Wall Sit' THEN 8
  END as order_index,
  3 as target_sets,
  CASE e.name
    WHEN 'Push-ups' THEN 8
    WHEN 'Bodyweight Squats' THEN 12
    WHEN 'Plank' THEN 1
    WHEN 'Lunges' THEN 10
    WHEN 'Glute Bridges' THEN 15
    WHEN 'Mountain Climbers' THEN 20
    WHEN 'Dead Bug' THEN 10
    WHEN 'Wall Sit' THEN 1
  END as target_reps,
  60 as rest_time_seconds,
  CASE e.name
    WHEN 'Plank' THEN 'Hold for 30 seconds'
    WHEN 'Wall Sit' THEN 'Hold for 30 seconds'
    ELSE 'Standard rep count'
  END as notes
FROM exercises e
WHERE e.name IN ('Push-ups', 'Bodyweight Squats', 'Plank', 'Lunges', 'Glute Bridges', 'Mountain Climbers', 'Dead Bug', 'Wall Sit');

-- Insert workout exercises for "Beginner Cardio Journey" (ID: 125)
INSERT INTO workout_exercises (template_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 125, e.id,
  CASE e.name
    WHEN 'Jumping Jacks' THEN 1
    WHEN 'High Knees' THEN 2
    WHEN 'Butt Kicks' THEN 3
    WHEN 'Mountain Climbers' THEN 4
    WHEN 'Burpees' THEN 5
    WHEN 'Jump Squats' THEN 6
    WHEN 'Russian Twists' THEN 7
  END as order_index,
  4 as target_sets,
  CASE e.name
    WHEN 'Jumping Jacks' THEN 30
    WHEN 'High Knees' THEN 30
    WHEN 'Butt Kicks' THEN 30
    WHEN 'Mountain Climbers' THEN 30
    WHEN 'Burpees' THEN 5
    WHEN 'Jump Squats' THEN 10
    WHEN 'Russian Twists' THEN 20
  END as target_reps,
  45 as rest_time_seconds,
  'Keep heart rate elevated throughout' as notes
FROM exercises e
WHERE e.name IN ('Jumping Jacks', 'High Knees', 'Butt Kicks', 'Mountain Climbers', 'Burpees', 'Jump Squats', 'Russian Twists');

-- Insert remaining workout templates
INSERT INTO workout_exercises (template_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 127, e.id,
  CASE e.name
    WHEN 'Push-ups' THEN 1
    WHEN 'Pike Push-ups' THEN 2
    WHEN 'Tricep Dips' THEN 3
    WHEN 'Shoulder Press' THEN 4
    WHEN 'Chest Press' THEN 5
    WHEN 'Lateral Raises' THEN 6
    WHEN 'Overhead Press' THEN 7
    WHEN 'Diamond Push-ups' THEN 8
  END as order_index,
  4 as target_sets,
  CASE e.name
    WHEN 'Push-ups' THEN 12
    WHEN 'Pike Push-ups' THEN 8
    WHEN 'Tricep Dips' THEN 10
    WHEN 'Shoulder Press' THEN 12
    WHEN 'Chest Press' THEN 10
    WHEN 'Lateral Raises' THEN 15
    WHEN 'Overhead Press' THEN 10
    WHEN 'Diamond Push-ups' THEN 6
  END as target_reps,
  75 as rest_time_seconds,
  'Focus on pushing muscle groups' as notes
FROM exercises e
WHERE e.name IN ('Push-ups', 'Pike Push-ups', 'Tricep Dips', 'Shoulder Press', 'Chest Press', 'Lateral Raises', 'Overhead Press', 'Diamond Push-ups');