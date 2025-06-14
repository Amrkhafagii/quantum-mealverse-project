import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useWorkoutScheduling(userId: string) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch schedules from Supabase (correct user_id mapping)
  async function fetchSchedules() {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('workout_schedules')
        .select('*')
        .eq('workout_schedules_user_id', userId);
      setSchedules(data || []);
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch sessions from Supabase (correct user_id mapping)
  async function fetchSessions() {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('workout_sessions_user_id', userId);
      setSessions(data || []);
    } finally {
      setIsLoading(false);
    }
  }

  // Function to book a workout session
  async function bookSession(scheduleId: string, date: string, time: string) {
    setIsLoading(true);
    try {
      // Fetch the workout schedule to get workout plan id
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('workout_schedules')
        .select('workout_plan_id')
        .eq('id', scheduleId)
        .single();

      if (scheduleError) throw scheduleError;

      const workoutPlanId = scheduleData?.workout_plan_id;

      // Insert the workout session
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert([
          {
            workout_sessions_user_id: userId, // Use the passed userId
            workout_plan_id: workoutPlanId,
            scheduled_date: date,
            scheduled_time: time,
            status: 'scheduled',
          },
        ]);

      if (error) throw error;

      // Refresh sessions after booking
      await fetchSessions();
    } finally {
      setIsLoading(false);
    }
  }

  // Function to cancel a workout session
  async function cancelSession(sessionId: string) {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Refresh sessions after cancellation
      await fetchSessions();
    } finally {
      setIsLoading(false);
    }
  }

  // Function to reschedule a workout session
  async function rescheduleSession(sessionId: string, newDate: string, newTime: string) {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ scheduled_date: newDate, scheduled_time: newTime })
        .eq('id', sessionId);

      if (error) throw error;

      // Refresh sessions after rescheduling
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
  };
}
