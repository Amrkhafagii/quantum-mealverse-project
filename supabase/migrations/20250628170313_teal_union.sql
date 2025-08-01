/*
  # Comprehensive Workout Templates

  1. New Tables
    - Inserts workout templates with their associated exercises
    - Creates complete workout programs from beginner to advanced levels
    
  2. Workout Templates
    - Beginner: Full Body, Cardio Blast, Morning Stretch
    - Intermediate: Upper Body Power, Lower Body Blast, HIIT Cardio, Core Crusher
    - Advanced: Advanced Full Body, Strength & Power, Endurance Challenge, Athletic Performance
    
  3. Exercise Associations
    - Links exercises to workouts with proper sets, reps, and rest periods
    - Sets appropriate target durations for cardio and flexibility exercises
*/

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

-- Insert workout exercises using the workout names to match IDs
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes)
SELECT 
  w.id as workout_id,
  exercise_data.exercise_id,
  exercise_data.order_index,
  exercise_data.target_sets,
  exercise_data.target_reps,
  exercise_data.rest_seconds,
  exercise_data.notes
FROM inserted_workouts w
CROSS JOIN LATERAL (
  VALUES
    -- Beginner Full Body
    ('Beginner Full Body', 1, 0, 3, ARRAY[8, 10, 12], 60, 'Start with knee push-ups if needed'),
    ('Beginner Full Body', 9, 1, 3, ARRAY[10, 12, 15], 60, 'Focus on proper form'),
    ('Beginner Full Body', 4, 2, 2, ARRAY[5, 8], 90, 'Use assistance if needed'),
    ('Beginner Full Body', 16, 3, 3, ARRAY[12, 15, 15], 45, 'Control the movement'),
    ('Beginner Full Body', 19, 4, 3, ARRAY[30, 45, 60], 60, 'Hold steady position'),

    -- Beginner Cardio Blast
    ('Beginner Cardio Blast', 22, 0, 3, NULL, 60, NULL),
    ('Beginner Cardio Blast', 24, 1, 3, NULL, 45, NULL),
    ('Beginner Cardio Blast', 21, 2, 1, NULL, 0, 'Cool down pace'),

    -- Morning Stretch
    ('Morning Stretch', 25, 0, 1, NULL, 30, 'Hold for 30 seconds'),
    ('Morning Stretch', 26, 1, 1, NULL, 30, 'Hold each side for 30 seconds'),
    ('Morning Stretch', 27, 2, 1, NULL, 30, 'Repeat 10 times slowly'),

    -- Upper Body Power
    ('Upper Body Power', 2, 0, 4, ARRAY[6, 8, 10, 12], 90, 'Progressive overload'),
    ('Upper Body Power', 3, 1, 3, ARRAY[8, 10, 12], 75, 'Control the negative'),
    ('Upper Body Power', 5, 2, 3, ARRAY[6, 8, 10], 90, 'Full range of motion'),
    ('Upper Body Power', 6, 3, 4, ARRAY[5, 6, 8, 10], 120, 'Focus on form'),
    ('Upper Body Power', 13, 4, 3, ARRAY[8, 10, 12], 60, 'Slow and controlled'),
    ('Upper Body Power', 16, 5, 3, ARRAY[12, 15, 15], 45, 'Squeeze at the top'),
    ('Upper Body Power', 17, 6, 3, ARRAY[10, 12, 15], 45, 'Full extension'),

    -- Lower Body Blast
    ('Lower Body Blast', 9, 0, 4, ARRAY[12, 15, 18, 20], 75, 'Go deep'),
    ('Lower Body Blast', 10, 1, 3, ARRAY[10, 12, 15], 60, 'Each leg'),
    ('Lower Body Blast', 11, 2, 3, ARRAY[8, 10, 12], 75, 'Feel the stretch'),
    ('Lower Body Blast', 12, 3, 4, ARRAY[15, 20, 25, 30], 45, 'Full range of motion'),
    ('Lower Body Blast', 6, 4, 3, ARRAY[5, 6, 8], 120, 'Heavy weight'),

    -- HIIT Cardio
    ('HIIT Cardio', 23, 0, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
    ('HIIT Cardio', 22, 1, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
    ('HIIT Cardio', 24, 2, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
    ('HIIT Cardio', 20, 3, 3, NULL, 60, 'High intensity'),

    -- Core Crusher
    ('Core Crusher', 19, 0, 3, ARRAY[30, 45, 60], 45, 'Hold steady'),
    ('Core Crusher', 20, 1, 3, ARRAY[15, 20, 25], 45, 'Control the movement'),
    ('Core Crusher', 21, 2, 3, ARRAY[10, 15, 20], 45, 'Each side'),
    ('Core Crusher', 22, 3, 3, NULL, 60, 'High knees'),
    ('Core Crusher', 1, 4, 2, ARRAY[10, 15], 60, 'Slow and controlled'),

    -- Advanced Full Body
    ('Advanced Full Body', 6, 0, 5, ARRAY[3, 5, 5, 8, 10], 180, 'Heavy compound movement'),
    ('Advanced Full Body', 2, 1, 4, ARRAY[5, 6, 8, 10], 120, 'Progressive sets'),
    ('Advanced Full Body', 5, 2, 4, ARRAY[5, 6, 8, 10], 90, 'Strict form'),
    ('Advanced Full Body', 9, 3, 4, ARRAY[15, 18, 20, 25], 90, 'Deep squats'),
    ('Advanced Full Body', 13, 4, 3, ARRAY[6, 8, 10], 75, 'Heavy weight'),
    ('Advanced Full Body', 19, 5, 3, ARRAY[60, 90, 120], 60, 'Extended holds'),

    -- Strength & Power
    ('Strength & Power', 6, 0, 5, ARRAY[1, 3, 5, 5, 8], 240, 'Max effort sets'),
    ('Strength & Power', 2, 1, 5, ARRAY[3, 5, 5, 8, 10], 180, 'Heavy bench press'),
    ('Strength & Power', 9, 2, 4, ARRAY[3, 5, 8, 10], 150, 'Back squats'),
    ('Strength & Power', 13, 3, 4, ARRAY[5, 6, 8, 10], 120, 'Overhead press'),
    ('Strength & Power', 7, 4, 3, ARRAY[5, 8, 10], 120, 'Bent-over rows'),

    -- Endurance Challenge
    ('Endurance Challenge', 21, 0, 1, NULL, 0, '30 minutes steady pace'),
    ('Endurance Challenge', 22, 1, 5, NULL, 60, '2 minutes each set'),
    ('Endurance Challenge', 24, 2, 3, NULL, 90, 'High intensity intervals'),

    -- Athletic Performance
    ('Athletic Performance', 23, 0, 4, NULL, 45, 'Explosive movement'),
    ('Athletic Performance', 6, 1, 4, ARRAY[3, 5, 5, 8], 180, 'Power development'),
    ('Athletic Performance', 10, 2, 3, ARRAY[8, 10, 12], 60, 'Single leg power'),
    ('Athletic Performance', 22, 3, 4, NULL, 60, 'Agility component'),
    ('Athletic Performance', 13, 4, 3, ARRAY[5, 8, 10], 90, 'Overhead stability'),
    ('Athletic Performance', 19, 5, 3, ARRAY[45, 60, 90], 60, 'Core stability')
) AS exercise_data(workout_name, exercise_id, order_index, target_sets, target_reps, rest_seconds, notes)
WHERE w.name = exercise_data.workout_name;

-- Set target duration for cardio exercises (where target_reps is NULL)
UPDATE workout_exercises 
SET target_duration_seconds = 300
WHERE exercise_id IN (21, 22, 23, 24) 
  AND target_reps IS NULL
  AND workout_id IN (
    SELECT id FROM workouts 
    WHERE name IN ('Beginner Cardio Blast', 'Core Crusher')
  );

-- Set specific durations for HIIT exercises
UPDATE workout_exercises 
SET target_duration_seconds = 30 
WHERE workout_id IN (SELECT id FROM workouts WHERE name = 'HIIT Cardio')
  AND exercise_id IN (22, 23, 24);

-- Set longer duration for endurance challenge
UPDATE workout_exercises 
SET target_duration_seconds = 1800 
WHERE workout_id IN (SELECT id FROM workouts WHERE name = 'Endurance Challenge')
  AND exercise_id = 21;

UPDATE workout_exercises 
SET target_duration_seconds = 120 
WHERE workout_id IN (SELECT id FROM workouts WHERE name = 'Endurance Challenge')
  AND exercise_id = 22;

UPDATE workout_exercises 
SET target_duration_seconds = 45 
WHERE workout_id IN (SELECT id FROM workouts WHERE name = 'Endurance Challenge')
  AND exercise_id = 24;

-- Set durations for flexibility exercises
UPDATE workout_exercises 
SET target_duration_seconds = 30, target_reps = NULL 
WHERE exercise_id IN (25, 26, 27);

-- Set specific duration for cat-cow stretch
UPDATE workout_exercises 
SET target_duration_seconds = 60, target_reps = NULL 
WHERE exercise_id = 27;

-- Set durations for athletic performance cardio exercises
UPDATE workout_exercises 
SET target_duration_seconds = 60
WHERE workout_id IN (SELECT id FROM workouts WHERE name = 'Athletic Performance')
  AND exercise_id IN (22, 23)
  AND target_reps IS NULL;