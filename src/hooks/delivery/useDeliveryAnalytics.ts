
import { useState, useEffect } from 'react';
import { deliveryAnalyticsService } from '@/services/delivery/deliveryAnalyticsService';
import type {
  DeliveryEarningsDetailed,
  DeliveryAnalyticsDaily,
  DeliveryPerformanceMetrics,
  DeliveryWeeklySummary,
  DeliveryFinancialReport,
  EarningsSummaryData,
  PerformanceTrend
} from '@/types/delivery-analytics';
import { toast } from '@/hooks/use-toast';

interface UseDeliveryAnalyticsOptions {
  deliveryUserId?: string;
  autoLoad?: boolean;
}

export const useDeliveryAnalytics = (options: UseDeliveryAnalyticsOptions = {}) => {
  const { deliveryUserId, autoLoad = true } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [earnings, setEarnings] = useState<DeliveryEarningsDetailed[]>([]);
  const [dailyAnalytics, setDailyAnalytics] = useState<DeliveryAnalyticsDaily[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<DeliveryPerformanceMetrics[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<DeliveryWeeklySummary[]>([]);
  const [financialReports, setFinancialReports] = useState<DeliveryFinancialReport[]>([]);
  const [summaryData, setSummaryData] = useState<EarningsSummaryData | null>(null);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);

  // Load all analytics data
  const loadAnalyticsData = async () => {
    if (!deliveryUserId) return;

    try {
      setLoading(true);
      setError(null);

      const [
        earningsData,
        dailyData,
        metricsData,
        weeklyData,
        reportsData,
        summary,
        trends
      ] = await Promise.all([
        deliveryAnalyticsService.getDetailedEarnings(deliveryUserId),
        deliveryAnalyticsService.getDailyAnalytics(deliveryUserId),
        deliveryAnalyticsService.getPerformanceMetrics(deliveryUserId),
        deliveryAnalyticsService.getWeeklySummaries(deliveryUserId),
        deliveryAnalyticsService.getFinancialReports(deliveryUserId),
        deliveryAnalyticsService.getEarningsSummary(deliveryUserId),
        deliveryAnalyticsService.getPerformanceTrends(deliveryUserId)
      ]);

      setEarnings(earningsData);
      setDailyAnalytics(dailyData);
      setPerformanceMetrics(metricsData);
      setWeeklySummaries(weeklyData);
      setFinancialReports(reportsData);
      setSummaryData(summary);
      setPerformanceTrends(trends);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load earnings for specific period
  const loadEarnings = async (startDate?: string, endDate?: string, limit?: number) => {
    if (!deliveryUserId) return [];

    try {
      const data = await deliveryAnalyticsService.getDetailedEarnings(deliveryUserId, startDate, endDate, limit);
      setEarnings(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load earnings';
      setError(errorMessage);
      return [];
    }
  };

  // Generate financial report
  const generateReport = async (
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    periodStart: string,
    periodEnd: string
  ) => {
    if (!deliveryUserId) throw new Error('Delivery user ID required');

    try {
      setLoading(true);
      const report = await deliveryAnalyticsService.generateFinancialReport(
        deliveryUserId,
        reportType,
        periodStart,
        periodEnd
      );

      // Refresh reports list
      const updatedReports = await deliveryAnalyticsService.getFinancialReports(deliveryUserId);
      setFinancialReports(updatedReports);

      toast({
        title: 'Report Generated',
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`
      });

      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily analytics
  const calculateDailyAnalytics = async (date?: string) => {
    if (!deliveryUserId) return;

    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      await deliveryAnalyticsService.calculateDailyAnalytics(deliveryUserId, targetDate);
      
      // Refresh daily analytics
      const updatedDaily = await deliveryAnalyticsService.getDailyAnalytics(deliveryUserId);
      setDailyAnalytics(updatedDaily);

      toast({
        title: 'Analytics Updated',
        description: 'Daily analytics have been recalculated'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate analytics';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Generate weekly summary
  const generateWeeklySummary = async (weekStartDate?: string) => {
    if (!deliveryUserId) return;

    try {
      const startDate = weekStartDate || (() => {
        const date = new Date();
        date.setDate(date.getDate() - date.getDay());
        return date.toISOString().split('T')[0];
      })();

      await deliveryAnalyticsService.generateWeeklySummary(deliveryUserId, startDate);
      
      // Refresh weekly summaries
      const updatedWeekly = await deliveryAnalyticsService.getWeeklySummaries(deliveryUserId);
      setWeeklySummaries(updatedWeekly);

      toast({
        title: 'Weekly Summary Generated',
        description: 'Weekly summary has been updated'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate weekly summary';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Auto load data when deliveryUserId changes
  useEffect(() => {
    if (autoLoad && deliveryUserId) {
      loadAnalyticsData();
    }
  }, [deliveryUserId, autoLoad]);

  return {
    // Data
    earnings,
    dailyAnalytics,
    performanceMetrics,
    weeklySummaries,
    financialReports,
    summaryData,
    performanceTrends,

    // State
    loading,
    error,

    // Actions
    loadAnalyticsData,
    loadEarnings,
    generateReport,
    calculateDailyAnalytics,
    generateWeeklySummary
  };
};
