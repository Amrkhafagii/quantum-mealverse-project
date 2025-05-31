
import React, { useEffect, useState } from 'react';
import { usePushNotifications } from '@/hooks/delivery/usePushNotifications';
import { useOrderStreaming } from '@/hooks/delivery/useOrderStreaming';
import { OrderCommunication } from './OrderCommunication';
import { DeliveryConfirmationModal } from './DeliveryConfirmationModal';
import { DeliveryRatingModal } from './DeliveryRatingModal';
import { SupportTicketSystem } from './SupportTicketSystem';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { NotificationMessageHandler } from '@/utils/delivery/notificationMessageHandler';
import { Bell, MessageCircle, Camera, Star, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [permissionDismissed, setPermissionDismissed] = useState(false);

  // Push notifications with enhanced error handling
  const {
    isSupported: pushSupported,
    permission,
    requestPermission,
    registerToken,
    sendNotification
  } = usePushNotifications();

  // Real-time order streaming
  const { events, isConnected, createEvent } = useOrderStreaming(orderId, user?.id);

  // Enhanced push notification permission handling
  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        const tokenRegistered = await registerToken();
        if (tokenRegistered) {
          toast({
            title: 'Notifications Enabled',
            description: 'You will now receive push notifications for order updates',
          });
        } else {
          toast({
            title: 'Setup Incomplete',
            description: 'Notifications enabled but token registration failed. Some features may not work.',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Notifications Disabled',
          description: 'You can enable notifications in your browser settings if you change your mind',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Permission Error',
        description: 'Failed to request notification permission. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Centralized notification handler
  const handleOrderEvent = async (event: any) => {
    if (!showFeatures.pushNotifications || !user?.id) return;

    try {
      const notificationMessage = NotificationMessageHandler.getMessageForEvent(
        event.event_type,
        event.event_data
      );

      if (!notificationMessage) return;

      // Check if we should send this notification
      if (!NotificationMessageHandler.shouldSendNotification(event.event_type)) {
        return;
      }

      // Send push notification
      const notificationId = await sendNotification(
        user.id,
        notificationMessage.title,
        notificationMessage.body,
        {
          orderId,
          eventType: event.event_type,
          priority: notificationMessage.priority,
          category: notificationMessage.category,
          ...event.event_data
        },
        notificationMessage.category
      );

      // Show toast notification
      toast({
        title: notificationMessage.title,
        description: notificationMessage.body,
        duration: notificationMessage.priority === 'high' ? 8000 : 5000,
      });

      console.log(`Notification sent: ${notificationId}`, notificationMessage);
    } catch (error) {
      console.error('Error handling order event notification:', error);
      // Don't show error toast for notification failures as it could be spammy
    }
  };

  // Handle order events
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[0];
      handleOrderEvent(latestEvent);
    }
  }, [events, showFeatures.pushNotifications, user?.id, orderId]);

  // Initialize push notifications on mount
  useEffect(() => {
    if (showFeatures.pushNotifications && pushSupported && permission === 'default' && !permissionDismissed) {
      // Don't auto-request, let user decide
      console.log('Push notifications supported but not yet requested');
    }
  }, [showFeatures.pushNotifications, pushSupported, permission, permissionDismissed]);

  const handleConfirmation = (type: 'pickup' | 'delivery') => {
    setConfirmationType(type);
    setShowConfirmationModal(true);
  };

  const handleConfirmationComplete = async () => {
    if (orderId) {
      try {
        await createEvent(
          orderId,
          `${confirmationType}_completed`,
          { 
            timestamp: new Date().toISOString(),
            confirmedBy: user?.id 
          },
          user?.id
        );
      } catch (error) {
        console.error('Error creating confirmation event:', error);
        toast({
          title: 'Event Update Failed',
          description: 'Confirmation was saved but failed to update event stream',
          variant: 'destructive'
        });
      }
    }
  };

  const handleShowRating = () => {
    setShowRatingModal(true);
  };

  // Render permission status with improved UX
  const renderNotificationStatus = () => {
    if (!showFeatures.pushNotifications) return null;

    if (!pushSupported) {
      return (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Push notifications are not supported in this browser
          </AlertDescription>
        </Alert>
      );
    }

    if (permission === 'denied') {
      return (
        <Alert className="border-red-200 bg-red-50">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Push notifications are blocked. Enable them in your browser settings to receive updates.
          </AlertDescription>
        </Alert>
      );
    }

    if (permission === 'granted') {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Push notifications are enabled
          </AlertDescription>
        </Alert>
      );
    }

    if (permission === 'default' && !permissionDismissed) {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <Bell className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 flex items-center justify-between">
            <span>Enable push notifications to receive real-time order updates</span>
            <div className="flex gap-2 ml-4">
              <Button 
                size="sm" 
                onClick={handleRequestPermission}
                className="h-8"
              >
                Enable
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setPermissionDismissed(true)}
                className="h-8"
              >
                Maybe Later
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Notification Status */}
      {renderNotificationStatus()}

      {/* Real-time Status */}
      {showFeatures.communication && (
        <Alert className={`border-${isConnected ? 'green' : 'red'}-200 bg-${isConnected ? 'green' : 'red'}-50`}>
          <MessageCircle className={`h-4 w-4 text-${isConnected ? 'green' : 'red'}-600`} />
          <AlertDescription className={`text-${isConnected ? 'green' : 'red'}-800`}>
            Real-time updates: {isConnected ? 'Connected' : 'Disconnected'}
          </AlertDescription>
        </Alert>
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
