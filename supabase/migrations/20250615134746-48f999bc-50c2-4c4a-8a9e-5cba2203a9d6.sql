
-- Fix workout_templates table structure and add missing data

-- Add missing columns to existing workout_templates table
ALTER TABLE public.workout_templates 
ADD COLUMN IF NOT EXISTS frequency INTEGER DEFAULT 3;

-- Add missing columns to existing workout_templates table
ALTER TABLE public.workout_templates 
ADD COLUMN IF NOT EXISTS goal TEXT DEFAULT 'general_fitness';

-- Add missing columns to existing workout_templates table  
ALTER TABLE public.workout_templates 
ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 4;

-- Add exercise progress table for tracking performance
CREATE TABLE IF NOT EXISTS public.exercise_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_progress_user_id UUID NOT NULL REFERENCES auth.users(id),
  exercise_name TEXT NOT NULL,
  recorded_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  max_weight NUMERIC,
  max_reps INTEGER,
  total_volume NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add user workout stats table
CREATE TABLE IF NOT EXISTS public.user_workout_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_workout_stats_user_id UUID NOT NULL REFERENCES auth.users(id),
  total_workouts INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  most_active_day TEXT,
  last_workout_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_workout_stats_user_id)
);

-- Add workout adaptations table for recommendations
CREATE TABLE IF NOT EXISTS public.workout_adaptations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_adaptations_user_id UUID NOT NULL REFERENCES auth.users(id),
  workout_plan_id UUID REFERENCES public.workout_plans(id),
  exercise_name TEXT,
  adaptation_type TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workout_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_adaptations ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own exercise progress' AND tablename = 'exercise_progress') THEN
        CREATE POLICY "Users can view their own exercise progress"
          ON public.exercise_progress
          FOR ALL
          USING (auth.uid() = exercise_progress_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own workout stats' AND tablename = 'user_workout_stats') THEN
        CREATE POLICY "Users can view their own workout stats"
          ON public.user_workout_stats
          FOR ALL
          USING (auth.uid() = user_workout_stats_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own workout adaptations' AND tablename = 'workout_adaptations') THEN
        CREATE POLICY "Users can view their own workout adaptations"
          ON public.workout_adaptations
          FOR ALL
          USING (auth.uid() = workout_adaptations_user_id);
    END IF;
END
$$;

-- Update existing workout templates with proper structure
UPDATE public.workout_templates 
SET 
  frequency = 3,
  goal = 'general_fitness',
  duration_weeks = 4
WHERE frequency IS NULL OR goal IS NULL OR duration_weeks IS NULL;

-- Insert sample workout templates (only if table is empty)
INSERT INTO public.workout_templates (name, description, difficulty, goal, duration_weeks, frequency, workout_days) 
SELECT 'Beginner Full Body', 'Perfect for newcomers to fitness', 'beginner', 'general_fitness', 4, 3, '[
  {
    "day_name": "Day 1 - Upper Body",
    "exercises": [
      {
        "id": "1",
        "exercise_id": "1",
        "name": "Push-ups",
        "exercise_name": "Push-ups",
        "target_muscle": "chest",
        "sets": 3,
        "reps": "8-12",
        "weight": 0,
        "rest": 60,
        "rest_time": 60,
        "rest_seconds": 60,
        "notes": "Start on knees if needed"
      }
    ]
  }
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.workout_templates WHERE name = 'Beginner Full Body');

-- Insert sample achievements with proper IDs
INSERT INTO public.achievements (id, name, description, icon, criteria, points) 
VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'First Steps', 'Complete your first workout', 'trophy', 'Complete 1 workout', 100),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Week Warrior', 'Maintain a 7-day workout streak', 'star', 'Complete workouts for 7 consecutive days', 250),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Consistency King', 'Complete 30 workouts', 'target', 'Complete 30 total workouts', 500),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'Strength Builder', 'Increase weight on any exercise by 25%', 'dumbbell', 'Increase exercise weight by 25%', 300)
ON CONFLICT (id) DO NOTHING;
