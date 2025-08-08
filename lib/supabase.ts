import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cfltlvkiglukppjqoxwn.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbHRsdmtpZ2x1a3BwanFveHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDYzNjAsImV4cCI6MjA2NjY4MjM2MH0.VTMaE1R-KuqKTzqQWnjIvaiWM5vK-Y7VTnYT9wXc7o8';

// Validate environment variables
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables are not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for TypeScript
export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  preferred_units?: 'metric' | 'imperial';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  instructions?: string;
  muscle_groups: string[];
  equipment?: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  exercise_type: 'strength' | 'cardio' | 'flexibility' | 'balance';
  demo_video_url?: string;
  demo_image_url?: string;
  created_at: string;
}

export interface Workout {
  id: number;
  creator_id?: string;
  name: string;
  description?: string;
  estimated_duration_minutes?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  workout_type: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed';
  is_template: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  order_index: number;
  target_sets: number;
  target_reps: number[] | null;
  target_weight_kg?: number;
  target_duration_seconds?: number;
  rest_seconds: number;
  notes?: string;
  created_at: string;
}

export interface WorkoutSession {
  id: number;
  user_id: string;
  workout_id?: number;
  name: string;
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
  calories_burned?: number;
  notes?: string;
  rating?: number;
  created_at: string;
}

interface SessionExercise {
  id: number;
  session_id: number;
  exercise_id: number;
  order_index: number;
  notes?: string;
  created_at: string;
}

export interface ExerciseSet {
  id: number;
  session_exercise_id: number;
  set_number: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  rest_seconds?: number;
  rpe?: number;
  completed: boolean;
  created_at: string;
}

export interface PersonalRecord {
  id: number;
  user_id: string;
  exercise_id: number;
  record_type: 'max_weight' | 'max_reps' | 'max_distance' | 'best_time';
  value: number;
  unit: string;
  session_id?: number;
  achieved_at: string;
  created_at: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon?: string;
  category: 'workout' | 'strength' | 'endurance' | 'consistency' | 'social';
  criteria: any;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface SocialPost {
  id: number;
  user_id: string;
  content: string;
  post_type: 'workout' | 'achievement' | 'progress' | 'general';
  workout_session_id?: number;
  achievement_id?: number;
  media_urls?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutStreak {
  id: number;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date?: string;
  streak_start_date?: string;
  updated_at: string;
}

// Auth helper functions
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

const signUp = async (email: string, password: string, username: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Profile functions
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Exercise functions
export const getExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
  
  return data || [];
};

const getExercisesByMuscleGroup = async (muscleGroup: string): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .contains('muscle_groups', [muscleGroup])
    .order('name');
  
  if (error) {
    console.error('Error fetching exercises by muscle group:', error);
    return [];
  }
  
  return data || [];
};

// Workout functions
export const getWorkoutTemplates = async (): Promise<Workout[]> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Error getting current user for templates:', userError);
    return [];
  }
  if (!user) {
    console.warn('No authenticated user; returning empty workout templates.');
    return [];
  }

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('is_template', true)
    .eq('creator_id', user.id)
    .order('name');
  
  if (error) {
    console.error('Error fetching workout templates:', error);
    return [];
  }
  
  return data || [];
};

export const getUserWorkouts = async (userId: string): Promise<Workout[]> => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user workouts:', error);
    return [];
  }
  
  return data || [];
};

export const createWorkout = async (workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
    .single();
  
  return { data, error };
};

const updateWorkout = async (workoutId: number, updates: Partial<Workout>) => {
  const { data, error } = await supabase
    .from('workouts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', workoutId)
    .select()
    .single();
  
  return { data, error };
};

const deleteWorkout = async (workoutId: number, userId: string) => {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('creator_id', userId);
  
  return { error };
};

// Workout exercise functions
export const createWorkoutExercise = async (workoutExercise: Omit<WorkoutExercise, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert(workoutExercise)
    .select()
    .single();
  
  return { data, error };
};

const updateWorkoutExercise = async (exerciseId: number, updates: Partial<WorkoutExercise>) => {
  const { data, error } = await supabase
    .from('workout_exercises')
    .update(updates)
    .eq('id', exerciseId)
    .select()
    .single();
  
  return { data, error };
};

