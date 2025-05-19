
import React from 'react';
import { Clock, Check, X, AlertTriangle, Package, ChefHat, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OrderStatusTimelineProps {
  orderId: string;
  status?: string; // Make status optional with a fallback in the component
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ 
  orderId, 
  status = 'pending' 
}) => {
  const getStatusIndex = (status: string): number => {
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    return statuses.indexOf(status);
  };

  const currentIndex = getStatusIndex(status);

  return (
    <div className="order-status-timeline my-6">
      <div className="flex items-center justify-between">
        {/* Status steps */}
        <StatusStep 
          icon={<Clock className="h-5 w-5" />} 
          label="Pending" 
          isActive={currentIndex >= 0} 
          isCompleted={currentIndex > 0}
        />
        
        <StatusStep 
          icon={<Check className="h-5 w-5" />} 
          label="Confirmed" 
          isActive={currentIndex >= 1} 
          isCompleted={currentIndex > 1}
        />
        
        <StatusStep 
          icon={<ChefHat className="h-5 w-5" />} 
          label="Preparing" 
          isActive={currentIndex >= 2} 
          isCompleted={currentIndex > 2}
        />
        
        <StatusStep 
          icon={<Package className="h-5 w-5" />} 
          label="Ready" 
          isActive={currentIndex >= 3} 
          isCompleted={currentIndex > 3}
        />
        
        <StatusStep 
          icon={<Truck className="h-5 w-5" />} 
          label="On the way" 
          isActive={currentIndex >= 4} 
          isCompleted={currentIndex > 4}
        />
        
        <StatusStep 
          icon={<Check className="h-5 w-5" />} 
          label="Delivered" 
          isActive={currentIndex >= 5} 
          isCompleted={false}
          isLast={true}
        />
      </div>
      
      {/* Progress line */}
      <div className="relative h-1 bg-gray-200 mt-3">
        <div 
          className="absolute left-0 top-0 h-full bg-quantum-cyan transition-all duration-500" 
          style={{ 
            width: `${Math.min((currentIndex / 5) * 100, 100)}%`,
            display: status === 'cancelled' ? 'none' : 'block'
          }} 
        />
        
        {status === 'cancelled' && (
          <div className="absolute left-0 top-0 h-full bg-red-500 w-full" />
        )}
      </div>
      
      {/* Cancelled state */}
      {status === 'cancelled' && (
        <div className="mt-4 bg-red-500/10 rounded-md p-3 flex items-center">
          <X className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm font-medium text-red-500">Order Cancelled</span>
        </div>
      )}
    </div>
  );
};

interface StatusStepProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast?: boolean;
}

const StatusStep: React.FC<StatusStepProps> = ({ icon, label, isActive, isCompleted, isLast = false }) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      isLast ? "pr-0" : "flex-1"
    )}>
      <div className={cn(
        "rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300",
        isActive ? (isCompleted ? "bg-green-500" : "bg-quantum-cyan") : "bg-gray-300",
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-xs mt-2 transition-all duration-300",
        isActive ? "text-white font-medium" : "text-gray-500"
      )}>
        {label}
      </span>
    </div>
  );
};
