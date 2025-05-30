
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { BatchPreparationService } from '@/services/preparation/batchPreparationService';
import { useBatchPreparation } from '@/hooks/restaurant/useBatchPreparation';

interface BatchProcessingDashboardProps {
  restaurantId: string;
}

export const BatchProcessingDashboard: React.FC<BatchProcessingDashboardProps> = ({
  restaurantId
}) => {
  const [summary, setSummary] = useState({
    pendingStages: 0,
    inProgressStages: 0,
    completedToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isProcessing, batchResults } = useBatchPreparation();

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const data = await BatchPreparationService.getBatchProcessingSummary(restaurantId);
        setSummary(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const totalStages = summary.pendingStages + summary.inProgressStages + summary.completedToday;
  const completionPercentage = totalStages > 0 ? (summary.completedToday / totalStages) * 100 : 0;

  const stats = [
    {
      label: 'Pending Stages',
      value: summary.pendingStages,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'In Progress',
      value: summary.inProgressStages,
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Completed Today',
      value: summary.completedToday,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading batch processing data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Batch Processing Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`p-4 rounded-lg ${stat.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Completion Progress</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {isProcessing && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium text-blue-800">
                  Batch operation in progress...
                </span>
              </div>
            </div>
          )}

          {batchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Recent Batch Results:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {batchResults.slice(-5).map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span>Order {result.orderId.slice(0, 8)} - {result.stageName}</span>
                    <Badge 
                      variant={result.success ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
