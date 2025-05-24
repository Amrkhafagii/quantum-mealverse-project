
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkoutSchedule, WorkoutSession, CalendarEvent, CreateWorkoutScheduleData } from '@/types/fitness/scheduling';

export function useWorkoutScheduling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchedules = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workout_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to our interface - now all fields should exist
      const mappedSchedules: WorkoutSchedule[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        workout_plan_id: item.workout_plan_id,
        name: item.name,
        days_of_week: item.days_of_week || [],
        start_date: item.start_date,
        end_date: item.end_date || undefined,
        preferred_time: item.preferred_time || undefined,
        timezone: item.timezone,
        is_active: item.is_active,
        reminder_enabled: item.reminder_enabled,
        reminder_minutes_before: item.reminder_minutes_before,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setSchedules(mappedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load workout schedules",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async (startDate?: string, endDate?: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_plans!inner(name),
          workout_schedules(name)
        `)
        .eq('user_id', user.id);

      if (startDate) {
        query = query.gte('scheduled_date', startDate);
      }
      if (endDate) {
        query = query.lte('scheduled_date', endDate);
      }

      const { data, error } = await query.order('scheduled_date', { ascending: true });

      if (error) throw error;
      
      // Map the data to our WorkoutSession interface
      const mappedSessions: WorkoutSession[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        workout_plan_id: item.workout_plan_id,
        workout_schedule_id: item.workout_schedule_id,
        scheduled_date: item.scheduled_date,
        scheduled_time: item.scheduled_time,
        started_at: item.started_at,
        completed_at: item.completed_at,
        status: item.status,
        duration_minutes: item.duration_minutes,
        calories_burned: item.calories_burned,
        notes: item.notes,
        workout_data: item.workout_data,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setSessions(mappedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load workout sessions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSchedule = async (scheduleData: CreateWorkoutScheduleData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workout_schedules')
        .insert([{ ...scheduleData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Generate initial sessions for the next 30 days
      await generateSessions(data.id);
      
      toast({
        title: "Success",
        description: "Workout schedule created successfully!"
      });

      fetchSchedules();
      return data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create workout schedule",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<CreateWorkoutScheduleData>) => {
    try {
      const { error } = await supabase
        .from('workout_schedules')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule updated successfully!"
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive"
      });
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workout_schedules')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule deleted successfully!"
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive"
      });
    }
  };

  const generateSessions = async (scheduleId: string, startDate?: string, endDate?: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_workout_sessions', {
        p_schedule_id: scheduleId,
        p_start_date: startDate || new Date().toISOString().split('T')[0],
        p_end_date: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      if (error) throw error;
      
      const sessionsCreated = typeof data === 'number' ? data : 0;
      
      if (sessionsCreated > 0) {
        toast({
          title: "Success",
          description: `${sessionsCreated} workout sessions generated!`
        });
      }

      return sessionsCreated;
    } catch (error) {
      console.error('Error generating sessions:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout sessions",
        variant: "destructive"
      });
      return 0;
    }
  };

  const updateSessionStatus = async (sessionId: string, status: WorkoutSession['status'], sessionData?: Partial<WorkoutSession>) => {
    try {
      const updates: any = { status, ...sessionData };
      
      if (status === 'in_progress' && !sessionData?.started_at) {
        updates.started_at = new Date().toISOString();
      }
      
      if (status === 'completed' && !sessionData?.completed_at) {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('workout_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Workout ${status.replace('_', ' ')}!`
      });

      fetchSessions();
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update workout session",
        variant: "destructive"
      });
    }
  };

  const getCalendarEvents = (startDate: string, endDate: string): CalendarEvent[] => {
    return sessions
      .filter(session => session.scheduled_date >= startDate && session.scheduled_date <= endDate)
      .map(session => ({
        id: session.id,
        title: (session as any).workout_plans?.name || 'Workout',
        date: session.scheduled_date,
        time: session.scheduled_time,
        type: 'workout' as const,
        status: session.status as any,
        workout_plan_name: (session as any).workout_plans?.name,
        duration: session.duration_minutes
      }));
  };

  useEffect(() => {
    if (user) {
      fetchSchedules();
      fetchSessions();
    }
  }, [user]);

  return {
    schedules,
    sessions,
    isLoading,
    fetchSchedules,
    fetchSessions,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    generateSessions,
    updateSessionStatus,
    getCalendarEvents
  };
}
