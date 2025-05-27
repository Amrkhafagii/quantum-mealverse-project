
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { financialService } from '@/services/financial/financialService';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CreditCard,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { 
  RestaurantEarnings, 
  FinancialTransaction, 
  Payout,
  FinancialReport 
} from '@/types/financial';

const RestaurantFinancials = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (restaurant?.id) {
      loadFinancialData();
    }
  }, [restaurant?.id]);

  const loadFinancialData = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      
      // Load all financial data concurrently
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

    } catch (error) {
      console.error('Error loading financial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!restaurant?.id) return;

    try {
      await financialService.requestPayout(restaurant.id);
      toast({
        title: 'Success',
        description: 'Payout request submitted successfully',
      });
      loadFinancialData(); // Refresh data
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        title: 'Error',
        description: 'Failed to request payout',
        variant: 'destructive'
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!restaurant?.id) return;

    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      await financialService.generateFinancialReport(
        restaurant.id,
        'monthly',
        startDate,
        endDate
      );
      
      toast({
        title: 'Success',
        description: 'Financial report generated successfully',
      });
      loadFinancialData(); // Refresh data
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <Button onClick={loadFinancialData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsSummary.totalEarnings)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(earningsSummary.availableEarnings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(earningsSummary.pendingEarnings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(earningsSummary.paidEarnings)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            onClick={handleRequestPayout}
            disabled={earningsSummary.availableEarnings <= 0}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Request Payout
          </Button>
          <Button onClick={handleGenerateReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Detailed Tables */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              {earnings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No earnings data available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {earnings.map((earning) => (
                    <div key={earning.id} className="flex justify-between items-center p-4 border rounded">
                      <div>
                        <p className="font-medium">{formatCurrency(earning.net_earnings)}</p>
                        <p className="text-sm text-gray-500">
                          Gross: {formatCurrency(earning.gross_amount)} | 
                          Commission: {formatCurrency(earning.platform_commission)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(earning.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusBadgeColor(earning.status)}>
                        {earning.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No transactions available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-4 border rounded">
                      <div>
                        <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.transaction_type} via {transaction.provider}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusBadgeColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No payouts requested yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="flex justify-between items-center p-4 border rounded">
                      <div>
                        <p className="font-medium">{formatCurrency(payout.amount)}</p>
                        <p className="text-sm text-gray-500">
                          {payout.earnings_count} earnings • {payout.payout_method}
                        </p>
                        <p className="text-xs text-gray-400">
                          {payout.period_start} to {payout.period_end}
                        </p>
                      </div>
                      <Badge className={getStatusBadgeColor(payout.status)}>
                        {payout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No reports generated yet</p>
                  <Button onClick={handleGenerateReport} className="mt-4">
                    Generate Your First Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex justify-between items-center p-4 border rounded">
                      <div>
                        <p className="font-medium">{report.report_type} Report</p>
                        <p className="text-sm text-gray-500">
                          {report.total_orders} orders • {formatCurrency(report.gross_revenue)} revenue
                        </p>
                        <p className="text-xs text-gray-400">
                          {report.period_start} to {report.period_end}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantFinancials;
