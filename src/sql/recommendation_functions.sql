
-- RPC functions to handle recommendation operations until Supabase types are regenerated

CREATE OR REPLACE FUNCTION insert_workout_adaptation(
  p_user_id UUID,
  p_workout_plan_id UUID DEFAULT NULL,
  p_exercise_name TEXT DEFAULT NULL,
  p_adaptation_type TEXT,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  adaptation_id UUID;
BEGIN
  INSERT INTO workout_adaptations (
    user_id, workout_plan_id, exercise_name, adaptation_type,
    old_value, new_value, reason, applied_at
  ) VALUES (
    p_user_id, p_workout_plan_id, p_exercise_name, p_adaptation_type,
    p_old_value, p_new_value, p_reason, p_applied_at
  ) RETURNING id INTO adaptation_id;
  
  RETURN adaptation_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_adaptations(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  workout_plan_id UUID,
  exercise_name TEXT,
  adaptation_type TEXT,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT wa.id, wa.user_id, wa.workout_plan_id, wa.exercise_name,
         wa.adaptation_type, wa.old_value, wa.new_value, wa.reason,
         wa.applied_at, wa.created_at
  FROM workout_adaptations wa
  WHERE wa.user_id = p_user_id
  ORDER BY wa.applied_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION insert_recommendation_feedback(
  p_user_id UUID,
  p_recommendation_id UUID,
  p_feedback_type TEXT,
  p_rating INTEGER DEFAULT NULL,
  p_comments TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  feedback_id UUID;
BEGIN
  INSERT INTO recommendation_feedback (
    user_id, recommendation_id, feedback_type, rating, comments
  ) VALUES (
    p_user_id, p_recommendation_id, p_feedback_type, p_rating, p_comments
  ) RETURNING id INTO feedback_id;
  
  RETURN feedback_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_recommendation_feedback(
  p_user_id UUID,
  p_recommendation_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  recommendation_id UUID,
  feedback_type TEXT,
  rating INTEGER,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT rf.id, rf.user_id, rf.recommendation_id, rf.feedback_type,
         rf.rating, rf.comments, rf.created_at
  FROM recommendation_feedback rf
  WHERE rf.user_id = p_user_id AND rf.recommendation_id = p_recommendation_id
  ORDER BY rf.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_workout_preferences(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  preferred_workout_duration INTEGER,
  preferred_workout_frequency INTEGER,
  preferred_workout_types TEXT[],
  fitness_level TEXT,
  available_equipment TEXT[],
  injury_history TEXT[],
  time_constraints JSONB,
  intensity_preference TEXT,
  auto_progression BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT uwp.id, uwp.user_id, uwp.preferred_workout_duration,
         uwp.preferred_workout_frequency, uwp.preferred_workout_types,
         uwp.fitness_level, uwp.available_equipment, uwp.injury_history,
         uwp.time_constraints, uwp.intensity_preference, uwp.auto_progression,
         uwp.created_at, uwp.updated_at
  FROM user_workout_preferences uwp
  WHERE uwp.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION insert_workout_recommendation(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_type TEXT,
  p_reason TEXT DEFAULT NULL,
  p_confidence_score DECIMAL(3,2) DEFAULT 0.5,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recommendation_id UUID;
BEGIN
  INSERT INTO workout_recommendations (
    user_id, title, description, type, reason, confidence_score, metadata
  ) VALUES (
    p_user_id, p_title, p_description, p_type, p_reason, p_confidence_score, p_metadata
  ) RETURNING id INTO recommendation_id;
  
  RETURN recommendation_id;
END;
$$;
