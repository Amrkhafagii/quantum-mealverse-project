
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaymentStatusCoordination, PaymentConfirmation } from '@/types/payment-flow';
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface PaymentStatusCardProps {
  coordination: PaymentStatusCoordination | null;
  confirmations: PaymentConfirmation[];
  onRefresh: () => void;
  loading?: boolean;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  coordination,
  confirmations,
  onRefresh,
  loading = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'disputed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
      case 'disputed':
        return 'bg-red-500';
      case 'partial':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConfirmationStatus = (party: string) => {
    const confirmation = confirmations.find(c => c.confirming_party === party);
    return confirmation?.confirmation_status || 'pending';
  };

  if (!coordination) {
    return (
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No payment information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="holographic-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-quantum-cyan flex items-center gap-2">
          {getStatusIcon(coordination.overall_payment_status)}
          Payment Status
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Status:</span>
          <Badge className={`${getStatusColor(coordination.overall_payment_status)} text-white`}>
            {coordination.overall_payment_status.toUpperCase()}
          </Badge>
        </div>

        {/* Payment Components */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Base Payment:</span>
            <Badge variant="outline">
              {coordination.base_payment_status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Tip Payment:</span>
            <Badge variant="outline">
              {coordination.tip_payment_status}
            </Badge>
          </div>
        </div>

        {/* Confirmation Status */}
        <div className="border-t border-quantum-cyan/20 pt-4">
          <h4 className="text-sm font-semibold mb-2">Confirmations</h4>
          <div className="space-y-2">
            {['customer', 'restaurant', 'driver'].map((party) => {
              const status = getConfirmationStatus(party);
              return (
                <div key={party} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{party}:</span>
                  <Badge 
                    variant="outline"
                    className={status === 'confirmed' ? 'border-green-500 text-green-500' : ''}
                  >
                    {status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Parties Confirmed */}
        {coordination.all_parties_confirmed && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">All parties have confirmed payment</span>
          </div>
        )}

        {/* Manual Review Required */}
        {coordination.requires_manual_review && (
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Manual review required</span>
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-gray-400">
          Last updated: {new Date(coordination.last_status_update).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};
