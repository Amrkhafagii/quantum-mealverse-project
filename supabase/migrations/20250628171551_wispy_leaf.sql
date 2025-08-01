-- Clear existing template data first to ensure clean state
DELETE FROM workout_exercises 
WHERE workout_id IN (
  SELECT id FROM workouts WHERE is_template = true
);

DELETE FROM workouts WHERE is_template = true;

-- Insert comprehensive workout templates
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
),
-- Get available exercises to ensure we only reference existing ones
available_exercises AS (
  SELECT id, name FROM exercises
)

-- Insert workout exercises using only existing exercises
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes)
SELECT 
  w.id as workout_id,
  e.id as exercise_id,
  exercise_data.order_index,
  exercise_data.target_sets,
  exercise_data.target_reps,
  exercise_data.rest_seconds,
  exercise_data.notes
FROM inserted_workouts w
CROSS JOIN LATERAL (
  VALUES
    -- Beginner Full Body (using basic exercises)
    ('Beginner Full Body', 'Push-up', 0, 3, ARRAY[8, 10, 12], 60, 'Start with knee push-ups if needed'),
    ('Beginner Full Body', 'Squat', 1, 3, ARRAY[10, 12, 15], 60, 'Focus on proper form'),
    ('Beginner Full Body', 'Plank', 2, 3, ARRAY[30, 45, 60], 60, 'Hold steady position'),

    -- Beginner Cardio Blast
    ('Beginner Cardio Blast', 'Jumping Jacks', 0, 3, NULL, 60, '5 minutes each set'),
    ('Beginner Cardio Blast', 'Running', 1, 1, NULL, 0, 'Cool down pace'),

    -- Morning Stretch
    ('Morning Stretch', 'Hamstring Stretch', 0, 1, NULL, 30, 'Hold for 30 seconds each side'),
    ('Morning Stretch', 'Child''s Pose', 1, 1, NULL, 30, 'Hold and breathe deeply'),

    -- Upper Body Power
    ('Upper Body Power', 'Push-up', 0, 4, ARRAY[8, 10, 12, 15], 90, 'Progressive overload'),
    ('Upper Body Power', 'Bench Press', 1, 3, ARRAY[8, 10, 12], 75, 'Control the negative'),
    ('Upper Body Power', 'Pull-up', 2, 3, ARRAY[5, 6, 8], 90, 'Use assistance if needed'),

    -- Lower Body Blast
    ('Lower Body Blast', 'Squat', 0, 4, ARRAY[12, 15, 18, 20], 75, 'Go deep'),
    ('Lower Body Blast', 'Lunge', 1, 3, ARRAY[10, 12, 15], 60, 'Each leg'),
    ('Lower Body Blast', 'Deadlift', 2, 3, ARRAY[8, 10, 12], 90, 'Focus on form'),

    -- HIIT Cardio
    ('HIIT Cardio', 'Burpees', 0, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
    ('HIIT Cardio', 'Jumping Jacks', 1, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
    ('HIIT Cardio', 'Mountain Climbers', 2, 4, NULL, 30, '30 seconds work, 30 seconds rest'),

    -- Core Crusher
    ('Core Crusher', 'Plank', 0, 3, ARRAY[30, 45, 60], 45, 'Hold steady'),
    ('Core Crusher', 'Crunches', 1, 3, ARRAY[15, 20, 25], 45, 'Control the movement'),
    ('Core Crusher', 'Russian Twists', 2, 3, ARRAY[20, 25, 30], 45, 'Each side counts as one'),

    -- Advanced Full Body
    ('Advanced Full Body', 'Deadlift', 0, 5, ARRAY[3, 5, 5, 8, 10], 180, 'Heavy compound movement'),
    ('Advanced Full Body', 'Bench Press', 1, 4, ARRAY[5, 6, 8, 10], 120, 'Progressive sets'),
    ('Advanced Full Body', 'Squat', 2, 4, ARRAY[8, 10, 12, 15], 90, 'Deep squats'),
    ('Advanced Full Body', 'Pull-up', 3, 3, ARRAY[8, 10, 12], 90, 'Strict form'),

    -- Strength & Power
    ('Strength & Power', 'Deadlift', 0, 5, ARRAY[1, 3, 5, 5, 8], 240, 'Max effort sets'),
    ('Strength & Power', 'Bench Press', 1, 5, ARRAY[3, 5, 5, 8, 10], 180, 'Heavy bench press'),
    ('Strength & Power', 'Squat', 2, 4, ARRAY[3, 5, 8, 10], 150, 'Back squats'),

    -- Endurance Challenge
    ('Endurance Challenge', 'Running', 0, 1, NULL, 0, '30 minutes steady pace'),
    ('Endurance Challenge', 'Cycling', 1, 1, NULL, 0, '20 minutes moderate pace'),

    -- Athletic Performance
    ('Athletic Performance', 'Burpees', 0, 4, NULL, 45, 'Explosive movement'),
    ('Athletic Performance', 'Squat', 1, 4, ARRAY[8, 10, 12, 15], 90, 'Power development'),
    ('Athletic Performance', 'Push-up', 2, 3, ARRAY[10, 12, 15], 60, 'Explosive push-ups')
) AS exercise_data(workout_name, exercise_name, order_index, target_sets, target_reps, rest_seconds, notes)
JOIN available_exercises e ON e.name = exercise_data.exercise_name
WHERE w.name = exercise_data.workout_name;

-- Set target duration for cardio exercises (where target_reps is NULL)
UPDATE workout_exercises we
SET target_duration_seconds = 300
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND e.exercise_type = 'cardio'
  AND we.target_reps IS NULL
  AND w.name IN ('Beginner Cardio Blast', 'Endurance Challenge');

-- Set specific durations for HIIT exercises (30 seconds work intervals)
UPDATE workout_exercises we
SET target_duration_seconds = 30
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND w.name = 'HIIT Cardio'
  AND we.target_reps IS NULL;

-- Set longer duration for endurance running (30 minutes)
UPDATE workout_exercises we
SET target_duration_seconds = 1800
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND w.name = 'Endurance Challenge'
  AND e.name = 'Running';

-- Set moderate duration for endurance cycling (20 minutes)
UPDATE workout_exercises we
SET target_duration_seconds = 1200
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND w.name = 'Endurance Challenge'
  AND e.name = 'Cycling';

-- Set durations for flexibility exercises (30 seconds holds)
UPDATE workout_exercises we
SET target_duration_seconds = 30, target_reps = NULL
FROM exercises e
WHERE we.exercise_id = e.id
  AND e.exercise_type = 'flexibility';

-- Set durations for athletic performance cardio exercises
UPDATE workout_exercises we
SET target_duration_seconds = 60
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND w.name = 'Athletic Performance'
  AND e.exercise_type = 'cardio'
  AND we.target_reps IS NULL;