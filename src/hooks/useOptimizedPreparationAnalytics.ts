
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { preparationIntegrationHub } from '@/services/preparation/preparationIntegrationHub';

interface PreparationAnalytics {
  averagePreparationTime: number;
  completionRate: number;
  delayFrequency: number;
  qualityScore: number;
  staffEfficiency: number;
}

export const useOptimizedPreparationAnalytics = (restaurantId: string) => {
  const [analytics, setAnalytics] = useState<PreparationAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const result = await preparationIntegrationHub.getPreparationAnalytics(restaurantId);
      setAnalytics(result);
    } catch (error) {
      console.error('Error loading preparation analytics:', error);
      toast.error('Failed to load preparation analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [restaurantId]);

  const optimizeWorkflow = async () => {
    if (!restaurantId) return;
    
    try {
      const result = await preparationIntegrationHub.optimizeWorkflow(restaurantId);
      if (result.success) {
        toast.success('Workflow optimization completed');
        loadAnalytics(); // Refresh analytics
      } else {
        toast.error('Failed to optimize workflow');
      }
    } catch (error) {
      console.error('Error optimizing workflow:', error);
      toast.error('Failed to optimize workflow');
    }
  };

  return {
    analytics,
    loading,
    optimizeWorkflow,
    refreshAnalytics: loadAnalytics
  };
};