const deleteWorkoutExercise = async (exerciseId: number) => {
  const { error } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('id', exerciseId);
  
  return { error };
};

const getWorkoutExercises = async (workoutId: number) => {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select(`
      *,
      exercise:exercises(*)
    `)
    .eq('workout_id', workoutId)
    .order('order_index');
  
  if (error) {
    console.error('Error fetching workout exercises:', error);
    return [];
  }
  
  return data || [];
};

// Workout session functions
export const createWorkoutSession = async (session: Omit<WorkoutSession, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert(session)
    .select()
    .single();
  
  return { data, error };
};

const getUserWorkoutSessions = async (userId: string): Promise<WorkoutSession[]> => {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching workout sessions:', error);
    return [];
  }
  
  return data || [];
};

export const completeWorkoutSession = async (sessionId: number, duration: number, calories?: number, rating?: number) => {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update({
      completed_at: new Date().toISOString(),
      duration_minutes: duration,
      calories_burned: calories,
      rating,
    })
    .eq('id', sessionId)
    .select()
    .single();
  
  return { data, error };
};

// Session exercise functions
const createSessionExercise = async (sessionExercise: Omit<SessionExercise, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('session_exercises')
    .insert(sessionExercise)
    .select()
    .single();
  
  return { data, error };
};

// Exercise set functions
const createExerciseSet = async (exerciseSet: Omit<ExerciseSet, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert(exerciseSet)
    .select()
    .single();
  
  return { data, error };
};

const updateExerciseSet = async (setId: number, updates: Partial<ExerciseSet>) => {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update(updates)
    .eq('id', setId)
    .select()
    .single();
  
  return { data, error };
};

// Personal records functions
export const getUserPersonalRecords = async (userId: string): Promise<PersonalRecord[]> => {
  const { data, error } = await supabase
    .from('personal_records')
    .select(`
      *,
      exercise:exercises(name, muscle_groups)
    `)
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching personal records:', error);
    return [];
  }
  
  return data || [];
};

const createPersonalRecord = async (record: Omit<PersonalRecord, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('personal_records')
    .upsert(record, {
      onConflict: 'user_id,exercise_id,record_type',
    })
    .select()
    .single();
  
  return { data, error };
};

// Achievement functions
const getUserAchievements = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
  
  return data || [];
};

// Social functions
const getSocialFeed = async (limit: number = 20): Promise<SocialPost[]> => {
  const { data, error } = await supabase
    .from('social_posts')
    .select(`
      *,
      profile:profiles(username, full_name, avatar_url),
      workout_session:workout_sessions(name, duration_minutes, calories_burned),
      achievement:achievements(name, description, icon)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching social feed:', error);
    return [];
  }
  
  return data || [];
};

export const createSocialPost = async (post: Omit<SocialPost, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('social_posts')
    .insert(post)
    .select()
    .single();
  
  return { data, error };
};

// Streak functions
export const getUserStreak = async (userId: string): Promise<WorkoutStreak | null> => {
  const { data, error } = await supabase
    .from('workout_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user streak:', error);
    return null;
  }
  
  return data;
};

const updateWorkoutStreak = async (userId: string) => {
  const { data, error } = await supabase.rpc('update_workout_streak', {
    user_uuid: userId,
  });
  
  return { data, error };
};

// Analytics and progress tracking
export const getWorkoutAnalytics = async (userId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .not('completed_at', 'is', null);

  if (startDate) {
    query = query.gte('started_at', startDate);
  }
  
  if (endDate) {
    query = query.lte('started_at', endDate);
  }

  const { data, error } = await query.order('started_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching workout analytics:', error);
    return [];
  }
  
  return data || [];
};

export const getExerciseProgress = async (userId: string, exerciseId: number) => {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      *,
      session_exercise:session_exercises(
        session:workout_sessions(started_at, user_id)
      )
    `)
    .eq('session_exercise.session.user_id', userId)
    .eq('session_exercise.exercise_id', exerciseId)
    .eq('completed', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching exercise progress:', error);
    return [];
  }
  
  return data || [];
};
