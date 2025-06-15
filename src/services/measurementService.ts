
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserMeasurement } from '@/types/fitness';

export const getMeasurements = async (userId: string): Promise<UserMeasurement[]> => {
  try {
    const { data, error } = await supabase
      .from('user_measurements')
      .select('*')
      .eq('user_measurements_user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    // Map database fields to UserMeasurement type
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_measurements_user_id,
      date: item.date,
      weight: item.weight,
      body_fat: item.body_fat,
      chest: item.chest,
      waist: item.waist,
      hips: item.hips,
      arms: item.arms,
      legs: item.legs,
      notes: item.notes
    }));
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return [];
  }
};

export const addMeasurement = async (measurement: Omit<UserMeasurement, 'id'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_measurements')
      .insert([{
        user_measurements_user_id: measurement.user_id,
        date: measurement.date,
        weight: measurement.weight,
        body_fat: measurement.body_fat,
        chest: measurement.chest,
        waist: measurement.waist,
        hips: measurement.hips,
        arms: measurement.arms,
        legs: measurement.legs,
        notes: measurement.notes
      }]);

    if (error) throw error;

    toast.success('Measurement added successfully');
    return true;
  } catch (error) {
    console.error('Error adding measurement:', error);
    toast.error('Failed to add measurement');
    return false;
  }
};

export const updateMeasurement = async (id: string, measurement: Partial<UserMeasurement>): Promise<boolean> => {
  try {
    const updateData: any = {};
    
    if (measurement.weight !== undefined) updateData.weight = measurement.weight;
    if (measurement.body_fat !== undefined) updateData.body_fat = measurement.body_fat;
    if (measurement.chest !== undefined) updateData.chest = measurement.chest;
    if (measurement.waist !== undefined) updateData.waist = measurement.waist;
    if (measurement.hips !== undefined) updateData.hips = measurement.hips;
    if (measurement.arms !== undefined) updateData.arms = measurement.arms;
    if (measurement.legs !== undefined) updateData.legs = measurement.legs;
    if (measurement.notes !== undefined) updateData.notes = measurement.notes;
    if (measurement.date !== undefined) updateData.date = measurement.date;

    const { error } = await supabase
      .from('user_measurements')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    toast.success('Measurement updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating measurement:', error);
    toast.error('Failed to update measurement');
    return false;
  }
};

export const deleteMeasurement = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_measurements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success('Measurement deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting measurement:', error);
    toast.error('Failed to delete measurement');
    return false;
  }
};
