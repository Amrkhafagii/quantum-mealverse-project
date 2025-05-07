
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import ActiveDeliveriesWithMap from '@/components/delivery/ActiveDeliveriesWithMap';
import { Loader2, Settings, User, LogOut } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EarningsSummary } from '@/components/delivery/dashboard/EarningsSummary';
import { DeliveryHistory } from '@/components/delivery/dashboard/DeliveryHistory';
import { DeliveryStats } from '@/components/delivery/dashboard/DeliveryStats';
import { AvailableOrders } from '@/components/delivery/AvailableOrders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from 'sonner';

const DeliveryDashboard: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { deliveryUser, loading: userLoading } = useDeliveryUser(user?.id);
  const { isLoaded: mapsLoaded, isLoading: mapsLoading } = useGoogleMaps();
  const [activeTab, setActiveTab] = useState<string>("active");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate('/auth');
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-quantum-cyan text-quantum-black">
                  {deliveryUser?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "D"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/delivery/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {deliveryUser && <DeliveryStats deliveryUser={deliveryUser} />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="available">Available Orders</TabsTrigger>
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="history">Delivery History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-2">
          <AvailableOrders />
        </TabsContent>
        
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
