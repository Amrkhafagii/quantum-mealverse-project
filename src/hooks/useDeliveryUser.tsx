
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
    console.log('useDeliveryUser - fetchDeliveryUser called with userId:', userId);
    
    if (!userId) {
      console.log('useDeliveryUser - No userId provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('useDeliveryUser - Fetching delivery user for userId:', userId);
      const userData = await getDeliveryUserByUserId(userId);
      console.log('useDeliveryUser - Received delivery user data:', userData);
      
      setDeliveryUser(userData);
    } catch (err) {
      console.error('useDeliveryUser - Error fetching delivery user:', err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to load your delivery profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useDeliveryUser - useEffect triggered with userId:', userId);
    fetchDeliveryUser();
  }, [userId]);

  const refreshDeliveryUser = () => {
    console.log('useDeliveryUser - refreshDeliveryUser called');
    fetchDeliveryUser();
  };

  return { deliveryUser, loading, error, refreshDeliveryUser };
};
