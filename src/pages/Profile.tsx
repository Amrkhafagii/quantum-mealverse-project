
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

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        setUsername(profile.username || '');
      } else {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({ id: session.user.id });
      }
    };
    
    getSession();
  }, [navigate]);
  
  const updateProfile = async () => {
    if (!session) return;
    
    setSaving(true);
    
    try {
      // Update username
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', session.user.id);
        
      if (profileError) throw profileError;
      
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
    if (!session) return;
    
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
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Profile</h1>
        
        <Tabs defaultValue="account">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Account Settings</TabsTrigger>
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
                        value={session?.user?.email || ''}
                        disabled
                        className="bg-gray-800"
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
                      />
                    </div>
                    
                    <Button 
                      onClick={updateProfile}
                      disabled={saving}
                      className="w-full"
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
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      onClick={updatePassword}
                      disabled={saving || !newPassword || newPassword !== confirmPassword}
                      className="w-full"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                <SubscriptionsList userId={session?.user?.id} />
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
                <OrdersHistoryList userId={session?.user?.id} />
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
