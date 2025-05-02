
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Loader2 
} from 'lucide-react';
import { DeliveryEarning } from '@/types/delivery';
import { getDeliveryEarnings } from '@/services/delivery/deliveryEarningService';

interface EarningsSummaryProps {
  deliveryUserId: string;
}

export const EarningsSummary: React.FC<EarningsSummaryProps> = ({ deliveryUserId }) => {
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<DeliveryEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  useEffect(() => {
    loadEarnings();
  }, [deliveryUserId, period]);
  
  const loadEarnings = async () => {
    try {
      setLoading(true);
      const earningsData = await getDeliveryEarnings(deliveryUserId, period);
      setEarnings(earningsData);
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast({
        title: "Couldn't load earnings data",
        description: "There was a problem loading your earnings information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate summary statistics
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.total_amount, 0);
  const totalDeliveries = earnings.length;
  const averagePerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;
  const totalTips = earnings.reduce((sum, earning) => sum + earning.tip_amount, 0);
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EarningsCard 
          title="Total Earnings"
          value={`$${totalEarnings.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          description={`This ${period}`}
          color="text-green-500"
        />
        
        <EarningsCard 
          title="Deliveries"
          value={totalDeliveries.toString()}
          icon={<Calendar className="h-5 w-5" />}
          description={`This ${period}`}
          color="text-blue-500"
        />
        
        <EarningsCard 
          title="Avg. Per Delivery"
          value={`$${averagePerDelivery.toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5" />}
          description={`This ${period}`}
          color="text-purple-500"
        />
        
        <EarningsCard 
          title="Total Tips"
          value={`$${totalTips.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          description={`This ${period}`}
          color="text-amber-500"
        />
      </div>
      
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Order</th>
                    <th className="pb-2 text-right">Base</th>
                    <th className="pb-2 text-right">Tip</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning) => (
                    <tr key={earning.id} className="border-t border-quantum-cyan/10">
                      <td className="py-3">{new Date(earning.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        {earning.order_id 
                          ? `#${earning.order_id.slice(-6)}` 
                          : 'Bonus Payment'}
                      </td>
                      <td className="py-3 text-right">${earning.base_amount.toFixed(2)}</td>
                      <td className="py-3 text-right">${earning.tip_amount.toFixed(2)}</td>
                      <td className="py-3 text-right font-medium">${earning.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No earnings data available for this period.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface EarningsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const EarningsCard: React.FC<EarningsCardProps> = ({ title, value, icon, description, color }) => {
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className={`text-xl font-semibold mt-1 ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          </div>
          <div className="bg-quantum-black/30 p-2 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
