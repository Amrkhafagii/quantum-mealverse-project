
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { financialService } from '@/services/financial/financialService';
import type { RestaurantEarnings } from '@/types/financial';

interface EarningsOverviewProps {
  restaurantId: string;
}

export const EarningsOverview: React.FC<EarningsOverviewProps> = ({ restaurantId }) => {
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<RestaurantEarnings[]>([]);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    availableEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState(false);

  useEffect(() => {
    loadEarningsData();
  }, [restaurantId]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      const [earningsData, summaryData] = await Promise.all([
        financialService.getRestaurantEarnings(restaurantId, { limit: 20 }),
        financialService.getEarningsSummary(restaurantId)
      ]);
      
      setEarnings(earningsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load earnings data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    try {
      setRequestingPayout(true);
      await financialService.requestPayout(restaurantId);
      
      toast({
        title: 'Payout Requested',
        description: 'Your payout request has been submitted successfully'
      });
      
      await loadEarningsData();
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      toast({
        title: 'Payout Failed',
        description: error.message || 'Failed to request payout',
        variant: 'destructive'
      });
    } finally {
      setRequestingPayout(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
          <span className="ml-2">Loading earnings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-lg font-bold text-green-600">
                  ${summary.totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-lg font-bold text-blue-600">
                  ${summary.availableEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg font-bold text-yellow-600">
                  ${summary.pendingEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Paid Out</p>
                <p className="text-lg font-bold text-purple-600">
                  ${summary.paidEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Button */}
      {summary.availableEarnings > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Request Payout</h3>
                <p className="text-sm text-gray-600">
                  You have ${summary.availableEarnings.toFixed(2)} available for payout
                </p>
              </div>
              <Button 
                onClick={handleRequestPayout}
                disabled={requestingPayout}
                className="min-w-32"
              >
                {requestingPayout ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Request Payout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Your latest earnings from completed orders</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Earnings Yet</h3>
              <p className="text-gray-600">Complete orders to start earning money!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(earning.status)}>
                        {earning.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(earning.earned_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span>Gross: ${earning.gross_amount.toFixed(2)}</span>
                      <span className="mx-2">•</span>
                      <span>Commission: ${earning.platform_commission.toFixed(2)}</span>
                      <span className="mx-2">•</span>
                      <span>Fees: ${earning.payment_processing_fee.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      ${earning.net_earnings.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(earning.commission_rate * 100).toFixed(1)}% commission
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
