
import { fromTable, supabase } from './supabaseClient';
import { UserMeasurement } from '@/types/fitness';

/**
 * Gets all measurements for a user
 */
export const getUserMeasurements = async (userId: string): Promise<{ data: UserMeasurement[] | null, error: any }> => {
  try {
    const { data, error } = await fromTable('user_measurements')
      .select('*')
      .eq('user_measurements_user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as UserMeasurement[], error: null };
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return { data: null, error };
  }
};

/**
 * Adds a new measurement entry for a user
 */
export const addMeasurement = async (measurement: UserMeasurement): Promise<{ data: UserMeasurement | null, error: any }> => {
  try {
    // Ensure the measurement object matches the database schema and handle optional weight
    const measurementData = {
      ...measurement,
      weight: measurement.weight || null // Convert undefined to null for database
    };
    
    const { data, error } = await fromTable('user_measurements')
      .insert(measurementData)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as UserMeasurement, error: null };
  } catch (error) {
    console.error('Error adding measurement:', error);
    return { data: null, error };
  }
};

/**
 * Updates an existing measurement entry
 */
export const updateMeasurement = async (measurement: UserMeasurement): Promise<{ data: UserMeasurement | null, error: any }> => {
  try {
    const { data, error } = await fromTable('user_measurements')
      .update({
        weight: measurement.weight,
        body_fat: measurement.body_fat,
        chest: measurement.chest,
        waist: measurement.waist,
        hips: measurement.hips,
        arms: measurement.arms,
        legs: measurement.legs,
        notes: measurement.notes
      })
      .eq('id', measurement.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as UserMeasurement, error: null };
  } catch (error) {
    console.error('Error updating measurement:', error);
    return { data: null, error };
  }
};

/**
 * Deletes a measurement entry
 */
export const deleteMeasurement = async (measurementId: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await fromTable('user_measurements')
      .delete()
      .eq('id', measurementId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting measurement:', error);
    return { success: false, error };
  }
};

/**
 * Gets the latest measurement for a user
 */
export const getLatestMeasurement = async (userId: string): Promise<{ data: UserMeasurement | null, error: any }> => {
  try {
    const { data, error } = await fromTable('user_measurements')
      .select('*')
      .eq('user_measurements_user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    
    return { data: data as UserMeasurement | null, error: null };
  } catch (error) {
    console.error('Error fetching latest measurement:', error);
    return { data: null, error };
  }
};

/**
 * Calculates progress between two measurement dates
 */
export const calculateProgress = async (userId: string, startDate: string, endDate: string): Promise<{ data: any, error: any }> => {
  try {
    const { data: startMeasurement, error: startError } = await fromTable('user_measurements')
      .select('*')
      .eq('user_measurements_user_id', userId)
      .gte('date', startDate)
      .order('date', { ascending: true })
      .limit(1)
      .single();
    
    if (startError && startError.code !== 'PGRST116') throw startError;
    
    const { data: endMeasurement, error: endError } = await fromTable('user_measurements')
      .select('*')
      .eq('user_measurements_user_id', userId)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (endError && endError.code !== 'PGRST116') throw endError;
    
    if (!startMeasurement || !endMeasurement) {
      return { data: null, error: 'Insufficient data for progress calculation' };
    }
    
    // Calculate changes
    const progress = {
      weight: endMeasurement.weight - startMeasurement.weight,
      body_fat: endMeasurement.body_fat !== null && startMeasurement.body_fat !== null 
        ? endMeasurement.body_fat - startMeasurement.body_fat 
        : null,
      chest: endMeasurement.chest !== null && startMeasurement.chest !== null 
        ? endMeasurement.chest - startMeasurement.chest 
        : null,
      waist: endMeasurement.waist !== null && startMeasurement.waist !== null 
        ? endMeasurement.waist - startMeasurement.waist 
        : null,
      hips: endMeasurement.hips !== null && startMeasurement.hips !== null 
        ? endMeasurement.hips - startMeasurement.hips 
        : null,
      arms: endMeasurement.arms !== null && startMeasurement.arms !== null 
        ? endMeasurement.arms - startMeasurement.arms 
        : null,
      legs: endMeasurement.legs !== null && startMeasurement.legs !== null 
        ? endMeasurement.legs - startMeasurement.legs 
        : null,
    };
    
    return { data: progress, error: null };
  } catch (error) {
    console.error('Error calculating progress:', error);
    return { data: null, error };
  }
};
