
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricProps {
  title: string;
  value: string | number;
  change?: number;
  isLoading?: boolean;
}

export const PerformanceMetricsCard = ({ 
  title, 
  value, 
  change, 
  isLoading = false 
}: MetricProps) => {
  // Determine if trend is positive or negative
  const isPositive = change && change > 0;
  const trendColor = isPositive ? 'text-green-500' : 'text-red-500';
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {isLoading ? '...' : value}
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center mt-1 text-sm ${trendColor}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{Math.abs(change)}% vs previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
