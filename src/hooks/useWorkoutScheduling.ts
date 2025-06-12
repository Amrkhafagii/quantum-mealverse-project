
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutSchedule } from '@/types/fitness';

export function useWorkoutScheduling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createSchedule = async (scheduleData: Omit<WorkoutSchedule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      throw new Error('User must be authenticated to create schedules');
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('workout_schedules')
        .insert([{
          user_id: user.id, // Use authenticated user's UUID
          workout_plan_id: scheduleData.workout_plan_id,
          day_of_week: scheduleData.day_of_week,
          days_of_week: scheduleData.days_of_week,
          time: scheduleData.time,
          preferred_time: scheduleData.preferred_time,
          reminder: scheduleData.reminder,
          start_date: scheduleData.start_date,
          end_date: scheduleData.end_date,
          active: scheduleData.active
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Schedule created",
        description: "Your workout schedule has been created successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create workout schedule.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSchedule = async (scheduleId: string, updates: Partial<WorkoutSchedule>) => {
    if (!user?.id) {
      throw new Error('User must be authenticated to update schedules');
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('workout_schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId)
        .eq('user_id', user.id) // Ensure user can only update their own schedules
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Schedule updated",
        description: "Your workout schedule has been updated successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update workout schedule.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    if (!user?.id) {
      throw new Error('User must be authenticated to delete schedules');
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('workout_schedules')
        .delete()
        .eq('id', scheduleId)
        .eq('user_id', user.id); // Ensure user can only delete their own schedules

      if (error) throw error;

      toast({
        title: "Schedule deleted",
        description: "Your workout schedule has been deleted.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete workout schedule.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUpcomingWorkouts = async (days: number = 7) => {
    if (!user?.id) {
      return [];
    }

    try {
      setIsLoading(true);
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);

      const { data, error } = await supabase
        .from('workout_schedules')
        .select(`
          *,
          workout_plans (
            name,
            difficulty,
            workout_days
          )
        `)
        .eq('user_id', user.id) // Use authenticated user's UUID
        .eq('active', true)
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('start_date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming workouts:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScheduleActive = async (scheduleId: string, active: boolean) => {
    if (!user?.id) {
      throw new Error('User must be authenticated to toggle schedule');
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('workout_schedules')
        .update({ 
          active,
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId)
        .eq('user_id', user.id) // Ensure user can only modify their own schedules
        .select()
        .single();

      if (error) throw error;

      toast({
        title: active ? "Schedule activated" : "Schedule deactivated",
        description: `Your workout schedule has been ${active ? 'activated' : 'deactivated'}.`,
      });

      return data;
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule status.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getUpcomingWorkouts,
    toggleScheduleActive,
    isLoading
  };
}
