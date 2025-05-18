
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { Card } from "@/components/ui/card";
import { OrdersHistoryList } from '@/components/profile/OrdersHistoryList';
import { ManageSubscription } from '@/components/profile/ManageSubscription';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import KeyboardNavigation from '@/components/a11y/KeyboardNavigation';
import { BiometricSetupCard } from '@/components/auth/BiometricSetupCard';
import { Platform } from '@/utils/platform';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="mb-6">You need to be logged in to view your profile.</p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <KeyboardNavigation />
      
      <main className="container mx-auto flex-1 px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md mb-8">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Orders</h2>
            <OrdersHistoryList userId={user.id} />
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-4">
            <ManageSubscription userId={user.id} />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Security Settings</h2>
            {Platform.isNative() && <BiometricSetupCard />}
            
            <Card className="p-6 mt-4">
              <h3 className="text-xl font-semibold mb-3">Password Management</h3>
              <p className="text-gray-500 mb-4">
                It's recommended to change your password regularly for security.
              </p>
              <Button variant="outline" onClick={() => navigate('/profile/change-password')}>
                Change Password
              </Button>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Account Details</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
