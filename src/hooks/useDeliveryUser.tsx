import { useState, useEffect } from 'react';
import { DeliveryUser } from '@/types/delivery';
import { getDeliveryUserByUserId } from '@/services/delivery/deliveryService';
import { useToast } from '@/hooks/use-toast';

export const useDeliveryUser = (userId: string | undefined) => {
  const [deliveryUser, setDeliveryUser] = useState<DeliveryUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const { toast } = useToast();

  const fetchDeliveryUser = async () => {
    console.log('=== useDeliveryUser fetchDeliveryUser ===');
    console.log('UserId provided:', userId);
    console.log('Has already attempted:', hasAttempted);
    
    if (!userId) {
      console.log('No userId provided, setting loading to false');
      setLoading(false);
      setDeliveryUser(null);
      setHasAttempted(true);
      return;
    }

    if (hasAttempted) {
      console.log('Already attempted fetch, skipping to prevent loop');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // DELIVERY USER FETCH: Use correct field ('delivery_users_user_id')
      const userData = await getDeliveryUserByUserId(userId);
      setDeliveryUser(userData);
      setHasAttempted(true);
    } catch (err) {
      console.error('Error fetching delivery user:', err);
      setError(err as Error);
      setDeliveryUser(null);
      setHasAttempted(true);
      
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
    console.log('Has attempted:', hasAttempted);
    
    // Only fetch if we haven't attempted yet or if userId changed
    if (!hasAttempted || (userId && deliveryUser === null)) {
      fetchDeliveryUser();
    }
  }, [userId]); // Only depend on userId

  const refreshDeliveryUser = () => {
    console.log('refreshDeliveryUser called - resetting attempt flag');
    setHasAttempted(false);
    fetchDeliveryUser();
  };

  return { deliveryUser, loading, error, refreshDeliveryUser };
};
