
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { DeliveryWeeklySummary } from '@/types/delivery-analytics';
import { Calendar, TrendingUp } from 'lucide-react';

interface WeeklySummaryTableProps {
  summaries: DeliveryWeeklySummary[];
  loading: boolean;
}

export const WeeklySummaryTable: React.FC<WeeklySummaryTableProps> = ({ 
  summaries, 
  loading 
}) => {
  if (loading) {
    return (
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle>Weekly Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summaries || summaries.length === 0) {
    return (
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-quantum-cyan" />
            Weekly Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            No weekly summary data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getEfficiencyBadge = (rating: number) => {
    if (rating >= 4.5) return { variant: 'default' as const, text: 'Excellent' };
    if (rating >= 4.0) return { variant: 'secondary' as const, text: 'Good' };
    if (rating >= 3.5) return { variant: 'outline' as const, text: 'Average' };
    return { variant: 'destructive' as const, text: 'Needs Improvement' };
  };

  return (
    <Card className="holographic-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-quantum-cyan" />
          Weekly Performance Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-quantum-cyan/20">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Week</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Earnings</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Deliveries</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Hours</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">$/Hour</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-400">Tips</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">Performance</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary, index) => {
                const efficiencyBadge = getEfficiencyBadge(summary.efficiency_rating);
                return (
                  <tr 
                    key={summary.id} 
                    className="border-b border-quantum-cyan/10 hover:bg-quantum-darkBlue/20"
                  >
                    <td className="py-4 px-2">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {formatDate(summary.week_start_date)} - {formatDate(summary.week_end_date)}
                        </div>
                        {summary.best_day_date && (
                          <div className="text-xs text-gray-400">
                            Best: {formatDate(summary.best_day_date)} (${summary.best_day_earnings.toFixed(2)})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-semibold text-green-400">
                        ${summary.total_earnings.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-medium">
                        {summary.total_deliveries}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-medium">
                        {summary.total_hours.toFixed(1)}h
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="font-medium text-blue-400">
                        ${summary.average_hourly_rate.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-yellow-400">
                          ${summary.total_tips.toFixed(2)}
                        </div>
                        {summary.total_bonuses > 0 && (
                          <div className="text-xs text-purple-400">
                            +${summary.total_bonuses.toFixed(2)} bonus
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <div className="space-y-2">
                        <Badge variant={efficiencyBadge.variant}>
                          {efficiencyBadge.text}
                        </Badge>
                        {summary.goal_achievement_percentage > 0 && (
                          <div className="text-xs text-gray-400">
                            {summary.goal_achievement_percentage.toFixed(0)}% goal
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
