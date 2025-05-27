
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
import { DeliveryDashboardErrorBoundary } from '@/components/delivery/DeliveryDashboardErrorBoundary';
import { DeliveryMapProvider } from '@/contexts/DeliveryMapContext';

const DeliveryDashboardContent: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { deliveryUser, loading: userLoading } = useDeliveryUser(user?.id);
  const { isLoaded: mapsLoaded } = useGoogleMaps();
  const [activeTab, setActiveTab] = useState<string>("active");

  console.log('=== DELIVERY DASHBOARD DEBUG ===');
  console.log('Auth loading:', authLoading);
  console.log('User loading:', userLoading);
  console.log('User exists:', !!user);
  console.log('User ID:', user?.id);
  console.log('Delivery user exists:', !!deliveryUser);
  console.log('Delivery user approved:', deliveryUser?.is_approved);
  console.log('Maps loaded:', mapsLoaded);

  // Redirect to auth if no user and not loading
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  // Show loading while auth or user data is loading
  if (authLoading || userLoading) {
    console.log('Showing loading state - authLoading:', authLoading, 'userLoading:', userLoading);
    return (
      <div className="flex h-screen items-center justify-center bg-quantum-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan mx-auto mb-4" />
          <p className="text-quantum-cyan">Loading delivery dashboard...</p>
        </div>
      </div>
    );
  }

  // Return null if no user (will trigger redirect)
  if (!user) {
    console.log('No user, returning null');
    return null;
  }

  // Show onboarding prompt if no delivery user profile
  if (!deliveryUser) {
    console.log('No delivery user profile found');
    return (
      <div className="min-h-screen bg-quantum-black text-white">
        <div className="container mx-auto p-4">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-quantum-cyan">Complete Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-300">You need to complete your delivery partner onboarding before accessing the dashboard.</p>
              <Button 
                onClick={() => navigate('/delivery/onboarding')}
                className="bg-quantum-purple hover:bg-quantum-purple/90"
              >
                Go to Onboarding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show approval pending if not approved
  if (!deliveryUser.is_approved) {
    console.log('Delivery user not approved');
    return (
      <div className="min-h-screen bg-quantum-black text-white">
        <div className="container mx-auto p-4">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-quantum-cyan">Approval Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Your delivery partner account is pending approval. We'll notify you when you're approved.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  console.log('Rendering main dashboard');

  // Main dashboard content
  return (
    <DeliveryMapProvider>
      <div className="min-h-screen bg-quantum-black text-white">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-quantum-cyan">Delivery Dashboard</h1>
            
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
          
          {/* Maps loading notice */}
          {!mapsLoaded && (
            <Card className="mb-4 bg-quantum-darkBlue/30 border-yellow-500/20">
              <CardContent className="p-4">
                <p className="text-yellow-400">Maps are loading. Some features may be limited until maps are ready.</p>
              </CardContent>
            </Card>
          )}
          
          <DeliveryStats deliveryUser={deliveryUser} />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 mb-4 bg-quantum-darkBlue/50">
              <TabsTrigger value="available" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Available Orders
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Active Deliveries
              </TabsTrigger>
              <TabsTrigger value="earnings" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Earnings
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black">
                Delivery History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="mt-2">
              <AvailableOrders />
            </TabsContent>
            
            <TabsContent value="active" className="mt-2">
              <ActiveDeliveriesWithMap />
            </TabsContent>
            
            <TabsContent value="earnings" className="mt-2">
              <EarningsSummary deliveryUserId={deliveryUser.id} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-2">
              <DeliveryHistory deliveryUserId={deliveryUser.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DeliveryMapProvider>
  );
};

const DeliveryDashboard: React.FC = () => {
  return (
    <DeliveryDashboardErrorBoundary>
      <DeliveryDashboardContent />
    </DeliveryDashboardErrorBoundary>
  );
};

export default DeliveryDashboard;
