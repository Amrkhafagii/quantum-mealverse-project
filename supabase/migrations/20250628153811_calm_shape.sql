/*
  # Fix Exercise Database with Proper Muscle Categorization

  1. Clear existing exercises
  2. Add comprehensive exercise library with proper muscle group categorization
  3. Ensure each muscle group has at least 10 exercises
  4. Match exercise names with appropriate images
  5. Add proper instructions and equipment
*/

-- Clear existing exercises
DELETE FROM exercises;

-- Reset the sequence
ALTER SEQUENCE exercises_id_seq RESTART WITH 1;

-- Insert comprehensive exercise database with proper categorization
INSERT INTO exercises (name, description, instructions, muscle_groups, equipment, difficulty_level, exercise_type, demo_image_url) VALUES

-- CHEST EXERCISES (15 exercises)
('Bench Press', 'Classic chest exercise performed lying on a bench', 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up explosively', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Push-ups', 'Bodyweight chest exercise performed in plank position', 'Start in plank, lower chest to ground, push back up maintaining straight line', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Incline Bench Press', 'Chest exercise targeting upper chest fibers', 'Set bench to 30-45 degrees, press barbell from upper chest', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['barbell', 'incline bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Dumbbell Flyes', 'Isolation exercise for chest using dumbbells', 'Lie on bench, arms wide, bring dumbbells together in arc motion', ARRAY['chest'], ARRAY['dumbbells', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Decline Bench Press', 'Targets lower chest fibers', 'Set bench to decline position, press barbell from lower chest', ARRAY['chest', 'triceps'], ARRAY['barbell', 'decline bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Chest Dips', 'Bodyweight exercise targeting lower chest', 'Lean forward on dip bars, lower body, press back up', ARRAY['chest', 'triceps'], ARRAY['dip bars'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Cable Chest Flyes', 'Cable isolation exercise for chest', 'Stand between cables, bring handles together in front of chest', ARRAY['chest'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552108/pexels-photo-1552108.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Incline Dumbbell Press', 'Upper chest development with dumbbells', 'Set bench to incline, press dumbbells from upper chest', ARRAY['chest', 'shoulders'], ARRAY['dumbbells', 'incline bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552104/pexels-photo-1552104.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Pec Deck Machine', 'Machine isolation exercise for chest', 'Sit on machine, bring arms together in front of chest', ARRAY['chest'], ARRAY['pec deck machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552105/pexels-photo-1552105.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Diamond Push-ups', 'Bodyweight exercise emphasizing inner chest and triceps', 'Form diamond with hands, perform push-up with narrow grip', ARRAY['chest', 'triceps'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/416810/pexels-photo-416810.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Chest Press Machine', 'Machine-based chest exercise', 'Sit on machine, press handles forward from chest level', ARRAY['chest', 'triceps'], ARRAY['chest press machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552107/pexels-photo-1552107.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Incline Push-ups', 'Easier variation of push-ups for beginners', 'Place hands on elevated surface, perform push-up motion', ARRAY['chest', 'triceps'], ARRAY['bench'], 'beginner', 'strength', 'https://images.pexels.com/photos/416811/pexels-photo-416811.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Decline Push-ups', 'Advanced push-up variation with feet elevated', 'Place feet on elevated surface, perform push-up', ARRAY['chest', 'shoulders'], ARRAY['bench'], 'advanced', 'strength', 'https://images.pexels.com/photos/416812/pexels-photo-416812.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Pullovers', 'Exercise targeting chest and lats', 'Lie on bench, lower weight behind head, pull back over chest', ARRAY['chest', 'lats'], ARRAY['dumbbell', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552109/pexels-photo-1552109.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Wide Grip Push-ups', 'Push-up variation targeting outer chest', 'Place hands wider than shoulders, perform push-up', ARRAY['chest', 'shoulders'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/416813/pexels-photo-416813.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

-- BACK EXERCISES (15 exercises)
('Pull-ups', 'Bodyweight exercise for upper back and lats', 'Hang from bar, pull body up until chin over bar', ARRAY['lats', 'rhomboids', 'biceps'], ARRAY['pull-up bar'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552257/pexels-photo-1552257.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Deadlifts', 'Compound exercise for entire posterior chain', 'Lift barbell from ground to hip level, keep back straight', ARRAY['lats', 'traps', 'rhomboids', 'glutes'], ARRAY['barbell'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552058/pexels-photo-1552058.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Bent-over Rows', 'Rowing exercise for mid-back development', 'Bend at hips, row barbell to lower chest', ARRAY['lats', 'rhomboids', 'traps'], ARRAY['barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552259/pexels-photo-1552259.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Lat Pulldowns', 'Cable exercise targeting latissimus dorsi', 'Pull cable bar down to upper chest from overhead', ARRAY['lats', 'rhomboids'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552260/pexels-photo-1552260.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('T-Bar Rows', 'Rowing exercise using T-bar apparatus', 'Straddle T-bar, row weight to lower chest', ARRAY['lats', 'rhomboids', 'traps'], ARRAY['t-bar'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552261/pexels-photo-1552261.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Seated Cable Rows', 'Seated rowing exercise for back thickness', 'Sit upright, pull cable handle to lower chest', ARRAY['lats', 'rhomboids', 'traps'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552262/pexels-photo-1552262.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Single-arm Dumbbell Rows', 'Unilateral back exercise', 'Support body with one arm, row dumbbell with other', ARRAY['lats', 'rhomboids'], ARRAY['dumbbell', 'bench'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552263/pexels-photo-1552263.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Chin-ups', 'Pull-up variation with underhand grip', 'Hang with palms facing you, pull up to chin over bar', ARRAY['lats', 'biceps'], ARRAY['pull-up bar'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552264/pexels-photo-1552264.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Face Pulls', 'Cable exercise for rear delts and upper back', 'Pull cable to face level, focus on squeezing shoulder blades', ARRAY['rhomboids', 'traps', 'rear delts'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552265/pexels-photo-1552265.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Reverse Flyes', 'Isolation exercise for rear delts and rhomboids', 'Bend forward, raise arms out to sides', ARRAY['rhomboids', 'rear delts'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552266/pexels-photo-1552266.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Hyperextensions', 'Lower back strengthening exercise', 'Lie face down, lift torso against resistance', ARRAY['lower back', 'glutes'], ARRAY['hyperextension bench'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552267/pexels-photo-1552267.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Inverted Rows', 'Bodyweight rowing exercise', 'Lie under bar, pull chest to bar', ARRAY['lats', 'rhomboids'], ARRAY['barbell', 'rack'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552268/pexels-photo-1552268.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Shrugs', 'Trapezius isolation exercise', 'Hold weights, lift shoulders straight up', ARRAY['traps'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552269/pexels-photo-1552269.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Wide Grip Pull-ups', 'Pull-up variation targeting lats', 'Use wide grip, pull up focusing on lat engagement', ARRAY['lats', 'rhomboids'], ARRAY['pull-up bar'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552270/pexels-photo-1552270.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Good Mornings', 'Hip hinge exercise for posterior chain', 'Barbell on shoulders, hinge at hips, return to standing', ARRAY['lower back', 'glutes', 'hamstrings'], ARRAY['barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552271/pexels-photo-1552271.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

-- SHOULDERS EXERCISES (12 exercises)
('Overhead Press', 'Compound shoulder exercise', 'Press barbell from shoulders to overhead', ARRAY['shoulders', 'triceps'], ARRAY['barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552272/pexels-photo-1552272.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Lateral Raises', 'Isolation exercise for side delts', 'Raise dumbbells out to sides to shoulder height', ARRAY['shoulders'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552273/pexels-photo-1552273.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Front Raises', 'Isolation exercise for front delts', 'Raise dumbbells forward to shoulder height', ARRAY['shoulders'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552274/pexels-photo-1552274.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Rear Delt Flyes', 'Isolation exercise for rear delts', 'Bend forward, raise dumbbells out to sides', ARRAY['shoulders'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552275/pexels-photo-1552275.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Arnold Press', 'Dumbbell shoulder exercise with rotation', 'Start with palms facing you, rotate while pressing up', ARRAY['shoulders'], ARRAY['dumbbells'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552276/pexels-photo-1552276.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Upright Rows', 'Compound exercise for shoulders and traps', 'Pull barbell up along body to chest level', ARRAY['shoulders', 'traps'], ARRAY['barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552277/pexels-photo-1552277.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Pike Push-ups', 'Bodyweight shoulder exercise', 'In downward dog position, lower head toward ground', ARRAY['shoulders'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552278/pexels-photo-1552278.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Handstand Push-ups', 'Advanced bodyweight shoulder exercise', 'Against wall, lower head to ground and press back up', ARRAY['shoulders', 'triceps'], ARRAY['bodyweight'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552279/pexels-photo-1552279.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Dumbbell Shoulder Press', 'Seated or standing dumbbell press', 'Press dumbbells from shoulder level to overhead', ARRAY['shoulders', 'triceps'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552280/pexels-photo-1552280.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Cable Lateral Raises', 'Cable variation of lateral raises', 'Use cable machine to perform lateral raise motion', ARRAY['shoulders'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552281/pexels-photo-1552281.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Face Pulls', 'Cable exercise for rear delts', 'Pull cable to face, focus on external rotation', ARRAY['shoulders', 'rhomboids'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552282/pexels-photo-1552282.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Shoulder Shrugs', 'Trapezius exercise', 'Lift shoulders straight up, hold briefly', ARRAY['shoulders', 'traps'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552283/pexels-photo-1552283.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

-- ARMS EXERCISES (15 exercises)
('Bicep Curls', 'Classic bicep isolation exercise', 'Curl dumbbells from extended arms to shoulders', ARRAY['biceps'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552284/pexels-photo-1552284.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Tricep Dips', 'Bodyweight tricep exercise', 'Lower body by bending arms, press back up', ARRAY['triceps'], ARRAY['bench'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552285/pexels-photo-1552285.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Hammer Curls', 'Bicep exercise with neutral grip', 'Curl dumbbells with palms facing each other', ARRAY['biceps', 'forearms'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552286/pexels-photo-1552286.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Tricep Extensions', 'Isolation exercise for triceps', 'Extend arms overhead, lower weight behind head', ARRAY['triceps'], ARRAY['dumbbell'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552287/pexels-photo-1552287.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Preacher Curls', 'Bicep exercise using preacher bench', 'Curl barbell with arms supported on angled pad', ARRAY['biceps'], ARRAY['barbell', 'preacher bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552288/pexels-photo-1552288.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Close-grip Bench Press', 'Tricep-focused bench press variation', 'Bench press with hands closer together', ARRAY['triceps', 'chest'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552289/pexels-photo-1552289.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Cable Curls', 'Bicep exercise using cable machine', 'Curl cable handle from extended position', ARRAY['biceps'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552290/pexels-photo-1552290.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Tricep Pushdowns', 'Cable tricep isolation exercise', 'Push cable handle down, extend arms fully', ARRAY['triceps'], ARRAY['cable machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552291/pexels-photo-1552291.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Concentration Curls', 'Isolated bicep exercise', 'Sit, brace elbow on thigh, curl dumbbell', ARRAY['biceps'], ARRAY['dumbbell'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552292/pexels-photo-1552292.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Overhead Tricep Extension', 'Tricep exercise with weight overhead', 'Hold weight overhead, lower behind head', ARRAY['triceps'], ARRAY['dumbbell'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552293/pexels-photo-1552293.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('21s Bicep Curls', 'Advanced bicep training method', 'Perform 7 partial reps bottom, 7 top, 7 full range', ARRAY['biceps'], ARRAY['barbell'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552294/pexels-photo-1552294.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Diamond Push-ups', 'Tricep-focused push-up variation', 'Form diamond with hands, perform push-up', ARRAY['triceps', 'chest'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552295/pexels-photo-1552295.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Wrist Curls', 'Forearm strengthening exercise', 'Curl wrists up and down with light weight', ARRAY['forearms'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552296/pexels-photo-1552296.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Reverse Curls', 'Bicep exercise with overhand grip', 'Curl barbell with palms facing down', ARRAY['biceps', 'forearms'], ARRAY['barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552297/pexels-photo-1552297.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Tricep Kickbacks', 'Isolation exercise for triceps', 'Bend forward, extend arm back from bent position', ARRAY['triceps'], ARRAY['dumbbells'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552298/pexels-photo-1552298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

-- LEGS EXERCISES (18 exercises)
('Squats', 'Fundamental lower body exercise', 'Lower body by bending knees, return to standing', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['barbell'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552100/pexels-photo-1552100.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Lunges', 'Unilateral leg exercise', 'Step forward, lower back knee, return to standing', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552299/pexels-photo-1552299.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Romanian Deadlifts', 'Hip hinge exercise for hamstrings', 'Hinge at hips, lower weight, return to standing', ARRAY['hamstrings', 'glutes'], ARRAY['barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552300/pexels-photo-1552300.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Leg Press', 'Machine-based leg exercise', 'Press weight away from body using legs', ARRAY['quadriceps', 'glutes'], ARRAY['leg press machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552301/pexels-photo-1552301.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Calf Raises', 'Isolation exercise for calves', 'Rise up on toes, lower slowly', ARRAY['calves'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552302/pexels-photo-1552302.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Bulgarian Split Squats', 'Single-leg squat variation', 'Rear foot elevated, squat with front leg', ARRAY['quadriceps', 'glutes'], ARRAY['bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552303/pexels-photo-1552303.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Leg Curls', 'Hamstring isolation exercise', 'Curl legs up against resistance', ARRAY['hamstrings'], ARRAY['leg curl machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552304/pexels-photo-1552304.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Leg Extensions', 'Quadriceps isolation exercise', 'Extend legs against resistance', ARRAY['quadriceps'], ARRAY['leg extension machine'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552305/pexels-photo-1552305.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Goblet Squats', 'Squat variation holding weight at chest', 'Hold dumbbell at chest, perform squat', ARRAY['quadriceps', 'glutes'], ARRAY['dumbbell'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552306/pexels-photo-1552306.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Step-ups', 'Unilateral leg exercise using platform', 'Step up onto platform, step back down', ARRAY['quadriceps', 'glutes'], ARRAY['platform'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552307/pexels-photo-1552307.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Wall Sits', 'Isometric quadriceps exercise', 'Sit against wall with thighs parallel to ground', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552308/pexels-photo-1552308.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Jump Squats', 'Explosive squat variation', 'Perform squat, jump up explosively', ARRAY['quadriceps', 'glutes', 'calves'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552309/pexels-photo-1552309.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Single-leg Deadlifts', 'Unilateral hip hinge exercise', 'Balance on one leg, hinge at hip', ARRAY['hamstrings', 'glutes'], ARRAY['dumbbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552310/pexels-photo-1552310.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Sumo Squats', 'Wide-stance squat variation', 'Squat with wide stance, toes pointed out', ARRAY['quadriceps', 'glutes', 'adductors'], ARRAY['dumbbell'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552311/pexels-photo-1552311.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Pistol Squats', 'Advanced single-leg squat', 'Squat on one leg, other leg extended forward', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552312/pexels-photo-1552312.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Glute Bridges', 'Hip extension exercise for glutes', 'Lie on back, lift hips up, squeeze glutes', ARRAY['glutes', 'hamstrings'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552313/pexels-photo-1552313.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Hip Thrusts', 'Advanced glute exercise', 'Shoulders on bench, thrust hips up with weight', ARRAY['glutes', 'hamstrings'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552314/pexels-photo-1552314.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Lateral Lunges', 'Side-to-side lunge variation', 'Step to side, lower into lunge position', ARRAY['quadriceps', 'glutes', 'adductors'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552315/pexels-photo-1552315.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

-- CORE EXERCISES (12 exercises)
('Plank', 'Isometric core strengthening exercise', 'Hold straight line from head to heels', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552316/pexels-photo-1552316.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Crunches', 'Basic abdominal exercise', 'Lie on back, lift shoulders off ground', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552317/pexels-photo-1552317.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Russian Twists', 'Rotational core exercise', 'Sit with feet up, rotate torso side to side', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552318/pexels-photo-1552318.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Mountain Climbers', 'Dynamic core and cardio exercise', 'In plank position, alternate bringing knees to chest', ARRAY['core'], ARRAY['bodyweight'], 'intermediate', 'cardio', 'https://images.pexels.com/photos/1552319/pexels-photo-1552319.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Dead Bug', 'Core stability exercise', 'Lie on back, extend opposite arm and leg', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552320/pexels-photo-1552320.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Bicycle Crunches', 'Dynamic abdominal exercise', 'Alternate bringing elbow to opposite knee', ARRAY['core'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552321/pexels-photo-1552321.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Side Plank', 'Lateral core strengthening exercise', 'Hold side position, body in straight line', ARRAY['core'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552322/pexels-photo-1552322.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Leg Raises', 'Lower abdominal exercise', 'Lie on back, raise legs to vertical position', ARRAY['core'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552323/pexels-photo-1552323.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Hollow Body Hold', 'Advanced core isometric exercise', 'Lie on back, lift shoulders and legs off ground', ARRAY['core'], ARRAY['bodyweight'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552324/pexels-photo-1552324.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Wood Chops', 'Rotational core exercise with weight', 'Rotate weight from high to low across body', ARRAY['core'], ARRAY['dumbbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552325/pexels-photo-1552325.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Hanging Knee Raises', 'Advanced lower abdominal exercise', 'Hang from bar, bring knees to chest', ARRAY['core'], ARRAY['pull-up bar'], 'advanced', 'strength', 'https://images.pexels.com/photos/1552326/pexels-photo-1552326.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Bear Crawl', 'Dynamic core and full-body exercise', 'Crawl forward on hands and feet', ARRAY['core'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552327/pexels-photo-1552327.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

-- GLUTES EXERCISES (10 exercises)
('Hip Thrusts', 'Primary glute development exercise', 'Shoulders on bench, thrust hips up with weight', ARRAY['glutes', 'hamstrings'], ARRAY['barbell', 'bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552328/pexels-photo-1552328.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Glute Bridges', 'Basic glute activation exercise', 'Lie on back, lift hips up, squeeze glutes', ARRAY['glutes', 'hamstrings'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552329/pexels-photo-1552329.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Bulgarian Split Squats', 'Unilateral glute exercise', 'Rear foot elevated, squat with front leg', ARRAY['glutes', 'quadriceps'], ARRAY['bench'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552330/pexels-photo-1552330.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Clamshells', 'Glute activation exercise', 'Lie on side, open top knee like clamshell', ARRAY['glutes'], ARRAY['resistance band'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552331/pexels-photo-1552331.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Fire Hydrants', 'Glute isolation exercise', 'On hands and knees, lift leg out to side', ARRAY['glutes'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552332/pexels-photo-1552332.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Single-leg Glute Bridges', 'Unilateral glute exercise', 'Bridge with one leg extended', ARRAY['glutes', 'hamstrings'], ARRAY['bodyweight'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552333/pexels-photo-1552333.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Curtsy Lunges', 'Multi-planar glute exercise', 'Step back and across into curtsy position', ARRAY['glutes', 'quadriceps'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552334/pexels-photo-1552334.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Donkey Kicks', 'Glute isolation exercise', 'On hands and knees, kick leg back and up', ARRAY['glutes'], ARRAY['bodyweight'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552335/pexels-photo-1552335.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Lateral Band Walks', 'Glute activation with resistance', 'Step sideways with resistance band around legs', ARRAY['glutes'], ARRAY['resistance band'], 'beginner', 'strength', 'https://images.pexels.com/photos/1552336/pexels-photo-1552336.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Sumo Deadlifts', 'Wide-stance deadlift for glutes', 'Deadlift with wide stance, emphasize glutes', ARRAY['glutes', 'hamstrings'], ARRAY['barbell'], 'intermediate', 'strength', 'https://images.pexels.com/photos/1552337/pexels-photo-1552337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

-- CARDIO EXERCISES (10 exercises)
('Running', 'Classic cardiovascular exercise', 'Maintain steady pace for extended duration', ARRAY['full body'], ARRAY['none'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552338/pexels-photo-1552338.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Jumping Jacks', 'Full-body cardio exercise', 'Jump while spreading legs and raising arms', ARRAY['full body'], ARRAY['bodyweight'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552339/pexels-photo-1552339.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Burpees', 'High-intensity full-body exercise', 'Squat, jump back to plank, jump forward, jump up', ARRAY['full body'], ARRAY['bodyweight'], 'intermediate', 'cardio', 'https://images.pexels.com/photos/1552340/pexels-photo-1552340.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('High Knees', 'Running in place with high knee lift', 'Run in place, bring knees to chest level', ARRAY['full body'], ARRAY['bodyweight'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552341/pexels-photo-1552341.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Butt Kickers', 'Running in place kicking heels to glutes', 'Run in place, kick heels toward glutes', ARRAY['full body'], ARRAY['bodyweight'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552342/pexels-photo-1552342.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Jump Rope', 'Cardiovascular exercise with rope', 'Jump over rope as it passes under feet', ARRAY['full body'], ARRAY['jump rope'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552343/pexels-photo-1552343.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Rowing', 'Full-body cardio on rowing machine', 'Pull handle to chest, extend legs and arms', ARRAY['full body'], ARRAY['rowing machine'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552344/pexels-photo-1552344.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Cycling', 'Lower body cardiovascular exercise', 'Pedal at steady pace for extended duration', ARRAY['legs'], ARRAY['bicycle'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552345/pexels-photo-1552345.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Stair Climbing', 'Lower body cardio exercise', 'Climb stairs at steady pace', ARRAY['legs'], ARRAY['stairs'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552346/pexels-photo-1552346.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),

('Swimming', 'Full-body low-impact cardio', 'Swim laps using various strokes', ARRAY['full body'], ARRAY['pool'], 'beginner', 'cardio', 'https://images.pexels.com/photos/1552347/pexels-photo-1552347.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2');