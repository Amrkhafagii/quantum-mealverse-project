-- Add workout_id column to workout_exercises table
ALTER TABLE workout_exercises 
ADD COLUMN workout_id integer REFERENCES workouts(id);

-- Create index for performance
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- Update RLS policy to include workout_id access for workout exercises
DROP POLICY IF EXISTS "Users can manage exercises in their workout sessions" ON workout_exercises;

CREATE POLICY "Users can manage exercises in their workouts and sessions" 
ON workout_exercises 
FOR ALL 
USING (
  -- Allow access if user owns the workout template
  (workout_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM workouts w 
    WHERE w.id = workout_exercises.workout_id 
    AND w.creator_id = auth.uid()
  ))
  OR
  -- Allow access if user owns the workout session
  (workout_session_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM workout_sessions ws 
    WHERE ws.id = workout_exercises.workout_session_id 
    AND ws.user_id = auth.uid()
  ))
  OR
  -- Allow access if user owns the workout template
  (template_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM workout_templates wt 
    WHERE wt.id = workout_exercises.template_id 
    AND wt.user_id = auth.uid()
  ))
)
WITH CHECK (
  -- Same check for inserts/updates
  (workout_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM workouts w 
    WHERE w.id = workout_exercises.workout_id 
    AND w.creator_id = auth.uid()
  ))
  OR
  (workout_session_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM workout_sessions ws 
    WHERE ws.id = workout_exercises.workout_session_id 
    AND ws.user_id = auth.uid()
  ))
  OR
  (template_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM workout_templates wt 
    WHERE wt.id = workout_exercises.template_id 
    AND wt.user_id = auth.uid()
  ))
);