-- Insert comprehensive workout templates and get their IDs
WITH inserted_workouts AS (
  INSERT INTO workouts (name, description, estimated_duration_minutes, difficulty_level, workout_type, is_template, is_public) VALUES
  -- Beginner workouts
  ('Beginner Full Body', 'A complete full-body workout perfect for beginners', 30, 'beginner', 'strength', true, true),
  ('Beginner Cardio Blast', 'Low-impact cardio workout for beginners', 20, 'beginner', 'cardio', true, true),
  ('Morning Stretch', 'Gentle stretching routine to start your day', 15, 'beginner', 'flexibility', true, true),

  -- Intermediate workouts
  ('Upper Body Power', 'Intense upper body strength training', 45, 'intermediate', 'strength', true, true),
  ('Lower Body Blast', 'Comprehensive lower body workout', 40, 'intermediate', 'strength', true, true),
  ('HIIT Cardio', 'High-intensity interval training', 25, 'intermediate', 'hiit', true, true),
  ('Core Crusher', 'Focused core strengthening workout', 30, 'intermediate', 'strength', true, true),

  -- Advanced workouts
  ('Advanced Full Body', 'Challenging full-body workout for experienced athletes', 60, 'advanced', 'strength', true, true),
  ('Strength & Power', 'Heavy lifting focused on building strength', 50, 'advanced', 'strength', true, true),
  ('Endurance Challenge', 'Long-duration cardio endurance test', 45, 'advanced', 'cardio', true, true),
  ('Athletic Performance', 'Sport-specific training for athletes', 55, 'advanced', 'mixed', true, true)
  RETURNING id, name
)

-- Insert workout exercises using the workout names to match IDs and exercise names to match exercise IDs
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes)
SELECT 
  w.id as workout_id,
  e.id as exercise_id, -- Dynamically get exercise_id
  exercise_data.order_index,
  exercise_data.target_sets,
  exercise_data.target_reps,
  exercise_data.rest_seconds,
  exercise_data.notes
