
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { financialService } from '@/services/financial/financialService';
import type { Payout } from '@/types/financial';

interface PayoutHistoryProps {
  restaurantId?: string;
  deliveryUserId?: string;
}

export const PayoutHistory: React.FC<PayoutHistoryProps> = ({ restaurantId, deliveryUserId }) => {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, [restaurantId, deliveryUserId]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const data = await financialService.getPayouts({
        restaurantId,
        deliveryUserId,
        limit: 50
      });
      setPayouts(data);
    } catch (error) {
      console.error('Error loading payouts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payout history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
          <span className="ml-2">Loading payout history...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
        <CardDescription>Track your payout requests and transfers</CardDescription>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payouts Yet</h3>
            <p className="text-gray-600">Your payout requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(payout.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(payout.status)}
                        <span className="capitalize">{payout.status}</span>
                      </div>
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {payout.payout_method.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      ${payout.amount.toFixed(2)}
                    </div>
                    {payout.provider_fee > 0 && (
                      <div className="text-sm text-gray-500">
                        Net: ${payout.net_amount?.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(payout.period_start).toLocaleDateString()} - {' '}
                      {new Date(payout.period_end).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{payout.earnings_count}</span> earnings included
                  </div>
                  <div>
                    Requested: {new Date(payout.created_at).toLocaleDateString()}
                  </div>
                  {payout.processed_at && (
                    <div>
                      Processed: {new Date(payout.processed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {payout.failure_reason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Payout Failed</p>
                        <p className="text-sm text-red-600">{payout.failure_reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {payout.external_payout_id && (
                  <div className="mt-2 text-xs text-gray-500">
                    Reference: {payout.external_payout_id}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
