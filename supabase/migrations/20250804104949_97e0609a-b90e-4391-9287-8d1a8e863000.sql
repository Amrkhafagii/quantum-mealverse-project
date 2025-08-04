-- Populate workout_exercises table with appropriate exercises for each workout template
-- Using correct column names based on actual table structure

-- Insert workout exercises for "Beginner Flexibility Flow" (ID: 126)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
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
  1 as target_reps, -- Using reps as duration indicator for stretches
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
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
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
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
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

-- Insert workout exercises for "Push Day Power" (ID: 127)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
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

-- Insert workout exercises for "Pull Day Strength" (ID: 128)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 128, e.id,
  CASE e.name
    WHEN 'Pull-ups' THEN 1
    WHEN 'Bent-over Rows' THEN 2
    WHEN 'Lat Pulldowns' THEN 3
    WHEN 'Face Pulls' THEN 4
    WHEN 'Bicep Curls' THEN 5
    WHEN 'Hammer Curls' THEN 6
    WHEN 'Reverse Flies' THEN 7
    WHEN 'Shrugs' THEN 8
  END as order_index,
  4 as target_sets,
  CASE e.name
    WHEN 'Pull-ups' THEN 6
    WHEN 'Bent-over Rows' THEN 10
    WHEN 'Lat Pulldowns' THEN 12
    WHEN 'Face Pulls' THEN 15
    WHEN 'Bicep Curls' THEN 12
    WHEN 'Hammer Curls' THEN 10
    WHEN 'Reverse Flies' THEN 15
    WHEN 'Shrugs' THEN 12
  END as target_reps,
  75 as rest_time_seconds,
  'Focus on pulling muscle groups' as notes
FROM exercises e
WHERE e.name IN ('Pull-ups', 'Bent-over Rows', 'Lat Pulldowns', 'Face Pulls', 'Bicep Curls', 'Hammer Curls', 'Reverse Flies', 'Shrugs');

-- Insert workout exercises for "Leg Day Burn" (ID: 129)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 129, e.id,
  CASE e.name
    WHEN 'Squats' THEN 1
    WHEN 'Deadlifts' THEN 2
    WHEN 'Lunges' THEN 3
    WHEN 'Bulgarian Split Squats' THEN 4
    WHEN 'Calf Raises' THEN 5
    WHEN 'Romanian Deadlifts' THEN 6
    WHEN 'Leg Press' THEN 7
    WHEN 'Wall Sit' THEN 8
  END as order_index,
  4 as target_sets,
  CASE e.name
    WHEN 'Squats' THEN 15
    WHEN 'Deadlifts' THEN 8
    WHEN 'Lunges' THEN 12
    WHEN 'Bulgarian Split Squats' THEN 10
    WHEN 'Calf Raises' THEN 20
    WHEN 'Romanian Deadlifts' THEN 10
    WHEN 'Leg Press' THEN 15
    WHEN 'Wall Sit' THEN 1
  END as target_reps,
  90 as rest_time_seconds,
  CASE e.name
    WHEN 'Wall Sit' THEN 'Hold for 45 seconds'
    ELSE 'Focus on proper form'
  END as notes
FROM exercises e
WHERE e.name IN ('Squats', 'Deadlifts', 'Lunges', 'Bulgarian Split Squats', 'Calf Raises', 'Romanian Deadlifts', 'Leg Press', 'Wall Sit');

-- Insert workout exercises for "HIIT Blast" (ID: 130)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 130, e.id,
  CASE e.name
    WHEN 'Burpees' THEN 1
    WHEN 'Jump Squats' THEN 2
    WHEN 'Mountain Climbers' THEN 3
    WHEN 'High Knees' THEN 4
    WHEN 'Jumping Jacks' THEN 5
    WHEN 'Plank Jacks' THEN 6
    WHEN 'Tuck Jumps' THEN 7
  END as order_index,
  6 as target_sets,
  CASE e.name
    WHEN 'Burpees' THEN 8
    WHEN 'Jump Squats' THEN 15
    WHEN 'Mountain Climbers' THEN 20
    WHEN 'High Knees' THEN 20
    WHEN 'Jumping Jacks' THEN 20
    WHEN 'Plank Jacks' THEN 20
    WHEN 'Tuck Jumps' THEN 10
  END as target_reps,
  15 as rest_time_seconds,
  'Maximum intensity with minimal rest' as notes
FROM exercises e
WHERE e.name IN ('Burpees', 'Jump Squats', 'Mountain Climbers', 'High Knees', 'Jumping Jacks', 'Plank Jacks', 'Tuck Jumps');

-- Insert workout exercises for "Core Crusher" (ID: 131)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 131, e.id,
  CASE e.name
    WHEN 'Plank' THEN 1
    WHEN 'Russian Twists' THEN 2
    WHEN 'Bicycle Crunches' THEN 3
    WHEN 'Dead Bug' THEN 4
    WHEN 'Mountain Climbers' THEN 5
    WHEN 'Side Plank' THEN 6
    WHEN 'Leg Raises' THEN 7
    WHEN 'Hollow Body Hold' THEN 8
  END as order_index,
  3 as target_sets,
  CASE e.name
    WHEN 'Plank' THEN 1
    WHEN 'Russian Twists' THEN 30
    WHEN 'Bicycle Crunches' THEN 20
    WHEN 'Dead Bug' THEN 15
    WHEN 'Mountain Climbers' THEN 30
    WHEN 'Side Plank' THEN 1
    WHEN 'Leg Raises' THEN 12
    WHEN 'Hollow Body Hold' THEN 1
  END as target_reps,
  45 as rest_time_seconds,
  CASE e.name
    WHEN 'Plank' THEN 'Hold for 45 seconds'
    WHEN 'Side Plank' THEN 'Hold for 30 seconds each side'
    WHEN 'Hollow Body Hold' THEN 'Hold for 20 seconds'
    ELSE 'Focus on controlled movements'
  END as notes
FROM exercises e
WHERE e.name IN ('Plank', 'Russian Twists', 'Bicycle Crunches', 'Dead Bug', 'Mountain Climbers', 'Side Plank', 'Leg Raises', 'Hollow Body Hold');

-- Insert workout exercises for "Upper Body Blast" (ID: 132)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 132, e.id,
  CASE e.name
    WHEN 'Push-ups' THEN 1
    WHEN 'Pull-ups' THEN 2
    WHEN 'Shoulder Press' THEN 3
    WHEN 'Bent-over Rows' THEN 4
    WHEN 'Tricep Dips' THEN 5
    WHEN 'Bicep Curls' THEN 6
    WHEN 'Lateral Raises' THEN 7
    WHEN 'Pike Push-ups' THEN 8
  END as order_index,
  4 as target_sets,
  CASE e.name
    WHEN 'Push-ups' THEN 12
    WHEN 'Pull-ups' THEN 6
    WHEN 'Shoulder Press' THEN 10
    WHEN 'Bent-over Rows' THEN 12
    WHEN 'Tricep Dips' THEN 10
    WHEN 'Bicep Curls' THEN 12
    WHEN 'Lateral Raises' THEN 15
    WHEN 'Pike Push-ups' THEN 8
  END as target_reps,
  75 as rest_time_seconds,
  'Complete upper body development' as notes
FROM exercises e
WHERE e.name IN ('Push-ups', 'Pull-ups', 'Shoulder Press', 'Bent-over Rows', 'Tricep Dips', 'Bicep Curls', 'Lateral Raises', 'Pike Push-ups');