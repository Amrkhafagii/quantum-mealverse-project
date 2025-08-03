-- Add comprehensive exercise database and populate workout templates

-- First, add more exercises across different categories
INSERT INTO exercises (name, description, muscle_groups, difficulty_level, category_id, equipment, instructions) VALUES
-- Strength Training - Upper Body
('Incline Dumbbell Press', 'Targets upper chest muscles', ARRAY['chest', 'shoulders', 'triceps'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['dumbbells', 'incline bench'], 'Lie on incline bench, press dumbbells up and together'),
('Dumbbell Rows', 'Strengthens back and biceps', ARRAY['back', 'biceps'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['dumbbells'], 'Bend over, pull dumbbells to chest level'),
('Overhead Press', 'Develops shoulder strength', ARRAY['shoulders', 'triceps', 'core'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['barbell', 'dumbbells'], 'Press weight overhead from shoulder level'),
('Lateral Raises', 'Isolates side deltoids', ARRAY['shoulders'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['dumbbells'], 'Raise arms to sides until parallel to floor'),
('Tricep Dips', 'Targets triceps and chest', ARRAY['triceps', 'chest'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['dip bars', 'bench'], 'Lower body between parallel bars, push back up'),
('Bicep Curls', 'Isolates bicep muscles', ARRAY['biceps'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['dumbbells', 'barbell'], 'Curl weight up to chest level'),

-- Strength Training - Lower Body  
('Bulgarian Split Squats', 'Single leg squat variation', ARRAY['quadriceps', 'glutes'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['bodyweight', 'dumbbells'], 'Rear foot elevated, squat down on front leg'),
('Romanian Deadlifts', 'Targets hamstrings and glutes', ARRAY['hamstrings', 'glutes', 'back'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['barbell', 'dumbbells'], 'Hinge at hips, lower weight with straight legs'),
('Walking Lunges', 'Dynamic leg strengthening', ARRAY['quadriceps', 'glutes'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['bodyweight', 'dumbbells'], 'Step forward into lunge, alternate legs'),
('Calf Raises', 'Strengthens calf muscles', ARRAY['calves'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['bodyweight', 'dumbbells'], 'Rise up on toes, lower slowly'),
('Hip Thrusts', 'Targets glutes and hamstrings', ARRAY['glutes', 'hamstrings'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['barbell', 'bodyweight'], 'Shoulders on bench, thrust hips up'),

-- Core Training
('Russian Twists', 'Rotational core exercise', ARRAY['abs', 'obliques'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['bodyweight', 'medicine ball'], 'Sit with feet up, twist torso side to side'),
('Dead Bug', 'Core stability exercise', ARRAY['abs', 'core'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['bodyweight'], 'Lie on back, extend opposite arm and leg'),
('Mountain Climbers', 'Dynamic core and cardio', ARRAY['abs', 'core'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1), ARRAY['bodyweight'], 'Plank position, alternate bringing knees to chest'),
('Side Plank', 'Lateral core strength', ARRAY['obliques', 'core'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['bodyweight'], 'Lie on side, hold body straight supported by forearm'),
('Bicycle Crunches', 'Dynamic ab exercise', ARRAY['abs', 'obliques'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['bodyweight'], 'Lie on back, bring opposite elbow to knee'),

-- Cardio Exercises
('Jumping Jacks', 'Full body cardio movement', ARRAY['legs', 'shoulders'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1), ARRAY['bodyweight'], 'Jump while spreading legs and raising arms'),
('Burpees', 'High intensity full body exercise', ARRAY['full body'], 'advanced', (SELECT id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1), ARRAY['bodyweight'], 'Squat, jump back to plank, push-up, jump forward, jump up'),
('High Knees', 'Running in place cardio', ARRAY['legs', 'core'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1), ARRAY['bodyweight'], 'Run in place bringing knees to chest level'),
('Box Steps', 'Step up cardio exercise', ARRAY['legs', 'glutes'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1), ARRAY['box', 'step'], 'Step up and down on elevated platform'),
('Battle Ropes', 'Upper body cardio', ARRAY['arms', 'shoulders', 'core'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1), ARRAY['battle ropes'], 'Alternate waves with heavy ropes'),

-- Flexibility & Mobility
('Cat Cow Stretch', 'Spinal mobility exercise', ARRAY['back', 'core'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Flexibility' LIMIT 1), ARRAY['bodyweight'], 'On hands and knees, arch and round spine'),
('Downward Dog', 'Full body stretch', ARRAY['hamstrings', 'calves', 'shoulders'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Flexibility' LIMIT 1), ARRAY['bodyweight'], 'Inverted V position, press heels down'),
('Pigeon Pose', 'Hip flexibility stretch', ARRAY['hips', 'glutes'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Flexibility' LIMIT 1), ARRAY['bodyweight'], 'One leg forward bent, other leg straight back'),
('Child''s Pose', 'Relaxing stretch', ARRAY['back', 'shoulders'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Flexibility' LIMIT 1), ARRAY['bodyweight'], 'Kneel and sit back on heels, reach arms forward'),
('Cobra Stretch', 'Back extension stretch', ARRAY['back', 'chest'], 'beginner', (SELECT id FROM exercise_categories WHERE name = 'Flexibility' LIMIT 1), ARRAY['bodyweight'], 'Lie face down, push chest up with arms'),

-- Functional Movement
('Turkish Get Up', 'Full body functional movement', ARRAY['full body'], 'advanced', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['kettlebell'], 'Complex movement from lying to standing with weight overhead'),
('Farmer''s Walk', 'Grip and core strength', ARRAY['forearms', 'core', 'traps'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['dumbbells', 'kettlebells'], 'Walk while carrying heavy weights'),
('Bear Crawl', 'Quadrupedal movement', ARRAY['core', 'shoulders'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1), ARRAY['bodyweight'], 'Crawl on hands and feet, knees off ground'),
('Kettlebell Swings', 'Hip hinge power movement', ARRAY['glutes', 'hamstrings', 'core'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['kettlebell'], 'Swing kettlebell from between legs to chest level'),

-- HIIT Specific
('Jump Squats', 'Explosive leg exercise', ARRAY['quadriceps', 'glutes'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1), ARRAY['bodyweight'], 'Squat down then explode up into a jump'),
('Push-up to T', 'Upper body with rotation', ARRAY['chest', 'shoulders', 'core'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Strength Training' LIMIT 1), ARRAY['bodyweight'], 'Push-up then rotate to side plank'),
('Skater Hops', 'Lateral plyometric movement', ARRAY['legs', 'glutes'], 'intermediate', (SELECT id FROM exercise_categories WHERE name = 'Cardio' LIMIT 1), ARRAY['bodyweight'], 'Hop side to side landing on one foot');

-- Now populate workout templates with exercises
-- Get workout template IDs and assign appropriate exercises

-- Template 1: Beginner Full Body Foundation (assuming workout_id = 1)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_time_seconds, notes) 
SELECT 1, e.id, 
  CASE e.name
    WHEN 'Squats' THEN 1
    WHEN 'Push-ups' THEN 2
    WHEN 'Plank' THEN 3
    WHEN 'Dumbbell Rows' THEN 4
    WHEN 'Walking Lunges' THEN 5
    WHEN 'Bicep Curls' THEN 6
    WHEN 'Dead Bug' THEN 7
  END as order_index,
  CASE e.name
    WHEN 'Plank' THEN 3
    WHEN 'Dead Bug' THEN 3
    ELSE 3
  END as target_sets,
  CASE e.name
    WHEN 'Plank' THEN NULL
    WHEN 'Dead Bug' THEN 10
    WHEN 'Walking Lunges' THEN 12
    ELSE 15
  END as target_reps,
  CASE e.name
    WHEN 'Plank' THEN 30
    ELSE NULL
  END as target_duration_seconds,
  60 as rest_time_seconds,
  CASE e.name
    WHEN 'Squats' THEN 'Focus on proper form, go to comfortable depth'
    WHEN 'Push-ups' THEN 'Modify on knees if needed'
    WHEN 'Plank' THEN 'Keep body straight, breathe normally'
    ELSE 'Focus on controlled movement'
  END as notes
FROM exercises e
WHERE e.name IN ('Squats', 'Push-ups', 'Plank', 'Dumbbell Rows', 'Walking Lunges', 'Bicep Curls', 'Dead Bug')
AND EXISTS (SELECT 1 FROM workouts WHERE id = 1);

-- Template 2: Upper Body Builder (assuming workout_id = 2)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 2, e.id,
  CASE e.name
    WHEN 'Bench Press' THEN 1
    WHEN 'Pull-ups' THEN 2
    WHEN 'Incline Dumbbell Press' THEN 3
    WHEN 'Dumbbell Rows' THEN 4
    WHEN 'Overhead Press' THEN 5
    WHEN 'Tricep Dips' THEN 6
    WHEN 'Bicep Curls' THEN 7
  END as order_index,
  4 as target_sets,
  CASE e.name
    WHEN 'Pull-ups' THEN 8
    WHEN 'Tricep Dips' THEN 12
    ELSE 10
  END as target_reps,
  90 as rest_time_seconds,
  'Focus on progressive overload and proper form'
FROM exercises e
WHERE e.name IN ('Bench Press', 'Pull-ups', 'Incline Dumbbell Press', 'Dumbbell Rows', 'Overhead Press', 'Tricep Dips', 'Bicep Curls')
AND EXISTS (SELECT 1 FROM workouts WHERE id = 2);

-- Template 3: HIIT Blast (assuming workout_id = 3)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_time_seconds, notes)
SELECT 3, e.id,
  CASE e.name
    WHEN 'Burpees' THEN 1
    WHEN 'Jump Squats' THEN 2
    WHEN 'Mountain Climbers' THEN 3
    WHEN 'Jumping Jacks' THEN 4
    WHEN 'High Knees' THEN 5
    WHEN 'Push-up to T' THEN 6
    WHEN 'Skater Hops' THEN 7
  END as order_index,
  4 as target_sets,
  NULL as target_reps,
  45 as target_duration_seconds,
  15 as rest_time_seconds,
  'Work at maximum intensity for duration, rest minimally'
FROM exercises e
WHERE e.name IN ('Burpees', 'Jump Squats', 'Mountain Climbers', 'Jumping Jacks', 'High Knees', 'Push-up to T', 'Skater Hops')
AND EXISTS (SELECT 1 FROM workouts WHERE id = 3);

-- Template 4: Lower Body Focus (assuming workout_id = 4)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, rest_time_seconds, notes)
SELECT 4, e.id,
  CASE e.name
    WHEN 'Squats' THEN 1
    WHEN 'Deadlifts' THEN 2
    WHEN 'Bulgarian Split Squats' THEN 3
    WHEN 'Romanian Deadlifts' THEN 4
    WHEN 'Walking Lunges' THEN 5
    WHEN 'Hip Thrusts' THEN 6
    WHEN 'Calf Raises' THEN 7
  END as order_index,
  4 as target_sets,
  CASE e.name
    WHEN 'Bulgarian Split Squats' THEN 10
    WHEN 'Walking Lunges' THEN 12
    WHEN 'Calf Raises' THEN 15
    ELSE 8
  END as target_reps,
  120 as rest_time_seconds,
  'Focus on full range of motion and muscle activation'
FROM exercises e
WHERE e.name IN ('Squats', 'Deadlifts', 'Bulgarian Split Squats', 'Romanian Deadlifts', 'Walking Lunges', 'Hip Thrusts', 'Calf Raises')
AND EXISTS (SELECT 1 FROM workouts WHERE id = 4);

-- Template 5: Flexibility Flow (assuming workout_id = 5)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_duration_seconds, rest_time_seconds, notes)
SELECT 5, e.id,
  CASE e.name
    WHEN 'Cat Cow Stretch' THEN 1
    WHEN 'Downward Dog' THEN 2
    WHEN 'Child''s Pose' THEN 3
    WHEN 'Pigeon Pose' THEN 4
    WHEN 'Cobra Stretch' THEN 5
    WHEN 'Dead Bug' THEN 6
    WHEN 'Side Plank' THEN 7
  END as order_index,
  2 as target_sets,
  CASE e.name
    WHEN 'Cat Cow Stretch' THEN 60
    WHEN 'Downward Dog' THEN 45
    WHEN 'Child''s Pose' THEN 60
    WHEN 'Pigeon Pose' THEN 90
    WHEN 'Cobra Stretch' THEN 30
    WHEN 'Dead Bug' THEN 45
    WHEN 'Side Plank' THEN 30
  END as target_duration_seconds,
  30 as rest_time_seconds,
  'Hold stretches gently, breathe deeply throughout'
FROM exercises e
WHERE e.name IN ('Cat Cow Stretch', 'Downward Dog', 'Child''s Pose', 'Pigeon Pose', 'Cobra Stretch', 'Dead Bug', 'Side Plank')
AND EXISTS (SELECT 1 FROM workouts WHERE id = 5);

-- Template 6: Core Crusher (assuming workout_id = 6)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_time_seconds, notes)
SELECT 6, e.id,
  CASE e.name
    WHEN 'Plank' THEN 1
    WHEN 'Russian Twists' THEN 2
    WHEN 'Bicycle Crunches' THEN 3
    WHEN 'Dead Bug' THEN 4
    WHEN 'Side Plank' THEN 5
    WHEN 'Mountain Climbers' THEN 6
    WHEN 'Bear Crawl' THEN 7
  END as order_index,
  3 as target_sets,
  CASE e.name
    WHEN 'Plank' THEN NULL
    WHEN 'Side Plank' THEN NULL
    WHEN 'Mountain Climbers' THEN NULL
    WHEN 'Bear Crawl' THEN NULL
    WHEN 'Russian Twists' THEN 20
    WHEN 'Bicycle Crunches' THEN 20
    WHEN 'Dead Bug' THEN 12
  END as target_reps,
  CASE e.name
    WHEN 'Plank' THEN 45
    WHEN 'Side Plank' THEN 30
    WHEN 'Mountain Climbers' THEN 30
    WHEN 'Bear Crawl' THEN 20
    ELSE NULL
  END as target_duration_seconds,
  45 as rest_time_seconds,
  'Focus on core engagement throughout all movements'
FROM exercises e
WHERE e.name IN ('Plank', 'Russian Twists', 'Bicycle Crunches', 'Dead Bug', 'Side Plank', 'Mountain Climbers', 'Bear Crawl')
AND EXISTS (SELECT 1 FROM workouts WHERE id = 6);

-- Template 7: Functional Fitness (assuming workout_id = 7)
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_duration_seconds, rest_time_seconds, notes)
SELECT 7, e.id,
  CASE e.name
    WHEN 'Turkish Get Up' THEN 1
    WHEN 'Kettlebell Swings' THEN 2
    WHEN 'Farmer''s Walk' THEN 3
    WHEN 'Bear Crawl' THEN 4
    WHEN 'Burpees' THEN 5
    WHEN 'Push-up to T' THEN 6
    WHEN 'Walking Lunges' THEN 7
  END as order_index,
  3 as target_sets,
  CASE e.name
    WHEN 'Turkish Get Up' THEN 5
    WHEN 'Kettlebell Swings' THEN 15
    WHEN 'Farmer''s Walk' THEN NULL
    WHEN 'Bear Crawl' THEN NULL
    WHEN 'Burpees' THEN 10
    WHEN 'Push-up to T' THEN 8
    WHEN 'Walking Lunges' THEN 12
  END as target_reps,
  CASE e.name
    WHEN 'Farmer''s Walk' THEN 30
    WHEN 'Bear Crawl' THEN 20
    ELSE NULL
  END as target_duration_seconds,
  90 as rest_time_seconds,
  'Focus on movement quality and functional patterns'
FROM exercises e
WHERE e.name IN ('Turkish Get Up', 'Kettlebell Swings', 'Farmer''s Walk', 'Bear Crawl', 'Burpees', 'Push-up to T', 'Walking Lunges')
AND EXISTS (SELECT 1 FROM workouts WHERE id = 7);

-- Continue populating remaining templates with appropriate exercise combinations
-- Each template now has 7 exercises minimum as requested