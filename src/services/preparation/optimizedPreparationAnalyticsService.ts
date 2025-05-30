
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export interface OptimizedPreparationAnalytics {
  totalOrders: number;
  averagePreparationTime: number;
  stageCompletionRates: Record<string, number>;
  bottlenecks: Array<{
    stage: string;
    averageTime: number;
    expectedTime: number;
    variance: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  peakHours: Array<{
    hour: number;
    orderCount: number;
    averageTime: number;
  }>;
  performanceMetrics: {
    onTimeDeliveryRate: number;
    customerSatisfactionScore: number;
    stageEfficiency: Record<string, number>;
    overallEfficiencyScore: number;
  };
}

export interface DynamicSatisfactionMetrics {
  averagePreparationTime: number;
  onTimeDeliveryRate: number;
  stageCompletionRate: number;
  qualityScore: number;
}

export class OptimizedPreparationAnalyticsService {
  /**
   * Get comprehensive preparation analytics with optimized bottleneck detection
   */
  static async getOptimizedPreparationAnalytics(
    restaurantId: string,
    timeRange: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<OptimizedPreparationAnalytics> {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Get completed preparation stages with order data
    const { data: stages, error } = await supabase
      .from('order_preparation_stages')
      .select(`
        stage_name,
        status,
        estimated_duration_minutes,
        actual_duration_minutes,
        started_at,
        completed_at,
        order_id,
        orders!inner(created_at, status, total, customer_rating)
      `)
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    const orderStages = stages || [];
    const uniqueOrders = new Set(orderStages.map(s => s.order_id)).size;

    // Pre-filter completed stages for performance
    const completedStages = orderStages.filter(s => s.status === 'completed' && s.actual_duration_minutes);
    
    // Calculate basic metrics
    const averagePreparationTime = completedStages.length > 0
      ? completedStages.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) / completedStages.length
      : 0;

    // Optimized stage completion rates calculation
    const stageGroups = this.groupStagesByName(orderStages);
    const stageCompletionRates = this.calculateStageCompletionRates(stageGroups);

    // Early bottleneck detection with severity classification
    const bottlenecks = this.detectBottlenecksEarly(completedStages);

    // Calculate peak hours efficiently
    const peakHours = this.calculatePeakHours(orderStages);

    // Dynamic customer satisfaction calculation
    const customerSatisfactionScore = await this.calculateDynamicCustomerSatisfaction(
      restaurantId,
      {
        averagePreparationTime,
        onTimeDeliveryRate: this.calculateOnTimeDeliveryRate(completedStages),
        stageCompletionRate: this.calculateOverallCompletionRate(stageCompletionRates),
        qualityScore: this.calculateQualityScore(orderStages)
      }
    );

    // Performance metrics
    const onTimeDeliveryRate = this.calculateOnTimeDeliveryRate(completedStages);
    const stageEfficiency = this.calculateStageEfficiency(stageGroups);
    const overallEfficiencyScore = this.calculateOverallEfficiency(stageEfficiency, onTimeDeliveryRate);

    return {
      totalOrders: uniqueOrders,
      averagePreparationTime,
      stageCompletionRates,
      bottlenecks,
      peakHours,
      performanceMetrics: {
        onTimeDeliveryRate,
        customerSatisfactionScore,
        stageEfficiency,
        overallEfficiencyScore
      }
    };
  }

  /**
   * Group stages by name for efficient processing
   */
  private static groupStagesByName(stages: any[]): Record<string, any[]> {
    return stages.reduce((groups, stage) => {
      if (!groups[stage.stage_name]) {
        groups[stage.stage_name] = [];
      }
      groups[stage.stage_name].push(stage);
      return groups;
    }, {} as Record<string, any[]>);
  }

  /**
   * Calculate stage completion rates efficiently
   */
  private static calculateStageCompletionRates(stageGroups: Record<string, any[]>): Record<string, number> {
    const completionRates: Record<string, number> = {};
    
    Object.entries(stageGroups).forEach(([stageName, stageData]) => {
      const completed = stageData.filter(s => s.status === 'completed').length;
      completionRates[stageName] = stageData.length > 0 ? (completed / stageData.length) * 100 : 0;
    });

    return completionRates;
  }

  /**
   * Early bottleneck detection with integrated severity classification
   */
  private static detectBottlenecksEarly(completedStages: any[]): OptimizedPreparationAnalytics['bottlenecks'] {
    const stageGroups = this.groupStagesByName(completedStages);
    const bottlenecks: OptimizedPreparationAnalytics['bottlenecks'] = [];

    Object.entries(stageGroups).forEach(([stageName, stageData]) => {
      if (stageData.length === 0) return;

      const averageTime = stageData.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) / stageData.length;
      const expectedTime = stageData[0]?.estimated_duration_minutes || 0;
      
      if (expectedTime > 0) {
        const variance = ((averageTime - expectedTime) / expectedTime) * 100;
        
        // Only include bottlenecks with significant variance
        if (variance > 15) {
          const severity = this.classifyBottleneckSeverity(variance);
          
          bottlenecks.push({
            stage: stageName,
            averageTime,
            expectedTime,
            variance,
            severity
          });
        }
      }
    });

    // Sort by severity and variance for prioritization
    return bottlenecks.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      return severityDiff !== 0 ? severityDiff : b.variance - a.variance;
    });
  }

  /**
   * Classify bottleneck severity
   */
  private static classifyBottleneckSeverity(variance: number): 'low' | 'medium' | 'high' {
    if (variance > 50) return 'high';
    if (variance > 30) return 'medium';
    return 'low';
  }

  /**
   * Calculate peak hours efficiently
   */
  private static calculatePeakHours(stages: any[]): OptimizedPreparationAnalytics['peakHours'] {
    const hourlyData: Record<number, { count: number; totalTime: number }> = {};
    
    stages.forEach(stage => {
      if (stage.started_at) {
        const hour = new Date(stage.started_at).getHours();
        if (!hourlyData[hour]) hourlyData[hour] = { count: 0, totalTime: 0 };
        hourlyData[hour].count++;
        hourlyData[hour].totalTime += stage.actual_duration_minutes || 0;
      }
    });

    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        orderCount: data.count,
        averageTime: data.count > 0 ? data.totalTime / data.count : 0
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 6); // Top 6 peak hours
  }

  /**
   * Calculate dynamic customer satisfaction score based on multiple metrics
   */
  private static async calculateDynamicCustomerSatisfaction(
    restaurantId: string,
    metrics: DynamicSatisfactionMetrics
  ): Promise<number> {
    try {
      // Get recent customer ratings if available
      const { data: recentRatings } = await supabase
        .from('orders')
        .select('customer_rating')
        .eq('restaurant_id', restaurantId)
        .not('customer_rating', 'is', null)
        .gte('created_at', subDays(new Date(), 30).toISOString())
        .limit(100);

      let baseScore = 4.0; // Default baseline

      // If we have actual ratings, use them as primary factor
      if (recentRatings && recentRatings.length > 0) {
        const avgRating = recentRatings.reduce((sum, r) => sum + (r.customer_rating || 0), 0) / recentRatings.length;
        baseScore = avgRating;
      }

      // Apply dynamic adjustments based on performance metrics
      let adjustedScore = baseScore;

      // On-time delivery impact (±0.5 points)
      const onTimeImpact = (metrics.onTimeDeliveryRate - 80) / 40; // -0.5 to +0.5
      adjustedScore += Math.max(-0.5, Math.min(0.5, onTimeImpact));

      // Preparation time impact (±0.3 points)
      const avgTimeThreshold = 25; // minutes
      const timeImpact = (avgTimeThreshold - metrics.averagePreparationTime) / 50; // -0.3 to +0.3
      adjustedScore += Math.max(-0.3, Math.min(0.3, timeImpact));

      // Stage completion impact (±0.2 points)
      const completionImpact = (metrics.stageCompletionRate - 85) / 75; // -0.2 to +0.2
      adjustedScore += Math.max(-0.2, Math.min(0.2, completionImpact));

      // Quality score impact (±0.3 points)
      const qualityImpact = (metrics.qualityScore - 80) / 67; // -0.3 to +0.3
      adjustedScore += Math.max(-0.3, Math.min(0.3, qualityImpact));

      // Ensure score stays within valid range
      return Math.max(1.0, Math.min(5.0, Number(adjustedScore.toFixed(2))));
    } catch (error) {
      console.error('Error calculating dynamic customer satisfaction:', error);
      return 4.0; // Fallback to neutral score
    }
  }

  /**
   * Calculate on-time delivery rate
   */
  private static calculateOnTimeDeliveryRate(completedStages: any[]): number {
    if (completedStages.length === 0) return 0;

    const onTimeOrders = completedStages.filter(s => {
      if (!s.actual_duration_minutes || !s.estimated_duration_minutes) return false;
      return s.actual_duration_minutes <= s.estimated_duration_minutes * 1.1; // 10% tolerance
    }).length;

    return (onTimeOrders / completedStages.length) * 100;
  }

  /**
   * Calculate overall completion rate
   */
  private static calculateOverallCompletionRate(stageCompletionRates: Record<string, number>): number {
    const rates = Object.values(stageCompletionRates);
    return rates.length > 0 ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0;
  }

  /**
   * Calculate quality score based on consistency and performance
   */
  private static calculateQualityScore(stages: any[]): number {
    if (stages.length === 0) return 80; // Default score

    const completedStages = stages.filter(s => s.status === 'completed');
    const completionRate = (completedStages.length / stages.length) * 100;

    // Calculate consistency (lower variance is better)
    const times = completedStages.map(s => s.actual_duration_minutes || 0);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
    const consistency = Math.max(0, 100 - (Math.sqrt(variance) / avgTime) * 100);

    // Combine completion rate and consistency
    return (completionRate * 0.6) + (consistency * 0.4);
  }

  /**
   * Calculate stage efficiency
   */
  private static calculateStageEfficiency(stageGroups: Record<string, any[]>): Record<string, number> {
    const efficiency: Record<string, number> = {};

    Object.entries(stageGroups).forEach(([stageName, stageData]) => {
      const completedStages = stageData.filter(s => s.status === 'completed');
      
      if (completedStages.length > 0) {
        const onTimeStages = completedStages.filter(s => 
          s.actual_duration_minutes && s.estimated_duration_minutes &&
          s.actual_duration_minutes <= s.estimated_duration_minutes
        );
        
        efficiency[stageName] = (onTimeStages.length / completedStages.length) * 100;
      } else {
        efficiency[stageName] = 0;
      }
    });

    return efficiency;
  }

  /**
   * Calculate overall efficiency score
   */
  private static calculateOverallEfficiency(
    stageEfficiency: Record<string, number>,
    onTimeDeliveryRate: number
  ): number {
    const efficiencyValues = Object.values(stageEfficiency);
    const avgStageEfficiency = efficiencyValues.length > 0 
      ? efficiencyValues.reduce((sum, eff) => sum + eff, 0) / efficiencyValues.length 
      : 0;

    // Weighted combination of stage efficiency and on-time delivery
    return (avgStageEfficiency * 0.7) + (onTimeDeliveryRate * 0.3);
  }

  /**
   * Get bottleneck recommendations
   */
  static getBottleneckRecommendations(bottlenecks: OptimizedPreparationAnalytics['bottlenecks']): string[] {
    const recommendations: string[] = [];

    bottlenecks.forEach(bottleneck => {
      switch (bottleneck.severity) {
        case 'high':
          recommendations.push(
            `URGENT: ${bottleneck.stage} is severely delayed (${bottleneck.variance.toFixed(1)}% over estimate). Consider immediate process review.`
          );
          break;
        case 'medium':
          recommendations.push(
            `${bottleneck.stage} is consistently delayed. Review workflow and consider staff training.`
          );
          break;
        case 'low':
          recommendations.push(
            `${bottleneck.stage} shows minor delays. Monitor for trends and optimize when possible.`
          );
          break;
      }
    });

    return recommendations;
  }
}
