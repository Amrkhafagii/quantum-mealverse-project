
BEGIN;

-- Tighten workouts: remove public visibility, require authenticated + ownership

DROP POLICY IF EXISTS "Users can view public workouts and own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can create workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON public.workouts;

CREATE POLICY "Users can view own workouts"
  ON public.workouts
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can create workouts"
  ON public.workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update own workouts"
  ON public.workouts
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can delete own workouts"
  ON public.workouts
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Workout exercises: remove broad public policy and consolidate under authenticated-only,
-- preserving ownership checks across workouts, sessions, and templates

DROP POLICY IF EXISTS "Users can manage exercises in their workouts and sessions" ON public.workout_exercises;

CREATE POLICY "Users can manage exercises in their workouts/templates/sessions"
  ON public.workout_exercises
  FOR ALL
  TO authenticated
  USING (
    (
      workout_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.workouts w
        WHERE w.id = workout_exercises.workout_id
          AND w.creator_id = auth.uid()
      )
    )
    OR
    (
      workout_session_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = workout_exercises.workout_session_id
          AND ws.user_id = auth.uid()
      )
    )
    OR
    (
      template_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.workout_templates wt
        WHERE wt.id = workout_exercises.template_id
          AND wt.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    (
      workout_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.workouts w
        WHERE w.id = workout_exercises.workout_id
          AND w.creator_id = auth.uid()
      )
    )
    OR
    (
      workout_session_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = workout_exercises.workout_session_id
          AND ws.user_id = auth.uid()
      )
    )
    OR
    (
      template_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.workout_templates wt
        WHERE wt.id = workout_exercises.template_id
          AND wt.user_id = auth.uid()
      )
    )
  );

COMMIT;
