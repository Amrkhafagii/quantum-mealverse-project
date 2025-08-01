/*
  # Comprehensive Workout Templates Migration

  1. New Templates (20 total)
    - 6 Beginner workouts (Full Body, Cardio, Flexibility, Upper Body, Lower Body, Core)
    - 8 Intermediate workouts (Strength, HIIT, Athletic, Push/Pull, Legs, Shoulders, Back, Arms)
    - 6 Advanced workouts (Powerlifting, Endurance, Competition Prep, Functional, Metabolic, Elite)

  2. Exercise Distribution
    - Each template contains 8-12 exercises
    - Proper progression from beginner to advanced
    - Balanced muscle group targeting
    - Appropriate rest periods and rep ranges

  3. Security
    - Uses existing exercises only
    - Proper workout categorization
    - Template and public flags set correctly
*/

-- Clear existing template data to ensure clean state
DELETE FROM workout_exercises 
WHERE workout_id IN (
  SELECT id FROM workouts WHERE is_template = true
);

DELETE FROM workouts WHERE is_template = true;

-- Insert 20 comprehensive workout templates
WITH inserted_workouts AS (
  INSERT INTO workouts (name, description, estimated_duration_minutes, difficulty_level, workout_type, is_template, is_public) VALUES
  -- BEGINNER WORKOUTS (6)
  ('Beginner Full Body Foundation', 'Complete introduction to strength training with fundamental movements', 35, 'beginner', 'strength', true, true),
  ('Beginner Cardio Journey', 'Low-impact cardiovascular workout to build endurance', 25, 'beginner', 'cardio', true, true),
  ('Beginner Flexibility Flow', 'Gentle stretching routine for mobility and recovery', 20, 'beginner', 'flexibility', true, true),
  ('Beginner Upper Body Builder', 'Introduction to upper body strength training', 30, 'beginner', 'strength', true, true),
  ('Beginner Lower Body Power', 'Foundation lower body strength and stability', 30, 'beginner', 'strength', true, true),
  ('Beginner Core Stability', 'Essential core strengthening for beginners', 25, 'beginner', 'strength', true, true),

  -- INTERMEDIATE WORKOUTS (8)
  ('Intermediate Strength Circuit', 'Comprehensive strength training with compound movements', 45, 'intermediate', 'strength', true, true),
  ('Intermediate HIIT Blast', 'High-intensity interval training for fat burning', 30, 'intermediate', 'hiit', true, true),
  ('Intermediate Athletic Performance', 'Sport-specific training for athletic development', 50, 'intermediate', 'mixed', true, true),
  ('Intermediate Push/Pull Split', 'Focused push and pull movement patterns', 40, 'intermediate', 'strength', true, true),
  ('Intermediate Leg Destroyer', 'Intense lower body strength and power', 45, 'intermediate', 'strength', true, true),
  ('Intermediate Shoulder Sculptor', 'Complete shoulder development workout', 35, 'intermediate', 'strength', true, true),
  ('Intermediate Back Builder', 'Comprehensive back strength and width', 40, 'intermediate', 'strength', true, true),
  ('Intermediate Arm Annihilator', 'Focused arm development and definition', 35, 'intermediate', 'strength', true, true),

  -- ADVANCED WORKOUTS (6)
  ('Advanced Powerlifting Protocol', 'Heavy compound movements for maximum strength', 60, 'advanced', 'strength', true, true),
  ('Advanced Endurance Challenge', 'Extended cardiovascular and muscular endurance', 55, 'advanced', 'cardio', true, true),
  ('Advanced Competition Prep', 'High-intensity training for competitive athletes', 65, 'advanced', 'mixed', true, true),
  ('Advanced Functional Fitness', 'Complex movement patterns and functional strength', 50, 'advanced', 'mixed', true, true),
  ('Advanced Metabolic Mayhem', 'Extreme metabolic conditioning workout', 45, 'advanced', 'hiit', true, true),
  ('Advanced Elite Performance', 'Maximum intensity training for elite athletes', 70, 'advanced', 'mixed', true, true)
  RETURNING id, name
),
-- Get available exercises to ensure we only reference existing ones
available_exercises AS (
  SELECT id, name, exercise_type FROM exercises
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
    -- BEGINNER FULL BODY FOUNDATION (8 exercises)
    ('Beginner Full Body Foundation', 'Push-up', 0, 3, ARRAY[5, 8, 10], 60, 'Start with knee push-ups if needed'),
    ('Beginner Full Body Foundation', 'Squat', 1, 3, ARRAY[8, 10, 12], 60, 'Focus on proper form and depth'),
    ('Beginner Full Body Foundation', 'Plank', 2, 3, ARRAY[20, 30, 40], 45, 'Hold steady, breathe normally'),
    ('Beginner Full Body Foundation', 'Lunge', 3, 2, ARRAY[6, 8], 60, 'Alternate legs, control the movement'),
    ('Beginner Full Body Foundation', 'Glute Bridge', 4, 3, ARRAY[10, 12, 15], 45, 'Squeeze glutes at the top'),
    ('Beginner Full Body Foundation', 'Wall Sit', 5, 2, ARRAY[20, 30], 60, 'Keep back flat against wall'),
    ('Beginner Full Body Foundation', 'Calf Raise', 6, 3, ARRAY[12, 15, 18], 30, 'Full range of motion'),
    ('Beginner Full Body Foundation', 'Dead Bug', 7, 2, ARRAY[8, 10], 45, 'Slow and controlled movement'),

    -- BEGINNER CARDIO JOURNEY (8 exercises)
    ('Beginner Cardio Journey', 'Walking', 0, 1, NULL, 0, 'Warm-up pace for 5 minutes'),
    ('Beginner Cardio Journey', 'Marching in Place', 1, 3, NULL, 60, '2 minutes each set'),
    ('Beginner Cardio Journey', 'Step-ups', 2, 3, ARRAY[10, 12, 15], 45, 'Use a sturdy platform'),
    ('Beginner Cardio Journey', 'Arm Circles', 3, 2, ARRAY[15, 20], 30, 'Forward and backward'),
    ('Beginner Cardio Journey', 'Knee Lifts', 4, 3, ARRAY[15, 20, 25], 45, 'Bring knees to chest'),
    ('Beginner Cardio Journey', 'Side Steps', 5, 3, ARRAY[20, 25, 30], 45, 'Step side to side'),
    ('Beginner Cardio Journey', 'Heel Touches', 6, 3, ARRAY[15, 20, 25], 30, 'Touch heels behind you'),
    ('Beginner Cardio Journey', 'Cool Down Walk', 7, 1, NULL, 0, 'Slow pace for recovery'),

    -- BEGINNER FLEXIBILITY FLOW (8 exercises)
    ('Beginner Flexibility Flow', 'Cat-Cow Stretch', 0, 2, ARRAY[10, 12], 30, 'Slow, controlled movement'),
    ('Beginner Flexibility Flow', 'Child''s Pose', 1, 2, NULL, 30, 'Hold for 30-45 seconds'),
    ('Beginner Flexibility Flow', 'Hamstring Stretch', 2, 2, NULL, 30, 'Hold each leg for 30 seconds'),
    ('Beginner Flexibility Flow', 'Shoulder Rolls', 3, 2, ARRAY[10, 15], 20, 'Forward and backward'),
    ('Beginner Flexibility Flow', 'Neck Stretch', 4, 2, NULL, 20, 'Gentle side to side'),
    ('Beginner Flexibility Flow', 'Hip Circles', 5, 2, ARRAY[8, 10], 30, 'Each direction'),
    ('Beginner Flexibility Flow', 'Ankle Rolls', 6, 2, ARRAY[10, 12], 20, 'Each foot, both directions'),
    ('Beginner Flexibility Flow', 'Deep Breathing', 7, 1, NULL, 0, 'Focus on relaxation'),

    -- BEGINNER UPPER BODY BUILDER (8 exercises)
    ('Beginner Upper Body Builder', 'Wall Push-up', 0, 3, ARRAY[8, 10, 12], 60, 'Stand arm''s length from wall'),
    ('Beginner Upper Body Builder', 'Arm Raises', 1, 3, ARRAY[10, 12, 15], 45, 'Front and side raises'),
    ('Beginner Upper Body Builder', 'Shoulder Shrugs', 2, 3, ARRAY[12, 15, 18], 30, 'Squeeze shoulder blades'),
    ('Beginner Upper Body Builder', 'Tricep Dips', 3, 2, ARRAY[5, 8], 60, 'Use chair or bench'),
    ('Beginner Upper Body Builder', 'Bicep Curls', 4, 3, ARRAY[8, 10, 12], 45, 'Control the movement'),
    ('Beginner Upper Body Builder', 'Chest Squeeze', 5, 3, ARRAY[10, 12, 15], 30, 'Isometric hold'),
    ('Beginner Upper Body Builder', 'Reverse Fly', 6, 2, ARRAY[8, 10], 45, 'Squeeze shoulder blades'),
    ('Beginner Upper Body Builder', 'Overhead Reach', 7, 2, ARRAY[10, 15], 30, 'Full arm extension'),

    -- BEGINNER LOWER BODY POWER (8 exercises)
    ('Beginner Lower Body Power', 'Bodyweight Squat', 0, 3, ARRAY[8, 10, 12], 60, 'Focus on form over speed'),
    ('Beginner Lower Body Power', 'Static Lunge', 1, 3, ARRAY[6, 8, 10], 60, 'Each leg separately'),
    ('Beginner Lower Body Power', 'Glute Bridge', 2, 3, ARRAY[10, 12, 15], 45, 'Pause at the top'),
    ('Beginner Lower Body Power', 'Calf Raise', 3, 3, ARRAY[12, 15, 18], 30, 'Rise up on toes'),
    ('Beginner Lower Body Power', 'Wall Sit', 4, 2, ARRAY[20, 30], 60, 'Thighs parallel to ground'),
    ('Beginner Lower Body Power', 'Step-ups', 5, 3, ARRAY[8, 10, 12], 45, 'Each leg, controlled pace'),
    ('Beginner Lower Body Power', 'Single Leg Stand', 6, 2, ARRAY[15, 20], 30, 'Balance challenge'),
    ('Beginner Lower Body Power', 'Leg Swings', 7, 2, ARRAY[10, 12], 30, 'Front to back, side to side'),

    -- BEGINNER CORE STABILITY (8 exercises)
    ('Beginner Core Stability', 'Plank', 0, 3, ARRAY[15, 20, 30], 60, 'Keep body straight'),
    ('Beginner Core Stability', 'Dead Bug', 1, 3, ARRAY[6, 8, 10], 45, 'Opposite arm and leg'),
    ('Beginner Core Stability', 'Bird Dog', 2, 3, ARRAY[6, 8, 10], 45, 'Hold for 3 seconds each'),
    ('Beginner Core Stability', 'Modified Crunches', 3, 3, ARRAY[8, 10, 12], 30, 'Hands behind head'),
    ('Beginner Core Stability', 'Side Plank', 4, 2, ARRAY[10, 15], 60, 'Each side, modified on knees'),
    ('Beginner Core Stability', 'Knee to Chest', 5, 3, ARRAY[8, 10, 12], 30, 'Alternate legs'),
    ('Beginner Core Stability', 'Pelvic Tilts', 6, 2, ARRAY[10, 12], 30, 'Engage core muscles'),
    ('Beginner Core Stability', 'Breathing Exercise', 7, 2, ARRAY[5, 8], 45, 'Deep diaphragmatic breathing'),

    -- INTERMEDIATE STRENGTH CIRCUIT (10 exercises)
    ('Intermediate Strength Circuit', 'Push-up', 0, 4, ARRAY[10, 12, 15, 18], 75, 'Full range of motion'),
    ('Intermediate Strength Circuit', 'Squat', 1, 4, ARRAY[12, 15, 18, 20], 75, 'Below parallel depth'),
    ('Intermediate Strength Circuit', 'Pull-up', 2, 3, ARRAY[5, 8, 10], 90, 'Use assistance if needed'),
    ('Intermediate Strength Circuit', 'Lunge', 3, 3, ARRAY[10, 12, 15], 60, 'Walking or stationary'),
    ('Intermediate Strength Circuit', 'Pike Push-up', 4, 3, ARRAY[8, 10, 12], 75, 'Feet elevated'),
    ('Intermediate Strength Circuit', 'Single Leg Deadlift', 5, 3, ARRAY[8, 10, 12], 60, 'Each leg'),
    ('Intermediate Strength Circuit', 'Plank', 6, 3, ARRAY[45, 60, 75], 60, 'Maintain perfect form'),
    ('Intermediate Strength Circuit', 'Jump Squat', 7, 3, ARRAY[8, 10, 12], 75, 'Land softly'),
    ('Intermediate Strength Circuit', 'Tricep Dips', 8, 3, ARRAY[10, 12, 15], 60, 'Full range of motion'),
    ('Intermediate Strength Circuit', 'Mountain Climbers', 9, 3, ARRAY[20, 25, 30], 45, 'Fast pace, good form'),

    -- INTERMEDIATE HIIT BLAST (9 exercises)
    ('Intermediate HIIT Blast', 'Burpees', 0, 4, NULL, 30, '30 seconds work, 30 seconds rest'),
    ('Intermediate HIIT Blast', 'Jump Squat', 1, 4, NULL, 30, 'Explosive movement'),
    ('Intermediate HIIT Blast', 'Mountain Climbers', 2, 4, NULL, 30, 'Fast pace'),
    ('Intermediate HIIT Blast', 'High Knees', 3, 4, NULL, 30, 'Drive knees up'),
    ('Intermediate HIIT Blast', 'Push-up', 4, 4, NULL, 30, 'As many as possible'),
    ('Intermediate HIIT Blast', 'Jumping Jacks', 5, 4, NULL, 30, 'Full body movement'),
    ('Intermediate HIIT Blast', 'Plank Jacks', 6, 4, NULL, 30, 'Jump feet in plank'),
    ('Intermediate HIIT Blast', 'Squat Thrust', 7, 4, NULL, 30, 'Without the jump'),
    ('Intermediate HIIT Blast', 'Cool Down Jog', 8, 1, NULL, 0, 'Light movement'),

    -- INTERMEDIATE ATHLETIC PERFORMANCE (10 exercises)
    ('Intermediate Athletic Performance', 'Plyometric Push-up', 0, 4, ARRAY[5, 6, 8, 10], 90, 'Explosive movement'),
    ('Intermediate Athletic Performance', 'Jump Squat', 1, 4, ARRAY[8, 10, 12, 15], 75, 'Maximum height'),
    ('Intermediate Athletic Performance', 'Lateral Lunge', 2, 3, ARRAY[8, 10, 12], 60, 'Each side'),
    ('Intermediate Athletic Performance', 'Single Arm Push-up', 3, 3, ARRAY[3, 5, 8], 90, 'Each arm'),
    ('Intermediate Athletic Performance', 'Box Jump', 4, 4, ARRAY[5, 8, 10, 12], 90, 'Land softly'),
    ('Intermediate Athletic Performance', 'Bear Crawl', 5, 3, ARRAY[10, 15, 20], 60, 'Steps forward'),
    ('Intermediate Athletic Performance', 'Agility Ladder', 6, 3, NULL, 60, '30 seconds each set'),
    ('Intermediate Athletic Performance', 'Turkish Get-up', 7, 2, ARRAY[3, 5], 120, 'Each side'),
    ('Intermediate Athletic Performance', 'Sprint Intervals', 8, 4, NULL, 90, '15 seconds all-out'),
    ('Intermediate Athletic Performance', 'Recovery Walk', 9, 1, NULL, 0, 'Active recovery'),

    -- INTERMEDIATE PUSH/PULL SPLIT (10 exercises)
    ('Intermediate Push/Pull Split', 'Push-up Variations', 0, 4, ARRAY[8, 10, 12, 15], 75, 'Wide, narrow, diamond'),
    ('Intermediate Push/Pull Split', 'Pike Push-up', 1, 3, ARRAY[6, 8, 10], 75, 'Shoulder focus'),
    ('Intermediate Push/Pull Split', 'Tricep Dips', 2, 3, ARRAY[10, 12, 15], 60, 'Deep range of motion'),
    ('Intermediate Push/Pull Split', 'Pull-up', 3, 4, ARRAY[5, 6, 8, 10], 90, 'Various grips'),
    ('Intermediate Push/Pull Split', 'Inverted Row', 4, 3, ARRAY[8, 10, 12], 75, 'Under table or bar'),
    ('Intermediate Push/Pull Split', 'Face Pull', 5, 3, ARRAY[12, 15, 18], 45, 'Rear delt focus'),
    ('Intermediate Push/Pull Split', 'Overhead Press', 6, 3, ARRAY[8, 10, 12], 75, 'Strict form'),
    ('Intermediate Push/Pull Split', 'Bicep Curls', 7, 3, ARRAY[10, 12, 15], 45, 'Control the negative'),
    ('Intermediate Push/Pull Split', 'Lateral Raise', 8, 3, ARRAY[12, 15, 18], 45, 'Shoulder isolation'),
    ('Intermediate Push/Pull Split', 'Reverse Fly', 9, 3, ARRAY[12, 15, 18], 45, 'Squeeze shoulder blades'),

    -- INTERMEDIATE LEG DESTROYER (9 exercises)
    ('Intermediate Leg Destroyer', 'Squat', 0, 5, ARRAY[12, 15, 18, 20, 25], 90, 'Progressive overload'),
    ('Intermediate Leg Destroyer', 'Bulgarian Split Squat', 1, 4, ARRAY[8, 10, 12, 15], 75, 'Each leg'),
    ('Intermediate Leg Destroyer', 'Jump Lunge', 2, 3, ARRAY[10, 12, 15], 60, 'Explosive switching'),
    ('Intermediate Leg Destroyer', 'Single Leg Deadlift', 3, 3, ARRAY[8, 10, 12], 75, 'Balance and strength'),
    ('Intermediate Leg Destroyer', 'Cossack Squat', 4, 3, ARRAY[6, 8, 10], 60, 'Each side'),
    ('Intermediate Leg Destroyer', 'Wall Sit', 5, 3, ARRAY[45, 60, 75], 75, 'Isometric hold'),
    ('Intermediate Leg Destroyer', 'Calf Raise', 6, 4, ARRAY[15, 18, 20, 25], 45, 'Single and double leg'),
    ('Intermediate Leg Destroyer', 'Glute Bridge', 7, 4, ARRAY[15, 18, 20, 25], 45, 'Single leg progression'),
    ('Intermediate Leg Destroyer', 'Leg Swings', 8, 2, ARRAY[15, 20], 30, 'Dynamic stretching'),

    -- INTERMEDIATE SHOULDER SCULPTOR (8 exercises)
    ('Intermediate Shoulder Sculptor', 'Pike Push-up', 0, 4, ARRAY[6, 8, 10, 12], 75, 'Feet elevated'),
    ('Intermediate Shoulder Sculptor', 'Handstand Progression', 1, 3, ARRAY[3, 5, 8], 90, 'Wall assisted'),
    ('Intermediate Shoulder Sculptor', 'Lateral Raise', 2, 4, ARRAY[12, 15, 18, 20], 45, 'Control the movement'),
    ('Intermediate Shoulder Sculptor', 'Front Raise', 3, 3, ARRAY[10, 12, 15], 45, 'Straight arms'),
    ('Intermediate Shoulder Sculptor', 'Rear Delt Fly', 4, 4, ARRAY[12, 15, 18, 20], 45, 'Squeeze shoulder blades'),
    ('Intermediate Shoulder Sculptor', 'Overhead Press', 5, 4, ARRAY[8, 10, 12, 15], 75, 'Full range of motion'),
    ('Intermediate Shoulder Sculptor', 'Upright Row', 6, 3, ARRAY[10, 12, 15], 60, 'Elbows high'),
    ('Intermediate Shoulder Sculptor', 'Shoulder Circles', 7, 2, ARRAY[15, 20], 30, 'Both directions'),

    -- INTERMEDIATE BACK BUILDER (8 exercises)
    ('Intermediate Back Builder', 'Pull-up', 0, 4, ARRAY[5, 6, 8, 10], 90, 'Various grips'),
    ('Intermediate Back Builder', 'Inverted Row', 1, 4, ARRAY[8, 10, 12, 15], 75, 'Horizontal pulling'),
    ('Intermediate Back Builder', 'Superman', 2, 3, ARRAY[10, 12, 15], 45, 'Hold for 2 seconds'),
    ('Intermediate Back Builder', 'Reverse Fly', 3, 4, ARRAY[12, 15, 18, 20], 45, 'Rear delt focus'),
    ('Intermediate Back Builder', 'Single Arm Row', 4, 3, ARRAY[8, 10, 12], 60, 'Each arm'),
    ('Intermediate Back Builder', 'Face Pull', 5, 3, ARRAY[15, 18, 20], 45, 'High elbows'),
    ('Intermediate Back Builder', 'Lat Pulldown', 6, 4, ARRAY[10, 12, 15, 18], 60, 'Wide grip'),
    ('Intermediate Back Builder', 'Good Morning', 7, 3, ARRAY[8, 10, 12], 75, 'Hip hinge pattern'),

    -- INTERMEDIATE ARM ANNIHILATOR (8 exercises)
    ('Intermediate Arm Annihilator', 'Diamond Push-up', 0, 4, ARRAY[6, 8, 10, 12], 75, 'Tricep focus'),
    ('Intermediate Arm Annihilator', 'Tricep Dips', 1, 4, ARRAY[10, 12, 15, 18], 60, 'Full range of motion'),
    ('Intermediate Arm Annihilator', 'Close Grip Push-up', 2, 3, ARRAY[8, 10, 12], 60, 'Hands close together'),
    ('Intermediate Arm Annihilator', 'Bicep Curls', 3, 4, ARRAY[10, 12, 15, 18], 45, 'Slow negatives'),
    ('Intermediate Arm Annihilator', 'Hammer Curls', 4, 3, ARRAY[8, 10, 12], 45, 'Neutral grip'),
    ('Intermediate Arm Annihilator', 'Overhead Tricep Extension', 5, 3, ARRAY[8, 10, 12], 60, 'Behind head'),
    ('Intermediate Arm Annihilator', 'Chin-up', 6, 3, ARRAY[5, 6, 8], 90, 'Underhand grip'),
    ('Intermediate Arm Annihilator', 'Isometric Hold', 7, 3, ARRAY[15, 20, 30], 60, 'Various positions'),

    -- ADVANCED POWERLIFTING PROTOCOL (8 exercises)
    ('Advanced Powerlifting Protocol', 'Deadlift', 0, 5, ARRAY[1, 3, 5, 5, 8], 240, 'Heavy singles and triples'),
    ('Advanced Powerlifting Protocol', 'Squat', 1, 5, ARRAY[2, 3, 5, 5, 8], 180, 'Competition depth'),
    ('Advanced Powerlifting Protocol', 'Bench Press', 2, 5, ARRAY[2, 3, 5, 5, 8], 180, 'Pause reps'),
    ('Advanced Powerlifting Protocol', 'Overhead Press', 3, 4, ARRAY[3, 5, 5, 8], 120, 'Strict form'),
    ('Advanced Powerlifting Protocol', 'Barbell Row', 4, 4, ARRAY[5, 6, 8, 10], 90, 'Pendlay style'),
    ('Advanced Powerlifting Protocol', 'Romanian Deadlift', 5, 3, ARRAY[6, 8, 10], 90, 'Hip hinge focus'),
    ('Advanced Powerlifting Protocol', 'Close Grip Bench', 6, 3, ARRAY[6, 8, 10], 90, 'Tricep strength'),
    ('Advanced Powerlifting Protocol', 'Front Squat', 7, 3, ARRAY[5, 6, 8], 120, 'Core stability'),

    -- ADVANCED ENDURANCE CHALLENGE (9 exercises)
    ('Advanced Endurance Challenge', 'Running', 0, 1, NULL, 0, '45 minutes steady state'),
    ('Advanced Endurance Challenge', 'Cycling', 1, 3, NULL, 120, '15 minutes each interval'),
    ('Advanced Endurance Challenge', 'Rowing', 2, 4, NULL, 90, '10 minutes each set'),
    ('Advanced Endurance Challenge', 'Burpees', 3, 5, ARRAY[20, 25, 30, 35, 40], 60, 'Maintain pace'),
    ('Advanced Endurance Challenge', 'Mountain Climbers', 4, 4, NULL, 60, '2 minutes each set'),
    ('Advanced Endurance Challenge', 'Jump Rope', 5, 6, NULL, 45, '3 minutes each round'),
    ('Advanced Endurance Challenge', 'Plank', 6, 3, ARRAY[120, 150, 180], 90, 'Extended holds'),
    ('Advanced Endurance Challenge', 'Squat', 7, 3, ARRAY[50, 75, 100], 90, 'High volume'),
    ('Advanced Endurance Challenge', 'Cool Down Walk', 8, 1, NULL, 0, 'Recovery pace'),

    -- ADVANCED COMPETITION PREP (10 exercises)
    ('Advanced Competition Prep', 'Olympic Lift Prep', 0, 5, ARRAY[3, 3, 5, 5, 8], 180, 'Technical focus'),
    ('Advanced Competition Prep', 'Plyometric Push-up', 1, 4, ARRAY[5, 6, 8, 10], 90, 'Explosive power'),
    ('Advanced Competition Prep', 'Box Jump', 2, 4, ARRAY[5, 8, 10, 12], 90, 'Maximum height'),
    ('Advanced Competition Prep', 'Sprint Intervals', 3, 6, NULL, 120, '30 seconds all-out'),
    ('Advanced Competition Prep', 'Agility Ladder', 4, 4, NULL, 60, 'Complex patterns'),
    ('Advanced Competition Prep', 'Turkish Get-up', 5, 3, ARRAY[3, 5, 8], 120, 'Each side'),
    ('Advanced Competition Prep', 'Single Leg Squat', 6, 3, ARRAY[5, 8, 10], 90, 'Pistol progression'),
    ('Advanced Competition Prep', 'Handstand Push-up', 7, 3, ARRAY[3, 5, 8], 120, 'Wall assisted'),
    ('Advanced Competition Prep', 'Muscle-up Progression', 8, 3, ARRAY[2, 3, 5], 150, 'Advanced movement'),
    ('Advanced Competition Prep', 'Recovery Stretching', 9, 1, NULL, 0, 'Full body mobility'),

    -- ADVANCED FUNCTIONAL FITNESS (9 exercises)
    ('Advanced Functional Fitness', 'Farmer''s Walk', 0, 4, NULL, 90, '50 meters each set'),
    ('Advanced Functional Fitness', 'Turkish Get-up', 1, 3, ARRAY[3, 5, 8], 120, 'Complex movement'),
    ('Advanced Functional Fitness', 'Bear Crawl', 2, 4, ARRAY[20, 30, 40, 50], 75, 'Forward and backward'),
    ('Advanced Functional Fitness', 'Single Arm Overhead Carry', 3, 3, NULL, 90, '25 meters each arm'),
    ('Advanced Functional Fitness', 'Crab Walk', 4, 3, ARRAY[15, 20, 25], 60, 'Lateral movement'),
    ('Advanced Functional Fitness', 'Sandbag Carry', 5, 4, NULL, 90, 'Various positions'),
    ('Advanced Functional Fitness', 'Crawling Patterns', 6, 3, ARRAY[10, 15, 20], 60, 'Multiple directions'),
    ('Advanced Functional Fitness', 'Loaded Carry Medley', 7, 3, NULL, 120, 'Mixed implements'),
    ('Advanced Functional Fitness', 'Movement Flow', 8, 2, NULL, 60, 'Continuous movement'),

    -- ADVANCED METABOLIC MAYHEM (8 exercises)
    ('Advanced Metabolic Mayhem', 'Burpee Box Jump', 0, 5, NULL, 45, '45 seconds work, 15 rest'),
    ('Advanced Metabolic Mayhem', 'Thruster', 1, 5, NULL, 45, 'Squat to press'),
    ('Advanced Metabolic Mayhem', 'Renegade Row', 2, 4, NULL, 60, 'Plank position'),
    ('Advanced Metabolic Mayhem', 'Devil Press', 3, 4, NULL, 60, 'Burpee to overhead'),
    ('Advanced Metabolic Mayhem', 'Man Maker', 4, 4, NULL, 60, 'Complex movement'),
    ('Advanced Metabolic Mayhem', 'Kettlebell Swing', 5, 5, NULL, 45, 'Hip drive power'),
    ('Advanced Metabolic Mayhem', 'Battle Ropes', 6, 4, NULL, 60, 'Various patterns'),
    ('Advanced Metabolic Mayhem', 'Finisher Circuit', 7, 1, NULL, 0, 'All-out effort'),

    -- ADVANCED ELITE PERFORMANCE (12 exercises)
    ('Advanced Elite Performance', 'Complex Training Block', 0, 4, ARRAY[3, 5, 5, 8], 180, 'Strength + power'),
    ('Advanced Elite Performance', 'Reactive Strength', 1, 4, ARRAY[5, 6, 8, 10], 120, 'Depth jumps'),
    ('Advanced Elite Performance', 'Unilateral Power', 2, 3, ARRAY[5, 8, 10], 90, 'Single limb focus'),
    ('Advanced Elite Performance', 'Rotational Power', 3, 4, ARRAY[6, 8, 10, 12], 75, 'Multi-planar'),
    ('Advanced Elite Performance', 'Contrast Training', 4, 4, ARRAY[3, 5, 8, 10], 150, 'Heavy to explosive'),
    ('Advanced Elite Performance', 'Plyometric Circuit', 5, 3, NULL, 90, 'Multiple directions'),
    ('Advanced Elite Performance', 'Speed Development', 6, 5, NULL, 180, 'Acceleration focus'),
    ('Advanced Elite Performance', 'Agility Complex', 7, 4, NULL, 90, 'Change of direction'),
    ('Advanced Elite Performance', 'Power Endurance', 8, 3, NULL, 120, 'Sustained power'),
    ('Advanced Elite Performance', 'Neural Activation', 9, 3, ARRAY[3, 5, 8], 120, 'CNS preparation'),
    ('Advanced Elite Performance', 'Competition Simulation', 10, 2, NULL, 300, 'Sport-specific'),
    ('Advanced Elite Performance', 'Recovery Protocol', 11, 1, NULL, 0, 'Active recovery')
) AS exercise_data(workout_name, exercise_name, order_index, target_sets, target_reps, rest_seconds, notes)
JOIN available_exercises e ON e.name = exercise_data.exercise_name
WHERE w.name = exercise_data.workout_name;

