
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateProgressInsights } from '@/services/goalTrackingService';
import { Lightbulb, ArrowUp, ArrowDown, Minus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface ProgressInsightsProps {
  userId?: string;
}

const ProgressInsights: React.FC<ProgressInsightsProps> = ({ userId }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [trends, setTrends] = useState<{
    weight: 'improving' | 'declining' | 'maintaining' | 'insufficient_data';
    bodyFat: 'improving' | 'declining' | 'maintaining' | 'insufficient_data';
  }>({
    weight: 'insufficient_data',
    bodyFat: 'insufficient_data'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (userId) {
      loadInsights();
    }
  }, [userId]);
  
  const loadInsights = async () => {
    setLoading(true);
    try {
      const result = await generateProgressInsights(userId!);
      setInsights(result.insights);
      setTrends(result.trends);
    } catch (error) {
      console.error('Error loading insights:', error);
      setInsights(['Unable to generate insights at this time.']);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    if (refreshing || !userId) return;
    setRefreshing(true);
    loadInsights();
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <ArrowUp className="h-5 w-5 text-green-400" />;
      case 'declining':
        return <ArrowDown className="h-5 w-5 text-red-400" />;
      case 'maintaining':
        return <Minus className="h-5 w-5 text-blue-400" />;
      default:
        return null;
    }
  };
  
  const getTrendLabel = (trend: string, metric: 'weight' | 'bodyFat') => {
    if (trend === 'insufficient_data') {
      return 'Insufficient data';
    }
    
    const isWeightLoss = metric === 'weight' && trend === 'improving';
    const isBodyFatLoss = metric === 'bodyFat' && trend === 'improving';
    
    if (isWeightLoss || isBodyFatLoss) {
      return 'Decreasing (Good)';
    } else if (trend === 'maintaining') {
      return 'Stable';
    } else {
      return 'Increasing';
    }
  };
  
  if (!userId) {
    return null;
  }
  
  return (
    <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          Progress Insights
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh insights</span>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="medium" text="Analyzing your progress..." />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-quantum-black/40 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-400">Weight Trend</p>
                  <p className="font-medium">
                    {getTrendLabel(trends.weight, 'weight')}
                  </p>
                </div>
                {getTrendIcon(trends.weight)}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-quantum-black/40 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-400">Body Fat Trend</p>
                  <p className="font-medium">
                    {getTrendLabel(trends.bodyFat, 'bodyFat')}
                  </p>
                </div>
                {getTrendIcon(trends.bodyFat)}
              </motion.div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Insights</h3>
              <ul className="space-y-3">
                {insights.length === 0 ? (
                  <motion.li
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-quantum-black/40 rounded-lg p-3 text-sm"
                  >
                    No insights available yet. Add more measurements to see progress analysis.
                  </motion.li>
                ) : (
                  insights.map((insight, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-quantum-black/40 rounded-lg p-3 text-sm"
                    >
                      {insight}
                    </motion.li>
                  ))
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressInsights;
