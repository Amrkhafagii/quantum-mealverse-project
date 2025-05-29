
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryAssignmentCenter } from '@/components/delivery/DeliveryAssignmentCenter';
import { DeliveryStats } from '@/components/delivery/dashboard/DeliveryStats';
import { EarningsSummary } from '@/components/delivery/dashboard/EarningsSummary';
import { ActiveDeliveries } from '@/components/delivery/dashboard/ActiveDeliveries';
import { DeliveryHistory } from '@/components/delivery/dashboard/DeliveryHistory';
import { DriverAvailabilityPanel } from '@/components/delivery/DriverAvailabilityPanel';
import { DeliveryDashboardErrorBoundary } from '@/components/delivery/DeliveryDashboardErrorBoundary';
import { deliveryService } from '@/services/delivery/deliveryService';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import { Loader2 } from 'lucide-react';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [deliveryUser, setDeliveryUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDeliveryUser = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userData = await deliveryService.getDeliveryUserByUserId(user.id);
        setDeliveryUser(userData);
      } catch (error) {
        console.error('Error loading delivery user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDeliveryUser();
  }, [user]);

  if (loading) {
    return (
      <DeliveryLayout>
        <div className="delivery-dashboard">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            <span className="ml-2 text-orange-600">Loading dashboard...</span>
          </div>
        </div>
      </DeliveryLayout>
    );
  }

  if (!deliveryUser) {
    return (
      <DeliveryLayout>
        <div className="delivery-dashboard">
          <Card className="delivery-card">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                Delivery user profile not found. Please contact support.
              </div>
            </CardContent>
          </Card>
        </div>
      </DeliveryLayout>
    );
  }

  return (
    <DeliveryLayout deliveryUserId={deliveryUser.id}>
      <DeliveryDashboardErrorBoundary>
        <div className="delivery-dashboard">
          <h1 className="text-2xl font-bold text-orange-900 mb-6">Driver Dashboard</h1>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-orange-100 text-orange-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Active Deliveries</TabsTrigger>
              <TabsTrigger value="available" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Available Orders</TabsTrigger>
              <TabsTrigger value="earnings" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Earnings</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Delivery Stats */}
              <DeliveryStats deliveryUser={deliveryUser} />
              
              {/* Driver Availability Panel */}
              <DriverAvailabilityPanel deliveryUserId={deliveryUser.id} />
            </TabsContent>

            <TabsContent value="active" className="space-y-6">
              <ActiveDeliveries deliveryUserId={deliveryUser.id} />
            </TabsContent>

            <TabsContent value="available" className="space-y-6">
              <DeliveryAssignmentCenter deliveryUserId={deliveryUser.id} />
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6">
              <EarningsSummary deliveryUserId={deliveryUser.id} />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <DeliveryHistory deliveryUserId={deliveryUser.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DeliveryDashboardErrorBoundary>
    </DeliveryLayout>
  );
};

export default DeliveryDashboard;
