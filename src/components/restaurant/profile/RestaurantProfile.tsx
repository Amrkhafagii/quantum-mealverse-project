
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { restaurantService, type Restaurant } from '@/services/restaurantService';
import { useAuth } from '@/hooks/useAuth';
import { RestaurantBasicInfo } from './RestaurantBasicInfo';
import { RestaurantSettings } from './RestaurantSettings';
import { RestaurantVerification } from './RestaurantVerification';
import { RestaurantOperations } from './RestaurantOperations';

export const RestaurantProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadRestaurant();
    }
  }, [user?.id]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurant(user!.id);
      setRestaurant(data);
    } catch (error: any) {
      console.error('Error loading restaurant:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurant profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantUpdate = (updatedRestaurant: Restaurant) => {
    setRestaurant(updatedRestaurant);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        <span className="ml-2 text-quantum-cyan">Loading restaurant profile...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Restaurant Profile Not Found</h3>
          <p className="text-gray-600">There was an error loading your restaurant profile.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-600">Manage your restaurant profile and settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            restaurant.verification_status === 'approved' 
              ? 'bg-green-100 text-green-800'
              : restaurant.verification_status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {restaurant.verification_status === 'approved' && 'Verified'}
            {restaurant.verification_status === 'rejected' && 'Rejected'}
            {restaurant.verification_status === 'pending' && 'Pending Verification'}
            {restaurant.verification_status === 'under_review' && 'Under Review'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            restaurant.is_active 
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {restaurant.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-4">
          <RestaurantBasicInfo 
            restaurant={restaurant} 
            onUpdate={handleRestaurantUpdate}
          />
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <RestaurantVerification 
            restaurant={restaurant} 
            onUpdate={handleRestaurantUpdate}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <RestaurantSettings 
            restaurant={restaurant}
          />
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <RestaurantOperations 
            restaurant={restaurant} 
            onUpdate={handleRestaurantUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
