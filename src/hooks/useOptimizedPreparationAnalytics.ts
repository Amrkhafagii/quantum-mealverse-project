
import { useState, useEffect } from 'react';
import { OptimizedPreparationAnalyticsService, type OptimizedPreparationAnalytics } from '@/services/preparation/optimizedPreparationAnalyticsService';
import { PreparationIntegrationHub } from '@/services/preparation/preparationIntegrationHub';
import { useConnectionStatus } from './useConnectionStatus';
import { toast } from '@/components/ui/use-toast';

export const useOptimizedPreparationAnalytics = (
  restaurantId: string | undefined,
  timeRange: 'week' | 'month' | 'quarter' = 'month'
) => {
  const [analytics, setAnalytics] = useState<OptimizedPreparationAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useConnectionStatus();

  const fetchAnalytics = async () => {
    if (!restaurantId || !isOnline) return;

    try {
      setLoading(true);
      setError(null);

      const analyticsData = await OptimizedPreparationAnalyticsService.getOptimizedPreparationAnalytics(
        restaurantId, 
        timeRange
      );

      setAnalytics(analyticsData);
      
      // Generate recommendations based on bottlenecks
      const recs = OptimizedPreparationAnalyticsService.getBottleneckRecommendations(analyticsData.bottlenecks);
      setRecommendations(recs);

      // Check for bottlenecks in parallel
      PreparationIntegrationHub.detectAndHandleBottlenecks(restaurantId);
    } catch (err) {
      console.error('Error fetching optimized preparation analytics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(errorMessage);
      
      if (isOnline) {
        toast({
          title: "Analytics Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh when dependencies change
  useEffect(() => {
    fetchAnalytics();
  }, [restaurantId, timeRange, isOnline]);

  // Auto-refresh analytics every 5 minutes
  useEffect(() => {
    if (!restaurantId || !isOnline) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [restaurantId, isOnline]);

  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  const getEfficiencyRating = (efficiency: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (efficiency >= 90) return 'excellent';
    if (efficiency >= 80) return 'good';
    if (efficiency >= 70) return 'fair';
    return 'poor';
  };

  const getBottleneckSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return {
    analytics,
    recommendations,
    loading,
    error,
    refreshAnalytics,
    getEfficiencyRating,
    getBottleneckSeverityColor,
    isOnline
  };
};
