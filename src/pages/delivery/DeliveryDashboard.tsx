
// Check if this file exists, if not create it
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import ActiveDeliveriesWithMap from '@/components/delivery/ActiveDeliveriesWithMap';
import { Loader2, MapPin } from 'lucide-react';
import GlobalGoogleMapsConfig from '@/components/maps/GlobalGoogleMapsConfig';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

const DeliveryDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { deliveryUser, loading: userLoading } = useDeliveryUser(user?.id);
  const { isLoaded: mapsLoaded, isLoading: mapsLoading } = useGoogleMaps();

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
            <CardTitle>Google Maps API Key Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">A Google Maps API key is required to use the delivery dashboard.</p>
            <GlobalGoogleMapsConfig />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>
      <ActiveDeliveriesWithMap />
      <GlobalGoogleMapsConfig />
    </div>
  );
};

export default DeliveryDashboard;
