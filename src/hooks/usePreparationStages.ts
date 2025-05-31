
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AssignmentMonitoringService } from '@/services/monitoring/assignmentMonitoringService';

interface PreparationStage {
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

export const usePreparationStages = (orderId: string) => {
  const [stages, setStages] = useState<PreparationStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const { toast } = useToast();

  const fetchStages = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('PreparationStages: Fetching stages for order:', orderId);

      const { data, error: fetchError } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .order('stage_order', { ascending: true });

      if (fetchError) {
        console.error('PreparationStages: Error fetching stages:', fetchError);
        throw fetchError;
      }

      console.log('PreparationStages: Fetched stages:', data?.length || 0);

      const stagesData = data || [];
      setStages(stagesData);

      // Calculate overall progress
      const completedStages = stagesData.filter(s => s.status === 'completed').length;
      const progress = stagesData.length > 0 ? Math.round((completedStages / stagesData.length) * 100) : 0;
      setOverallProgress(progress);

      // Log monitoring event
      await AssignmentMonitoringService.logMonitoringEvent(
        'preparation_stages_loaded',
        `Loaded ${stagesData.length} stages for order`,
        { 
          order_id: orderId,
          stages_count: stagesData.length,
          progress
        }
      );

    } catch (err) {
      console.error('PreparationStages: Error in fetchStages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preparation stages';
      setError(errorMessage);
      
      // Log error
      await AssignmentMonitoringService.logMonitoringEvent(
        'preparation_stages_error',
        errorMessage,
        { order_id: orderId, error: err }
      );

      toast({
        title: "Error",
        description: "Failed to load preparation stages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [orderId, toast]);

  const advanceStage = useCallback(async (stageName: string) => {
    try {
      console.log('PreparationStages: Advancing stage:', stageName);

      // Complete current stage
      const { error: completeError } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .eq('stage_name', stageName);

      if (completeError) throw completeError;

      // Get next stage
      const currentStageOrder = stages.find(s => s.stage_name === stageName)?.stage_order || 0;
      const nextStage = stages.find(s => s.stage_order > currentStageOrder && s.status === 'pending');

      if (nextStage) {
        // Start next stage
        const { error: startError } = await supabase
          .from('order_preparation_stages')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('id', nextStage.id);

        if (startError) throw startError;
      } else {
        // No more stages, mark order as ready
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

      // Log monitoring event
      await AssignmentMonitoringService.logMonitoringEvent(
        'stage_advanced',
        `Stage ${stageName} advanced for order`,
        { 
          order_id: orderId,
          stage_name: stageName,
          next_stage: nextStage?.stage_name || 'completed'
        }
      );

      await fetchStages();
      return true;
    } catch (error) {
      console.error('PreparationStages: Error advancing stage:', error);
      
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
      return false;
    }
  }, [orderId, stages, fetchStages, toast]);

  const updateNotes = useCallback(async (stageName: string, notes: string) => {
    try {
      const stage = stages.find(s => s.stage_name === stageName);
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
      console.error('PreparationStages: Error updating notes:', error);
      toast({
        title: "Error",
        description: "Failed to update stage notes",
        variant: "destructive",
      });
      return false;
    }
  }, [stages, fetchStages, toast]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  useEffect(() => {
    if (!orderId) return;

    // Set up real-time subscription
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
        (payload) => {
          console.log('PreparationStages: Real-time update received:', payload);
          fetchStages();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [orderId, fetchStages]);

  return {
    stages,
    loading,
    error,
    overallProgress,
    advanceStage,
    updateNotes,
    refetch: fetchStages
  };
};
