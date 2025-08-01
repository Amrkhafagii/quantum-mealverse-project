-- ======================
-- COMPREHENSIVE SECURITY FIXES - CORRECTED
-- ======================

-- Fix function search paths for security (all functions need secure search paths)
ALTER FUNCTION public.trigger_update_post_counts() SET search_path = public;
ALTER FUNCTION public.update_challenge_rankings(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_one_rep_max(numeric, integer) SET search_path = public;
ALTER FUNCTION public.update_comment_engagement_counts(uuid) SET search_path = public;
ALTER FUNCTION public.create_user_profile() SET search_path = public;
ALTER FUNCTION public.create_default_photo_album() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_backups() SET search_path = public;
ALTER FUNCTION public.refresh_analytics_caches() SET search_path = public;
ALTER FUNCTION public.trigger_calculate_workout_analytics() SET search_path = public;
ALTER FUNCTION public.trigger_update_challenge_timestamp() SET search_path = public;
ALTER FUNCTION public.trigger_update_comment_counts() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.trigger_update_achievement_stats() SET search_path = public;
ALTER FUNCTION public.trigger_update_challenge_rankings() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_post_engagement_counts(uuid) SET search_path = public;
ALTER FUNCTION public.are_users_friends(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.calculate_achievement_progress(uuid, integer) SET search_path = public;
ALTER FUNCTION public.update_leaderboard_rankings(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_challenge_progress(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.update_table_statistics() SET search_path = public;
ALTER FUNCTION public.update_team_scores(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_user_analytics(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_workout_analytics(uuid) SET search_path = public;
ALTER FUNCTION public.cleanup_old_data(integer) SET search_path = public;
ALTER FUNCTION public.detect_personal_record() SET search_path = public;
ALTER FUNCTION public.get_performance_metrics() SET search_path = public;
ALTER FUNCTION public.get_user_activity_feed(uuid, integer, integer) SET search_path = public;
ALTER FUNCTION public.join_challenge(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.run_database_optimization() SET search_path = public;
ALTER FUNCTION public.update_goal_progress() SET search_path = public;
ALTER FUNCTION public.update_user_achievement_stats(uuid) SET search_path = public;
ALTER FUNCTION public.update_workout_streak(uuid) SET search_path = public;
ALTER FUNCTION public.validate_workout_data() SET search_path = public;

-- Create secure user lookup functions to avoid auth.users exposure
CREATE OR REPLACE FUNCTION public.get_user_email_safe(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = user_uuid;
$$;

-- Enhanced password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Password must be at least 8 characters
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  event_type text NOT NULL,
  event_details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow system to write to audit log, users can read their own
CREATE POLICY "Users can read own audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_details jsonb DEFAULT '{}',
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, 
    event_type, 
    event_details, 
    ip_address, 
    user_agent
  )
  VALUES (
    p_user_id, 
    p_event_type, 
    p_event_details, 
    p_ip_address, 
    p_user_agent
  );
END;
$$;

-- Create rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL, -- email or IP address
  attempt_type text NOT NULL, -- 'login', 'signup', 'password_reset'
  attempts integer DEFAULT 1,
  first_attempt timestamptz DEFAULT now(),
  last_attempt timestamptz DEFAULT now(),
  blocked_until timestamptz,
  UNIQUE(identifier, attempt_type)
);

-- Enable RLS on rate limits (system access only)
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System only access to rate limits" 
ON public.auth_rate_limits 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_attempt_type text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15,
  p_block_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_time timestamptz := now();
  rate_limit_record record;
BEGIN
  -- Get or create rate limit record
  INSERT INTO public.auth_rate_limits (identifier, attempt_type)
  VALUES (p_identifier, p_attempt_type)
  ON CONFLICT (identifier, attempt_type) DO NOTHING;
  
  -- Get current record
  SELECT * INTO rate_limit_record
  FROM public.auth_rate_limits
  WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
  
  -- Check if currently blocked
  IF rate_limit_record.blocked_until IS NOT NULL AND rate_limit_record.blocked_until > current_time THEN
    RETURN false;
  END IF;
  
  -- Reset if outside window
  IF rate_limit_record.first_attempt < current_time - (p_window_minutes || ' minutes')::interval THEN
    UPDATE public.auth_rate_limits
    SET attempts = 1,
        first_attempt = current_time,
        last_attempt = current_time,
        blocked_until = NULL
    WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
    RETURN true;
  END IF;
  
  -- Check if exceeded max attempts
  IF rate_limit_record.attempts >= p_max_attempts THEN
    UPDATE public.auth_rate_limits
    SET blocked_until = current_time + (p_block_minutes || ' minutes')::interval,
        last_attempt = current_time
    WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
    RETURN false;
  END IF;
  
  -- Increment attempts
  UPDATE public.auth_rate_limits
  SET attempts = attempts + 1,
      last_attempt = current_time
  WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
  
  RETURN true;
END;
$$;