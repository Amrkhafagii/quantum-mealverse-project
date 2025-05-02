
import React, { useEffect } from 'react';
import { RestaurantDashboard } from '@/components/restaurant/RestaurantDashboard';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { isRestaurantOwner, loading, user } = useRestaurantAuth();

  useEffect(() => {
    console.log("Restaurant Dashboard Page Mounted, user:", user);
    
    if (!user) {
      console.log("No user found, redirecting to auth");
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If not a restaurant owner, redirect to auth page
  if (!isRestaurantOwner) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <RestaurantLayout>
      <RestaurantDashboard />
    </RestaurantLayout>
  );
};

export default Dashboard;
