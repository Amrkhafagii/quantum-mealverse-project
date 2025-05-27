
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, Download, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { financialService } from '@/services/financial/financialService';
import type { FinancialReport } from '@/types/financial';

interface FinancialReportsProps {
  restaurantId: string;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({ restaurantId }) => {
  const { toast } = useToast();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  useEffect(() => {
    loadReports();
  }, [restaurantId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await financialService.getFinancialReports(restaurantId);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial reports',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      
      // Calculate period based on report type
      const now = new Date();
      let periodStart: Date;
      let periodEnd = new Date(now);

      switch (reportType) {
        case 'daily':
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() - 1);
          break;
        case 'weekly':
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'quarterly':
          const quarter = Math.floor(now.getMonth() / 3);
          periodStart = new Date(now.getFullYear(), quarter * 3 - 3, 1);
          periodEnd = new Date(now.getFullYear(), quarter * 3, 0);
          break;
        case 'yearly':
          periodStart = new Date(now.getFullYear() - 1, 0, 1);
          periodEnd = new Date(now.getFullYear() - 1, 11, 31);
          break;
      }

      const report = await financialService.generateFinancialReport(
        restaurantId,
        reportType,
        periodStart.toISOString().split('T')[0],
        periodEnd.toISOString().split('T')[0]
      );

      toast({
        title: 'Report Generated',
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`
      });

      await loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate financial report',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (report: FinancialReport) => {
    // Create CSV content
    const csvContent = [
      ['Metric', 'Value'],
      ['Report Type', report.report_type],
      ['Period', `${report.period_start} to ${report.period_end}`],
      ['Total Orders', report.total_orders.toString()],
      ['Gross Revenue', `$${report.gross_revenue.toFixed(2)}`],
      ['Net Revenue', `$${report.net_revenue.toFixed(2)}`],
      ['Total Commission', `$${report.total_commission.toFixed(2)}`],
      ['Total Fees', `$${report.total_fees.toFixed(2)}`],
      ['Average Order Value', `$${report.average_order_value.toFixed(2)}`],
      ['Commission Rate', `${((report.commission_rate || 0) * 100).toFixed(2)}%`]
    ].map(row => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-${report.report_type}-${report.period_start}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
          <span className="ml-2">Loading reports...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Financial Report</CardTitle>
          <CardDescription>Create detailed financial reports for your restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateReport} disabled={generating}>
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
          <CardDescription>Your generated financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
              <p className="text-gray-600">Generate your first financial report to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="capitalize">
                        {report.report_type}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(report.period_start).toLocaleDateString()} - {' '}
                        {new Date(report.period_end).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Generated {new Date(report.generated_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        ${report.gross_revenue.toFixed(0)}
                      </div>
                      <div className="text-sm text-green-600">Gross Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        ${report.net_revenue.toFixed(0)}
                      </div>
                      <div className="text-sm text-blue-600">Net Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {report.total_orders}
                      </div>
                      <div className="text-sm text-purple-600">Total Orders</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">
                        ${report.average_order_value.toFixed(0)}
                      </div>
                      <div className="text-sm text-orange-600">Avg Order Value</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Commission Paid:</span>
                      <span className="ml-2 font-medium">${report.total_commission.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Processing Fees:</span>
                      <span className="ml-2 font-medium">${report.total_fees.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
