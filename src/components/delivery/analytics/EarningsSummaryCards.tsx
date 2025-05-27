
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { EarningsSummaryData } from '@/types/delivery-analytics';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Star,
  Truck,
  Target
} from 'lucide-react';

interface EarningsSummaryCardsProps {
  summaryData: EarningsSummaryData | null;
  loading: boolean;
}

export const EarningsSummaryCards: React.FC<EarningsSummaryCardsProps> = ({ 
  summaryData, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="holographic-card">
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summaryData) {
    return (
      <Card className="holographic-card">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            No earnings data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: 'Today\'s Earnings',
      value: `$${summaryData.todayEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Week Earnings',
      value: `$${summaryData.weekEarnings.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Month Earnings',
      value: `$${summaryData.monthEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Total Deliveries',
      value: summaryData.totalDeliveries.toString(),
      icon: Truck,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Average Rating',
      value: summaryData.averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      suffix: '/5.0'
    },
    {
      title: 'Earnings/Hour',
      value: `$${summaryData.earningsPerHour.toFixed(2)}`,
      icon: Clock,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="holographic-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">{card.title}</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                  {card.suffix && (
                    <span className="text-sm text-gray-400">{card.suffix}</span>
                  )}
                </div>
                {index === 5 && ( // Completion rate badge for earnings/hour card
                  <Badge variant="outline" className="text-xs">
                    {summaryData.completionRate.toFixed(1)}% completion
                  </Badge>
                )}
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
