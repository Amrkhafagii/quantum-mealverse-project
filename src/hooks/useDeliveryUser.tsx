
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
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userData = await getDeliveryUserByUserId(userId);
      setDeliveryUser(userData);
    } catch (err) {
      console.error('Error fetching delivery user:', err);
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
    fetchDeliveryUser();
  }, [userId]);

  const refreshDeliveryUser = () => {
    fetchDeliveryUser();
  };

  return { deliveryUser, loading, error, refreshDeliveryUser };
};
