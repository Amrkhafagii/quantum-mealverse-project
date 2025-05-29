
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PreparationStageService } from '@/services/preparation/preparationStageService';
import { toast } from 'react-hot-toast';

export const usePreparationStages = (orderId: string) => {
  const [stages, setStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    const fetchStages = async () => {
      try {
        setIsLoading(true);
        const stageData = await PreparationStageService.getOrderPreparationStages(orderId);
        setStages(stageData);
        
        // Calculate overall progress
        const completedStages = stageData.filter(s => s.status === 'completed').length;
        const progress = stageData.length > 0 ? (completedStages / stageData.length) * 100 : 0;
        setOverallProgress(Math.round(progress));
      } catch (error) {
        console.error('Error fetching preparation stages:', error);
        toast.error('Failed to load preparation stages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStages();

    // Set up real-time subscription for stage updates
    const subscription = supabase
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
      subscription.unsubscribe();
    };
  }, [orderId]);

  const advanceStage = async (stageName: string, notes?: string) => {
    try {
      const result = await PreparationStageService.advanceStage(orderId, stageName, notes);
      if (result.success) {
        toast.success(`${stageName} stage completed!`);
        // Refetch stages to get updated data
        const updatedStages = await PreparationStageService.getOrderPreparationStages(orderId);
        setStages(updatedStages);
        
        // Update progress
        const completedStages = updatedStages.filter(s => s.status === 'completed').length;
        const progress = updatedStages.length > 0 ? (completedStages / updatedStages.length) * 100 : 0;
        setOverallProgress(Math.round(progress));
      } else {
        toast.error(result.message || 'Failed to advance stage');
      }
      return result;
    } catch (error) {
      console.error('Error advancing stage:', error);
      toast.error('Failed to advance stage');
      return { success: false, message: 'Failed to advance stage' };
    }
  };

  const updateNotes = async (stageName: string, notes: string) => {
    try {
      const success = await PreparationStageService.updateStageNotes(orderId, stageName, notes);
      if (success) {
        toast.success('Notes updated successfully');
        // Refetch stages to get updated data
        const updatedStages = await PreparationStageService.getOrderPreparationStages(orderId);
        setStages(updatedStages);
      } else {
        toast.error('Failed to update notes');
      }
      return success;
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
      return false;
    }
  };

  const getElapsedMinutes = (stageName: string) => {
    const stage = stages.find(s => s.stage_name === stageName);
    if (!stage || !stage.started_at) return 0;
    
    const startTime = new Date(stage.started_at);
    const now = new Date();
    return Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
  };

  const getCurrentStage = () => {
    return stages.find(s => s.status === 'in_progress') || null;
  };

  const getEstimatedCompletionTime = async () => {
    try {
      return await PreparationStageService.getEstimatedCompletionTime(orderId);
    } catch (error) {
      console.error('Error getting estimated completion time:', error);
      return null;
    }
  };

  // Calculate preparation progress (for customer view)
  const progress = stages.map(stage => ({
    stage_name: stage.stage_name,
    status: stage.status,
    stage_order: stage.stage_order,
    started_at: stage.started_at,
    completed_at: stage.completed_at,
    estimated_duration_minutes: stage.estimated_duration_minutes,
    actual_duration_minutes: stage.actual_duration_minutes,
    notes: stage.notes,
    progress_percentage: stage.status === 'completed' ? 100 : stage.status === 'in_progress' ? 50 : 0
  }));

  return {
    stages,
    isLoading,
    overallProgress,
    progress,
    advanceStage,
    updateNotes,
    getElapsedMinutes,
    getCurrentStage,
    getEstimatedCompletionTime
  };
};
