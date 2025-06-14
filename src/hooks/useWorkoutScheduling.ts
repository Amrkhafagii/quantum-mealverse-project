
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { WorkoutSchedule, WorkoutSession, CreateWorkoutScheduleData, CalendarEvent } from '@/types/fitness/scheduling';

export function useWorkoutScheduling(userIdFromProps?: string) {
  const { user } = useAuth?.() || {};
  const userId = userIdFromProps || user?.id;

  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function fetchSchedules() {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('workout_schedules')
        .select('*')
        .eq('workout_schedules_user_id', userId);
      setSchedules((data as WorkoutSchedule[]) || []);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSessions(startDate?: string, endDate?: string) {
    if (!userId) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('workout_sessions')
        .select('*')
        .eq('workout_sessions_user_id', userId);
      if (startDate) query = query.gte('scheduled_date', startDate);
      if (endDate) query = query.lte('scheduled_date', endDate);
      const { data } = await query;
      // Map DB field workout_sessions_user_id to WorkoutSession.user_id (for compatibility)
      const mappedSessions: WorkoutSession[] =
        (data as any[] ?? []).map(s => ({
          ...s,
          user_id: s.workout_sessions_user_id,
        }));
      setSessions(mappedSessions);
    } finally {
      setIsLoading(false);
    }
  }

  async function createSchedule(schedule: CreateWorkoutScheduleData) {
    if (!userId) throw new Error('No userId');
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_schedules')
        .insert([
          {
            ...schedule,
            workout_schedules_user_id: userId,
          },
        ]);
      if (error) throw error;
      await fetchSchedules();
    } finally {
      setIsLoading(false);
    }
  }

  async function updateSchedule(scheduleId: string, updates: Partial<CreateWorkoutScheduleData>) {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_schedules')
        .update(updates)
        .eq('id', scheduleId);
      if (error) throw error;
      await fetchSchedules();
    } finally {
      setIsLoading(false);
    }
  }

  function getCalendarEvents(startDate?: string, endDate?: string): CalendarEvent[] {
    let filteredSessions = sessions;
    if (startDate) {
      filteredSessions = filteredSessions.filter(s =>
        (!s.scheduled_date || s.scheduled_date >= startDate)
      );
    }
    if (endDate) {
      filteredSessions = filteredSessions.filter(s =>
        (!s.scheduled_date || s.scheduled_date <= endDate)
      );
    }
    return filteredSessions.map(session => ({
      id: session.id,
      date: session.scheduled_date,
      title: `Workout`,
      status: session.status,
      time: session.scheduled_time,
      type: 'session',
      workoutPlanId: session.workout_plan_id,
      scheduleId: session.workout_schedule_id
    }));
  }

  async function bookSession(scheduleId: string, date: string, time: string) {
    setIsLoading(true);
    try {
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('workout_schedules')
        .select('workout_plan_id')
        .eq('id', scheduleId)
        .single();

      if (scheduleError) throw scheduleError;
      const workoutPlanId = scheduleData?.workout_plan_id;

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert([
          {
            workout_sessions_user_id: userId,
            workout_plan_id: workoutPlanId,
            scheduled_date: date,
            scheduled_time: time,
            status: 'scheduled',
          },
        ]);
      if (error) throw error;
      await fetchSessions();
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelSession(sessionId: string) {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId);
      if (error) throw error;
      await fetchSessions();
    } finally {
      setIsLoading(false);
    }
  }

  async function rescheduleSession(sessionId: string, newDate: string, newTime: string) {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ scheduled_date: newDate, scheduled_time: newTime })
        .eq('id', sessionId);
      if (error) throw error;
      await fetchSessions();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      fetchSchedules();
      fetchSessions();
    }
  }, [userId]);

  return {
    schedules,
    sessions,
    isLoading,
    fetchSchedules,
    fetchSessions,
    bookSession,
    cancelSession,
    rescheduleSession,
    createSchedule,
    updateSchedule,
    getCalendarEvents,
  };
}
