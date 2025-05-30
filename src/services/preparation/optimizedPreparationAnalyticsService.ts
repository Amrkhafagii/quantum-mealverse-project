
import { supabase } from '@/integrations/supabase/client';

export interface OptimizedPreparationAnalytics {
  bottlenecks: PreparationBottleneck[];
  stageCompletionRates: Record<string, number>;
  performanceMetrics: {
    averageCompletionTime: number;
    onTimeDeliveryRate: number;
    customerSatisfactionScore: number;
    efficiencyScore: number;
  };
  realTimeMetrics: {
    currentOrdersInProgress: number;
    averageWaitTime: number;
    staffUtilization: number;
  };
  trends: {
    completionTimeHistory: Array<{ date: string; avgTime: number }>;
    bottleneckFrequency: Record<string, number>;
  };
}

export interface PreparationBottleneck {
  stage: string;
  severity: 'low' | 'medium' | 'high';
  variance: number;
  impact: number;
  frequency: number;
  avgDelay: number;
  description: string;
}

export class OptimizedPreparationAnalyticsService {
  /**
   * Get comprehensive preparation analytics with optimized bottleneck detection
   */
  static async getOptimizedPreparationAnalytics(
    restaurantId: string,
    timeRange: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<OptimizedPreparationAnalytics> {
    try {
      console.log(`Fetching optimized preparation analytics for restaurant ${restaurantId}`);

      const dateRange = this.getDateRange(timeRange);
      
      // Fetch preparation stages data with early bottleneck detection
      const { data: stagesData, error: stagesError } = await supabase
        .from('order_preparation_stages')
        .select(`
          *,
          orders!inner(
            id,
            restaurant_id,
            status,
            total,
            created_at
          )
        `)
        .eq('orders.restaurant_id', restaurantId)
        .gte('orders.created_at', dateRange.start)
        .lte('orders.created_at', dateRange.end);

      if (stagesError) {
        console.error('Error fetching preparation stages:', stagesError);
        throw new Error('Failed to fetch preparation stages data');
      }

      // Process data and detect bottlenecks early
      const analytics = await this.processAnalyticsData(stagesData || [], restaurantId, dateRange);
      
      console.log('Successfully processed optimized preparation analytics');
      return analytics;
    } catch (error) {
      console.error('Error in getOptimizedPreparationAnalytics:', error);
      throw error;
    }
  }

  /**
   * Process analytics data with integrated bottleneck detection
   */
  private static async processAnalyticsData(
    stagesData: any[],
    restaurantId: string,
    dateRange: { start: string; end: string }
  ): Promise<OptimizedPreparationAnalytics> {
    // Group stages by order and stage name
    const stagesByOrder = new Map<string, any[]>();
    const stageMetrics = new Map<string, { times: number[]; delays: number[] }>();

    stagesData.forEach(stage => {
      const orderId = stage.orders?.id || stage.order_id;
      if (!stagesByOrder.has(orderId)) {
        stagesByOrder.set(orderId, []);
      }
      stagesByOrder.get(orderId)!.push(stage);

      // Track stage performance for bottleneck detection
      if (stage.completed_at && stage.started_at) {
        const stageName = stage.stage_name;
        const duration = new Date(stage.completed_at).getTime() - new Date(stage.started_at).getTime();
        const durationMinutes = duration / (1000 * 60);
        
        if (!stageMetrics.has(stageName)) {
          stageMetrics.set(stageName, { times: [], delays: [] });
        }
        
        const metrics = stageMetrics.get(stageName)!;
        metrics.times.push(durationMinutes);
        
        // Calculate delay based on estimated duration
        const estimatedDuration = stage.estimated_duration_minutes || 15;
        const delay = Math.max(0, durationMinutes - estimatedDuration);
        metrics.delays.push(delay);
      }
    });

    // Detect bottlenecks with severity classification
    const bottlenecks = this.detectBottlenecksWithSeverity(stageMetrics);

    // Calculate stage completion rates
    const stageCompletionRates = this.calculateStageCompletionRates(stagesData);

    // Calculate performance metrics with dynamic customer satisfaction
    const performanceMetrics = await this.calculatePerformanceMetrics(
      stagesData,
      restaurantId,
      dateRange
    );

    // Calculate real-time metrics
    const realTimeMetrics = await this.calculateRealTimeMetrics(restaurantId);

    // Calculate trends
    const trends = this.calculateTrends(stagesData, stageMetrics);

    return {
      bottlenecks,
      stageCompletionRates,
      performanceMetrics,
      realTimeMetrics,
      trends
    };
  }

  /**
   * Enhanced bottleneck detection with severity classification
   */
  private static detectBottlenecksWithSeverity(
    stageMetrics: Map<string, { times: number[]; delays: number[] }>
  ): PreparationBottleneck[] {
    const bottlenecks: PreparationBottleneck[] = [];

    stageMetrics.forEach((metrics, stageName) => {
      if (metrics.times.length < 2) return; // Need at least 2 data points

      // Calculate variance and average
      const avgTime = metrics.times.reduce((a, b) => a + b, 0) / metrics.times.length;
      const variance = metrics.times.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / metrics.times.length;
      const variancePercentage = (Math.sqrt(variance) / avgTime) * 100;

      // Calculate delay metrics
      const avgDelay = metrics.delays.reduce((a, b) => a + b, 0) / metrics.delays.length;
      const delayFrequency = metrics.delays.filter(d => d > 0).length / metrics.delays.length;

      // Determine severity based on multiple factors
      let severity: 'low' | 'medium' | 'high' = 'low';
      let impact = 0;

      if (variancePercentage > 50 && avgDelay > 10) {
        severity = 'high';
        impact = variancePercentage * avgDelay * delayFrequency;
      } else if (variancePercentage > 30 || avgDelay > 5) {
        severity = 'medium';
        impact = (variancePercentage * avgDelay * delayFrequency) / 2;
      } else if (variancePercentage > 15) {
        severity = 'low';
        impact = (variancePercentage * avgDelay * delayFrequency) / 4;
      }

      // Only include stages that show significant bottleneck indicators
      if (variancePercentage > 15 || avgDelay > 2) {
        bottlenecks.push({
          stage: stageName,
          severity,
          variance: variancePercentage,
          impact,
          frequency: delayFrequency,
          avgDelay,
          description: this.generateBottleneckDescription(stageName, severity, avgDelay, variancePercentage)
        });
      }
    });

    // Sort by impact (highest first)
    return bottlenecks.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Generate descriptive bottleneck descriptions
   */
  private static generateBottleneckDescription(
    stage: string,
    severity: 'low' | 'medium' | 'high',
    avgDelay: number,
    variance: number
  ): string {
    const stageDisplayName = stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    switch (severity) {
      case 'high':
        return `${stageDisplayName} shows critical delays (avg: ${avgDelay.toFixed(1)}min) with high variability (${variance.toFixed(1)}%)`;
      case 'medium':
        return `${stageDisplayName} experiences moderate delays (avg: ${avgDelay.toFixed(1)}min) with some inconsistency`;
      case 'low':
        return `${stageDisplayName} has minor timing variations that could be optimized`;
      default:
        return `${stageDisplayName} bottleneck detected`;
    }
  }

  /**
   * Calculate stage completion rates
   */
  private static calculateStageCompletionRates(stagesData: any[]): Record<string, number> {
    const stageStats = new Map<string, { total: number; completed: number }>();

    stagesData.forEach(stage => {
      const stageName = stage.stage_name;
      if (!stageStats.has(stageName)) {
        stageStats.set(stageName, { total: 0, completed: 0 });
      }
      
      const stats = stageStats.get(stageName)!;
      stats.total++;
      if (stage.status === 'completed') {
        stats.completed++;
      }
    });

    const completionRates: Record<string, number> = {};
    stageStats.forEach((stats, stageName) => {
      completionRates[stageName] = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    });

    return completionRates;
  }

  /**
   * Calculate performance metrics with dynamic customer satisfaction
   */
  private static async calculatePerformanceMetrics(
    stagesData: any[],
    restaurantId: string,
    dateRange: { start: string; end: string }
  ): Promise<OptimizedPreparationAnalytics['performanceMetrics']> {
    // Calculate average completion time
    const completedOrders = stagesData
      .filter(stage => stage.stage_name === 'ready' && stage.completed_at)
      .map(stage => {
        const orderStart = new Date(stage.orders?.created_at || stage.created_at);
        const orderReady = new Date(stage.completed_at);
        return (orderReady.getTime() - orderStart.getTime()) / (1000 * 60); // minutes
      });

    const averageCompletionTime = completedOrders.length > 0
      ? completedOrders.reduce((a, b) => a + b, 0) / completedOrders.length
      : 0;

    // Calculate on-time delivery rate (orders completed within estimated time)
    const onTimeOrders = completedOrders.filter(time => time <= 45); // 45 minutes default
    const onTimeDeliveryRate = completedOrders.length > 0
      ? (onTimeOrders.length / completedOrders.length) * 100
      : 100;

    // Dynamic customer satisfaction calculation
    const customerSatisfactionScore = await this.calculateDynamicCustomerSatisfaction(
      restaurantId,
      dateRange,
      averageCompletionTime,
      onTimeDeliveryRate
    );

    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(
      averageCompletionTime,
      onTimeDeliveryRate,
      customerSatisfactionScore
    );

    return {
      averageCompletionTime,
      onTimeDeliveryRate,
      customerSatisfactionScore,
      efficiencyScore
    };
  }

  /**
   * Dynamic customer satisfaction calculation based on available metrics
   */
  private static async calculateDynamicCustomerSatisfaction(
    restaurantId: string,
    dateRange: { start: string; end: string },
    avgCompletionTime: number,
    onTimeRate: number
  ): Promise<number> {
    try {
      // Try to fetch actual review data
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .eq('status', 'approved');

      if (reviews && reviews.length > 0) {
        // Use actual review ratings
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        return (avgRating / 5) * 100; // Convert to percentage
      }

      // Fallback to calculated satisfaction based on performance metrics
      return this.calculateEstimatedSatisfaction(avgCompletionTime, onTimeRate);
    } catch (error) {
      console.warn('Could not fetch review data, using estimated satisfaction:', error);
      return this.calculateEstimatedSatisfaction(avgCompletionTime, onTimeRate);
    }
  }

  /**
   * Estimate customer satisfaction based on performance metrics
   */
  private static calculateEstimatedSatisfaction(avgCompletionTime: number, onTimeRate: number): number {
    // Base satisfaction starts at 80%
    let satisfaction = 80;

    // Adjust based on completion time (faster = better)
    if (avgCompletionTime <= 30) {
      satisfaction += 10;
    } else if (avgCompletionTime <= 45) {
      satisfaction += 5;
    } else if (avgCompletionTime > 60) {
      satisfaction -= 10;
    }

    // Adjust based on on-time rate
    if (onTimeRate >= 90) {
      satisfaction += 10;
    } else if (onTimeRate >= 80) {
      satisfaction += 5;
    } else if (onTimeRate < 70) {
      satisfaction -= 15;
    }

    return Math.max(0, Math.min(100, satisfaction));
  }

  /**
   * Calculate overall efficiency score
   */
  private static calculateEfficiencyScore(
    avgCompletionTime: number,
    onTimeRate: number,
    customerSatisfactionScore: number
  ): number {
    // Weight factors: time (30%), on-time rate (40%), satisfaction (30%)
    const timeScore = Math.max(0, 100 - (avgCompletionTime - 30)); // 30 min is optimal
    const efficiencyScore = (timeScore * 0.3) + (onTimeRate * 0.4) + (customerSatisfactionScore * 0.3);
    
    return Math.max(0, Math.min(100, efficiencyScore));
  }

  /**
   * Calculate real-time metrics
   */
  private static async calculateRealTimeMetrics(
    restaurantId: string
  ): Promise<OptimizedPreparationAnalytics['realTimeMetrics']> {
    try {
      // Get current orders in progress
      const { data: currentOrders } = await supabase
        .from('orders')
        .select('id, created_at')
        .eq('restaurant_id', restaurantId)
        .in('status', ['restaurant_accepted', 'preparing']);

      const currentOrdersInProgress = currentOrders?.length || 0;

      // Calculate average wait time for current orders
      const averageWaitTime = currentOrders && currentOrders.length > 0
        ? currentOrders.reduce((sum, order) => {
            const waitTime = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);
            return sum + waitTime;
          }, 0) / currentOrders.length
        : 0;

      // Estimate staff utilization (simplified calculation)
      const staffUtilization = Math.min(100, currentOrdersInProgress * 25); // Assume 4 orders = 100% utilization

      return {
        currentOrdersInProgress,
        averageWaitTime,
        staffUtilization
      };
    } catch (error) {
      console.error('Error calculating real-time metrics:', error);
      return {
        currentOrdersInProgress: 0,
        averageWaitTime: 0,
        staffUtilization: 0
      };
    }
  }

  /**
   * Calculate trends
   */
  private static calculateTrends(
    stagesData: any[],
    stageMetrics: Map<string, { times: number[]; delays: number[] }>
  ): OptimizedPreparationAnalytics['trends'] {
    // Group completion times by date
    const completionTimeByDate = new Map<string, number[]>();
    
    stagesData
      .filter(stage => stage.stage_name === 'ready' && stage.completed_at)
      .forEach(stage => {
        const date = new Date(stage.completed_at).toISOString().split('T')[0];
        const orderStart = new Date(stage.orders?.created_at || stage.created_at);
        const orderReady = new Date(stage.completed_at);
        const duration = (orderReady.getTime() - orderStart.getTime()) / (1000 * 60);
        
        if (!completionTimeByDate.has(date)) {
          completionTimeByDate.set(date, []);
        }
        completionTimeByDate.get(date)!.push(duration);
      });

    // Calculate daily averages
    const completionTimeHistory = Array.from(completionTimeByDate.entries())
      .map(([date, times]) => ({
        date,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate bottleneck frequency
    const bottleneckFrequency: Record<string, number> = {};
    stageMetrics.forEach((metrics, stageName) => {
      const avgDelay = metrics.delays.reduce((a, b) => a + b, 0) / metrics.delays.length;
      if (avgDelay > 2) { // Consider stages with >2min average delay as frequent bottlenecks
        bottleneckFrequency[stageName] = metrics.delays.filter(d => d > 0).length;
      }
    });

    return {
      completionTimeHistory,
      bottleneckFrequency
    };
  }

  /**
   * Get bottleneck recommendations
   */
  static getBottleneckRecommendations(bottlenecks: PreparationBottleneck[]): string[] {
    const recommendations: string[] = [];

    bottlenecks.forEach(bottleneck => {
      const stageName = bottleneck.stage.replace('_', ' ');
      
      switch (bottleneck.severity) {
        case 'high':
          recommendations.push(
            `URGENT: Review ${stageName} process - consider additional staff or equipment`
          );
          break;
        case 'medium':
          recommendations.push(
            `Optimize ${stageName} workflow - review procedures and timing`
          );
          break;
        case 'low':
          recommendations.push(
            `Monitor ${stageName} consistency - minor process improvements needed`
          );
          break;
      }
    });

    // Add general recommendations if no specific bottlenecks
    if (recommendations.length === 0) {
      recommendations.push('No major bottlenecks detected - maintain current efficiency levels');
    }

    return recommendations;
  }

  /**
   * Get date range for analytics
   */
  private static getDateRange(timeRange: 'week' | 'month' | 'quarter'): { start: string; end: string } {
    const end = new Date();
    const start = new Date();

    switch (timeRange) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }
}
