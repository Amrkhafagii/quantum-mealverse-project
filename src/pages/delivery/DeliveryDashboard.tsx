
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import ActiveDeliveriesWithMap from '@/components/delivery/ActiveDeliveriesWithMap';
import { Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EarningsSummary } from '@/components/delivery/dashboard/EarningsSummary';
import { DeliveryHistory } from '@/components/delivery/dashboard/DeliveryHistory';
import { DeliveryStats } from '@/components/delivery/dashboard/DeliveryStats';

const DeliveryDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { deliveryUser, loading: userLoading } = useDeliveryUser(user?.id);
  const { isLoaded: mapsLoaded, isLoading: mapsLoading } = useGoogleMaps();
  const [activeTab, setActiveTab] = useState<string>("active");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!deliveryUser) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Complete Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need to complete your delivery partner onboarding before accessing the dashboard.</p>
            <Button onClick={() => navigate('/delivery/onboarding')}>Go to Onboarding</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deliveryUser.is_approved) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Approval Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your delivery partner account is pending approval. We'll notify you when you're approved.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mapsLoaded && !mapsLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Maps API Loading</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we load the mapping service...</p>
            <div className="mt-4 flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Initializing maps</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>
      
      {deliveryUser && <DeliveryStats deliveryUser={deliveryUser} />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="history">Delivery History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-2">
          <ActiveDeliveriesWithMap />
        </TabsContent>
        
        <TabsContent value="earnings" className="mt-2">
          {deliveryUser && <EarningsSummary deliveryUserId={deliveryUser.id} />}
        </TabsContent>
        
        <TabsContent value="history" className="mt-2">
          {deliveryUser && <DeliveryHistory deliveryUserId={deliveryUser.id} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryDashboard;
