
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutSchedule, CalendarEvent, WorkoutSession, CreateWorkoutScheduleData } from '@/types/fitness/scheduling';

export function useWorkoutScheduling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  const createSchedule = async (scheduleData: CreateWorkoutScheduleData) => {
    if (!user?.id) {
      throw new Error('User must be authenticated to create schedules');
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('workout_schedules')
        .insert([{
          user_id: user.id,
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

  const updateSchedule = async (scheduleId: string, updates: Partial<CreateWorkoutScheduleData>) => {
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
        .eq('user_id', user.id)
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
        .eq('user_id', user.id);

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
        .eq('user_id', user.id)
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
        .eq('user_id', user.id)
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

  const fetchSessions = async (startDate: string, endDate: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);

      if (error) throw error;
      
      const typedSessions: WorkoutSession[] = (data || []).map(session => ({
        id: session.id,
        user_id: session.user_id,
        workout_plan_id: session.workout_plan_id,
        workout_schedule_id: session.workout_schedule_id,
        scheduled_date: session.scheduled_date,
        scheduled_time: session.scheduled_time,
        started_at: session.started_at,
        completed_at: session.completed_at,
        duration: session.duration_minutes, // Map duration_minutes to duration
        status: session.status as WorkoutSession['status'],
        notes: session.notes,
        created_at: session.created_at,
        updated_at: session.updated_at
      }));
      
      setSessions(typedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const getCalendarEvents = (startDate: string, endDate: string): CalendarEvent[] => {
    return sessions.map(session => ({
      id: session.id,
      title: `Workout Session`,
      date: session.scheduled_date,
      time: session.scheduled_time,
      status: session.status,
      type: 'workout' as const
    }));
  };

  const updateSessionStatus = async (sessionId: string, status: WorkoutSession['status']) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ status })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, status } : session
      ));
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const generateSessions = async (scheduleId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('generate_workout_sessions', {
        p_schedule_id: scheduleId
      });

      if (error) throw error;

      toast({
        title: "Sessions generated",
        description: "Workout sessions have been generated for your schedule.",
      });
    } catch (error) {
      console.error('Error generating sessions:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout sessions.",
        variant: "destructive"
      });
    }
  };

  return {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getUpcomingWorkouts,
    toggleScheduleActive,
    fetchSessions,
    getCalendarEvents,
    updateSessionStatus,
    generateSessions,
    schedules,
    sessions,
    isLoading
  };
}
