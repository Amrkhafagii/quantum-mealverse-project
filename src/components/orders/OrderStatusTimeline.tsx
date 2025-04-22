
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Package, CheckCircle2, RefreshCcw, Truck } from 'lucide-react';

interface OrderStatusTimelineProps {
  orderId: string;
}

// Define a type for order status history items
interface OrderStatusHistoryItem {
  id?: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by?: string | null;
}

const statusSteps = [
  { key: 'pending', label: 'Order Received', Icon: Package },
  { key: 'accepted', label: 'Accepted', Icon: RefreshCcw },
  { key: 'preparing', label: 'Preparing', Icon: RefreshCcw },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', Icon: RefreshCcw },
  { key: 'on_the_way', label: 'On The Way', Icon: Truck },
  { key: 'delivered', label: 'Delivered', Icon: CheckCircle2 },
];

const getStepIndex = (status: string) => {
  const statusMap: { [key: string]: number } = {
    'pending': 0,
    'awaiting_restaurant': 0, // Same as pending in the timeline
    'accepted': 1,
    'preparing': 2,
    'ready_for_pickup': 3,
    'on_the_way': 4,
    'delivered': 5
  };
  return statusMap[status] ?? -1;
};

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ orderId }) => {
  const { data: statusHistory } = useQuery({
    queryKey: ['order-status-history', orderId],
    queryFn: async () => {
      // Use the order_history table that contains status changes
      const { data, error } = await supabase
        .from('order_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at');
        
      if (error) throw error;
      
      // Transform the data to match the expected OrderStatusHistoryItem structure
      return (data || []).map((item): OrderStatusHistoryItem => ({
        id: item.id,
        order_id: item.order_id,
        previous_status: item.previous_status,
        new_status: item.status,
        changed_at: item.created_at,
        changed_by: item.changed_by
      }));
    }
  });

  // Get the current status from the last history item
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
        
        // Find the history item for this step
        const historyItem = statusHistory?.find(h => h.new_status === step.key);

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
              {historyItem && (
                <p className="text-sm text-gray-400">
                  {format(
                    new Date(historyItem.changed_at),
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
