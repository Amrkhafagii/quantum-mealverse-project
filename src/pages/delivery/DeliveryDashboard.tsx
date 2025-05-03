
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { updateDeliveryUserStatus } from '@/services/delivery/deliveryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AlertCircle, Settings } from 'lucide-react';
import DeliveryHistory from '@/components/delivery/DeliveryHistory';
import EarningsSummary from '@/components/delivery/EarningsSummary';
import { AvailableOrders } from '@/components/delivery/AvailableOrders';
import { useDeliveryMap } from '@/contexts/DeliveryMapContext';
import ActiveDeliveriesWithMap from '@/components/delivery/ActiveDeliveriesWithMap';
import DeliveryLocationControls from '@/components/delivery/DeliveryLocationControls';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deliveryUser, loading, error, refreshDeliveryUser } = useDeliveryUser(user?.id);
  const [activeTab, setActiveTab] = useState('available');
  const [toggleStatus, setToggleStatus] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  useEffect(() => {
    // If user isn't authenticated, redirect to login
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  useEffect(() => {
    // Set initial status toggle based on user status
    if (deliveryUser) {
      setToggleStatus(deliveryUser.status === 'active');
    }
  }, [deliveryUser]);
  
  const handleStatusToggle = async (newStatus: boolean) => {
    if (!deliveryUser) return;
    
    try {
      setUpdatingStatus(true);
      await updateDeliveryUserStatus(user!.id, newStatus ? 'active' : 'inactive');
      setToggleStatus(newStatus);
      refreshDeliveryUser();
      
      toast.success(newStatus ? "You're now active" : "You're now inactive", {
        description: newStatus 
          ? "You can now receive delivery requests" 
          : "You won't receive any delivery requests",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Error", {
        description: "Failed to update your status"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Handle case where user isn't onboarded yet
  if (!loading && !error && !deliveryUser) {
    return (
      <div className="min-h-screen bg-quantum-black text-white">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle>Welcome to Delivery</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">Not Registered</h2>
              <p className="text-center mb-6 text-gray-400">
                You need to complete the onboarding process before you can start making deliveries.
              </p>
              <Button 
                className="bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                onClick={() => navigate('/delivery/onboarding')}
              >
                Start Onboarding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Handle approval status
  if (deliveryUser && !deliveryUser.is_approved) {
    return (
      <div className="min-h-screen bg-quantum-black text-white">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle>Account Pending Approval</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-yellow-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">Under Review</h2>
              <p className="text-center mb-6 text-gray-400">
                Your delivery account is currently being reviewed. 
                We'll notify you once your account has been approved.
              </p>
              <p className="text-sm text-gray-500">
                This process usually takes 1-2 business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Use our new location handler for delivery personnel
  const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
    console.log('Location updated in dashboard:', location);
  };
  
  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-quantum-cyan">Delivery Dashboard</h1>
          <Button onClick={() => navigate('/delivery/settings')} variant="outline" className="flex gap-2 items-center">
            <Settings size={18} />
            Settings
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="pb-2">
                <CardTitle>Delivery Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lg">Available for Orders</span>
                  <Switch
                    checked={toggleStatus}
                    onCheckedChange={handleStatusToggle}
                    disabled={updatingStatus}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {toggleStatus 
                    ? "You're available to receive delivery requests" 
                    : "You're currently offline"}
                </p>

                {/* Use our new location controls component */}
                {toggleStatus && (
                  <div className="mt-4">
                    <DeliveryLocationControls 
                      onLocationUpdate={handleLocationUpdate} 
                      required={toggleStatus} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* User Stats */}
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="pb-2">
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Deliveries</span>
                    <span className="font-bold text-quantum-cyan">
                      {deliveryUser?.total_deliveries || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rating</span>
                    <span className="font-bold text-quantum-cyan">
                      {deliveryUser?.average_rating?.toFixed(1) || '5.0'} ★
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className={`font-bold ${toggleStatus ? 'text-green-500' : 'text-yellow-500'}`}>
                      {toggleStatus ? 'Active' : 'Offline'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Earnings Summary */}
            <EarningsSummary deliveryUserId={deliveryUser?.id} />
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-2">
            <Tabs 
              defaultValue="available" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="available">
                <AvailableOrders />
              </TabsContent>
              
              <TabsContent value="active">
                <ActiveDeliveriesWithMap />
              </TabsContent>
              
              <TabsContent value="history">
                <DeliveryHistory deliveryUserId={deliveryUser?.id || ''} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
