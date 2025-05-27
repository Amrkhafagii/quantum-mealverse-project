
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Power, PowerOff, AlertTriangle } from 'lucide-react';
import { restaurantService, type Restaurant } from '@/services/restaurantService';

interface Props {
  restaurant: Restaurant;
  onUpdate: (restaurant: Restaurant) => void;
}

export const RestaurantOperations: React.FC<Props> = ({ restaurant, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleToggleActive = async () => {
    try {
      setLoading(true);
      const updatedRestaurant = await restaurantService.updateRestaurant(restaurant.id, {
        is_active: !restaurant.is_active
      });
      onUpdate(updatedRestaurant);
      toast({
        title: "Success",
        description: `Restaurant ${updatedRestaurant.is_active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling restaurant status:', error);
      toast({
        title: "Error",
        description: "Failed to update restaurant status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerificationProgress = () => {
    const requiredDocTypes = ['business_license', 'food_handler_permit', 'identity_document'];
    // This would need to be calculated based on uploaded documents
    // For now, return a placeholder
    return restaurant.verification_status === 'approved' ? 100 : 
           restaurant.verification_status === 'under_review' ? 75 : 
           restaurant.verification_status === 'pending' ? 25 : 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Status</CardTitle>
          <CardDescription>
            Manage your restaurant's operational status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Restaurant Active Status</h3>
                <p className="text-sm text-gray-500">
                  {restaurant.is_active 
                    ? 'Your restaurant is currently active and can receive orders'
                    : 'Your restaurant is currently inactive and will not receive orders'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {restaurant.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant={restaurant.is_active ? "destructive" : "default"}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : restaurant.is_active ? (
                        <PowerOff className="mr-2 h-4 w-4" />
                      ) : (
                        <Power className="mr-2 h-4 w-4" />
                      )}
                      {restaurant.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {restaurant.is_active ? 'Deactivate Restaurant' : 'Activate Restaurant'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {restaurant.is_active 
                          ? 'Are you sure you want to deactivate your restaurant? You will stop receiving new orders.'
                          : 'Are you sure you want to activate your restaurant? You will start receiving orders.'
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleToggleActive}>
                        {restaurant.is_active ? 'Deactivate' : 'Activate'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Verification Status</h3>
                <p className="text-sm text-gray-500">
                  Complete verification to start receiving orders
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={
                  restaurant.verification_status === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : restaurant.verification_status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }>
                  {restaurant.verification_status === 'approved' && 'Verified'}
                  {restaurant.verification_status === 'rejected' && 'Rejected'}
                  {restaurant.verification_status === 'pending' && 'Pending'}
                  {restaurant.verification_status === 'under_review' && 'Under Review'}
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-medium">{getVerificationProgress()}%</div>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${getVerificationProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Verification Required</h4>
                <p className="text-sm text-yellow-700">
                  Your restaurant must be verified before you can start receiving orders. 
                  Please upload all required documents in the Verification tab.
                </p>
              </div>
            </div>

            {!restaurant.is_verified && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Complete Your Profile</h4>
                  <p className="text-sm text-blue-700">
                    Make sure to complete all sections of your profile including basic information, 
                    verification documents, and settings to provide the best experience for customers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
