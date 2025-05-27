
import { useState, useEffect } from 'react';
import { DeliveryUser } from '@/types/delivery';
import { getDeliveryUserByUserId } from '@/services/delivery/deliveryService';
import { useToast } from '@/hooks/use-toast';

export const useDeliveryUser = (userId: string | undefined) => {
  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchDeliveryUser = async () => {
    console.log('=== useDeliveryUser fetchDeliveryUser ===');
    console.log('UserId provided:', userId);
    
    if (!userId) {
      console.log('No userId provided, setting loading to false');
      setLoading(false);
      setDeliveryUser(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching delivery user for userId:', userId);
      const userData = await getDeliveryUserByUserId(userId);
      console.log('Delivery user data received:', userData);
      
      setDeliveryUser(userData);
    } catch (err) {
      console.error('Error fetching delivery user:', err);
      setError(err as Error);
      setDeliveryUser(null);
      
      // Only show toast for actual errors, not missing profiles
      if (err && (err as any).message !== 'Delivery user not found') {
        toast({
          title: "Error",
          description: "Failed to load your delivery profile",
          variant: "destructive"
        });
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== useDeliveryUser useEffect ===');
    console.log('UserId changed to:', userId);
    fetchDeliveryUser();
  }, [userId]); // Remove toast dependency to prevent loops

  const refreshDeliveryUser = () => {
    console.log('refreshDeliveryUser called');
    fetchDeliveryUser();
  };

  return { deliveryUser, loading, error, refreshDeliveryUser };
};
