import { supabase, PersonalRecord, ExerciseSet } from './supabase';

export interface PersonalRecordData {
  exercise_id: number;
  exercise_name: string;
  record_type: 'max_weight' | 'max_reps' | 'max_distance' | 'best_time';
  value: number;
  unit: string;
  previous_value?: number;
  improvement?: number;
  achieved_at: string;
  session_id?: number;
}

interface PersonalRecordUpdate {
  exercise_id: number;
  record_type: 'max_weight' | 'max_reps' | 'max_distance' | 'best_time';
  value: number;
  unit: string;
  session_id: number;
}

// Check for new personal records after a workout session
export const checkForPersonalRecords = async (
  userId: string, 
  sessionId: number
): Promise<PersonalRecordData[]> => {
  const newRecords: PersonalRecordData[] = [];
  
  try {
    // Get all exercise sets from the completed session
    const { data: sessionSets, error: setsError } = await supabase
      .from('exercise_sets')
      .select(`
        *,
        session_exercise:session_exercises(
          exercise_id,
          exercise:exercises(name, exercise_type)
        )
      `)
      .eq('session_exercise.session_id', sessionId)
      .eq('completed', true);

    if (setsError) throw setsError;

    // Filter out sets with null session_exercise or exercise data
    const validSets = (sessionSets || []).filter(set => 
      set.session_exercise && 
      set.session_exercise.exercise && 
      set.session_exercise.exercise.name
    );

    if (validSets.length === 0) {
      console.log('No valid exercise sets found for session:', sessionId);
      return newRecords;
    }

    // Group sets by exercise
    const exerciseGroups = groupSetsByExercise(validSets);

    // Check each exercise for potential records
    for (const [exerciseId, sets] of exerciseGroups) {
      const exerciseName = sets[0].session_exercise.exercise.name;
      const exerciseType = sets[0].session_exercise.exercise.exercise_type;
      
      // Check different record types based on exercise type
      if (exerciseType === 'strength') {
        // Check max weight record
        const maxWeightRecord = await checkMaxWeightRecord(
          userId, 
          parseInt(exerciseId), 
          sets, 
          sessionId,
          exerciseName
        );
        if (maxWeightRecord) newRecords.push(maxWeightRecord);

        // Check max reps record (at any weight)
        const maxRepsRecord = await checkMaxRepsRecord(
          userId, 
          parseInt(exerciseId), 
          sets, 
          sessionId,
          exerciseName
        );
        if (maxRepsRecord) newRecords.push(maxRepsRecord);
      }

      if (exerciseType === 'cardio') {
        // Check best time record
        const bestTimeRecord = await checkBestTimeRecord(
          userId, 
          parseInt(exerciseId), 
          sets, 
          sessionId,
          exerciseName
        );
        if (bestTimeRecord) newRecords.push(bestTimeRecord);

        // Check max distance record
        const maxDistanceRecord = await checkMaxDistanceRecord(
          userId, 
          parseInt(exerciseId), 
          sets, 
          sessionId,
          exerciseName
        );
        if (maxDistanceRecord) newRecords.push(maxDistanceRecord);
      }
    }
  } catch (error) {
    console.error('Error checking for personal records:', error);
  }

  return newRecords;
};

// Group exercise sets by exercise ID
const groupSetsByExercise = (sets: any[]): Map<string, any[]> => {
  const groups = new Map<string, any[]>();
  
  sets.forEach(set => {
    // Add defensive null check for session_exercise
    if (!set.session_exercise || !set.session_exercise.exercise_id) {
      console.warn('Skipping set with invalid session_exercise data:', set);
      return;
    }

    const exerciseId = set.session_exercise.exercise_id.toString();
    if (!groups.has(exerciseId)) {
      groups.set(exerciseId, []);
    }
    groups.get(exerciseId)!.push(set);
  });
  
  return groups;
};

