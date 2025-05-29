
import { useState, useEffect, useCallback } from 'react';
import { PreparationStageService } from '@/services/preparation/preparationStageService';
import { useConnectionStatus } from './useConnectionStatus';
import { supabase } from '@/integrations/supabase/client';

export const usePreparationStages = (orderId: string) => {
  const [stages, setStages] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [timerState, setTimerState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const { isOnline } = useConnectionStatus();

  const loadStages = useCallback(async () => {
    if (!orderId || !isOnline) return;

    try {
      setIsLoading(true);
      const [stagesData, progressData, overallProg] = await Promise.all([
        PreparationStageService.getOrderPreparationStages(orderId),
        PreparationStageService.getPreparationProgress(orderId),
        PreparationStageService.getOverallProgress(orderId)
      ]);

      setStages(stagesData);
      setProgress(progressData);
      setOverallProgress(overallProg);
    } catch (error) {
      console.error('Error loading preparation stages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isOnline]);

  // Real-time updates
  useEffect(() => {
    if (!orderId || !isOnline) return;

    const channel = supabase
      .channel(`preparation_stages_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_preparation_stages',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          loadStages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, isOnline, loadStages]);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  const getCurrentStage = useCallback(() => {
    return stages.find(stage => stage.status === 'in_progress') || null;
  }, [stages]);

  const startStage = async (stageName: string) => {
    return await PreparationStageService.startStage(orderId, stageName);
  };

  const advanceStage = async (stageName: string, notes?: string) => {
    setIsAdvancing(true);
    try {
      const result = await PreparationStageService.advanceStage(orderId, stageName, notes);
      if (result.success) {
        await loadStages();
      }
      return result;
    } finally {
      setIsAdvancing(false);
    }
  };

  const skipStage = async (stageName: string, reason?: string) => {
    setIsSkipping(true);
    try {
      const result = await PreparationStageService.skipStage(orderId, stageName, reason);
      if (result) {
        await loadStages();
      }
      return result;
    } finally {
      setIsSkipping(false);
    }
  };

  const updateNotes = async (stageName: string, notes: string) => {
    return await PreparationStageService.updateStageNotes(orderId, stageName, notes);
  };

  const getEstimatedCompletionTime = async () => {
    return await PreparationStageService.getEstimatedCompletionTime(orderId);
  };

  const getElapsedMinutes = (startedAt: string) => {
    if (!startedAt) return 0;
    const started = new Date(startedAt);
    const now = new Date();
    return Math.floor((now.getTime() - started.getTime()) / (1000 * 60));
  };

  const pauseTimer = () => {
    setTimerState((prev: any) => prev ? { ...prev, isRunning: false } : null);
  };

  const resumeTimer = () => {
    setTimerState((prev: any) => prev ? { ...prev, isRunning: true } : null);
  };

  return {
    stages,
    progress,
    overallProgress,
    timerState,
    getCurrentStage,
    startStage,
    advanceStage,
    skipStage,
    updateNotes,
    getEstimatedCompletionTime,
    getElapsedMinutes,
    pauseTimer,
    resumeTimer,
    isLoading,
    isAdvancing,
    isSkipping
  };
};
