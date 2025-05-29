
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
import Navbar from '@/components/Navbar';
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
      <div className="min-h-screen bg-quantum-black">
        <Navbar />
        <div className="space-y-6 p-4">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
            <span className="ml-2 text-quantum-cyan">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!deliveryUser) {
    return (
      <div className="min-h-screen bg-quantum-black">
        <Navbar />
        <div className="space-y-6 p-4">
          <Card className="border border-quantum-cyan/20 bg-transparent">
            <CardContent className="pt-6">
              <div className="text-center text-red-400">
                Delivery user profile not found. Please contact support.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black">
      <Navbar />
      <DeliveryDashboardErrorBoundary>
        <div className="space-y-6 p-4">
          <h1 className="text-2xl font-bold text-quantum-cyan mb-6">Delivery Dashboard</h1>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="active">Active Deliveries</TabsTrigger>
              <TabsTrigger value="available">Available Orders</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
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
    </div>
  );
};

export default DeliveryDashboard;
