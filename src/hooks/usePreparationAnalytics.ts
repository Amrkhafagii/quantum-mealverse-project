
import { useState, useEffect } from 'react';
import { PreparationAnalyticsService, type PreparationAnalytics, type PreparationTrends } from '@/services/preparation/preparationAnalyticsService';
import { useConnectionStatus } from './useConnectionStatus';
import { toast } from '@/components/ui/use-toast';

export const usePreparationAnalytics = (
  restaurantId: string | undefined,
  timeRange: 'week' | 'month' | 'quarter' = 'month'
) => {
  const [analytics, setAnalytics] = useState<PreparationAnalytics | null>(null);
  const [trends, setTrends] = useState<PreparationTrends | null>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useConnectionStatus();

  const fetchAnalytics = async () => {
    if (!restaurantId || !isOnline) return;

    try {
      setLoading(true);
      setError(null);

      const [analyticsData, trendsData, realTimeData] = await Promise.all([
        PreparationAnalyticsService.getPreparationAnalytics(restaurantId, timeRange),
        PreparationAnalyticsService.getPreparationTrends(restaurantId),
        PreparationAnalyticsService.getRealTimePerformance(restaurantId)
      ]);

      setAnalytics(analyticsData);
      setTrends(trendsData);
      setRealTimeData(realTimeData);
    } catch (err) {
      console.error('Error fetching preparation analytics:', err);
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

  // Auto-refresh real-time data
  useEffect(() => {
    if (!restaurantId || !isOnline) return;

    const interval = setInterval(async () => {
      try {
        const data = await PreparationAnalyticsService.getRealTimePerformance(restaurantId);
        setRealTimeData(data);
      } catch (error) {
        console.error('Error refreshing real-time data:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [restaurantId, isOnline]);

  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  const getBottleneckSeverity = (variance: number): 'low' | 'medium' | 'high' => {
    if (variance > 50) return 'high';
    if (variance > 30) return 'medium';
    return 'low';
  };

  const getEfficiencyRating = (efficiency: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (efficiency >= 90) return 'excellent';
    if (efficiency >= 80) return 'good';
    if (efficiency >= 70) return 'fair';
    return 'poor';
  };

  const getPerformanceInsights = (): string[] => {
    if (!analytics) return [];

    const insights: string[] = [];

    // Analyze completion rates
    const avgCompletionRate = Object.values(analytics.stageCompletionRates).reduce((a, b) => a + b, 0) / 
                              Object.values(analytics.stageCompletionRates).length;
    
    if (avgCompletionRate < 85) {
      insights.push("Stage completion rates could be improved. Consider reviewing training procedures.");
    }

    // Analyze bottlenecks
    if (analytics.bottlenecks.length > 0) {
      const severestBottleneck = analytics.bottlenecks.reduce((prev, current) => 
        prev.variance > current.variance ? prev : current
      );
      insights.push(`${severestBottleneck.stage.replace('_', ' ')} is your biggest bottleneck with ${severestBottleneck.variance.toFixed(1)}% variance.`);
    }

    // Analyze on-time delivery
    if (analytics.performanceMetrics.onTimeDeliveryRate < 80) {
      insights.push("On-time delivery rate is below target. Consider optimizing preparation workflows.");
    }

    // Analyze customer satisfaction
    if (analytics.performanceMetrics.customerSatisfactionScore < 4.0) {
      insights.push("Customer satisfaction could be improved. Focus on quality and communication.");
    }

    return insights;
  };

  return {
    analytics,
    trends,
    realTimeData,
    loading,
    error,
    refreshAnalytics,
    getBottleneckSeverity,
    getEfficiencyRating,
    getPerformanceInsights,
    isOnline
  };
};
