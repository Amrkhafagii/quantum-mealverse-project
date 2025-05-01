
-- Create workout plans table
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT NOT NULL,
  frequency INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  workout_days JSONB NOT NULL
);

-- Create workout logs table
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration INTEGER NOT NULL,
  calories_burned INTEGER,
  notes TEXT,
  completed_exercises JSONB NOT NULL
);

-- Create workout history table
CREATE TABLE IF NOT EXISTS public.workout_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  workout_log_id UUID NOT NULL REFERENCES public.workout_logs(id),
  workout_plan_name TEXT NOT NULL,
  workout_day_name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  exercises_completed INTEGER NOT NULL,
  total_exercises INTEGER NOT NULL,
  calories_burned INTEGER
);

-- Create workout schedules table
CREATE TABLE IF NOT EXISTS public.workout_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id),
  start_date DATE NOT NULL,
  end_date DATE,
  days_of_week INTEGER[] NOT NULL,
  preferred_time TIME,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Create user streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  currentStreak INTEGER NOT NULL DEFAULT 0,
  longestStreak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE NOT NULL,
  streak_type TEXT NOT NULL,
  UNIQUE(user_id, streak_type)
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[] NOT NULL,
  equipment_needed TEXT[],
  difficulty TEXT NOT NULL,
  instructions TEXT[],
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  date_achieved TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Add RLS policies
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Users can view their own workout plans"
  ON public.workout_plans
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own workout plans"
  ON public.workout_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own workout plans"
  ON public.workout_plans
  FOR UPDATE
  USING (auth.uid() = user_id);
  
-- Repeat similar policies for other tables
CREATE POLICY "Users can view their own workout logs"
  ON public.workout_logs
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own workout logs"
  ON public.workout_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can view their own workout history"
  ON public.workout_history
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own workout history"
  ON public.workout_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can view their own workout schedules"
  ON public.workout_schedules
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own workout schedules"
  ON public.workout_schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own workout schedules"
  ON public.workout_schedules
  FOR UPDATE
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can view their own streaks"
  ON public.user_streaks
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Grant public access to exercises and achievements tables
CREATE POLICY "Anyone can view exercises" 
  ON public.exercises 
  FOR SELECT 
  USING (true);
  
CREATE POLICY "Anyone can view achievements" 
  ON public.achievements 
  FOR SELECT 
  USING (true);
