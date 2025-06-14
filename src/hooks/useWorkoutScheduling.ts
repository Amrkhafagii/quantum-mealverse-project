
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, WorkoutSession } from '@/types/fitness/scheduling';

// Define simplified interfaces for the hook to avoid type conflicts
export interface CreateWorkoutScheduleData {
  workout_plan_id: string;
  days_of_week: number[];
  start_date: string;
  end_date?: string;
  time?: string;
  reminder?: boolean;
  active: boolean;
  name?: string;
  timezone?: string;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
}

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  days_of_week: number[];
  start_date: string;
  end_date?: string;
  time?: string;
  reminder?: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  name?: string;
  timezone?: string;
  reminder_enabled?: boolean;
  reminder_minutes_before?: number;
}

export const useWorkoutScheduling = () => {
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createSchedule = useCallback(async (scheduleData: CreateWorkoutScheduleData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_schedules')
        .insert(scheduleData)
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
      const { data, error } = await supabase
        .from('workout_schedules')
        .update(updates)
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
    return updateSchedule(scheduleId, { active });
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

      setSessions(data || []);
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
      const { data, error } = await supabase
        .from('workout_sessions')
        .update({ status })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      setSessions(prev => prev.map(s => s.id === sessionId ? data : s));
      return data;
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
