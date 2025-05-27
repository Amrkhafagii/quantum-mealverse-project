
import { useState, useEffect } from 'react';
import { useRestaurantAuth } from './useRestaurantAuth';
import { financialService } from '@/services/financial/financialService';
import type { 
  RestaurantEarnings, 
  FinancialTransaction, 
  Payout,
  FinancialReport 
} from '@/types/financial';

export const useFinancialData = () => {
  const { restaurant } = useRestaurantAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [earnings, setEarnings] = useState<RestaurantEarnings[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [earningsSummary, setEarningsSummary] = useState({
    totalEarnings: 0,
    availableEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0
  });

  const loadFinancialData = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const [
        earningsData,
        transactionsData,
        payoutsData,
        reportsData,
        summaryData
      ] = await Promise.all([
        financialService.getRestaurantEarnings(restaurant.id, { limit: 20 }),
        financialService.getTransactions({ restaurantId: restaurant.id, limit: 20 }),
        financialService.getPayouts({ restaurantId: restaurant.id, limit: 10 }),
        financialService.getFinancialReports(restaurant.id, 5),
        financialService.getEarningsSummary(restaurant.id)
      ]);

      setEarnings(earningsData);
      setTransactions(transactionsData);
      setPayouts(payoutsData);
      setReports(reportsData);
      setEarningsSummary(summaryData);

    } catch (err) {
      console.error('Error loading financial data:', err);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    if (!restaurant?.id) throw new Error('No restaurant found');
    
    const payout = await financialService.requestPayout(restaurant.id);
    await loadFinancialData(); // Refresh data
    return payout;
  };

  const generateReport = async (
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
    startDate: string,
    endDate: string
  ) => {
    if (!restaurant?.id) throw new Error('No restaurant found');
    
    const report = await financialService.generateFinancialReport(
      restaurant.id,
      reportType,
      startDate,
      endDate
    );
    await loadFinancialData(); // Refresh data
    return report;
  };

  useEffect(() => {
    if (restaurant?.id) {
      loadFinancialData();
    }
  }, [restaurant?.id]);

  return {
    // Data
    earnings,
    transactions,
    payouts,
    reports,
    earningsSummary,
    
    // State
    loading,
    error,
    
    // Actions
    loadFinancialData,
    requestPayout,
    generateReport
  };
};
