import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { useDeliveryLocationService } from '@/hooks/useDeliveryLocationService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, AlertTriangle, LogOut, User, Truck, Settings, Lock } from 'lucide-react';
import { toast } from 'sonner';
import DeliveryLocationControls from '@/components/delivery/DeliveryLocationControls';
import DeliveryProfileForm from '@/components/delivery/settings/DeliveryProfileForm';
import DeliveryVehicleForm from '@/components/delivery/settings/DeliveryVehicleForm';
import DeliveryAccountSettings from '@/components/delivery/settings/DeliveryAccountSettings';

const DeliverySettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationDenied = searchParams.get('locationDenied') === 'true';
  const { deliveryUser, loading, refreshDeliveryUser } = useDeliveryUser(user?.id);
  const locationService = useDeliveryLocationService();
  const { permissionStatus, updateLocation } = locationService;
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate('/auth');
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full md:w-64 space-y-6">
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-quantum-cyan text-quantum-black text-xl">
                      {deliveryUser?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-lg">
                    {deliveryUser ? `${deliveryUser.first_name} ${deliveryUser.last_name}` : user?.email}
                  </h3>
                  <span className="text-sm text-gray-400">Delivery Partner</span>
                  
                  <div className="mt-6 w-full">
                    <Button 
                      variant="outline"
                      className="w-full border-red-500/30 text-red-500 hover:bg-red-950/30 hover:text-red-400 flex items-center justify-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant={activeTab === 'profile' ? 'default' : 'ghost'}
                    className={activeTab === 'profile' ? 'bg-quantum-cyan text-quantum-black' : ''}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button 
                    variant={activeTab === 'vehicle' ? 'default' : 'ghost'}
                    className={activeTab === 'vehicle' ? 'bg-quantum-cyan text-quantum-black' : ''}
                    onClick={() => setActiveTab('vehicle')}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Vehicle
                  </Button>
                  <Button 
                    variant={activeTab === 'location' ? 'default' : 'ghost'}
                    className={activeTab === 'location' ? 'bg-quantum-cyan text-quantum-black' : ''}
                    onClick={() => setActiveTab('location')}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Location
                  </Button>
                  <Button 
                    variant={activeTab === 'account' ? 'default' : 'ghost'}
                    className={activeTab === 'account' ? 'bg-quantum-cyan text-quantum-black' : ''}
                    onClick={() => setActiveTab('account')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => navigate('/delivery/dashboard')}
              className="w-full"
              variant="outline"
            >
              Return to Dashboard
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {locationDenied && (
              <Alert className="mb-6 bg-red-500/20 border-red-500/40">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Location Access Required</AlertTitle>
                <AlertDescription>
                  You need to enable location access to use the delivery features. 
                  Please update your location settings below.
                </AlertDescription>
              </Alert>
            )}

            {activeTab === 'profile' && (
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deliveryUser && <DeliveryProfileForm deliveryUser={deliveryUser} onUpdate={refreshDeliveryUser} />}
                </CardContent>
              </Card>
            )}

            {activeTab === 'vehicle' && (
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle>Vehicle Details</CardTitle>
                  <CardDescription>
                    Manage your vehicle information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deliveryUser && <DeliveryVehicleForm deliveryUserId={deliveryUser.id} />}
                </CardContent>
              </Card>
            )}

            {activeTab === 'location' && (
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle>Location Settings</CardTitle>
                  <CardDescription>
                    Manage your location permissions and tracking settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg mb-2">Location Status</h3>
                    <p className="text-sm mb-4 text-gray-400">
                      Current permission status: <span className={`font-medium ${
                        permissionStatus === 'granted' ? 'text-green-500' : 
                        permissionStatus === 'prompt' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {permissionStatus === 'granted' ? 'Allowed' : 
                         permissionStatus === 'prompt' ? 'Not asked yet' : 'Blocked'}
                      </span>
                    </p>

                    <DeliveryLocationControls 
                      onLocationUpdate={(loc) => console.log('Location updated:', loc)} 
                      showHelp={true}
                    />
                  </div>
                  
                  {permissionStatus === 'denied' && (
                    <Alert className="bg-yellow-500/20 border-yellow-500/40">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Location Blocked</AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">To enable location access:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li>Click the lock/info icon in your browser's address bar</li>
                          <li>Select "Site settings" or "Permissions"</li>
                          <li>Find "Location" and change it to "Allow"</li>
                          <li>Refresh this page</li>
                        </ol>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <h3 className="text-lg mb-2">Location Troubleshooting</h3>
                    <p className="text-sm mb-4 text-gray-400">
                      If you're having issues with your location tracking:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                      <li>Ensure your device's location services are enabled</li>
                      <li>Allow this site to access your location in browser settings</li>
                      <li>Try using the "Update Location" button above</li>
                      <li>Refresh the page after granting permissions</li>
                      <li>Try using a different browser if problems persist</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'account' && (
              <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deliveryUser && <DeliveryAccountSettings deliveryUser={deliveryUser} onUpdate={refreshDeliveryUser} />}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySettings;
