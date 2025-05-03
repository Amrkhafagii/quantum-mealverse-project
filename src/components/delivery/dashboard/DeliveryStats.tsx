
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface DeliveryStatsProps {
  deliveryUser: {
    id: string;
    total_deliveries: number;
    average_rating: number;
    // Add any other properties needed
  };
}

export const DeliveryStats: React.FC<DeliveryStatsProps> = ({ deliveryUser }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Deliveries" 
        value={deliveryUser.total_deliveries.toString()} 
        icon={<Package className="h-5 w-5" />} 
        description="All time"
      />
      
      <StatCard 
        title="Rating" 
        value={deliveryUser.average_rating.toFixed(1)} 
        icon={<CheckCircle2 className="h-5 w-5" />}
        description="Average"
      />
      
      <StatCard 
        title="Response Rate" 
        value="98%" 
        icon={<Clock className="h-5 w-5" />}
        description="Last 30 days"
      />
      
      <StatCard 
        title="Completion Rate" 
        value="100%" 
        icon={<TrendingUp className="h-5 w-5" />}
        description="Last 30 days"
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => {
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
          <div className="p-2 bg-quantum-black/30 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
