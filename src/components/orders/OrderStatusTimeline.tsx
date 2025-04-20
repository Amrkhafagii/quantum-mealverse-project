
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Package, CheckCircle2, RefreshCcw, Truck } from 'lucide-react';

interface OrderStatusTimelineProps {
  orderId: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Received', Icon: Package },
  { key: 'processing', label: 'Processing', Icon: RefreshCcw },
  { key: 'on_the_way', label: 'On The Way', Icon: Truck },
  { key: 'delivered', label: 'Delivered', Icon: CheckCircle2 },
];

const getStepIndex = (status: string) => {
  const statusMap: { [key: string]: number } = {
    'pending': 0,
    'accepted': 1, // This will color up to Processing
    'processing': 1,
    'on_the_way': 2,
    'delivered': 3
  };
  return statusMap[status] ?? -1;
};

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ orderId }) => {
  const { data: statusHistory } = useQuery({
    queryKey: ['order-status-history', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at');
        
      if (error) throw error;
      return data || [];
    }
  });

  const currentStatus = statusHistory?.length 
    ? statusHistory[statusHistory.length - 1].new_status 
    : 'pending';

  const currentStep = getStepIndex(currentStatus);

  return (
    <div className="space-y-4 relative">
      {statusSteps.map((step, index) => {
        const isComplete = index <= currentStep;
        const isActive = index === currentStep;

        const { Icon } = step;

        return (
          <div key={step.key} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div 
                className={`rounded-full h-8 w-8 flex items-center justify-center border-2 
                  ${isComplete ? 'border-quantum-cyan bg-quantum-cyan bg-opacity-10' : 'border-gray-500 border-opacity-50'}`}
              >
                <Icon className={`h-4 w-4 ${isComplete ? 'text-quantum-cyan' : 'text-gray-500'}`} />
              </div>
              {index < statusSteps.length - 1 && (
                <div 
                  className={`w-0.5 h-12 
                    ${index < currentStep ? 'bg-quantum-cyan' : 'bg-gray-500 bg-opacity-30'}`} 
                />
              )}
            </div>
            
            <div className="pb-8">
              <h4 className={`font-medium ${isComplete ? 'text-quantum-cyan' : 'text-gray-500'}`}>
                {step.label}
              </h4>
              {statusHistory?.find(h => h.new_status === step.key) && (
                <p className="text-sm text-gray-400">
                  {format(
                    new Date(statusHistory.find(h => h.new_status === step.key)!.changed_at),
                    'MMM dd, yyyy HH:mm'
                  )}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
