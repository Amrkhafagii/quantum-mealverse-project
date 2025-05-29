
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PreparationStageService, type PreparationStage, type PreparationProgress, type StageTransitionResult } from '@/services/preparation/preparationStageService';
import { PreparationTimerService, type TimerState } from '@/services/preparation/preparationTimerService';
import { useToast } from '@/hooks/use-toast';

export const usePreparationStages = (orderId: string) => {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for preparation stages
  const { data: stages, isLoading } = useQuery({
    queryKey: ['preparation-stages', orderId],
    queryFn: () => PreparationStageService.getOrderPreparationStages(orderId),
    enabled: !!orderId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Query for preparation progress
  const { data: progress } = useQuery({
    queryKey: ['preparation-progress', orderId],
    queryFn: () => PreparationStageService.getPreparationProgress(orderId),
    enabled: !!orderId,
    refetchInterval: 5000,
  });

  // Query for overall progress percentage
  const { data: overallProgress } = useQuery({
    queryKey: ['preparation-overall-progress', orderId],
    queryFn: () => PreparationStageService.getOverallProgress(orderId),
    enabled: !!orderId,
    refetchInterval: 5000,
  });

  // Start stage mutation
  const startStageMutation = useMutation({
    mutationFn: ({ orderId, stageName }: { orderId: string; stageName: string }) =>
      PreparationStageService.startStage(orderId, stageName),
    onSuccess: (success, { stageName }) => {
      if (success) {
        PreparationTimerService.startTimer(orderId, stageName);
        queryClient.invalidateQueries({ queryKey: ['preparation-stages', orderId] });
        queryClient.invalidateQueries({ queryKey: ['preparation-progress', orderId] });
        toast({
          title: 'Stage Started',
          description: `${stageName} stage has been started`,
        });
      }
    },
  });

  // Advance stage mutation
  const advanceStageMutation = useMutation({
    mutationFn: ({ orderId, stageName, notes }: { orderId: string; stageName: string; notes?: string }) =>
      PreparationStageService.advanceStage(orderId, stageName, notes),
    onSuccess: (result: StageTransitionResult) => {
      if (result.success) {
        PreparationTimerService.stopTimer(orderId);
        
        if (result.next_stage) {
          PreparationTimerService.startTimer(orderId, result.next_stage);
        }
        
        queryClient.invalidateQueries({ queryKey: ['preparation-stages', orderId] });
        queryClient.invalidateQueries({ queryKey: ['preparation-progress', orderId] });
        queryClient.invalidateQueries({ queryKey: ['preparation-overall-progress', orderId] });
        
        toast({
          title: 'Stage Advanced',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
  });

  // Skip stage mutation
  const skipStageMutation = useMutation({
    mutationFn: ({ orderId, stageName, reason }: { orderId: string; stageName: string; reason?: string }) =>
      PreparationStageService.skipStage(orderId, stageName, reason),
    onSuccess: (success, { stageName }) => {
      if (success) {
        PreparationTimerService.stopTimer(orderId);
        queryClient.invalidateQueries({ queryKey: ['preparation-stages', orderId] });
        queryClient.invalidateQueries({ queryKey: ['preparation-progress', orderId] });
        toast({
          title: 'Stage Skipped',
          description: `${stageName} stage has been skipped`,
        });
      }
    },
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: ({ orderId, stageName, notes }: { orderId: string; stageName: string; notes: string }) =>
      PreparationStageService.updateStageNotes(orderId, stageName, notes),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['preparation-stages', orderId] });
        toast({
          title: 'Notes Updated',
          description: 'Stage notes have been updated',
        });
      }
    },
  });

  // Timer state management
  useEffect(() => {
    if (!orderId) return;

    // Initialize timer for existing in-progress stage
    PreparationTimerService.initializeExistingTimer(orderId);

    // Subscribe to timer updates
    const unsubscribe = PreparationTimerService.subscribeToTimerUpdates(orderId, setTimerState);

    // Set initial timer state
    const initialTimer = PreparationTimerService.getTimerState(orderId);
    setTimerState(initialTimer);

    return () => {
      unsubscribe();
      // Don't stop timer on unmount unless explicitly requested
    };
  }, [orderId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only cleanup if no other components are using the timer
      // This is a basic implementation - could be improved with ref counting
    };
  }, []);

  const startStage = useCallback((stageName: string) => {
    startStageMutation.mutate({ orderId, stageName });
  }, [orderId, startStageMutation]);

  const advanceStage = useCallback((stageName: string, notes?: string) => {
    advanceStageMutation.mutate({ orderId, stageName, notes });
  }, [orderId, advanceStageMutation]);

  const skipStage = useCallback((stageName: string, reason?: string) => {
    skipStageMutation.mutate({ orderId, stageName, reason });
  }, [orderId, skipStageMutation]);

  const updateNotes = useCallback((stageName: string, notes: string) => {
    updateNotesMutation.mutate({ orderId, stageName, notes });
  }, [orderId, updateNotesMutation]);

  const pauseTimer = useCallback(() => {
    PreparationTimerService.pauseTimer(orderId);
  }, [orderId]);

  const resumeTimer = useCallback(() => {
    PreparationTimerService.resumeTimer(orderId);
  }, [orderId]);

  const getCurrentStage = useCallback(() => {
    return stages?.find(stage => stage.status === 'in_progress') || null;
  }, [stages]);

  const getElapsedMinutes = useCallback(() => {
    return PreparationTimerService.getElapsedMinutes(orderId);
  }, [orderId]);

  return {
    // Data
    stages,
    progress,
    overallProgress,
    timerState,
    isLoading,
    
    // Actions
    startStage,
    advanceStage,
    skipStage,
    updateNotes,
    pauseTimer,
    resumeTimer,
    
    // Helpers
    getCurrentStage,
    getElapsedMinutes,
    
    // Loading states
    isStarting: startStageMutation.isPending,
    isAdvancing: advanceStageMutation.isPending,
    isSkipping: skipStageMutation.isPending,
    isUpdatingNotes: updateNotesMutation.isPending,
  };
};
