
import React from 'react';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from 'lucide-react';

// Import the new components
import { NotificationCenter } from '@/components/restaurant/notifications/NotificationCenter';
import { PerformanceDashboard } from '@/components/restaurant/performance/PerformanceDashboard';
import { AssignmentCenter } from '@/components/restaurant/assignments/AssignmentCenter';
import { ReviewsManagement } from '@/components/restaurant/reviews/ReviewsManagement';
import { PromotionsManager } from '@/components/restaurant/promotions/PromotionsManager';

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
              Monitor orders, track performance, manage reviews, and handle promotions all in one place.
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">Orders</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AssignmentCenter />
              <NotificationCenter />
            </div>
            <PerformanceDashboard />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentCenter />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceDashboard />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManagement />
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionsManager />
          </TabsContent>
        </Tabs>
      </div>
    </RestaurantLayout>
  );
};

export default Dashboard;
