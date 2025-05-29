
import React from 'react';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';
import { useAuth } from '@/hooks/useAuth';
import { PaymentStatusCard } from './PaymentStatusCard';
import { PaymentConfirmationPanel } from './PaymentConfirmationPanel';
import { TipDistributionCard } from './TipDistributionCard';
import { PaymentNotificationsPanel } from './PaymentNotificationsPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface PaymentFlowIntegrationProps {
  orderId: string;
  showNotifications?: boolean;
  showTipDistribution?: boolean;
  canAddTip?: boolean;
}

export const PaymentFlowIntegration: React.FC<PaymentFlowIntegrationProps> = ({
  orderId,
  showNotifications = true,
  showTipDistribution = true,
  canAddTip = false
}) => {
  const { user } = useAuth();
  const {
    coordination,
    transactions,
    confirmations,
    tipDistributions,
    loading: paymentLoading,
    error: paymentError,
    confirmPayment,
    processTip,
    refreshData
  } = usePaymentFlow(orderId);

  const {
    notifications,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead
  } = usePaymentNotifications(user?.id);

  const handleConfirmPayment = async (confirmationId: string) => {
    if (!user) return false;
    
    return await confirmPayment({
      confirmationId,
      confirmingUserId: user.id,
      confirmationMethod: 'app'
    });
  };

  if (paymentLoading && !coordination) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        <span className="ml-2">Loading payment information...</span>
      </div>
    );
  }

  if (paymentError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading payment information: {paymentError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Status Overview */}
      <PaymentStatusCard
        coordination={coordination}
        confirmations={confirmations}
        onRefresh={refreshData}
        loading={paymentLoading}
      />

      {/* Payment Confirmations */}
      <PaymentConfirmationPanel
        confirmations={confirmations}
        onConfirm={handleConfirmPayment}
        loading={paymentLoading}
      />

      {/* Tip Distribution */}
      {showTipDistribution && (
        <TipDistributionCard
          tipDistributions={tipDistributions}
          orderId={orderId}
          onProcessTip={processTip}
          loading={paymentLoading}
          canAddTip={canAddTip}
        />
      )}

      {/* Payment Notifications */}
      {showNotifications && (
        <PaymentNotificationsPanel
          notifications={notifications.filter(n => n.order_id === orderId)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          loading={notificationsLoading}
        />
      )}
    </div>
  );
};
