
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentConfirmation } from '@/types/payment-flow';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PaymentConfirmationPanelProps {
  confirmations: PaymentConfirmation[];
  onConfirm: (confirmationId: string) => Promise<boolean>;
  loading?: boolean;
}

export const PaymentConfirmationPanel: React.FC<PaymentConfirmationPanelProps> = ({
  confirmations,
  onConfirm,
  loading = false
}) => {
  const { user } = useAuth();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleConfirm = async (confirmationId: string) => {
    if (!user) return;
    
    setConfirmingId(confirmationId);
    try {
      await onConfirm(confirmationId);
    } finally {
      setConfirmingId(null);
    }
  };

  const getUserConfirmations = () => {
    return confirmations.filter(c => c.confirming_user_id === user?.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'timeout':
      case 'disputed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const userConfirmations = getUserConfirmations();

  if (userConfirmations.length === 0) {
    return null;
  }

  return (
    <Card className="holographic-card">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Payment Confirmations</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {userConfirmations.map((confirmation) => (
          <div key={confirmation.id} className="border border-quantum-cyan/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(confirmation.confirmation_status)}
                <span className="font-medium capitalize">
                  {confirmation.confirming_party} Confirmation
                </span>
              </div>
              <Badge 
                variant="outline"
                className={
                  confirmation.confirmation_status === 'confirmed'
                    ? 'border-green-500 text-green-500'
                    : confirmation.confirmation_status === 'pending'
                    ? 'border-yellow-500 text-yellow-500'
                    : 'border-red-500 text-red-500'
                }
              >
                {confirmation.confirmation_status}
              </Badge>
            </div>

            {confirmation.confirmation_status === 'pending' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Please confirm that you have {
                    confirmation.confirming_party === 'customer' ? 'made the payment' :
                    confirmation.confirming_party === 'restaurant' ? 'received the payment' :
                    'been informed of the payment'
                  }.
                </p>
                
                <Button
                  onClick={() => handleConfirm(confirmation.id)}
                  disabled={loading || confirmingId === confirmation.id}
                  className="w-full"
                >
                  {confirmingId === confirmation.id ? 'Confirming...' : 'Confirm Payment'}
                </Button>

                <div className="text-xs text-gray-400">
                  Expires: {new Date(confirmation.timeout_at).toLocaleString()}
                </div>
              </div>
            )}

            {confirmation.confirmation_status === 'confirmed' && confirmation.confirmed_at && (
              <div className="text-sm text-green-500">
                Confirmed on {new Date(confirmation.confirmed_at).toLocaleString()}
                {confirmation.confirmation_method && (
                  <span className="text-gray-400"> via {confirmation.confirmation_method}</span>
                )}
              </div>
            )}

            {confirmation.confirmation_status === 'disputed' && confirmation.dispute_reason && (
              <div className="text-sm text-red-500">
                Disputed: {confirmation.dispute_reason}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
