
import React, { useEffect, useState } from 'react';
import { usePushNotifications } from '@/hooks/delivery/usePushNotifications';
import { useOrderStreaming } from '@/hooks/delivery/useOrderStreaming';
import { OrderCommunication } from './OrderCommunication';
import { DeliveryConfirmationModal } from './DeliveryConfirmationModal';
import { DeliveryRatingModal } from './DeliveryRatingModal';
import { SupportTicketSystem } from './SupportTicketSystem';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Bell, MessageCircle, Camera, Star, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeliveryFeaturesIntegrationProps {
  orderId?: string;
  assignmentId?: string;
  deliveryUserId?: string;
  customerId?: string;
  recipientId?: string;
  recipientName?: string;
  recipientPhone?: string;
  deliveryUserName?: string;
  showFeatures?: {
    pushNotifications?: boolean;
    communication?: boolean;
    confirmation?: boolean;
    rating?: boolean;
    support?: boolean;
  };
}

export const DeliveryFeaturesIntegration: React.FC<DeliveryFeaturesIntegrationProps> = ({
  orderId,
  assignmentId,
  deliveryUserId,
  customerId,
  recipientId,
  recipientName,
  recipientPhone,
  deliveryUserName,
  showFeatures = {
    pushNotifications: true,
    communication: true,
    confirmation: true,
    rating: true,
    support: true
  }
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'pickup' | 'delivery'>('pickup');
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Push notifications
  const {
    isSupported: pushSupported,
    permission,
    requestPermission,
    registerToken,
    sendNotification
  } = usePushNotifications();

  // Real-time order streaming
  const { events, isConnected, createEvent } = useOrderStreaming(orderId, user?.id);

  // Initialize push notifications
  useEffect(() => {
    if (showFeatures.pushNotifications && pushSupported && permission === 'default') {
      requestPermission().then((granted) => {
        if (granted) {
          registerToken();
        }
      });
    }
  }, [showFeatures.pushNotifications, pushSupported, permission]);

  // Handle order events for notifications
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[0];
      
      // Send push notification for important events
      if (showFeatures.pushNotifications && user?.id) {
        const eventNotifications: Record<string, { title: string; body: string }> = {
          'order_confirmed': {
            title: 'Order Confirmed',
            body: 'Your order has been confirmed and is being prepared'
          },
          'driver_assigned': {
            title: 'Driver Assigned',
            body: 'A driver has been assigned to your order'
          },
          'pickup_completed': {
            title: 'Order Picked Up',
            body: 'Your order has been picked up and is on the way'
          },
          'delivery_completed': {
            title: 'Order Delivered',
            body: 'Your order has been delivered successfully'
          }
        };

        const notification = eventNotifications[latestEvent.event_type];
        if (notification) {
          sendNotification(
            user.id,
            notification.title,
            notification.body,
            { orderId, eventType: latestEvent.event_type },
            'order_update'
          );

          toast({
            title: notification.title,
            description: notification.body,
          });
        }
      }
    }
  }, [events, showFeatures.pushNotifications, user?.id, orderId]);

  const handleConfirmation = (type: 'pickup' | 'delivery') => {
    setConfirmationType(type);
    setShowConfirmationModal(true);
  };

  const handleConfirmationComplete = async () => {
    if (orderId) {
      await createEvent(
        orderId,
        `${confirmationType}_completed`,
        { timestamp: new Date().toISOString() },
        user?.id
      );
    }
  };

  const handleShowRating = () => {
    setShowRatingModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Push Notification Status */}
      {showFeatures.pushNotifications && (
        <div className="flex items-center gap-2 p-3 bg-quantum-darkBlue/20 rounded-lg">
          <Bell className="h-4 w-4 text-quantum-cyan" />
          <span className="text-sm">
            Push notifications: {permission === 'granted' ? 'Enabled' : 'Disabled'}
          </span>
          {permission !== 'granted' && (
            <Button size="sm" variant="outline" onClick={requestPermission}>
              Enable
            </Button>
          )}
        </div>
      )}

      {/* Real-time Status */}
      {showFeatures.communication && (
        <div className="flex items-center gap-2 p-3 bg-quantum-darkBlue/20 rounded-lg">
          <MessageCircle className="h-4 w-4 text-quantum-cyan" />
          <span className="text-sm">
            Real-time updates: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      )}

      {/* Communication */}
      {showFeatures.communication && orderId && recipientId && recipientName && (
        <OrderCommunication
          orderId={orderId}
          recipientId={recipientId}
          recipientName={recipientName}
          recipientPhone={recipientPhone}
        />
      )}

      {/* Delivery Actions */}
      {showFeatures.confirmation && assignmentId && (
        <div className="flex gap-2">
          <Button
            onClick={() => handleConfirmation('pickup')}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Confirm Pickup
          </Button>
          <Button
            onClick={() => handleConfirmation('delivery')}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Confirm Delivery
          </Button>
        </div>
      )}

      {/* Rating */}
      {showFeatures.rating && assignmentId && deliveryUserId && customerId && deliveryUserName && (
        <Button
          onClick={handleShowRating}
          className="w-full"
        >
          <Star className="h-4 w-4 mr-2" />
          Rate Delivery
        </Button>
      )}

      {/* Support System */}
      {showFeatures.support && (
        <SupportTicketSystem
          orderId={orderId}
          deliveryAssignmentId={assignmentId}
        />
      )}

      {/* Modals */}
      {assignmentId && (
        <DeliveryConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          assignmentId={assignmentId}
          type={confirmationType}
          onConfirmed={handleConfirmationComplete}
        />
      )}

      {assignmentId && orderId && deliveryUserId && customerId && deliveryUserName && (
        <DeliveryRatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          assignmentId={assignmentId}
          orderId={orderId}
          deliveryUserId={deliveryUserId}
          customerId={customerId}
          deliveryUserName={deliveryUserName}
        />
      )}
    </div>
  );
};