FROM inserted_workouts w
CROSS JOIN LATERAL (
  VALUES
    -- Beginner Full Body
    ('Beginner Full Body', 'Push-up', 0, 3, ARRAY[8, 10, 12], 60, 'Start with knee push-ups if needed'),
    ('Beginner Full Body', 'Squat', 1, 3, ARRAY[10, 12, 15], 60, 'Focus on proper form'),
    ('Beginner Full Body', 'Pull-up', 2, 2, ARRAY[5, 8], 90, 'Use assistance if needed'),
    ('Beginner Full Body', 'Calf Raise', 3, 3, ARRAY[12, 15, 15], 45, 'Control the movement'),
    ('Beginner Full Body', 'Plank', 4, 3, ARRAY[30, 45, 60], 60, 'Hold steady position'),

    -- Beginner Cardio Blast
    ('Beginner Cardio Blast', 'Jumping Jacks', 0, 3, NULL, 60, NULL),
    ('Beginner Cardio Blast', 'Burpees', 1, 3, NULL, 45, NULL),
    ('Beginner Cardio Blast', 'Running', 2, 1, NULL, 0, 'Cool down pace'),

    -- Morning Stretch
    ('Morning Stretch', 'Cat-Cow Stretch', 0, 1, NULL, 30, 'Hold for 30 seconds'),
    ('Morning Stretch', 'Hamstring Stretch', 1, 1, NULL, 30, 'Hold each side for 30 seconds'),
    ('Morning Stretch', 'Child''s Pose', 2, 1, NULL, 30, 'Repeat 10 times slowly'),

    -- Upper Body Power
    ('Upper Body Power', 'Bench Press', 0, 4, ARRAY[6, 8, 10, 12], 90, 'Progressive overload'),
    ('Upper Body Power', 'Overhead Press', 1, 3, ARRAY[8, 10, 12], 75, 'Control the negative'),
    ('Upper Body Power', 'Deadlift', 2, 3, ARRAY[6, 8, 10], 90, 'Full range of motion'),
    ('Upper Body Power', 'Barbell Row', 3, 4, ARRAY[5, 6, 8, 10], 120, 'Focus on form'),
    ('Upper Body Power', 'Bicep Curl', 4, 3, ARRAY[8, 10, 12], 60, 'Slow and controlled'),
    ('Upper Body Power', 'Calf Raise', 5, 3, ARRAY[12, 15, 15], 45, 'Squeeze at the top'),
    ('Upper Body Power', 'Tricep Extension', 6, 3, ARRAY[10, 12, 15], 45, 'Full extension'),

    -- Lower Body Blast
    ('Lower Body Blast', 'Squat', 0, 4, ARRAY[12, 15, 18, 20], 75, 'Go deep'),
    ('Lower Body Blast', 'Lunge', 1, 3, ARRAY[10, 12, 15], 60, 'Each leg'),
    ('Lower Body Blast', 'Leg Press', 2, 3, ARRAY[8, 10, 12], 75, 'Feel the stretch'),
    ('Lower Body Blast', 'Leg Curl', 3, 4, ARRAY[15, 20, 25, 30], 45, 'Full range of motion'),
    ('Lower Body Blast', 'Barbell Row', 4, 3, ARRAY[5, 6, 8], 120, 'Heavy weight'),

    -- HIIT Cardio
    ('HIIT Cardio', 'Box Jump', 0, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
    ('HIIT Cardio', 'Jumping Jacks', 1, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
    ('HIIT Cardio', 'Burpees', 2, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
    ('HIIT Cardio', 'Crunches', 3, 3, NULL, 60, 'High intensity'),

    -- Core Crusher
    ('Core Crusher', 'Plank', 0, 3, ARRAY[30, 45, 60], 45, 'Hold steady'),
    ('Core Crusher', 'Crunches', 1, 3, ARRAY[15, 20, 25], 45, 'Control the movement'),
    ('Core Crusher', 'Running', 2, 3, ARRAY[10, 15, 20], 45, 'Each side'),
    ('Core Crusher', 'Jumping Jacks', 3, 3, NULL, 60, 'High knees'),
    ('Core Crusher', 'Push-up', 4, 2, ARRAY[10, 15], 60, 'Slow and controlled'),

    -- Advanced Full Body
    ('Advanced Full Body', 'Barbell Row', 0, 5, ARRAY[3, 5, 5, 8, 10], 180, 'Heavy compound movement'),
    ('Advanced Full Body', 'Bench Press', 1, 4, ARRAY[5, 6, 8, 10], 120, 'Progressive sets'),
    ('Advanced Full Body', 'Deadlift', 2, 4, ARRAY[5, 6, 8, 10], 90, 'Strict form'),
    ('Advanced Full Body', 'Squat', 3, 4, ARRAY[15, 18, 20, 25], 90, 'Deep squats'),
    ('Advanced Full Body', 'Bicep Curl', 4, 3, ARRAY[6, 8, 10], 75, 'Heavy weight'),
    ('Advanced Full Body', 'Plank', 5, 3, ARRAY[60, 90, 120], 60, 'Extended holds'),

    -- Strength & Power
    ('Strength & Power', 'Barbell Row', 0, 5, ARRAY[1, 3, 5, 5, 8], 240, 'Max effort sets'),
    ('Strength & Power', 'Bench Press', 1, 5, ARRAY[3, 5, 5, 8, 10], 180, 'Heavy bench press'),
    ('Strength & Power', 'Squat', 2, 4, ARRAY[3, 5, 8, 10], 150, 'Back squats'),
    ('Strength & Power', 'Bicep Curl', 3, 4, ARRAY[5, 6, 8, 10], 120, 'Overhead press'),
    ('Strength & Power', 'Bent-over Row', 4, 3, ARRAY[5, 8, 10], 120, 'Bent-over rows'),

    -- Endurance Challenge
    ('Endurance Challenge', 'Running', 0, 1, NULL, 0, '30 minutes steady pace'),
    ('Endurance Challenge', 'Jumping Jacks', 1, 5, NULL, 60, '2 minutes each set'),
    ('Endurance Challenge', 'Burpees', 2, 3, NULL, 90, 'High intensity intervals'),

    -- Athletic Performance
    ('Athletic Performance', 'Box Jump', 0, 4, NULL, 45, 'Explosive movement'),
    ('Athletic Performance', 'Barbell Row', 1, 4, ARRAY[3, 5, 5, 8], 180, 'Power development'),
    ('Athletic Performance', 'Lunge', 2, 3, ARRAY[8, 10, 12], 60, 'Single leg power'),
    ('Athletic Performance', 'Jumping Jacks', 3, 4, NULL, 60, 'Agility component'),
    ('Athletic Performance', 'Bicep Curl', 4, 3, ARRAY[5, 8, 10], 90, 'Overhead stability'),
    ('Athletic Performance', 'Plank', 5, 3, ARRAY[45, 60, 90], 60, 'Core stability')
) AS exercise_data(workout_name, exercise_name, order_index, target_sets, target_reps, rest_seconds, notes)
JOIN exercises e ON e.name = exercise_data.exercise_name -- Join with exercises table
WHERE w.name = exercise_data.workout_name;

-- Set target duration for cardio exercises (where target_reps is NULL)
UPDATE workout_exercises we
SET target_duration_seconds = 300
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND e.name IN ('Running', 'Jumping Jacks', 'Burpees')
  AND we.target_reps IS NULL
  AND w.name IN ('Beginner Cardio Blast', 'Core Crusher');

-- Set specific durations for HIIT exercises
UPDATE workout_exercises we
SET target_duration_seconds = 30
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND w.name = 'HIIT Cardio'
  AND e.name IN ('Jumping Jacks', 'Box Jump', 'Burpees');

-- Set longer duration for endurance challenge
UPDATE workout_exercises we
SET target_duration_seconds = 1800
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND w.name = 'Endurance Challenge'
  AND e.name = 'Running';

UPDATE workout_exercises we
SET target_duration_seconds = 120
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND w.name = 'Endurance Challenge'
  AND e.name = 'Jumping Jacks';

UPDATE workout_exercises we
SET target_duration_seconds = 45
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND w.name = 'Endurance Challenge'
  AND e.name = 'Burpees';

-- Set durations for flexibility exercises
UPDATE workout_exercises we
SET target_duration_seconds = 30, target_reps = NULL
FROM exercises e
WHERE we.exercise_id = e.id
  AND e.name IN ('Cat-Cow Stretch', 'Hamstring Stretch', 'Child''s Pose');

-- Set specific duration for cat-cow stretch
UPDATE workout_exercises we
SET target_duration_seconds = 60, target_reps = NULL
FROM exercises e
WHERE we.exercise_id = e.id
  AND e.name = 'Child''s Pose';

-- Set durations for athletic performance cardio exercises
UPDATE workout_exercises we
SET target_duration_seconds = 60
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND w.name = 'Athletic Performance'
  AND e.name IN ('Jumping Jacks', 'Box Jump')
  AND we.target_reps IS NULL;