
import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AssignmentMonitoringService } from '@/services/monitoring/assignmentMonitoringService';

export interface PreparationStage {
  id: string;
  stage_name: string;
  status: string;
  stage_order: number;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  started_at?: string;
  completed_at?: string;
  notes?: string;
}

interface PreparationStagesState {
  stages: PreparationStage[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_STAGES'; stages: PreparationStage[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };

const initialState: PreparationStagesState = {
  stages: [],
  loading: true,
  error: null,
};

function reducer(state: PreparationStagesState, action: Action): PreparationStagesState {
  switch (action.type) {
    case 'SET_STAGES':
      return { ...state, stages: action.stages, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export const usePreparationStages = (orderId: string) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toast } = useToast();

  // Calculate overall progress, memoized based on stages
  const overallProgress = useMemo(() => {
    const stageCount = state.stages.length;
    if (!stageCount) return 0;
    const completed = state.stages.filter(s => s.status === 'completed').length;
    return Math.round((completed / stageCount) * 100);
  }, [state.stages]);

  // Fetch stages from DB
  const fetchStages = useCallback(async () => {
    if (!orderId) return;
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      const { data, error } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .order('stage_order', { ascending: true });

      if (error) {
        console.error('PreparationStages: Error fetching stages:', error);
        throw error;
      }
      dispatch({ type: 'SET_STAGES', stages: data ?? [] });

      await AssignmentMonitoringService.logMonitoringEvent(
        'preparation_stages_loaded',
        `Loaded ${data?.length || 0} stages for order`,
        { order_id: orderId, stages_count: data?.length || 0, progress: overallProgress }
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load preparation stages';
      dispatch({ type: 'SET_ERROR', error: errMsg });

      await AssignmentMonitoringService.logMonitoringEvent(
        'preparation_stages_error', errMsg, { order_id: orderId, error: err }
      );
      toast({
        title: "Error",
        description: "Failed to load preparation stages",
        variant: "destructive",
      });
    }
  }, [orderId, toast, overallProgress]);

  // Advance current stage, start the next
  const advanceStage = useCallback(async (stageName: string) => {
    try {
      // Complete current stage
      const stage = state.stages.find(s => s.stage_name === stageName);
      if (!stage) throw new Error('Stage not found');
      const { error: completeError } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', stage.id);

      if (completeError) throw completeError;

      // Find next
      const nextStage = state.stages
        .filter(s => s.stage_order > stage.stage_order && s.status === 'pending')
        .sort((a, b) => a.stage_order - b.stage_order)[0];

      if (nextStage) {
        const { error: startError } = await supabase
          .from('order_preparation_stages')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('id', nextStage.id);

        if (startError) throw startError;
      } else {
        // All stages complete? Mark order as ready
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'ready_for_pickup' })
          .eq('id', orderId);
        if (orderError) throw orderError;
        toast({
          title: "Order Ready",
          description: "Order is now ready for pickup!",
        });
      }

      await AssignmentMonitoringService.logMonitoringEvent(
        'stage_advanced',
        `Stage ${stageName} advanced for order`,
        {
          order_id: orderId,
          stage_name: stageName,
          next_stage: nextStage?.stage_name || 'completed',
        }
      );

      await fetchStages();
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      await AssignmentMonitoringService.logMonitoringEvent(
        'stage_advance_error',
        `Failed to advance stage ${stageName}`,
        {
          order_id: orderId,
          stage_name: stageName,
          error: error
        }
      );
      toast({
        title: "Error",
        description: "Failed to advance preparation stage",
        variant: "destructive",
      });
      dispatch({ type: 'SET_ERROR', error: errorMsg });
      return false;
    }
  }, [orderId, state.stages, fetchStages, toast]);

  // Update stage notes
  const updateNotes = useCallback(async (stageName: string, notes: string) => {
    try {
      const stage = state.stages.find(s => s.stage_name === stageName);
      if (!stage) throw new Error('Stage not found');
      const { error } = await supabase
        .from('order_preparation_stages')
        .update({ notes })
        .eq('id', stage.id);
      if (error) throw error;

      toast({
        title: "Notes Updated",
        description: "Stage notes have been updated",
      });

      await fetchStages();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stage notes",
        variant: "destructive",
      });
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }, [state.stages, fetchStages, toast]);

  // Get the current stage
  const getCurrentStage = useCallback(() => {
    return state.stages.find(s => s.status === 'in_progress') || null;
  }, [state.stages]);

  // Memoized estimated completion
  const getEstimatedCompletionTime = useCallback(async (): Promise<Date | null> => {
    if (!state.stages.length) return null;
    const currentStage = state.stages.find(s => s.status === 'in_progress');
    if (!currentStage) return null;
    const pendingStages = state.stages.filter(s => s.status === 'pending' || s.status === 'in_progress');
    const totalMinutes = pendingStages.reduce((acc, s) => acc + s.estimated_duration_minutes, 0);
    return new Date(Date.now() + totalMinutes * 60 * 1000);
  }, [state.stages]);

  // Elapsed minutes for a stage
  const getElapsedMinutes = useCallback((stageName: string): number => {
    const stage = state.stages.find(s => s.stage_name === stageName);
    if (!stage || !stage.started_at) return 0;
    const start = new Date(stage.started_at).getTime();
    return Math.floor((Date.now() - start) / (1000 * 60));
  }, [state.stages]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    dispatch({ type: 'RESET' });
    if (!orderId) return;
    fetchStages();
  }, [orderId, fetchStages]);

  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`preparation_stages_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_preparation_stages',
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          fetchStages();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [orderId, fetchStages]);

  return {
    stages: state.stages,
    loading: state.loading,
    error: state.error,
    overallProgress,
    advanceStage,
    updateNotes,
    refetch: fetchStages,
    getCurrentStage,
    getEstimatedCompletionTime,
    getElapsedMinutes,
    isLoading: state.loading
  };
};
