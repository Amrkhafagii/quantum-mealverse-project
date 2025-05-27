
import React from 'react';
import { RestaurantDashboard } from '@/components/restaurant/RestaurantDashboard';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';

const Dashboard = () => {
  const { isRestaurantOwner, isLoading, user } = useRestaurantAuth();

  console.log('Restaurant Dashboard - Auth state:', { isRestaurantOwner, isLoading, user });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-quantum-black">
        <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
        <span className="ml-2 text-quantum-cyan">Loading restaurant dashboard...</span>
      </div>
    );
  }

  // If not a restaurant owner, redirect to auth page
  if (!isRestaurantOwner) {
    console.log('Not a restaurant owner, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  return (
    <RestaurantLayout>
      <div className="space-y-6">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-quantum-cyan">Restaurant Management Dashboard</CardTitle>
            <CardDescription>
              Welcome to your restaurant management system. Monitor orders, track performance, and manage your menu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RestaurantDashboard />
          </CardContent>
        </Card>
      </div>
    </RestaurantLayout>
  );
};

export default Dashboard;
