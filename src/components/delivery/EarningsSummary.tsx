
import React from 'react';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';

interface EarningsSummaryProps {
  deliveryUserId?: string;
}

export const EarningsSummary: React.FC<EarningsSummaryProps> = ({ deliveryUserId }) => {
  if (!deliveryUserId) {
    return (
      <div className="text-center py-8 text-gray-400">
        Delivery user ID is required to display earnings
      </div>
    );
  }

  return <AnalyticsDashboard deliveryUserId={deliveryUserId} />;
};

export default EarningsSummary;
