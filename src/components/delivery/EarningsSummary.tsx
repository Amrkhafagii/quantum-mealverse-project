
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Loader2 
} from 'lucide-react';

interface EarningsSummaryProps {
  deliveryUserId?: string;
}

// Simple placeholder for DeliveryEarning until we implement the actual type
interface DeliveryEarning {
  id: string;
  delivery_user_id: string;
  order_id?: string;
  base_amount: number;
  tip_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export const EarningsSummary: React.FC<EarningsSummaryProps> = ({ deliveryUserId }) => {
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<DeliveryEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  useEffect(() => {
    // Mock data for now - we'll implement the actual service later
    const mockData = [
      {
        id: '1',
        delivery_user_id: deliveryUserId || '',
        order_id: 'order-123',
        base_amount: 5.00,
        tip_amount: 2.50,
        total_amount: 7.50,
        status: 'paid',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        delivery_user_id: deliveryUserId || '',
        order_id: 'order-456',
        base_amount: 5.00,
        tip_amount: 3.00,
        total_amount: 8.00,
        status: 'paid',
        created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
      }
    ];
    
    setEarnings(mockData);
    setLoading(false);
  }, [deliveryUserId, period]);
  
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
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle>Earnings Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
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
        </div>
        
        <div className="grid grid-cols-2 gap-4">
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
      </CardContent>
    </Card>
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
    <div className="bg-quantum-darkBlue/30 border border-quantum-cyan/20 rounded-md p-4">
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
    </div>
  );
};

export default EarningsSummary;
