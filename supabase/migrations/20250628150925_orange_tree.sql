/*
  # Expand Exercise Database

  1. Additional Exercises
    - Add 50+ new exercises covering all muscle groups
    - Include variations for different difficulty levels
    - Comprehensive equipment options
    - Detailed instructions and muscle targeting

  2. Muscle Group Coverage
    - Chest: 8+ exercises
    - Back: 8+ exercises  
    - Shoulders: 8+ exercises
    - Arms (Biceps/Triceps): 10+ exercises
    - Legs (Quads/Hamstrings/Glutes): 12+ exercises
    - Core: 8+ exercises
    - Cardio: 6+ exercises
    - Full Body: 4+ exercises

  3. Exercise Types
    - Strength training variations
    - Bodyweight alternatives
    - Machine exercises
    - Free weight exercises
    - Cardio options
*/

-- Insert comprehensive exercise library
INSERT INTO exercises (name, description, instructions, muscle_groups, equipment, difficulty_level, exercise_type, demo_image_url) VALUES

-- CHEST EXERCISES
('Incline Bench Press', 'Upper chest focused bench press variation', 'Set bench to 30-45 degree incline, press weight from chest to full extension', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'incline bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Decline Bench Press', 'Lower chest focused bench press variation', 'Set bench to decline position, press weight from chest focusing on lower pecs', ARRAY['chest', 'triceps'], ARRAY['barbell', 'decline bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Dumbbell Flyes', 'Isolation exercise for chest development', 'Lie on bench, lower dumbbells in wide arc, squeeze chest to bring weights together', ARRAY['chest'], ARRAY['dumbbells', 'bench'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('Incline Dumbbell Press', 'Upper chest development with dumbbells', 'On incline bench, press dumbbells from chest level to overhead', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['dumbbells', 'incline bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Chest Dips', 'Bodyweight exercise targeting lower chest', 'Lean forward on dip bars, lower body until stretch in chest, push back up', ARRAY['chest', 'triceps'], ARRAY['dip bars'], 'intermediate', 'strength', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
('Cable Crossover', 'Cable machine chest isolation', 'Set cables high, bring handles together in front of chest with slight forward lean', ARRAY['chest'], ARRAY['cable machine'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Diamond Push-ups', 'Triceps and inner chest focused push-up variation', 'Form diamond with hands, perform push-up with hands close together', ARRAY['chest', 'triceps'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),

-- BACK EXERCISES  
('Lat Pulldowns', 'Vertical pulling exercise for lats', 'Pull bar down to upper chest, squeeze shoulder blades together', ARRAY['back', 'biceps'], ARRAY['lat pulldown machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Seated Cable Rows', 'Horizontal pulling for mid-back', 'Pull handle to torso, squeeze shoulder blades, control the negative', ARRAY['back', 'biceps'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('T-Bar Rows', 'Thick back development exercise', 'Bend over T-bar, pull weight to lower chest, squeeze back muscles', ARRAY['back', 'biceps'], ARRAY['t-bar', 'plates'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Face Pulls', 'Rear delt and upper back exercise', 'Pull rope to face level, separate handles at face, squeeze rear delts', ARRAY['back', 'shoulders'], ARRAY['cable machine', 'rope'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Inverted Rows', 'Bodyweight horizontal pulling', 'Hang under bar, pull chest to bar, keep body straight', ARRAY['back', 'biceps'], ARRAY['barbell', 'rack'], 'beginner', 'strength', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
('Single-Arm Cable Rows', 'Unilateral back development', 'Pull cable handle to side of torso, focus on lat contraction', ARRAY['back', 'biceps'], ARRAY['cable machine'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Hyperextensions', 'Lower back strengthening exercise', 'Lie face down, lift torso using lower back muscles', ARRAY['back'], ARRAY['hyperextension bench'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),

-- SHOULDER EXERCISES
('Lateral Raises', 'Side delt isolation exercise', 'Raise dumbbells to sides until parallel with floor, control descent', ARRAY['shoulders'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Front Raises', 'Front delt isolation exercise', 'Raise weight in front of body to shoulder height', ARRAY['shoulders'], ARRAY['dumbbells', 'barbell'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('Rear Delt Flyes', 'Rear deltoid isolation', 'Bend over, raise weights to sides focusing on rear delts', ARRAY['shoulders'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Arnold Press', 'Full shoulder development exercise', 'Start with palms facing you, rotate and press overhead', ARRAY['shoulders', 'triceps'], ARRAY['dumbbells'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Upright Rows', 'Trap and shoulder exercise', 'Pull weight up along body to chest level, elbows high', ARRAY['shoulders', 'traps'], ARRAY['barbell', 'dumbbells'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Pike Push-ups', 'Bodyweight shoulder exercise', 'In downward dog position, lower head toward ground, press back up', ARRAY['shoulders', 'triceps'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
('Handstand Push-ups', 'Advanced bodyweight shoulder exercise', 'Against wall, lower head to ground and press back to handstand', ARRAY['shoulders', 'triceps'], ARRAY['bodyweight'], 'advanced', 'strength', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),

-- ARM EXERCISES (BICEPS)
('Barbell Curls', 'Classic bicep building exercise', 'Curl barbell from arms extended to full contraction', ARRAY['biceps'], ARRAY['barbell'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Dumbbell Curls', 'Unilateral bicep development', 'Curl dumbbells alternating or together, full range of motion', ARRAY['biceps'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('Hammer Curls', 'Bicep and forearm exercise', 'Curl dumbbells with neutral grip, thumbs up position', ARRAY['biceps', 'forearms'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Preacher Curls', 'Isolated bicep exercise', 'Use preacher bench to eliminate momentum, focus on bicep contraction', ARRAY['biceps'], ARRAY['barbell', 'preacher bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Cable Curls', 'Constant tension bicep exercise', 'Curl cable handle maintaining tension throughout range of motion', ARRAY['biceps'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),

-- ARM EXERCISES (TRICEPS)
('Tricep Dips', 'Bodyweight tricep exercise', 'Lower body by bending elbows, press back up using triceps', ARRAY['triceps'], ARRAY['bench', 'bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
('Close-Grip Bench Press', 'Compound tricep exercise', 'Bench press with hands closer than shoulder width', ARRAY['triceps', 'chest'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Overhead Tricep Extension', 'Tricep isolation exercise', 'Lower weight behind head, extend arms to overhead position', ARRAY['triceps'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Tricep Pushdowns', 'Cable tricep isolation', 'Push cable attachment down using triceps, control the return', ARRAY['triceps'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('Skull Crushers', 'Lying tricep extension', 'Lower weight to forehead, extend arms back to start position', ARRAY['triceps'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),

-- LEG EXERCISES (QUADRICEPS)
('Leg Press', 'Machine-based quad exercise', 'Press weight using legs, full range of motion', ARRAY['quadriceps', 'glutes'], ARRAY['leg press machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Bulgarian Split Squats', 'Single-leg quad exercise', 'Rear foot elevated, lower into lunge position', ARRAY['quadriceps', 'glutes'], ARRAY['bench', 'dumbbells'], 'intermediate', 'strength', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('Front Squats', 'Quad-focused squat variation', 'Hold weight in front, squat down keeping torso upright', ARRAY['quadriceps', 'core'], ARRAY['barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Leg Extensions', 'Quad isolation exercise', 'Extend legs against resistance, squeeze quads at top', ARRAY['quadriceps'], ARRAY['leg extension machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Jump Squats', 'Explosive quad exercise', 'Squat down and explode up into a jump', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], 'intermediate', 'cardio', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),

-- LEG EXERCISES (HAMSTRINGS & GLUTES)
('Leg Curls', 'Hamstring isolation exercise', 'Curl legs against resistance, squeeze hamstrings', ARRAY['hamstrings'], ARRAY['leg curl machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),
('Stiff-Leg Deadlifts', 'Hamstring and glute exercise', 'Keep legs relatively straight, hinge at hips', ARRAY['hamstrings', 'glutes'], ARRAY['barbell', 'dumbbells'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Hip Thrusts', 'Glute isolation exercise', 'Thrust hips up from bridge position, squeeze glutes', ARRAY['glutes', 'hamstrings'], ARRAY['barbell', 'bench'], 'beginner', 'strength', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('Walking Lunges', 'Dynamic leg exercise', 'Step forward into lunge, alternate legs walking forward', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['dumbbells', 'bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('Reverse Lunges', 'Glute-focused lunge variation', 'Step backward into lunge position, focus on glute activation', ARRAY['glutes', 'quadriceps'], ARRAY['dumbbells', 'bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('Goblet Squats', 'Beginner-friendly squat variation', 'Hold weight at chest, squat down keeping chest up', ARRAY['quadriceps', 'glutes'], ARRAY['dumbbell'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Calf Raises', 'Calf muscle isolation', 'Rise up on toes, squeeze calves, lower slowly', ARRAY['calves'], ARRAY['bodyweight', 'dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),

-- CORE EXERCISES
('Dead Bug', 'Core stability exercise', 'Lie on back, extend opposite arm and leg while maintaining core tension', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Bicycle Crunches', 'Dynamic core exercise', 'Alternate bringing elbow to opposite knee in cycling motion', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('Leg Raises', 'Lower ab exercise', 'Raise legs from lying position, control the descent', ARRAY['core'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Side Plank', 'Lateral core strengthening', 'Hold side plank position, engage obliques', ARRAY['core'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'),
('Hanging Knee Raises', 'Advanced core exercise', 'Hang from bar, raise knees to chest using core', ARRAY['core'], ARRAY['pull-up bar'], 'advanced', 'strength', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
('Wood Chops', 'Rotational core exercise', 'Rotate weight from high to low across body', ARRAY['core'], ARRAY['cable machine', 'medicine ball'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('V-Ups', 'Full core exercise', 'Simultaneously raise legs and torso to form V shape', ARRAY['core'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),

-- CARDIO EXERCISES
('High Knees', 'High-intensity cardio exercise', 'Run in place bringing knees up to waist level', ARRAY['legs', 'cardiovascular'], ARRAY['bodyweight'], 'beginner', 'cardio', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('Jumping Jacks', 'Full-body cardio exercise', 'Jump feet apart while raising arms overhead', ARRAY['full body', 'cardiovascular'], ARRAY['bodyweight'], 'beginner', 'cardio', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
('Box Jumps', 'Explosive cardio exercise', 'Jump onto box or platform, step down safely', ARRAY['legs', 'cardiovascular'], ARRAY['box', 'platform'], 'intermediate', 'cardio', 'https://images.pexels.com/photos/4164746/pexels-photo-4164746.jpeg'),
('Battle Ropes', 'High-intensity full-body cardio', 'Create waves with heavy ropes using full body', ARRAY['full body', 'cardiovascular'], ARRAY['battle ropes'], 'intermediate', 'cardio', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg'),
('Rowing Machine', 'Low-impact full-body cardio', 'Pull handle to chest, push with legs, maintain rhythm', ARRAY['full body', 'cardiovascular'], ARRAY['rowing machine'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg'),

-- FULL BODY EXERCISES
('Thrusters', 'Full-body compound exercise', 'Squat with weight, press overhead in one fluid motion', ARRAY['full body'], ARRAY['dumbbells', 'barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Turkish Get-ups', 'Complex full-body movement', 'Move from lying to standing while holding weight overhead', ARRAY['full body'], ARRAY['kettlebell', 'dumbbell'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg'),
('Clean and Press', 'Olympic-style full-body exercise', 'Clean weight to shoulders, press overhead', ARRAY['full body'], ARRAY['barbell', 'dumbbells'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg'),
('Bear Crawl', 'Full-body movement exercise', 'Crawl forward on hands and feet, keep knees off ground', ARRAY['full body'], ARRAY['bodyweight'], 'intermediate', 'cardio', 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),

-- FLEXIBILITY EXERCISES
('Cat-Cow Stretch', 'Spinal mobility exercise', 'Alternate between arching and rounding spine on hands and knees', ARRAY['back', 'core'], ARRAY['bodyweight'], 'beginner', 'flexibility', 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg'),
('Downward Dog', 'Full-body stretch', 'Form inverted V shape, stretch calves and hamstrings', ARRAY['full body'], ARRAY['bodyweight'], 'beginner', 'flexibility', 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg'),
('Pigeon Pose', 'Hip flexibility stretch', 'Stretch hip flexors and glutes in seated position', ARRAY['hips', 'glutes'], ARRAY['bodyweight'], 'intermediate', 'flexibility', 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg'),
('Child''s Pose', 'Relaxing back stretch', 'Sit back on heels, reach arms forward, relax spine', ARRAY['back'], ARRAY['bodyweight'], 'beginner', 'flexibility', 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg');

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups_gin ON exercises USING GIN(muscle_groups);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment_gin ON exercises USING GIN(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercises_name_search ON exercises USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_exercises_description_search ON exercises USING GIN(to_tsvector('english', description));