// Check for max weight personal record
const checkMaxWeightRecord = async (
  userId: string,
  exerciseId: number,
  sets: any[],
  sessionId: number,
  exerciseName: string
): Promise<PersonalRecordData | null> => {
  try {
    // Find the maximum weight lifted in this session
    const maxWeight = Math.max(...sets.map(set => set.weight_kg || 0));
    
    if (maxWeight <= 0) return null;

    // Get current max weight record
    const { data: currentRecord, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .eq('record_type', 'max_weight')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const previousValue = currentRecord?.value || 0;
    
    // Check if this is a new record
    if (maxWeight > previousValue) {
      // Create or update the record
      const recordData = {
        user_id: userId,
        exercise_id: exerciseId,
        record_type: 'max_weight' as const,
        value: maxWeight,
        unit: 'kg',
        session_id: sessionId,
        achieved_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('personal_records')
        .upsert(recordData, {
          onConflict: 'user_id,exercise_id,record_type',
        });

      if (upsertError) throw upsertError;

      return {
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        record_type: 'max_weight',
        value: maxWeight,
        unit: 'kg',
        previous_value: previousValue,
        improvement: maxWeight - previousValue,
        achieved_at: recordData.achieved_at,
        session_id: sessionId,
      };
    }
  } catch (error) {
    console.error('Error checking max weight record:', error);
  }

  return null;
};

// Check for max reps personal record
const checkMaxRepsRecord = async (
  userId: string,
  exerciseId: number,
  sets: any[],
  sessionId: number,
  exerciseName: string
): Promise<PersonalRecordData | null> => {
  try {
    // Find the maximum reps in a single set
    const maxReps = Math.max(...sets.map(set => set.reps || 0));
    
    if (maxReps <= 0) return null;

    // Get current max reps record
    const { data: currentRecord, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .eq('record_type', 'max_reps')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const previousValue = currentRecord?.value || 0;
    
    // Check if this is a new record
    if (maxReps > previousValue) {
      // Create or update the record
      const recordData = {
        user_id: userId,
        exercise_id: exerciseId,
        record_type: 'max_reps' as const,
        value: maxReps,
        unit: 'reps',
        session_id: sessionId,
        achieved_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('personal_records')
        .upsert(recordData, {
          onConflict: 'user_id,exercise_id,record_type',
        });

      if (upsertError) throw upsertError;

      return {
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        record_type: 'max_reps',
        value: maxReps,
        unit: 'reps',
        previous_value: previousValue,
        improvement: maxReps - previousValue,
        achieved_at: recordData.achieved_at,
        session_id: sessionId,
      };
    }
  } catch (error) {
    console.error('Error checking max reps record:', error);
  }

  return null;
};

// Check for best time personal record (for cardio exercises)
const checkBestTimeRecord = async (
  userId: string,
  exerciseId: number,
  sets: any[],
  sessionId: number,
  exerciseName: string
): Promise<PersonalRecordData | null> => {
  try {
    // Find the minimum time (best time) in this session
    const validTimes = sets.map(set => set.duration_seconds).filter(time => time > 0);
    if (validTimes.length === 0) return null;
    
    const bestTime = Math.min(...validTimes);

    // Get current best time record
    const { data: currentRecord, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .eq('record_type', 'best_time')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const previousValue = currentRecord?.value || Infinity;
    
    // Check if this is a new record (lower time is better)
    if (bestTime < previousValue) {
      // Create or update the record
      const recordData = {
        user_id: userId,
        exercise_id: exerciseId,
        record_type: 'best_time' as const,
        value: bestTime,
        unit: 'seconds',
        session_id: sessionId,
        achieved_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('personal_records')
        .upsert(recordData, {
          onConflict: 'user_id,exercise_id,record_type',
        });

      if (upsertError) throw upsertError;

      return {
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        record_type: 'best_time',
        value: bestTime,
        unit: 'seconds',
        previous_value: previousValue === Infinity ? 0 : previousValue,
        improvement: previousValue === Infinity ? bestTime : previousValue - bestTime,
        achieved_at: recordData.achieved_at,
        session_id: sessionId,
      };
    }
  } catch (error) {
    console.error('Error checking best time record:', error);
  }

  return null;
};

// Check for max distance personal record
const checkMaxDistanceRecord = async (
  userId: string,
  exerciseId: number,
  sets: any[],
  sessionId: number,
  exerciseName: string
): Promise<PersonalRecordData | null> => {
  try {
    // Find the maximum distance in this session
    const maxDistance = Math.max(...sets.map(set => set.distance_meters || 0));
    
    if (maxDistance <= 0) return null;

    // Get current max distance record
    const { data: currentRecord, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .eq('record_type', 'max_distance')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const previousValue = currentRecord?.value || 0;
    
    // Check if this is a new record
    if (maxDistance > previousValue) {
      // Create or update the record
      const recordData = {
        user_id: userId,
        exercise_id: exerciseId,
        record_type: 'max_distance' as const,
        value: maxDistance,
        unit: 'meters',
        session_id: sessionId,
        achieved_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('personal_records')
        .upsert(recordData, {
          onConflict: 'user_id,exercise_id,record_type',
        });

      if (upsertError) throw upsertError;

      return {
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        record_type: 'max_distance',
        value: maxDistance,
        unit: 'meters',
        previous_value: previousValue,
        improvement: maxDistance - previousValue,
        achieved_at: recordData.achieved_at,
        session_id: sessionId,
      };
    }
  } catch (error) {
    console.error('Error checking max distance record:', error);
  }

  return null;
};

// Get user's personal records with exercise details
export const getUserPersonalRecordsWithDetails = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('personal_records')
      .select(`
        *,
        exercise:exercises(name, muscle_groups, exercise_type)
      `)
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching personal records:', error);
    return [];
  }
};

// Get personal records for a specific exercise
export const getExercisePersonalRecords = async (
  userId: string, 
  exerciseId: number
): Promise<PersonalRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .order('achieved_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching exercise personal records:', error);
    return [];
  }
};

// Format personal record value for display
export const formatPersonalRecordValue = (
  value: number, 
  recordType: string, 
  unit: string
): string => {
  switch (recordType) {
    case 'max_weight':
      return `${value} ${unit}`;
    case 'max_reps':
      return `${value} reps`;
    case 'best_time':
      return formatTime(value);
    case 'max_distance':
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)} km`;
      }
      return `${value} m`;
    default:
      return `${value} ${unit}`;
  }
};

// Format time in seconds to readable format
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// Get personal record statistics
export const getPersonalRecordStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('personal_records')
      .select('record_type, achieved_at')
      .eq('user_id', userId);

    if (error) throw error;

    const records = data || [];
    const totalRecords = records.length;
    
    // Count records by type
    const recordsByType = records.reduce((acc, record) => {
      acc[record.record_type] = (acc[record.record_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count recent records (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = records.filter(
      record => new Date(record.achieved_at) >= thirtyDaysAgo
    ).length;

    return {
      totalRecords,
      recentRecords,
      recordsByType,
    };
  } catch (error) {
    console.error('Error getting personal record stats:', error);
    return {
      totalRecords: 0,
      recentRecords: 0,
      recordsByType: {},
    };
  }
};