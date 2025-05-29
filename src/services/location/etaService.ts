
import { supabase } from '@/integrations/supabase/client';
import { DeliveryETAUpdate } from '@/types/location-sharing';

export class ETAService {
  // Get latest ETA for a delivery assignment
  async getLatestETA(deliveryAssignmentId: string): Promise<DeliveryETAUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_eta_updates')
        .select('*')
        .eq('delivery_assignment_id', deliveryAssignmentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting latest ETA:', error);
      return null;
    }
  }

  // Get ETA updates for an order
  async getETAUpdatesForOrder(orderId: string): Promise<DeliveryETAUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_eta_updates')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting ETA updates for order:', error);
      return [];
    }
  }

  // Subscribe to ETA updates
  subscribeToETAUpdates(
    deliveryAssignmentId: string,
    onUpdate: (eta: DeliveryETAUpdate) => void,
    onError?: (error: Error) => void
  ) {
    const channel = supabase
      .channel(`eta-updates-${deliveryAssignmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_eta_updates',
          filter: `delivery_assignment_id=eq.${deliveryAssignmentId}`
        },
        (payload) => {
          console.log('Real-time ETA update:', payload);
          onUpdate(payload.new as DeliveryETAUpdate);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ETA updates for assignment ${deliveryAssignmentId}`);
        } else if (status === 'CHANNEL_ERROR') {
          const error = new Error(`Failed to subscribe to ETA updates for assignment ${deliveryAssignmentId}`);
          console.error(error);
          onError?.(error);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Calculate time until delivery
  calculateTimeUntilDelivery(estimatedArrival: string): {
    minutes: number;
    isOverdue: boolean;
    timeText: string;
  } {
    const now = new Date();
    const eta = new Date(estimatedArrival);
    const diffMs = eta.getTime() - now.getTime();
    const minutes = Math.ceil(diffMs / (1000 * 60));

    const isOverdue = minutes < 0;
    const absMinutes = Math.abs(minutes);

    let timeText: string;
    if (absMinutes < 60) {
      timeText = `${absMinutes} minute${absMinutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(absMinutes / 60);
      const remainingMinutes = absMinutes % 60;
      timeText = `${hours} hour${hours !== 1 ? 's' : ''}`;
      if (remainingMinutes > 0) {
        timeText += ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
      }
    }

    if (isOverdue) {
      timeText = `${timeText} overdue`;
    }

    return {
      minutes: isOverdue ? -absMinutes : absMinutes,
      isOverdue,
      timeText
    };
  }
}

export const etaService = new ETAService();
