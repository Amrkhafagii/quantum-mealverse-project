
import React from 'react';
import { RestaurantDashboard } from '@/components/restaurant/RestaurantDashboard';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Navigate } from 'react-router-dom';
import { EnhancedAnalyticsDashboard } from '@/components/restaurant/analytics/EnhancedAnalyticsDashboard';

const Dashboard = () => {
  const { isRestaurantOwner, loading, user } = useRestaurantAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If not a restaurant owner, redirect to auth page
  if (!isRestaurantOwner) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <RestaurantLayout>
      <div className="space-y-8">
        <RestaurantDashboard />
        <EnhancedAnalyticsDashboard />
      </div>
    </RestaurantLayout>
  );
};

export default Dashboard;
