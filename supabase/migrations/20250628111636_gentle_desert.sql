/*
  # Complete Fitness App Database Schema

  1. New Tables
    - `profiles` - User profile information extending Supabase auth
    - `exercises` - Exercise library with details and instructions
    - `workouts` - Workout templates and user-created workouts
    - `workout_exercises` - Junction table linking workouts to exercises
    - `workout_sessions` - Individual workout session records
    - `session_exercises` - Exercises performed in a specific session
    - `exercise_sets` - Individual sets within an exercise
    - `personal_records` - User's personal records for exercises
    - `achievements` - Achievement definitions
    - `user_achievements` - User's unlocked achievements
    - `social_posts` - Social feed posts
    - `post_likes` - Likes on social posts
    - `post_comments` - Comments on social posts
    - `friendships` - User friendship relationships
    - `workout_streaks` - User workout streak tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate

  3. Features
    - Complete user profile management
    - Exercise library with muscle groups and difficulty levels
    - Workout creation and tracking
    - Personal records and progress tracking
    - Achievement system
    - Social features (posts, likes, comments, friends)
    - Streak tracking
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_units TEXT CHECK (preferred_units IN ('metric', 'imperial')) DEFAULT 'metric',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  exercise_type TEXT CHECK (exercise_type IN ('strength', 'cardio', 'flexibility', 'balance')) DEFAULT 'strength',
  demo_video_url TEXT,
  demo_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts table (templates and user workouts)
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  estimated_duration_minutes INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  workout_type TEXT CHECK (workout_type IN ('strength', 'cardio', 'hiit', 'flexibility', 'mixed')) DEFAULT 'strength',
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for workout exercises
CREATE TABLE IF NOT EXISTS workout_exercises (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps INTEGER[],
  target_weight_kg DECIMAL(6,2),
  target_duration_seconds INTEGER,
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout sessions (actual workout instances)
CREATE TABLE IF NOT EXISTS workout_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  workout_id INTEGER REFERENCES workouts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises performed in a session
CREATE TABLE IF NOT EXISTS session_exercises (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual sets within an exercise
CREATE TABLE IF NOT EXISTS exercise_sets (
  id SERIAL PRIMARY KEY,
  session_exercise_id INTEGER REFERENCES session_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg DECIMAL(6,2),
  duration_seconds INTEGER,
  distance_meters DECIMAL(8,2),
  rest_seconds INTEGER,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal records
CREATE TABLE IF NOT EXISTS personal_records (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  record_type TEXT CHECK (record_type IN ('max_weight', 'max_reps', 'max_distance', 'best_time')) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  session_id INTEGER REFERENCES workout_sessions(id) ON DELETE SET NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id, record_type)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT CHECK (category IN ('workout', 'strength', 'endurance', 'consistency', 'social')) DEFAULT 'workout',
  criteria JSONB NOT NULL, -- Flexible criteria definition
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress JSONB, -- Track progress towards achievement
  UNIQUE(user_id, achievement_id)
);

-- Social posts
CREATE TABLE IF NOT EXISTS social_posts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT CHECK (post_type IN ('workout', 'achievement', 'progress', 'general')) DEFAULT 'general',
  workout_session_id INTEGER REFERENCES workout_sessions(id) ON DELETE SET NULL,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE SET NULL,
  media_urls TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES social_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES social_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendships
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Workout streaks
CREATE TABLE IF NOT EXISTS workout_streaks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  streak_start_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_streaks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view public profiles" ON profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Exercises policies (public read, admin write)
CREATE POLICY "Anyone can view exercises" ON exercises
  FOR SELECT USING (true);

-- Workouts policies
CREATE POLICY "Users can view public workouts and own workouts" ON workouts
  FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create workouts" ON workouts
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (creator_id = auth.uid());

-- Workout exercises policies
CREATE POLICY "Users can view workout exercises for accessible workouts" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts w 
      WHERE w.id = workout_id 
      AND (w.is_public = true OR w.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage workout exercises for own workouts" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts w 
      WHERE w.id = workout_id 
      AND w.creator_id = auth.uid()
    )
  );

-- Workout sessions policies
CREATE POLICY "Users can manage own workout sessions" ON workout_sessions
  FOR ALL USING (user_id = auth.uid());

-- Session exercises policies
CREATE POLICY "Users can manage own session exercises" ON session_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws 
      WHERE ws.id = session_id 
      AND ws.user_id = auth.uid()
    )
  );

-- Exercise sets policies
CREATE POLICY "Users can manage own exercise sets" ON exercise_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM session_exercises se
      JOIN workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = session_exercise_id 
      AND ws.user_id = auth.uid()
    )
  );

-- Personal records policies
CREATE POLICY "Users can view public personal records" ON personal_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = user_id 
      AND (p.is_public = true OR p.id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own personal records" ON personal_records
  FOR ALL USING (user_id = auth.uid());

-- Achievements policies
CREATE POLICY "Anyone can view active achievements" ON achievements
  FOR SELECT USING (is_active = true);

-- User achievements policies
CREATE POLICY "Users can view public user achievements" ON user_achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = user_id 
      AND (p.is_public = true OR p.id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own achievements" ON user_achievements
  FOR ALL USING (user_id = auth.uid());

-- Social posts policies
CREATE POLICY "Users can view public posts and own posts" ON social_posts
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create posts" ON social_posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON social_posts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON social_posts
  FOR DELETE USING (user_id = auth.uid());

-- Post likes policies
CREATE POLICY "Users can view likes on public posts" ON post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM social_posts sp 
      WHERE sp.id = post_id 
      AND (sp.is_public = true OR sp.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own likes" ON post_likes
  FOR ALL USING (user_id = auth.uid());

-- Post comments policies
CREATE POLICY "Users can view comments on public posts" ON post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM social_posts sp 
      WHERE sp.id = post_id 
      AND (sp.is_public = true OR sp.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments on public posts" ON post_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM social_posts sp 
      WHERE sp.id = post_id 
      AND sp.is_public = true
    )
  );

CREATE POLICY "Users can update own comments" ON post_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON post_comments
  FOR DELETE USING (user_id = auth.uid());

-- Friendships policies
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friendship requests" ON friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update friendships they're involved in" ON friendships
  FOR UPDATE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Workout streaks policies
CREATE POLICY "Users can view public streaks" ON workout_streaks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = user_id 
      AND (p.is_public = true OR p.id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own streak" ON workout_streaks
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
CREATE INDEX IF NOT EXISTS idx_workouts_creator ON workouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_workouts_public ON workouts(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise ON personal_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(requester_id, addressee_id);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Initialize workout streak
  INSERT INTO public.workout_streaks (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update workout streaks
CREATE OR REPLACE FUNCTION public.update_workout_streak(user_uuid UUID)
RETURNS void AS $$
DECLARE
  last_workout_date DATE;
  current_date DATE := CURRENT_DATE;
  streak_record RECORD;
BEGIN
  -- Get the user's last workout date
  SELECT DATE(completed_at) INTO last_workout_date
  FROM workout_sessions
  WHERE user_id = user_uuid AND completed_at IS NOT NULL
  ORDER BY completed_at DESC
  LIMIT 1;

  -- Get current streak record
  SELECT * INTO streak_record
  FROM workout_streaks
  WHERE user_id = user_uuid;

  IF last_workout_date IS NULL THEN
    -- No workouts yet, reset streak
    UPDATE workout_streaks
    SET current_streak = 0,
        last_workout_date = NULL,
        streak_start_date = NULL,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    RETURN;
  END IF;

  IF last_workout_date = current_date THEN
    -- Workout today
    IF streak_record.last_workout_date = current_date - INTERVAL '1 day' OR 
       streak_record.last_workout_date IS NULL THEN
      -- Continue or start streak
      UPDATE workout_streaks
      SET current_streak = COALESCE(current_streak, 0) + 1,
          longest_streak = GREATEST(COALESCE(longest_streak, 0), COALESCE(current_streak, 0) + 1),
          last_workout_date = current_date,
          streak_start_date = COALESCE(streak_start_date, current_date),
          updated_at = NOW()
      WHERE user_id = user_uuid;
    END IF;
  ELSIF last_workout_date < current_date - INTERVAL '1 day' THEN
    -- Streak broken
    UPDATE workout_streaks
    SET current_streak = 0,
        last_workout_date = last_workout_date,
        streak_start_date = NULL,
        updated_at = NOW()
    WHERE user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;