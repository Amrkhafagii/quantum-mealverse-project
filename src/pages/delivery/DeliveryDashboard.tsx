
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryAssignmentCenter } from '@/components/delivery/DeliveryAssignmentCenter';
import { deliveryService } from '@/services/delivery/deliveryService';
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
      <div className="space-y-6 p-4">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
          <span className="ml-2 text-quantum-cyan">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!deliveryUser) {
    return (
      <div className="space-y-6 p-4">
        <Card className="border border-quantum-cyan/20 bg-transparent">
          <CardContent className="pt-6">
            <div className="text-center text-red-400">
              Delivery user profile not found. Please contact support.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-quantum-cyan mb-6">Delivery Dashboard</h1>
      
      <Tabs defaultValue="assignments">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <DeliveryAssignmentCenter deliveryUserId={deliveryUser.id} />
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card className="border border-quantum-cyan/20 bg-transparent">
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Active delivery tracking will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryDashboard;
