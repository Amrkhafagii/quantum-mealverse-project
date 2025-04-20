
import React from 'react';
import { Check } from 'lucide-react';
import { Order } from '@/types/order';

interface OrderHeaderProps {
  orderId?: string;
  formattedOrderId?: string;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ orderId, formattedOrderId }) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-12 h-12 text-green-500" />
      </div>
      
      <h1 className="text-4xl font-bold text-quantum-cyan mb-2 neon-text">Order Confirmed!</h1>
      <p className="text-2xl mb-2">Order #{formattedOrderId || orderId?.substring(0, 8)}</p>
      
      <p className="text-gray-400">
        We're looking for the perfect restaurant to prepare your order.
        You can track the progress below.
      </p>
    </div>
  );
};
