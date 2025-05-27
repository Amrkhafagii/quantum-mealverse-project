
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { DeliveryFinancialReport } from '@/types/delivery-analytics';
import { FileText, Download, Calendar } from 'lucide-react';

interface FinancialReportsSectionProps {
  reports: DeliveryFinancialReport[];
  loading: boolean;
  onGenerateReport: () => void;
  selectedPeriod: string;
}

export const FinancialReportsSection: React.FC<FinancialReportsSectionProps> = ({ 
  reports, 
  loading, 
  onGenerateReport,
  selectedPeriod
}) => {
  if (loading) {
    return (
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const downloadReport = (report: DeliveryFinancialReport) => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Report Type', report.report_type],
      ['Period', `${report.period_start} to ${report.period_end}`],
      ['Gross Earnings', `$${report.gross_earnings.toFixed(2)}`],
      ['Net Earnings', `$${report.net_earnings.toFixed(2)}`],
      ['Total Tips', `$${report.total_tips.toFixed(2)}`],
      ['Total Bonuses', `$${report.total_bonuses.toFixed(2)}`],
      ['Total Penalties', `$${report.total_penalties.toFixed(2)}`],
      ['Delivery Count', report.delivery_count.toString()],
      ['Hours Worked', report.hours_worked.toFixed(2)],
      ['Fuel Costs', `$${report.fuel_costs.toFixed(2)}`],
      ['Maintenance Costs', `$${report.maintenance_costs.toFixed(2)}`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delivery-report-${report.report_type}-${report.period_start}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Generate Report Card */}
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-quantum-cyan" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">
                Generate a detailed financial report for the selected {selectedPeriod}
              </p>
            </div>
            <Button onClick={onGenerateReport} disabled={loading}>
              <FileText className="h-4 w-4 mr-2" />
              Generate {selectedPeriod} Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-quantum-cyan" />
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No financial reports available
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className="border border-quantum-cyan/20 rounded-lg p-4 hover:bg-quantum-darkBlue/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {report.report_type}
                      </Badge>
                      <div className="text-sm text-gray-400">
                        {new Date(report.period_start).toLocaleDateString()} - {' '}
                        {new Date(report.period_end).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                    <div className="text-center p-3 bg-green-500/10 rounded border border-green-500/20">
                      <div className="text-xl font-bold text-green-400">
                        ${report.gross_earnings.toFixed(0)}
                      </div>
                      <div className="text-sm text-green-400">Gross Earnings</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded border border-blue-500/20">
                      <div className="text-xl font-bold text-blue-400">
                        ${report.net_earnings.toFixed(0)}
                      </div>
                      <div className="text-sm text-blue-400">Net Earnings</div>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded border border-purple-500/20">
                      <div className="text-xl font-bold text-purple-400">
                        {report.delivery_count}
                      </div>
                      <div className="text-sm text-purple-400">Deliveries</div>
                    </div>
                    <div className="text-center p-3 bg-orange-500/10 rounded border border-orange-500/20">
                      <div className="text-xl font-bold text-orange-400">
                        {report.hours_worked.toFixed(1)}h
                      </div>
                      <div className="text-sm text-orange-400">Hours Worked</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Tips Earned:</span>
                      <span className="ml-2 font-medium text-yellow-400">
                        ${report.total_tips.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Bonuses:</span>
                      <span className="ml-2 font-medium text-purple-400">
                        ${report.total_bonuses.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Penalties:</span>
                      <span className="ml-2 font-medium text-red-400">
                        ${report.total_penalties.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Hourly Rate:</span>
                      <span className="ml-2 font-medium">
                        ${report.hours_worked > 0 ? (report.gross_earnings / report.hours_worked).toFixed(2) : '0.00'}
                      </span>
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
