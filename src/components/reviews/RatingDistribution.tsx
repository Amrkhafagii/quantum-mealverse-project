
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface RatingDistributionProps {
  distribution: Record<number, number>;
  totalReviews: number;
}

export const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribution,
  totalReviews
}) => {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(star => {
        const count = distribution[star] || 0;
        const percentage = totalReviews > 0 
          ? (count / totalReviews) * 100 
          : 0;
          
        return (
          <div key={star} className="flex items-center gap-2">
            <div className="w-8 text-sm text-gray-600">{star} ★</div>
            <div className="flex-1">
              <Progress value={percentage} className="h-2" />
            </div>
            <div className="w-20 text-xs text-gray-500 text-right">
              {count} ({percentage.toFixed(0)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};
