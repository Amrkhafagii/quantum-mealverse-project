-- Phase 1: Critical Database Security Fixes (Fixed version)

-- 1. Fix progress-photos storage bucket security
-- First, let's make the bucket private and add proper policies
UPDATE storage.buckets 
SET public = false 
WHERE id = 'progress-photos';

-- Check if storage policies exist before creating them
DO $$
BEGIN
  -- Users can view their own progress photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view their own progress photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own progress photos" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = ''progress-photos'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;

  -- Users can upload their own progress photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own progress photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload their own progress photos" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
      bucket_id = ''progress-photos'' 
      AND auth.uid()::text = (storage.foldername(name))[1]
      AND (storage.extension(name)) = ANY(ARRAY[''jpg'', ''jpeg'', ''png'', ''webp''])
      AND length(name) <= 255
    )';
  END IF;

  -- Users can update their own progress photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own progress photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own progress photos" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = ''progress-photos'' AND auth.uid()::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = ''progress-photos'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;

  -- Users can delete their own progress photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own progress photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own progress photos" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = ''progress-photos'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END $$;

-- 2. Secure materialized views - drop and recreate without exposing auth.users
DROP MATERIALIZED VIEW IF EXISTS challenge_leaderboards;
DROP MATERIALIZED VIEW IF EXISTS user_progress_summary;
DROP MATERIALIZED VIEW IF EXISTS exercise_performance_trends;

-- Recreate user_progress_summary safely using profiles instead of auth.users
CREATE MATERIALIZED VIEW user_progress_summary AS
SELECT 
  p.id as user_id,
  p.username,
  COUNT(DISTINCT ws.id) as total_workouts,
  COUNT(DISTINCT we.exercise_id) as unique_exercises,
  COALESCE(SUM(es.weight_kg * es.reps), 0) as total_volume,
  MAX(ws.completed_at) as last_workout_date,
  EXTRACT(days FROM (CURRENT_DATE - MAX(ws.completed_at)::date)) as days_since_last_workout
FROM profiles p
LEFT JOIN workout_sessions ws ON p.id = ws.user_id AND ws.completed_at IS NOT NULL
LEFT JOIN workout_exercises we ON ws.id = we.workout_session_id
LEFT JOIN exercise_sets es ON we.id = es.workout_exercise_id AND es.completed = true
GROUP BY p.id, p.username;

-- Create safe index
CREATE INDEX IF NOT EXISTS idx_user_progress_summary_user_id ON user_progress_summary(user_id);

-- Recreate exercise_performance_trends safely
CREATE MATERIALIZED VIEW exercise_performance_trends AS
SELECT 
  e.id as exercise_id,
  e.name as exercise_name,
  DATE_TRUNC('week', ws.completed_at) as week_start,
  COUNT(DISTINCT ws.user_id) as active_users,
  AVG(es.weight_kg) as avg_weight,
  AVG(es.reps) as avg_reps,
  SUM(es.weight_kg * es.reps) as total_volume
FROM exercises e
JOIN workout_exercises we ON e.id = we.exercise_id
JOIN workout_sessions ws ON we.workout_session_id = ws.id AND ws.completed_at IS NOT NULL
JOIN exercise_sets es ON we.id = es.workout_exercise_id AND es.completed = true
WHERE ws.completed_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY e.id, e.name, DATE_TRUNC('week', ws.completed_at);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercise_performance_trends_exercise_id ON exercise_performance_trends(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_performance_trends_week ON exercise_performance_trends(week_start);

-- 3. Add input validation functions for user content
CREATE OR REPLACE FUNCTION validate_social_post_content(content TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check content length (max 2000 characters)
  IF LENGTH(content) > 2000 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for basic XSS patterns
  IF content ~* '<script|javascript:|data:|vbscript:|on\w+=' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for SQL injection patterns
  IF content ~* '(union\s+select|drop\s+table|delete\s+from|insert\s+into|update\s+set)' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add validation trigger for social_posts
CREATE OR REPLACE FUNCTION validate_social_post_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT validate_social_post_content(NEW.content) THEN
    RAISE EXCEPTION 'Invalid post content detected';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger to social_posts if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_posts') THEN
    DROP TRIGGER IF EXISTS validate_social_post_content_trigger ON social_posts;
    CREATE TRIGGER validate_social_post_content_trigger
      BEFORE INSERT OR UPDATE ON social_posts
      FOR EACH ROW EXECUTE FUNCTION validate_social_post_trigger();
  END IF;
END $$;

-- 4. Add rate limiting for authentication
CREATE OR REPLACE FUNCTION check_auth_rate_limit(
  p_identifier TEXT,
  p_attempt_type TEXT DEFAULT 'login'
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN check_rate_limit(p_identifier, p_attempt_type, 5, 15, 60);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;