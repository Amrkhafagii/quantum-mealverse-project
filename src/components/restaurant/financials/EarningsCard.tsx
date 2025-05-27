
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import type { RestaurantEarnings } from '@/types/financial';

interface EarningsCardProps {
  earnings: RestaurantEarnings[];
  loading?: boolean;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({ earnings, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        {earnings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>No earnings data available yet</p>
            <p className="text-sm">Start receiving orders to see earnings here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {earnings.map((earning) => (
              <div key={earning.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-lg">{formatCurrency(earning.net_earnings)}</p>
                    <Badge className={getStatusBadgeColor(earning.status)}>
                      {earning.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Gross Amount:</span>
                      <span>{formatCurrency(earning.gross_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Commission ({earning.commission_rate}%):</span>
                      <span>-{formatCurrency(earning.platform_commission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee:</span>
                      <span>-{formatCurrency(earning.payment_processing_fee)}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-2">
                    Earned: {new Date(earning.earned_at).toLocaleDateString()}
                    {earning.available_at && earning.status === 'available' && (
                      <> • Available: {new Date(earning.available_at).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
