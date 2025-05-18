
import React from 'react';
import { RestaurantDashboard } from '@/components/restaurant/RestaurantDashboard';
import { RestaurantLayout } from '@/components/restaurant/RestaurantLayout';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Navigate } from 'react-router-dom';
import { EnhancedAnalyticsDashboard } from '@/components/restaurant/analytics/EnhancedAnalyticsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { isRestaurantOwner, isLoading, user } = useRestaurantAuth();
  const [activeTab, setActiveTab] = React.useState('overview');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not a restaurant owner, redirect to auth page
  if (!isRestaurantOwner) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <RestaurantLayout>
      <Card className="mb-8 bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Restaurant Management</CardTitle>
          <CardDescription>
            View your restaurant performance, manage orders, and track analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <RestaurantDashboard />
            </TabsContent>
            <TabsContent value="analytics" className="mt-6">
              <EnhancedAnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </RestaurantLayout>
  );
};

export default Dashboard;
