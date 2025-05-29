
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TipDistribution, ProcessTipRequest } from '@/types/payment-flow';
import { DollarSign, Users, Percent } from 'lucide-react';

interface TipDistributionCardProps {
  tipDistributions: TipDistribution[];
  orderId: string;
  onProcessTip: (request: ProcessTipRequest) => Promise<string | null>;
  loading?: boolean;
  canAddTip?: boolean;
}

export const TipDistributionCard: React.FC<TipDistributionCardProps> = ({
  tipDistributions,
  orderId,
  onProcessTip,
  loading = false,
  canAddTip = false
}) => {
  const [tipAmount, setTipAmount] = useState<string>('');
  const [driverPercentage, setDriverPercentage] = useState<number>(100);
  const [processing, setProcessing] = useState(false);

  const handleSubmitTip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setProcessing(true);
    try {
      await onProcessTip({
        orderId,
        totalTipAmount: amount,
        driverTipPercentage: driverPercentage
      });
      setTipAmount('');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'distributed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'reversed':
        return 'bg-orange-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const totalTips = tipDistributions.reduce((sum, tip) => sum + tip.total_tip_amount, 0);

  return (
    <Card className="holographic-card">
      <CardHeader>
        <CardTitle className="text-quantum-cyan flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Tips & Distribution
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add Tip Form */}
        {canAddTip && tipDistributions.length === 0 && (
          <form onSubmit={handleSubmitTip} className="space-y-4 p-4 border border-quantum-cyan/20 rounded-lg">
            <h4 className="font-semibold">Add Tip</h4>
            
            <div className="space-y-2">
              <Label htmlFor="tipAmount">Tip Amount ($)</Label>
              <Input
                id="tipAmount"
                type="number"
                min="0"
                step="0.01"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="Enter tip amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverPercentage">Driver Percentage (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="driverPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={driverPercentage}
                  onChange={(e) => setDriverPercentage(parseInt(e.target.value) || 0)}
                />
                <Percent className="h-4 w-4" />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={processing || loading || !tipAmount}
              className="w-full"
            >
              {processing ? 'Processing...' : 'Add Tip'}
            </Button>
          </form>
        )}

        {/* Tip Distributions List */}
        {tipDistributions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Tip History</h4>
              <Badge variant="outline">
                Total: ${totalTips.toFixed(2)}
              </Badge>
            </div>

            {tipDistributions.map((tip) => (
              <div key={tip.id} className="border border-quantum-cyan/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">${tip.total_tip_amount.toFixed(2)} Tip</span>
                  <Badge className={`${getStatusColor(tip.distribution_status)} text-white`}>
                    {tip.distribution_status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Driver:</span>
                    <div className="font-medium">
                      ${tip.driver_tip_amount.toFixed(2)} ({tip.driver_tip_percentage}%)
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Platform:</span>
                    <div className="font-medium">
                      ${tip.platform_fee_amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {tip.restaurant_tip_amount > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">Restaurant:</span>
                    <span className="font-medium ml-2">
                      ${tip.restaurant_tip_amount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  {tip.distributed_at 
                    ? `Distributed: ${new Date(tip.distributed_at).toLocaleString()}`
                    : `Created: ${new Date(tip.created_at).toLocaleString()}`
                  }
                </div>

                {tip.failure_reason && (
                  <div className="text-xs text-red-400 mt-1">
                    Error: {tip.failure_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tipDistributions.length === 0 && !canAddTip && (
          <div className="text-center text-gray-400 py-4">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p>No tips have been added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