-- Set appropriate durations for cardio and flexibility exercises
UPDATE workout_exercises we
SET target_duration_seconds = CASE 
  WHEN w.name = 'Beginner Cardio Journey' AND e.name IN ('Walking', 'Cool Down Walk') THEN 300
  WHEN w.name = 'Beginner Cardio Journey' AND e.name = 'Marching in Place' THEN 120
  WHEN w.name = 'Beginner Flexibility Flow' AND e.name IN ('Child''s Pose', 'Hamstring Stretch', 'Neck Stretch') THEN 30
  WHEN w.name = 'Beginner Flexibility Flow' AND e.name = 'Deep Breathing' THEN 180
  WHEN w.name = 'Intermediate HIIT Blast' AND e.name != 'Cool Down Jog' THEN 30
  WHEN w.name = 'Intermediate HIIT Blast' AND e.name = 'Cool Down Jog' THEN 300
  WHEN w.name = 'Intermediate Athletic Performance' AND e.name = 'Agility Ladder' THEN 30
  WHEN w.name = 'Intermediate Athletic Performance' AND e.name = 'Sprint Intervals' THEN 15
  WHEN w.name = 'Intermediate Athletic Performance' AND e.name = 'Recovery Walk' THEN 300
  WHEN w.name = 'Advanced Endurance Challenge' AND e.name = 'Running' THEN 2700
  WHEN w.name = 'Advanced Endurance Challenge' AND e.name = 'Cycling' THEN 900
  WHEN w.name = 'Advanced Endurance Challenge' AND e.name = 'Rowing' THEN 600
  WHEN w.name = 'Advanced Endurance Challenge' AND e.name = 'Mountain Climbers' THEN 120
  WHEN w.name = 'Advanced Endurance Challenge' AND e.name = 'Jump Rope' THEN 180
  WHEN w.name = 'Advanced Endurance Challenge' AND e.name = 'Cool Down Walk' THEN 300
  WHEN w.name = 'Advanced Competition Prep' AND e.name = 'Sprint Intervals' THEN 30
  WHEN w.name = 'Advanced Competition Prep' AND e.name = 'Agility Ladder' THEN 45
  WHEN w.name = 'Advanced Competition Prep' AND e.name = 'Recovery Stretching' THEN 600
  WHEN w.name = 'Advanced Functional Fitness' AND e.name LIKE '%Walk%' THEN 60
  WHEN w.name = 'Advanced Functional Fitness' AND e.name LIKE '%Carry%' THEN 45
  WHEN w.name = 'Advanced Functional Fitness' AND e.name = 'Movement Flow' THEN 120
  WHEN w.name = 'Advanced Metabolic Mayhem' AND e.name != 'Finisher Circuit' THEN 45
  WHEN w.name = 'Advanced Metabolic Mayhem' AND e.name = 'Finisher Circuit' THEN 300
  WHEN w.name = 'Advanced Elite Performance' AND e.name LIKE '%Circuit%' THEN 90
  WHEN w.name = 'Advanced Elite Performance' AND e.name = 'Speed Development' THEN 20
  WHEN w.name = 'Advanced Elite Performance' AND e.name = 'Competition Simulation' THEN 1800
  WHEN w.name = 'Advanced Elite Performance' AND e.name = 'Recovery Protocol' THEN 600
  ELSE NULL
END,
target_reps = CASE 
  WHEN we.target_duration_seconds IS NOT NULL THEN NULL
  ELSE we.target_reps
END
FROM exercises e, workouts w
WHERE we.exercise_id = e.id
  AND we.workout_id = w.id
  AND (e.exercise_type = 'cardio' OR e.exercise_type = 'flexibility' OR we.target_reps IS NULL);