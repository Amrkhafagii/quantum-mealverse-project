
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeliveryAnalytics } from '@/hooks/delivery/useDeliveryAnalytics';
import { EarningsSummaryCards } from './EarningsSummaryCards';
import { PerformanceChart } from './PerformanceChart';
import { WeeklySummaryTable } from './WeeklySummaryTable';
import { FinancialReportsSection } from './FinancialReportsSection';
import { DetailedEarningsTable } from './DetailedEarningsTable';
import { 
  BarChart3, 
  TrendingUp, 
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';

interface AnalyticsDashboardProps {
  deliveryUserId: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ deliveryUserId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'performance' | 'reports'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const {
    summaryData,
    performanceTrends,
    weeklySummaries,
    financialReports,
    earnings,
    loading,
    error,
    loadAnalyticsData,
    generateReport,
    calculateDailyAnalytics,
    generateWeeklySummary
  } = useDeliveryAnalytics({ deliveryUserId });

  const handleRefreshData = async () => {
    await loadAnalyticsData();
    await calculateDailyAnalytics();
    await generateWeeklySummary();
  };

  const handleGenerateReport = async () => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
    }

    await generateReport(
      selectedPeriod === 'week' ? 'weekly' : selectedPeriod === 'month' ? 'monthly' : 'quarterly',
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  };

  if (error) {
    return (
      <Card className="holographic-card">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <p>Error loading analytics: {error}</p>
            <Button onClick={loadAnalyticsData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="holographic-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-quantum-cyan" />
              Earnings & Analytics Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button
                onClick={handleRefreshData}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <Card className="holographic-card">
        <CardContent className="p-2">
          <div className="flex space-x-1">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'earnings', label: 'Detailed Earnings', icon: BarChart3 },
              { key: 'performance', label: 'Performance', icon: TrendingUp },
              { key: 'reports', label: 'Reports', icon: Calendar }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.key as any)}
                className="flex items-center gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <EarningsSummaryCards 
            summaryData={summaryData} 
            loading={loading} 
          />
          <PerformanceChart 
            trends={performanceTrends} 
            loading={loading} 
          />
          <WeeklySummaryTable 
            summaries={weeklySummaries.slice(0, 4)} 
            loading={loading} 
          />
        </div>
      )}

      {activeTab === 'earnings' && (
        <DetailedEarningsTable 
          earnings={earnings} 
          loading={loading} 
        />
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <PerformanceChart 
            trends={performanceTrends} 
            loading={loading} 
            showDetailed={true}
          />
          <WeeklySummaryTable 
            summaries={weeklySummaries} 
            loading={loading} 
          />
        </div>
      )}

      {activeTab === 'reports' && (
        <FinancialReportsSection 
          reports={financialReports} 
          loading={loading}
          onGenerateReport={handleGenerateReport}
          selectedPeriod={selectedPeriod}
        />
      )}
    </div>
  );
};
