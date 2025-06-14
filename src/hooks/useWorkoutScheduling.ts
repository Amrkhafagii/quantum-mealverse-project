
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, WorkoutSession, WorkoutSchedule, CreateWorkoutScheduleData } from '@/types/fitness/scheduling';

export const useWorkoutScheduling = () => {
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createSchedule = useCallback(async (scheduleData: CreateWorkoutScheduleData) => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare data with user_id and correct field mapping
      const insertData = {
        user_id: user.id,
        workout_plan_id: scheduleData.workout_plan_id,
        days_of_week: scheduleData.days_of_week,
        start_date: scheduleData.start_date,
        end_date: scheduleData.end_date || null,
        preferred_time: scheduleData.preferred_time || null,
        reminder_enabled: scheduleData.reminder_enabled || false,
        is_active: scheduleData.is_active,
        name: scheduleData.name || null,
        timezone: scheduleData.timezone || 'UTC',
        reminder_minutes_before: scheduleData.reminder_minutes_before || 15
      };

      const { data, error } = await supabase
        .from('workout_schedules')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      setSchedules(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSchedule = useCallback(async (scheduleId: string, updates: Partial<CreateWorkoutScheduleData>) => {
    setIsLoading(true);
    try {
      // Map updates to database fields
      const updateData: any = {};
      if (updates.workout_plan_id) updateData.workout_plan_id = updates.workout_plan_id;
      if (updates.days_of_week) updateData.days_of_week = updates.days_of_week;
      if (updates.start_date) updateData.start_date = updates.start_date;
      if (updates.end_date !== undefined) updateData.end_date = updates.end_date;
      if (updates.preferred_time !== undefined) updateData.preferred_time = updates.preferred_time;
      if (updates.reminder_enabled !== undefined) updateData.reminder_enabled = updates.reminder_enabled;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.timezone) updateData.timezone = updates.timezone;
      if (updates.reminder_minutes_before !== undefined) updateData.reminder_minutes_before = updates.reminder_minutes_before;

      const { data, error } = await supabase
        .from('workout_schedules')
        .update(updateData)
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) throw error;

      setSchedules(prev => prev.map(s => s.id === scheduleId ? data : s));
      return data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSchedule = useCallback(async (scheduleId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleScheduleActive = useCallback(async (scheduleId: string, active: boolean) => {
    return updateSchedule(scheduleId, { is_active: active });
  }, [updateSchedule]);

  const fetchSessions = useCallback(async (startDate: string, endDate: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);

      if (error) throw error;

      // Map and validate session data
      const mappedSessions: WorkoutSession[] = (data || []).map(session => ({
        id: session.id,
        user_id: session.user_id,
        workout_plan_id: session.workout_plan_id,
        workout_schedule_id: session.workout_schedule_id,
        scheduled_date: session.scheduled_date,
        scheduled_time: session.scheduled_time,
        started_at: session.started_at,
        completed_at: session.completed_at,
        duration: session.duration_minutes,
        status: ['scheduled', 'in_progress', 'completed', 'skipped', 'cancelled'].includes(session.status) 
          ? session.status as 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'cancelled'
          : 'scheduled',
        notes: session.notes,
        created_at: session.created_at,
        updated_at: session.updated_at
      }));

      setSessions(mappedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCalendarEvents = useCallback((startDate: string, endDate: string): CalendarEvent[] => {
    return sessions.map(session => ({
      id: session.id,
      title: `Workout Session`,
      date: session.scheduled_date,
      time: session.scheduled_time,
      status: session.status,
      type: 'workout' as const,
      workoutPlanId: session.workout_plan_id,
      scheduleId: session.workout_schedule_id
    }));
  }, [sessions]);

  const updateSessionStatus = useCallback(async (sessionId: string, status: string) => {
    setIsLoading(true);
    try {
      const validStatus = ['scheduled', 'in_progress', 'completed', 'skipped', 'cancelled'].includes(status) 
        ? status : 'scheduled';

      const { data, error } = await supabase
        .from('workout_sessions')
        .update({ status: validStatus })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Map response and update sessions
      const mappedSession: WorkoutSession = {
        id: data.id,
        user_id: data.user_id,
        workout_plan_id: data.workout_plan_id,
        workout_schedule_id: data.workout_schedule_id,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        started_at: data.started_at,
        completed_at: data.completed_at,
        duration: data.duration_minutes,
        status: validStatus as 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'cancelled',
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setSessions(prev => prev.map(s => s.id === sessionId ? mappedSession : s));
      return mappedSession;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateSessions = useCallback(async (scheduleId: string) => {
    // Mock implementation - would generate workout sessions based on schedule
    console.log('Generating sessions for schedule:', scheduleId);
  }, []);

  return {
    schedules,
    sessions,
    isLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleScheduleActive,
    fetchSessions,
    getCalendarEvents,
    updateSessionStatus,
    generateSessions
  };
};
