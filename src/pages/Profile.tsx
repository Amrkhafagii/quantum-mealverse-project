
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { OrdersHistoryList } from '@/components/profile/OrdersHistoryList';
import { SubscriptionsList } from '@/components/profile/SubscriptionsList';
import { useAuth } from '@/hooks/useAuth';
import CurrencySelector from '@/components/settings/CurrencySelector';
import KeyboardNavigation from '@/components/a11y/KeyboardNavigation';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!session) {
      navigate('/login');
      return;
    }
    
    const fetchUserData = async () => {
      try {
        // Try to get username from delivery_info table
        const { data: deliveryInfo } = await supabase
          .from('delivery_info')
          .select('full_name')
          .eq('user_id', user?.id)
          .maybeSingle();
          
        if (deliveryInfo && deliveryInfo.full_name) {
          setUsername(deliveryInfo.full_name);
        } else if (user?.email) {
          // If no delivery info, we can use the user's email as default username
          setUsername(user.email.split('@')[0]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    if (user) {
      fetchUserData();
    }
  }, [navigate, user, session, loading]);
  
  const updateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      // Check if user has delivery info
      const { data: existingInfo } = await supabase
        .from('delivery_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingInfo) {
        // Update existing delivery info
        const { error } = await supabase
          .from('delivery_info')
          .update({ full_name: username })
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Create new delivery info with at least the full name
        const { error } = await supabase
          .from('delivery_info')
          .insert({ 
            user_id: user.id, 
            full_name: username,
            address: 'Not provided', // These are required fields in the schema
            phone: 'Not provided',
            city: 'Not provided'
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const updatePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="text-2xl text-quantum-cyan">Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      <KeyboardNavigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10" aria-labelledby="profile-heading">
        <h1 id="profile-heading" className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Profile</h1>
        
        <Tabs defaultValue="account">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Account Settings</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details and username
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-800"
                        aria-readonly="true"
                      />
                      <p className="text-sm text-gray-400">Your email cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a unique username"
                        aria-describedby="username-description"
                      />
                      <p id="username-description" className="text-sm text-gray-400">
                        This name will appear on your orders and reviews
                      </p>
                    </div>
                    
                    <Button 
                      onClick={updateProfile}
                      disabled={saving}
                      className="w-full"
                      aria-busy={saving}
                    >
                      {saving ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        aria-describedby="password-requirements"
                        autoComplete="new-password"
                      />
                      <p id="password-requirements" className="text-sm text-gray-400">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    
                    <Button 
                      onClick={updatePassword}
                      disabled={saving || !newPassword || newPassword !== confirmPassword}
                      className="w-full"
                      aria-busy={saving}
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences">
            <div className="grid gap-6 md:grid-cols-2">
              <CurrencySelector />
              
              {/* Additional preference components can go here */}
            </div>
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Your Subscriptions</CardTitle>
                <CardDescription>
                  Manage your meal plan subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionsList userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and track your orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersHistoryList userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
